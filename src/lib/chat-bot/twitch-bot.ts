import tmi from "tmi.js";
import {
  findMatchingCommand,
  renderCommandResponse,
  renderRotatingMessage,
} from "@/lib/chat-bot/settings";
import {
  getActiveChatBots,
  isChatBotConfigured,
  type ActiveChatBot,
} from "@/lib/chat-bot/repository";

const RELOAD_INTERVAL_MS = 30_000;
const COMMAND_COOLDOWN_MS = 2_000;
const TWITCH_MESSAGE_MAX = 490;

type ChannelMap = Map<string, ActiveChatBot>;

const AUTH_RETRY_MS = 10 * 60_000;

class TwitchChatBotManager {
  private client: tmi.Client | null = null;
  private channels: ChannelMap = new Map();
  private cooldowns = new Map<string, number>();
  private rotatingTimers = new Map<string, ReturnType<typeof setInterval>>();
  private rotatingTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
  private reloadTimer: ReturnType<typeof setInterval> | null = null;
  private starting = false;
  private authBlockedUntil = 0;
  private authFailLogged = false;

  configured(): boolean {
    return isChatBotConfigured();
  }

  async start(): Promise<void> {
    if (!this.configured()) {
      console.warn(
        "[chat-bot] TWITCH_BOT_USERNAME / TWITCH_BOT_OAUTH_TOKEN não configurados — bot desativado.",
      );
      return;
    }

    await this.reload();

    if (this.reloadTimer) clearInterval(this.reloadTimer);
    this.reloadTimer = setInterval(() => {
      void this.reload();
    }, RELOAD_INTERVAL_MS);
  }

  requestReload(): void {
    void this.reload();
  }

