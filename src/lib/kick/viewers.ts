import { getPrisma } from "@/lib/db";
import type { ViewerPlatformResult } from "@/lib/viewers/types";

let appTokenCache: { token: string; expiresAt: number } | null = null;

async function getKickAppAccessToken(): Promise<string | null> {
  const clientId = process.env.KICK_CLIENT_ID;
  const clientSecret = process.env.KICK_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  if (appTokenCache && Date.now() < appTokenCache.expiresAt - 60_000) {
    return appTokenCache.token;
  }

  const res = await fetch("https://id.kick.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
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

export async function resolveKickBroadcasterId(creatorId: string): Promise<string | null> {
  const db = getPrisma();
  const creator = await db.creator.findUnique({
    where: { id: creatorId },
    select: { userId: true },
  });
  if (!creator) return null;

  const account = await db.oAuthAccount.findFirst({
    where: { userId: creator.userId, provider: "kick" },
    select: { providerAccountId: true },
  });

  return account?.providerAccountId?.trim() || null;
}

export async function fetchKickViewerCount(
  broadcasterUserId: string,
): Promise<ViewerPlatformResult> {
  const token = await getKickAppAccessToken();
  const channel = broadcasterUserId;

  if (!token) {
    return { viewers: 0, live: false, channel, mock: true };
  }

  const url = new URL("https://api.kick.com/public/v1/livestreams");
  url.searchParams.append("broadcaster_user_id", broadcasterUserId);
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return { viewers: 0, live: false, channel };
  }

  const payload = (await res.json()) as {
    data?: Array<{ viewer_count?: number }>;
  };

  const stream = payload.data?.[0];
  if (!stream) {
    return { viewers: 0, live: false, channel };
  }

  return {
    viewers: stream.viewer_count ?? 0,
    live: true,
    channel,
  };
}

export async function getKickViewersForCreator(
  creatorId: string,
): Promise<ViewerPlatformResult> {
  const broadcasterId = await resolveKickBroadcasterId(creatorId);
  if (!broadcasterId) {
    return { viewers: 0, live: false, channel: null };
  }
  return fetchKickViewerCount(broadcasterId);
}
