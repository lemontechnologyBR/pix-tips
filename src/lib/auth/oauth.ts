import { createHash, randomBytes } from "crypto";
import {
  generateWidgetToken,
  getDefaultAlertSettings,
  getDefaultAvatar,
  getDefaultTipPageSettings,
} from "@/lib/auth/creator-defaults";
import { sendWelcomeEmail } from "@/lib/auth/emails";
import { isUsernameAvailableSlug, slugifyUsername } from "@/lib/auth/validators";
import { getPrisma } from "@/lib/db";

export type OAuthProvider =
  | "google"
  | "twitch"
  | "youtube"
  | "discord"
  | "kick"
  | "streamlabs"
  | "streamelements";

export const OAUTH_STATE_COOKIE = "oauth_state";
export const OAUTH_PKCE_COOKIE = "oauth_pkce_verifier";
export const OAUTH_LINK_USER_COOKIE = "oauth_link_user_id";
export const OAUTH_RETURN_COOKIE = "oauth_return_to";
export const OAUTH_PROVIDERS: OAuthProvider[] = [
  "google",
  "twitch",
  "youtube",
  "discord",
  "kick",
  "streamlabs",
  "streamelements",
];

/** Provedores que só podem ser vinculados a uma conta existente (sem login social). */
export const LINK_ONLY_OAUTH_PROVIDERS: OAuthProvider[] = [
  "streamlabs",
  "streamelements",
];

export function isLinkOnlyOAuthProvider(provider: OAuthProvider): boolean {
  return LINK_ONLY_OAUTH_PROVIDERS.includes(provider);
}

export function generatePkcePair(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

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
  /** Handle público do canal (twitch login, kick slug, @youtube, discord). */
  username?: string;
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

export function buildAuthUrl(
  provider: OAuthProvider,
  state: string,
  options?: { codeChallenge?: string },
): string {
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

  if (provider === "kick") {
    const clientId = process.env.KICK_CLIENT_ID;
    if (!clientId) {
      throw new Error("KICK_CLIENT_ID não configurado.");
    }
    if (!options?.codeChallenge) {
      throw new Error("PKCE obrigatório para login com Kick.");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getOAuthRedirectUri("kick"),
      response_type: "code",
      scope: "user:read",
      state,
      code_challenge: options.codeChallenge,
      code_challenge_method: "S256",
    });

    return `https://id.kick.com/oauth/authorize?${params.toString()}`;
  }

  if (provider === "streamlabs") {
    const clientId = process.env.STREAMLABS_CLIENT_ID;
    if (!clientId) {
      throw new Error("STREAMLABS_CLIENT_ID não configurado.");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getOAuthRedirectUri("streamlabs"),
      response_type: "code",
      scope: "donations.create alerts.create",
      state,
    });

    return `https://streamlabs.com/api/v2.0/authorize?${params.toString()}`;
  }

  if (provider === "streamelements") {
    const clientId = process.env.STREAMELEMENTS_CLIENT_ID;
    if (!clientId) {
      throw new Error("STREAMELEMENTS_CLIENT_ID não configurado.");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getOAuthRedirectUri("streamelements"),
      response_type: "code",
      scope: "tips:write channel:read",
      state,
    });

    return `https://api.streamelements.com/oauth2/authorize?${params.toString()}`;
  }

  throw new Error(`Provedor OAuth desconhecido: ${provider}`);
}

