import * as creatorRepo from "@/lib/repositories/creator-repository";
import type { ChatBotSettings } from "@/types";
import {
  defaultChatBotSettings,
  normalizeChatBotSettings,
} from "@/lib/chat-bot/settings";
import { parseJson } from "@/lib/repositories/json-fields";

export interface ActiveChatBot {
  creatorId: string;
  username: string;
  displayName: string;
  twitchChannel: string;
  settings: ChatBotSettings;
}

export function parseChatBotSettings(raw: string): ChatBotSettings {
  return normalizeChatBotSettings(
    parseJson<Partial<ChatBotSettings>>(raw, defaultChatBotSettings()),
  );
}

export async function getChatBotSettingsForCreator(
  creatorId: string,
): Promise<ChatBotSettings | null> {
  const creator = await creatorRepo.getById(creatorId);
  return creator?.chatBotSettings ?? null;
}

export async function updateChatBotSettings(
  creatorId: string,
  patch: Partial<ChatBotSettings>,
): Promise<ChatBotSettings | null> {
  const creator = await creatorRepo.getById(creatorId);
  if (!creator) return null;

  const merged = normalizeChatBotSettings({
    ...creator.chatBotSettings,
    ...patch,
  });

  const updated = await creatorRepo.update(creatorId, {
    chatBotSettings: merged,
  });

  return updated?.chatBotSettings ?? null;
}

export async function getActiveChatBots(): Promise<ActiveChatBot[]> {
  const { getPrisma } = await import("@/lib/db");
  const db = getPrisma();
  const rows = await db.creator.findMany({
    where: { isSuspended: false },
    select: {
      id: true,
      username: true,
      displayName: true,
      chatBotSettings: true,
    },
  });

  const active: ActiveChatBot[] = [];

  for (const row of rows) {
    const settings = parseChatBotSettings(row.chatBotSettings ?? "{}");
    if (!settings.enabled || !settings.twitchChannel) continue;

    active.push({
      creatorId: row.id,
      username: row.username,
      displayName: row.displayName,
      twitchChannel: settings.twitchChannel,
      settings,
    });
  }

  return active;
}

export function isChatBotConfigured(): boolean {
  return Boolean(
    process.env.TWITCH_BOT_USERNAME?.trim() &&
      process.env.TWITCH_BOT_OAUTH_TOKEN?.trim(),
  );
}
