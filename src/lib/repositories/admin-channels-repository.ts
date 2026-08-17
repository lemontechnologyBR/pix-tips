import { prisma } from "@/lib/db";
import { DEMO_CREATOR_ID } from "@/lib/demo";
import { SITE_URL } from "@/lib/brand";

export const STREAM_CHANNEL_PROVIDERS = [
  "twitch",
  "kick",
  "youtube",
  "discord",
] as const;

export type StreamChannelProvider = (typeof STREAM_CHANNEL_PROVIDERS)[number];

export interface AdminChannelLink {
  provider: StreamChannelProvider;
  handle: string | null;
  url: string | null;
  connectedAt: string;
}

export interface AdminStreamerChannelRow {
  creatorId: string;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  plan: string;
  tipPageUrl: string;
  channels: AdminChannelLink[];
}

export interface AdminStreamerChannelsResult {
  items: AdminStreamerChannelRow[];
  total: number;
  page: number;
  totalPages: number;
  counts: {
    creatorsWithChannels: number;
    twitch: number;
    kick: number;
    youtube: number;
    discord: number;
  };
}

function parseChatBotTwitch(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { twitchChannel?: unknown };
    if (typeof parsed.twitchChannel === "string" && parsed.twitchChannel.trim()) {
      return parsed.twitchChannel.trim().replace(/^#/, "").toLowerCase();
    }
  } catch {
    // ignore
  }
  return null;
}

function channelUrl(
  provider: StreamChannelProvider,
  handle: string | null,
  providerAccountId: string,
): string | null {
  if (provider === "discord") {
    return `https://discord.com/users/${providerAccountId}`;
  }
  if (!handle) return null;
  const slug = handle.replace(/^@/, "");
  if (provider === "twitch") return `https://twitch.tv/${slug}`;
  if (provider === "kick") return `https://kick.com/${slug}`;
  if (provider === "youtube") {
    if (slug.startsWith("UC") && slug.length >= 20) {
      return `https://youtube.com/channel/${slug}`;
    }
    return `https://youtube.com/@${slug}`;
  }
  return null;
}

async function resolveMissingTwitchLogin(
  accessToken: string | null,
): Promise<string | null> {
  if (!accessToken) return null;
  const clientId = process.env.TWITCH_CLIENT_ID;
  if (!clientId) return null;
  try {
    const res = await fetch("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": clientId,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { data?: Array<{ login?: string }> };
    const login = data.data?.[0]?.login?.trim().toLowerCase();
    return login || null;
  } catch {
    return null;
  }
}

async function resolveMissingKickName(
  accessToken: string | null,
): Promise<string | null> {
  if (!accessToken) return null;
  try {
    const res = await fetch("https://api.kick.com/public/v1/users", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const payload = (await res.json()) as {
      data?: Array<{ name?: string }>;
    };
    const name = payload.data?.[0]?.name?.trim();
    return name || null;
  } catch {
    return null;
  }
}

export async function getAdminStreamerChannels(opts: {
  page?: number;
  search?: string;
  platform?: string;
  limit?: number;
} = {}): Promise<AdminStreamerChannelsResult> {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(50, Math.max(1, opts.limit ?? 20));
  const search = opts.search?.trim() ?? "";
  const platform = STREAM_CHANNEL_PROVIDERS.includes(
    opts.platform as StreamChannelProvider,
  )
    ? (opts.platform as StreamChannelProvider)
    : "all";

  const [twitchCount, kickCount, youtubeCount, discordCount] = await Promise.all(
    STREAM_CHANNEL_PROVIDERS.map((provider) =>
      prisma.oAuthAccount.count({
        where: {
          provider,
          user: { creator: { id: { not: DEMO_CREATOR_ID } } },
        },
      }),
    ),
  );

  const creatorsWithChannels = await prisma.creator.count({
    where: {
      id: { not: DEMO_CREATOR_ID },
      user: {
        oauthAccounts: {
          some: { provider: { in: [...STREAM_CHANNEL_PROVIDERS] } },
        },
      },
    },
  });

  const oauthSome =
    platform === "all"
      ? { provider: { in: [...STREAM_CHANNEL_PROVIDERS] } }
      : { provider: platform };

  const where = {
    id: { not: DEMO_CREATOR_ID },
    user: {
      oauthAccounts: { some: oauthSome },
    },
    ...(search
      ? {
          OR: [
            { username: { contains: search } },
            { displayName: { contains: search } },
            { user: { email: { contains: search } } },
            { user: { name: { contains: search } } },
            {
              user: {
                oauthAccounts: {
                  some: { username: { contains: search } },
                },
              },
            },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.creator.findMany({
      where,
      select: {
        id: true,
        userId: true,
        username: true,
        displayName: true,
        avatar: true,
        plan: true,
        chatBotSettings: true,
        user: {
          select: {
            oauthAccounts: {
              where: { provider: { in: [...STREAM_CHANNEL_PROVIDERS] } },
              select: {
                id: true,
                provider: true,
                providerAccountId: true,
                username: true,
                accessToken: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.creator.count({ where }),
  ]);

  const items: AdminStreamerChannelRow[] = [];

  for (const row of rows) {
    const botTwitch = parseChatBotTwitch(row.chatBotSettings);
    const channels: AdminChannelLink[] = [];

    for (const account of row.user.oauthAccounts) {
      if (
        !STREAM_CHANNEL_PROVIDERS.includes(
          account.provider as StreamChannelProvider,
        )
      ) {
        continue;
      }
      const provider = account.provider as StreamChannelProvider;
      let handle = account.username?.trim() || null;

      if (!handle && provider === "twitch") {
        handle =
          botTwitch ?? (await resolveMissingTwitchLogin(account.accessToken));
        if (handle && handle !== account.username) {
          await prisma.oAuthAccount
            .update({ where: { id: account.id }, data: { username: handle } })
            .catch(() => undefined);
        }
      }

      if (!handle && provider === "kick") {
        handle = await resolveMissingKickName(account.accessToken);
        if (handle && handle !== account.username) {
          await prisma.oAuthAccount
            .update({ where: { id: account.id }, data: { username: handle } })
            .catch(() => undefined);
        }
      }

      channels.push({
        provider,
        handle,
        url: channelUrl(provider, handle, account.providerAccountId),
        connectedAt: account.createdAt.toISOString(),
      });
    }

    if (botTwitch && !channels.some((c) => c.provider === "twitch")) {
      channels.push({
        provider: "twitch",
        handle: botTwitch,
        url: channelUrl("twitch", botTwitch, ""),
        connectedAt: new Date(0).toISOString(),
      });
    }

    items.push({
      creatorId: row.id,
      userId: row.userId,
      username: row.username,
      displayName: row.displayName,
      avatar: row.avatar,
      plan: row.plan,
      tipPageUrl: `${SITE_URL}/${row.username}`,
      channels: channels.sort((a, b) =>
        STREAM_CHANNEL_PROVIDERS.indexOf(a.provider) -
        STREAM_CHANNEL_PROVIDERS.indexOf(b.provider),
      ),
    });
  }

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    counts: {
      creatorsWithChannels,
      twitch: twitchCount,
      kick: kickCount,
      youtube: youtubeCount,
      discord: discordCount,
    },
  };
}
