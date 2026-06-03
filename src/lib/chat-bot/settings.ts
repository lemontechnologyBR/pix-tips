import { tipPageUrl } from "@/lib/brand";
import type { ChatBotCommand, ChatBotSettings } from "@/types";

const MAX_COMMANDS = 20;
const MAX_TRIGGER_LEN = 32;
const MAX_RESPONSE_LEN = 450;
const MAX_PREFIX_LEN = 3;

export const BUILTIN_COMMANDS: ChatBotCommand[] = [
  {
    id: "builtin-pix",
    trigger: "pix",
    response: "Apoie via Pix: {url}",
    enabled: true,
    builtin: true,
  },
  {
    id: "builtin-doar",
    trigger: "doar",
    response: "Doe aqui: {url}",
    enabled: true,
    builtin: true,
  },
  {
    id: "builtin-ajuda",
    trigger: "ajuda",
    response: "",
    enabled: true,
    builtin: true,
  },
];

export function defaultChatBotSettings(): ChatBotSettings {
  return {
    enabled: false,
    prefix: "!",
    twitchChannel: null,
    commands: BUILTIN_COMMANDS.map((cmd) => ({ ...cmd })),
  };
}

function sanitizeTrigger(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^!+/, "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, MAX_TRIGGER_LEN);
}

function sanitizePrefix(raw: string): string {
  const trimmed = raw.trim().slice(0, MAX_PREFIX_LEN);
  return trimmed || "!";
}

function mergeCommands(raw: ChatBotCommand[] | undefined): ChatBotCommand[] {
  const builtins = BUILTIN_COMMANDS.map((base) => {
    const found = raw?.find((cmd) => cmd.id === base.id);
    if (!found) return { ...base };
    return {
      ...base,
      response:
        typeof found.response === "string"
          ? found.response.slice(0, MAX_RESPONSE_LEN)
          : base.response,
      enabled: found.enabled !== false,
    };
  });

  const custom =
    raw
      ?.filter((cmd) => !cmd.builtin && cmd.id && cmd.trigger)
      .map((cmd) => ({
        id: cmd.id,
        trigger: sanitizeTrigger(cmd.trigger),
        response: String(cmd.response ?? "").slice(0, MAX_RESPONSE_LEN),
        enabled: cmd.enabled !== false,
      }))
      .filter((cmd) => cmd.trigger.length > 0) ?? [];

  const seen = new Set<string>();
  const merged: ChatBotCommand[] = [];

  for (const cmd of [...builtins, ...custom]) {
    if (seen.has(cmd.trigger)) continue;
    seen.add(cmd.trigger);
    merged.push(cmd);
    if (merged.length >= MAX_COMMANDS) break;
  }

  return merged;
}

export function normalizeChatBotSettings(
  raw: Partial<ChatBotSettings> | null | undefined,
): ChatBotSettings {
  const base = defaultChatBotSettings();
  if (!raw) return base;

  const channel =
    typeof raw.twitchChannel === "string" && raw.twitchChannel.trim()
      ? raw.twitchChannel.trim().toLowerCase()
      : null;

  return {
    enabled: raw.enabled === true,
    prefix: sanitizePrefix(raw.prefix ?? base.prefix),
    twitchChannel: channel,
    commands: mergeCommands(raw.commands),
  };
}

export interface ChatBotRenderContext {
  username: string;
  displayName: string;
}

export function buildHelpResponse(
  settings: ChatBotSettings,
  prefix: string,
): string {
  const triggers = settings.commands
    .filter((cmd) => cmd.enabled && cmd.trigger !== "ajuda")
    .map((cmd) => `${prefix}${cmd.trigger}`);

  if (triggers.length === 0) {
    return "Nenhum comando disponível no momento.";
  }

  return `Comandos: ${triggers.join(" · ")}`;
}

export function renderCommandResponse(
  command: ChatBotCommand,
  settings: ChatBotSettings,
  ctx: ChatBotRenderContext,
): string {
  if (command.trigger === "ajuda" && !command.response.trim()) {
    return buildHelpResponse(settings, settings.prefix);
  }

  const url = tipPageUrl(ctx.username);
  const text = command.response
    .replace(/\{url\}/gi, url)
    .replace(/\{nome\}/gi, ctx.displayName)
    .replace(/\{usuario\}/gi, ctx.username);

  return text.trim().slice(0, MAX_RESPONSE_LEN);
}

export function findMatchingCommand(
  message: string,
  settings: ChatBotSettings,
): ChatBotCommand | null {
  const trimmed = message.trim();
  if (!trimmed.startsWith(settings.prefix)) return null;

  const body = trimmed.slice(settings.prefix.length).trim();
  if (!body) return null;

  const trigger = body.split(/\s+/)[0]?.toLowerCase();
  if (!trigger) return null;

  const command = settings.commands.find(
    (cmd) => cmd.enabled && cmd.trigger === trigger,
  );
  return command ?? null;
}
