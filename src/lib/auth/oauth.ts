import { randomBytes } from "crypto";
import {
  generateWidgetToken,
  getDefaultAlertSettings,
  getDefaultAvatar,
  getDefaultTipPageSettings,
} from "@/lib/auth/creator-defaults";
import { sendWelcomeEmail } from "@/lib/auth/emails";
import { isUsernameAvailableSlug, slugifyUsername } from "@/lib/auth/validators";
import { getPrisma } from "@/lib/db";

export type OAuthProvider = "google" | "twitch" | "youtube" | "discord";

export const OAUTH_STATE_COOKIE = "oauth_state";
export const OAUTH_LINK_USER_COOKIE = "oauth_link_user_id";
export const OAUTH_RETURN_COOKIE = "oauth_return_to";
export const OAUTH_PROVIDERS: OAuthProvider[] = [
  "google",
  "twitch",
  "youtube",
  "discord",
];

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface OAuthUserInfo {
  providerUserId: string;
  email: string;
  name: string;
  avatar?: string;
}

function getRedirectBase(): string {
  return process.env.OAUTH_REDIRECT_BASE ?? "http://localhost:3000";
}

export function getOAuthRedirectUri(provider: OAuthProvider): string {
  return `${getRedirectBase()}/api/auth/oauth/${provider}/callback`;
}

export function isOAuthProvider(value: string): value is OAuthProvider {
  return OAUTH_PROVIDERS.includes(value as OAuthProvider);
}

export function generateOAuthState(): string {
  return randomBytes(32).toString("hex");
}

function googleScopes(provider: OAuthProvider): string[] {
  const scopes = ["openid", "email", "profile"];
  if (provider === "youtube") {
    scopes.push("https://www.googleapis.com/auth/youtube.readonly");
  }
  return scopes;
}

export function buildAuthUrl(provider: OAuthProvider, state: string): string {
  if (provider === "google" || provider === "youtube") {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error("GOOGLE_CLIENT_ID não configurado.");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getOAuthRedirectUri(provider),
      response_type: "code",
      scope: googleScopes(provider).join(" "),
      state,
      access_type: "offline",
      prompt: "consent",
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  if (provider === "twitch") {
    const clientId = process.env.TWITCH_CLIENT_ID;
    if (!clientId) {
      throw new Error("TWITCH_CLIENT_ID não configurado.");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getOAuthRedirectUri("twitch"),
      response_type: "code",
      scope: "user:read:email",
      state,
    });

    return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
  }

  if (provider === "discord") {
    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) {
      throw new Error("DISCORD_CLIENT_ID não configurado.");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getOAuthRedirectUri("discord"),
      response_type: "code",
      scope: "identify email",
      state,
      prompt: "consent",
    });

    return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  }

  throw new Error(`Provedor OAuth desconhecido: ${provider}`);
}

