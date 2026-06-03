import { getPrisma } from "@/lib/db";
import { resolveTwitchLogin } from "@/lib/chat-bot/twitch-channel";
import { parseJson } from "@/lib/repositories/json-fields";
import type { ChatBotSettings } from "@/types";
import { defaultChatBotSettings } from "@/lib/chat-bot/settings";

export interface TwitchViewerResult {
  viewers: number;
  live: boolean;
  channel: string | null;
  mock?: boolean;
}

let appTokenCache: { token: string; expiresAt: number } | null = null;

async function getAppAccessToken(): Promise<string | null> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  if (appTokenCache && Date.now() < appTokenCache.expiresAt - 60_000) {
    return appTokenCache.token;
  }

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { access_token: string; expires_in: number };
  appTokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

export async function resolveCreatorTwitchChannel(creatorId: string): Promise<string | null> {
  const db = getPrisma();
  const creator = await db.creator.findUnique({
    where: { id: creatorId },
    select: { userId: true, chatBotSettings: true },
  });
  if (!creator) return null;

  const chatBot = parseJson<Partial<ChatBotSettings>>(
    creator.chatBotSettings ?? "{}",
    defaultChatBotSettings(),
  );
  if (chatBot.twitchChannel?.trim()) {
    return chatBot.twitchChannel.trim().toLowerCase();
  }

  return resolveTwitchLogin(creator.userId);
}

export async function fetchTwitchViewerCount(login: string): Promise<TwitchViewerResult> {
  const token = await getAppAccessToken();
  const clientId = process.env.TWITCH_CLIENT_ID;
  const channel = login.toLowerCase();

  if (!token || !clientId) {
    return { viewers: 847, live: true, channel, mock: true };
  }

  const res = await fetch(
    `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(channel)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": clientId,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return { viewers: 0, live: false, channel };
  }

  const data = (await res.json()) as {
    data: Array<{ viewer_count: number }>;
  };

  const stream = data.data[0];
  if (!stream) {
    return { viewers: 0, live: false, channel };
  }

  return { viewers: stream.viewer_count, live: true, channel };
}

export async function getTwitchViewersForCreator(
  creatorId: string,
): Promise<TwitchViewerResult> {
  const channel = await resolveCreatorTwitchChannel(creatorId);
  if (!channel) {
    return { viewers: 0, live: false, channel: null };
  }
  return fetchTwitchViewerCount(channel);
}
