import tmi from "tmi.js";
import {
  findMatchingCommand,
  renderCommandResponse,
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

class TwitchChatBotManager {
  private client: tmi.Client | null = null;
  private channels: ChannelMap = new Map();
  private cooldowns = new Map<string, number>();
  private reloadTimer: ReturnType<typeof setInterval> | null = null;
  private starting = false;

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

    const client = this.client;
    if (!client) return;

    try {
      await client.say(
        channel,
        reply.slice(0, TWITCH_MESSAGE_MAX),
      );
    } catch (err) {
      console.error("[chat-bot] erro ao responder:", err);
    }
  }

  private buildClient(channelLogins: string[]): tmi.Client {
    const username = process.env.TWITCH_BOT_USERNAME!.trim();
    const password = process.env.TWITCH_BOT_OAUTH_TOKEN!.trim();

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

      this.channels = nextChannels;

      if (nextLogins.length === 0) {
        if (this.client) {
          console.log("[chat-bot] nenhum canal ativo — desconectando.");
          await this.disconnect();
        }
        return;
      }

      if (this.client && sameChannels) {
        return;
      }

      await this.disconnect();

      const client = this.buildClient(nextLogins);
      client.on("message", (channel, tags, message, self) => {
        void this.handleMessage(channel, tags, message, self);
      });
      client.on("connected", () => {
        console.log(
          `[chat-bot] conectado em ${nextLogins.length} canal(is): ${nextLogins.join(", ")}`,
        );
      });

      this.client = client;
      await client.connect();
    } catch (err) {
      console.error("[chat-bot] falha ao recarregar:", err);
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