  private channelKey(channel: string): string {
    return channel.replace(/^#/, "").toLowerCase();
  }

  private cooldownKey(channel: string, trigger: string): string {
    return `${this.channelKey(channel)}:${trigger}`;
  }

  private canReply(channel: string, trigger: string): boolean {
    const key = this.cooldownKey(channel, trigger);
    const last = this.cooldowns.get(key) ?? 0;
    if (Date.now() - last < COMMAND_COOLDOWN_MS) return false;
    this.cooldowns.set(key, Date.now());
    return true;
  }

  private async say(channel: string, text: string): Promise<void> {
    const client = this.client;
    if (!client || !text.trim()) return;
    try {
      await client.say(channel, text.slice(0, TWITCH_MESSAGE_MAX));
    } catch (err) {
      console.error("[chat-bot] erro ao enviar mensagem:", err);
    }
  }

  private clearRotatingTimers(): void {
    for (const timer of this.rotatingTimers.values()) {
      clearInterval(timer);
    }
    this.rotatingTimers.clear();
    for (const timeout of this.rotatingTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.rotatingTimeouts.clear();
  }

  private scheduleRotatingMessages(): void {
    this.clearRotatingTimers();
    if (!this.client) return;

    for (const [channelLogin, config] of this.channels) {
      const channel = `#${channelLogin}`;

      for (const msg of config.settings.rotatingMessages) {
        if (!msg.enabled || !msg.text.trim()) continue;
        const key = `${channelLogin}:${msg.id}`;
        const ms = Math.max(60_000, msg.intervalSeconds * 1000);

        const tick = () => {
          const live = this.channels.get(channelLogin);
          if (!live) return;
          const current = live.settings.rotatingMessages.find((m) => m.id === msg.id);
          if (!current?.enabled) return;
          const text = renderRotatingMessage(current, {
            username: live.username,
            displayName: live.displayName,
          });
          void this.say(channel, text);
        };

        // Primeiro envio após 20s da conexão; depois no intervalo escolhido.
        const kickoff = setTimeout(() => {
          this.rotatingTimeouts.delete(key);
          tick();
          const timer = setInterval(tick, ms);
          this.rotatingTimers.set(key, timer);
        }, 20_000);

        this.rotatingTimeouts.set(key, kickoff);
      }
    }
  }

  private async handleMessage(
    channel: string,
    _tags: tmi.ChatUserstate,
    message: string,
    self: boolean,
  ): Promise<void> {
    if (self) return;

    const config = this.channels.get(this.channelKey(channel));
    if (!config) return;

    const command = findMatchingCommand(message, config.settings);
    if (!command) return;
    if (!this.canReply(channel, command.trigger)) return;

    const reply = renderCommandResponse(command, config.settings, {
      username: config.username,
      displayName: config.displayName,
    });

    if (!reply) return;
    await this.say(channel, reply);
  }

  private buildClient(channelLogins: string[]): tmi.Client {
    const username = process.env.TWITCH_BOT_USERNAME!.trim();
    const raw = process.env.TWITCH_BOT_OAUTH_TOKEN!.trim();
    const token = raw.replace(/^oauth:/i, "");
    const password = `oauth:${token}`;

    return new tmi.Client({
      options: { debug: process.env.NODE_ENV !== "production" },
      connection: {
        secure: true,
        reconnect: true,
      },
      identity: {
        username,
        password,
      },
      channels: channelLogins.map((ch) => ch.toLowerCase()),
    });
  }

  private async disconnect(): Promise<void> {
    this.clearRotatingTimers();
    if (!this.client) return;
    const old = this.client;
    this.client = null;
    try {
      await old.disconnect();
    } catch {
      /* ignore */
    }
  }

  async reload(): Promise<void> {
    if (!this.configured() || this.starting) return;
    if (Date.now() < this.authBlockedUntil) return;
    this.starting = true;

    try {
      const bots = await getActiveChatBots();
      const nextChannels: ChannelMap = new Map();

      for (const bot of bots) {
        nextChannels.set(bot.twitchChannel.toLowerCase(), bot);
      }

      const nextLogins = [...nextChannels.keys()].sort();
      const currentLogins = [...this.channels.keys()].sort();
      const sameChannels =
        nextLogins.length === currentLogins.length &&
        nextLogins.every((ch, i) => ch === currentLogins[i]);

      // Always refresh in-memory settings (commands + rotating)
      this.channels = nextChannels;

      if (nextLogins.length === 0) {
        if (this.client) {
          console.log("[chat-bot] nenhum canal ativo — desconectando.");
          await this.disconnect();
        } else {
          this.clearRotatingTimers();
        }
        return;
      }

      if (this.client && sameChannels) {
        // reconnect not needed — just reschedule rotating with new texts/intervals
        this.scheduleRotatingMessages();
        return;
      }

      await this.disconnect();

      const client = this.buildClient(nextLogins);
      client.on("message", (channel, tags, message, self) => {
        void this.handleMessage(channel, tags, message, self);
      });
      client.on("connected", () => {
        this.authBlockedUntil = 0;
        this.authFailLogged = false;
        console.log(
          `[chat-bot] conectado em ${nextLogins.length} canal(is): ${nextLogins.join(", ")}`,
        );
        this.scheduleRotatingMessages();
      });

      this.client = client;
      await client.connect();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const authFailed = /login authentication failed/i.test(message);
      if (authFailed) {
        this.authBlockedUntil = Date.now() + AUTH_RETRY_MS;
        if (!this.authFailLogged) {
          this.authFailLogged = true;
          console.error(
            "[chat-bot] token Twitch inválido ou expirado. Gere um novo em https://twitchtokengenerator.com com os scopes chat:read e chat:edit (conta do bot), no formato oauth:xxxxx, e atualize TWITCH_BOT_OAUTH_TOKEN no .env.",
          );
        }
      } else {
        console.error("[chat-bot] falha ao recarregar:", err);
      }
      await this.disconnect();
    } finally {
      this.starting = false;
    }
  }
}

const manager = new TwitchChatBotManager();

export function startTwitchChatBot(): Promise<void> {
  return manager.start();
}

export function reloadTwitchChatBot(): void {
  manager.requestReload();
}

export function isTwitchChatBotConfigured(): boolean {
  return manager.configured();
}