export async function exchangeCode(
  provider: OAuthProvider,
  code: string,
): Promise<OAuthTokens> {
  if (provider === "google" || provider === "youtube") {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("Credenciais Google OAuth não configuradas.");
    }

    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getOAuthRedirectUri(provider),
      grant_type: "authorization_code",
    });

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Falha ao trocar código Google: ${detail}`);
    }

    const data = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  if (provider === "twitch") {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("Credenciais Twitch OAuth não configuradas.");
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: getOAuthRedirectUri("twitch"),
    });

    const res = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Falha ao trocar código Twitch: ${detail}`);
    }

    const data = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  if (provider === "discord") {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("Credenciais Discord OAuth não configuradas.");
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: getOAuthRedirectUri("discord"),
    });

    const res = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Falha ao trocar código Discord: ${detail}`);
    }

    const data = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  throw new Error(`Provedor OAuth desconhecido: ${provider}`);
}

export async function getUserInfo(
  provider: OAuthProvider,
  tokens: OAuthTokens,
): Promise<OAuthUserInfo> {
  if (provider === "google" || provider === "youtube") {
    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });

    if (!res.ok) {
      throw new Error("Não foi possível obter perfil Google.");
    }

    const data = (await res.json()) as {
      id: string;
      email?: string;
      name?: string;
      picture?: string;
    };

    if (!data.email) {
      throw new Error("E-mail não disponível na conta Google.");
    }

    return {
      providerUserId: data.id,
      email: data.email.trim().toLowerCase(),
      name: data.name?.trim() || data.email.split("@")[0],
      avatar: data.picture,
    };
  }

  if (provider === "twitch") {
    const clientId = process.env.TWITCH_CLIENT_ID;
    if (!clientId) {
      throw new Error("TWITCH_CLIENT_ID não configurado.");
    }

    const res = await fetch("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Client-Id": clientId,
      },
    });

    if (!res.ok) {
      throw new Error("Não foi possível obter perfil Twitch.");
    }

    const data = (await res.json()) as {
      data: Array<{
        id: string;
        login: string;
        display_name: string;
        email?: string;
        profile_image_url?: string;
      }>;
    };

    const profile = data.data[0];
    if (!profile?.email) {
      throw new Error("E-mail não disponível na conta Twitch.");
    }

    return {
      providerUserId: profile.id,
      email: profile.email.trim().toLowerCase(),
      name: profile.display_name.trim() || profile.login,
      avatar: profile.profile_image_url,
    };
  }

  if (provider === "discord") {
    const res = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });

    if (!res.ok) {
      throw new Error("Não foi possível obter perfil Discord.");
    }

    const data = (await res.json()) as {
      id: string;
      username: string;
      global_name?: string | null;
      email?: string;
      avatar?: string | null;
    };

    if (!data.email) {
      throw new Error("E-mail não disponível na conta Discord.");
    }

    const avatar =
      data.avatar != null
        ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
        : undefined;

    return {
      providerUserId: data.id,
      email: data.email.trim().toLowerCase(),
      name: data.global_name?.trim() || data.username,
      avatar,
    };
  }

  throw new Error(`Provedor OAuth desconhecido: ${provider}`);
}

async function generateUniqueUsername(email: string): Promise<string> {
  const db = getPrisma();
  const prefix = slugifyUsername(email.split("@")[0]);
  let base = prefix.length >= 3 ? prefix : `user${prefix || "oauth"}`;

  if (!isUsernameAvailableSlug(base)) {
    base = `user${randomBytes(3).toString("hex")}`;
  }

  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate =
      attempt === 0
        ? base
        : `${base.slice(0, 22)}_${randomBytes(2).toString("hex")}`.slice(0, 30);

    if (!isUsernameAvailableSlug(candidate)) continue;

    const existing = await db.creator.findUnique({ where: { username: candidate } });
    if (!existing) return candidate;
  }

  return `user${randomBytes(4).toString("hex")}`.slice(0, 30);
}

export interface OAuthSessionResult {
  userId: string;
  creatorId: string;
  email: string;
  role: string;
  onboardingCompleted: boolean;
  totpEnabled: boolean;
  isNewUser: boolean;
}

export async function findOrCreateOAuthUser(
  provider: OAuthProvider,
  userInfo: OAuthUserInfo,
  tokens: OAuthTokens,
): Promise<OAuthSessionResult> {
  const db = getPrisma();

  const existingAccount = await db.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId: userInfo.providerUserId,
      },
    },
    include: {
      user: { include: { creator: true } },
    },
  });

  if (existingAccount) {
    await db.oAuthAccount.update({
      where: { id: existingAccount.id },
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });

    const creator = existingAccount.user.creator;
    if (!creator) {
      throw new Error("Conta de criador não encontrada.");
    }

    return {
      userId: existingAccount.user.id,
      creatorId: creator.id,
      email: existingAccount.user.email,
      role: existingAccount.user.role,
      onboardingCompleted: creator.onboardingCompleted,
      totpEnabled: existingAccount.user.totpEnabled,
      isNewUser: false,
    };
  }

  const existingUser = await db.user.findUnique({
    where: { email: userInfo.email },
    include: { creator: true },
  });

  if (existingUser) {
    throw new Error("oauth_email_conflict");
  }

  const username = await generateUniqueUsername(userInfo.email);
  const alertSettings = getDefaultAlertSettings();
  const tipPageSettings = getDefaultTipPageSettings();

  const user = await db.user.create({
    data: {
      email: userInfo.email,
      passwordHash: null,
      name: userInfo.name,
      emailVerified: true,
      creator: {
        create: {
          username,
          displayName: userInfo.name,
          avatar: userInfo.avatar || getDefaultAvatar(username),
          widgetToken: generateWidgetToken(),
          paymentMethods: JSON.stringify(["pix"]),
          alertSettings: JSON.stringify(alertSettings),
          tipPageSettings: JSON.stringify(tipPageSettings),
        },
      },
      oauthAccounts: {
        create: {
          provider,
          providerAccountId: userInfo.providerUserId,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      },
    },
    include: { creator: true },
  });

  const creator = user.creator!;
  await sendWelcomeEmail(user.email, creator.displayName, creator.username);

  return {
    userId: user.id,
    creatorId: creator.id,
    email: user.email,
    role: user.role,
    onboardingCompleted: creator.onboardingCompleted,
    totpEnabled: user.totpEnabled,
    isNewUser: true,
  };
}

export async function linkOAuthAccount(
  userId: string,
  provider: OAuthProvider,
  userInfo: OAuthUserInfo,
  tokens: OAuthTokens,
): Promise<void> {
  const db = getPrisma();

  const existingAccount = await db.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId: userInfo.providerUserId,
      },
    },
  });

  if (existingAccount) {
    if (existingAccount.userId !== userId) {
      throw new Error("Esta conta social já está vinculada a outro usuário.");
    }

    await db.oAuthAccount.update({
      where: { id: existingAccount.id },
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
    return;
  }

  await db.oAuthAccount.create({
    data: {
      userId,
      provider,
      providerAccountId: userInfo.providerUserId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
}

export async function listOAuthAccounts(
  userId: string,
): Promise<{ provider: OAuthProvider; createdAt: Date }[]> {
  const db = getPrisma();
  const accounts = await db.oAuthAccount.findMany({
    where: { userId },
    select: { provider: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return accounts
    .filter((account) => isOAuthProvider(account.provider))
    .map((account) => ({
      provider: account.provider as OAuthProvider,
      createdAt: account.createdAt,
    }));
}

export async function unlinkOAuthAccount(
  userId: string,
  provider: OAuthProvider,
): Promise<void> {
  const db = getPrisma();

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { oauthAccounts: true },
  });

  if (!user) {
    throw new Error("Usuário não encontrado.");
  }

  const account = user.oauthAccounts.find((a) => a.provider === provider);
  if (!account) {
    throw new Error("Conta social não vinculada.");
  }

  if (!user.passwordHash && user.oauthAccounts.length <= 1) {
    throw new Error(
      "Defina uma senha antes de desvincular sua única forma de login.",
    );
  }

  await db.oAuthAccount.delete({ where: { id: account.id } });
}
