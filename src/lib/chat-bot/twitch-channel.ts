import { getPrisma } from "@/lib/db";

export async function hasTwitchOAuth(userId: string): Promise<boolean> {
  const db = getPrisma();
  const account = await db.oAuthAccount.findFirst({
    where: { userId, provider: "twitch" },
    select: { id: true },
  });
  return Boolean(account);
}

export async function resolveTwitchLogin(userId: string): Promise<string | null> {
  const db = getPrisma();
  const account = await db.oAuthAccount.findFirst({
    where: { userId, provider: "twitch" },
    select: { accessToken: true },
  });

  if (!account?.accessToken) return null;

  const clientId = process.env.TWITCH_CLIENT_ID;
  if (!clientId) return null;

  const res = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${account.accessToken}`,
      "Client-Id": clientId,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    data: Array<{ login: string }>;
  };

  const login = data.data[0]?.login;
  return login ? login.toLowerCase() : null;
}