export async function exchangeCode(
  provider: OAuthProvider,
  code: string,
  codeVerifier?: string,
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

  if (provider === "kick") {
    const clientId = process.env.KICK_CLIENT_ID;
    const clientSecret = process.env.KICK_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("Credenciais Kick OAuth não configuradas.");
    }
    if (!codeVerifier) {
      throw new Error("Verificador PKCE ausente para login com Kick.");
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: getOAuthRedirectUri("kick"),
      code_verifier: codeVerifier,
    });

    const res = await fetch("https://id.kick.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Falha ao trocar código Kick: ${detail}`);
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

  if (provider === "streamlabs") {
    const clientId = process.env.STREAMLABS_CLIENT_ID;
    const clientSecret = process.env.STREAMLABS_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("Credenciais Streamlabs OAuth não configuradas.");
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: getOAuthRedirectUri("streamlabs"),
    });

    const res = await fetch("https://streamlabs.com/api/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Falha ao trocar código Streamlabs: ${detail}`);
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

  if (provider === "streamelements") {
    const clientId = process.env.STREAMELEMENTS_CLIENT_ID;
    const clientSecret = process.env.STREAMELEMENTS_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("Credenciais StreamElements OAuth não configuradas.");
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: getOAuthRedirectUri("streamelements"),
    });

    const res = await fetch("https://api.streamelements.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Falha ao trocar código StreamElements: ${detail}`);
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

async function fetchYoutubeChannelHandle(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      items?: Array<{
        id?: string;
        snippet?: { customUrl?: string; title?: string };
      }>;
    };
    const item = data.items?.[0];
    const custom = item?.snippet?.customUrl?.replace(/^@/, "").trim();
    if (custom) return custom;
    return item?.id ?? item?.snippet?.title?.trim() ?? null;
  } catch {
    return null;
  }
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

    const info: OAuthUserInfo = {
      providerUserId: data.id,
      email: data.email.trim().toLowerCase(),
      name: data.name?.trim() || data.email.split("@")[0],
      avatar: data.picture,
    };

    if (provider === "youtube") {
      const channel = await fetchYoutubeChannelHandle(tokens.accessToken);
      if (channel) info.username = channel;
    }

    return info;
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
      username: profile.login.trim().toLowerCase(),
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
      username: data.username.trim(),
    };
  }

  if (provider === "kick") {
    const res = await fetch("https://api.kick.com/public/v1/users", {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });

    if (!res.ok) {
      throw new Error("Não foi possível obter perfil Kick.");
    }

    const payload = (await res.json()) as {
      data?: Array<{
        user_id: number;
        name?: string;
        email?: string;
        profile_picture?: string;
      }>;
    };

    const profile = payload.data?.[0];
    if (!profile?.email) {
      throw new Error("E-mail não disponível na conta Kick.");
    }

    return {
      providerUserId: String(profile.user_id),
      email: profile.email.trim().toLowerCase(),
      name: profile.name?.trim() || profile.email.split("@")[0],
      avatar: profile.profile_picture,
      username: profile.name?.trim() || undefined,
    };
  }

  if (provider === "streamlabs") {
    const res = await fetch("https://streamlabs.com/api/v2.0/user", {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });

    if (!res.ok) {
      throw new Error("Não foi possível obter perfil Streamlabs.");
    }

    const data = (await res.json()) as {
      streamlabs?: { id?: number | string; display_name?: string };
    };

    const profile = data.streamlabs;
    if (!profile?.id) {
      throw new Error("Perfil Streamlabs inválido.");
    }

    const providerUserId = String(profile.id);

    return {
      providerUserId,
      email: `${providerUserId}@linked.streamlabs`,
      name: profile.display_name?.trim() || "Streamlabs",
    };
  }

  if (provider === "streamelements") {
    const res = await fetch("https://api.streamelements.com/kappa/v2/channels/me", {
      headers: { Authorization: `oAuth ${tokens.accessToken}` },
    });

    if (!res.ok) {
      throw new Error("Não foi possível obter perfil StreamElements.");
    }

    const data = (await res.json()) as {
      _id?: string;
      email?: string;
      displayName?: string;
      username?: string;
      avatar?: string;
    };

    if (!data._id) {
      throw new Error("Perfil StreamElements inválido.");
    }

    return {
      providerUserId: data._id,
      email: (data.email ?? `${data._id}@linked.streamelements`).trim().toLowerCase(),
      name: data.displayName?.trim() || data.username?.trim() || "StreamElements",
      avatar: data.avatar,
      username: data.username?.trim() || undefined,
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
        username: userInfo.username ?? existingAccount.username,
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
          username: userInfo.username,
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
        username: userInfo.username ?? existingAccount.username,
      },
    });
    return;
  }

  await db.oAuthAccount.create({
    data: {
      userId,
      provider,
      providerAccountId: userInfo.providerUserId,
      username: userInfo.username,
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

export async function getOAuthAccountForCreator(
  creatorId: string,
  provider: OAuthProvider,
): Promise<{ accessToken: string; providerAccountId: string } | null> {
  const db = getPrisma();
  const creator = await db.creator.findUnique({
    where: { id: creatorId },
    select: {
      user: {
        select: {
          oauthAccounts: {
            where: { provider },
            select: {
              accessToken: true,
              providerAccountId: true,
            },
            take: 1,
          },
        },
      },
    },
  });

  const account = creator?.user.oauthAccounts[0];
  if (!account?.accessToken) return null;

  return {
    accessToken: account.accessToken,
    providerAccountId: account.providerAccountId,
  };
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
