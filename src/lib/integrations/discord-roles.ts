import { getPrisma } from "@/lib/db";

export interface DiscordRoleMapping {
  minAmount: number;
  roleId: string;
  roleName?: string;
}

export interface DiscordSettings {
  guildId: string | null;
  roleMappings: DiscordRoleMapping[];
}

export function defaultDiscordSettings(): DiscordSettings {
  return { guildId: null, roleMappings: [] };
}

export function normalizeDiscordSettings(
  raw: Partial<DiscordSettings> | null | undefined,
): DiscordSettings {
  const base = defaultDiscordSettings();
  if (!raw || typeof raw !== "object") return base;
  const guildId =
    typeof raw.guildId === "string" && raw.guildId.trim()
      ? raw.guildId.trim()
      : null;
  const mappings = Array.isArray(raw.roleMappings)
    ? raw.roleMappings
        .filter(
          (m): m is DiscordRoleMapping =>
            !!m &&
            typeof m === "object" &&
            typeof m.roleId === "string" &&
            m.roleId.trim().length > 0 &&
            typeof m.minAmount === "number" &&
            Number.isFinite(m.minAmount) &&
            m.minAmount >= 0,
        )
        .map((m) => ({
          minAmount: Math.round(m.minAmount * 100) / 100,
          roleId: m.roleId.trim(),
          roleName:
            typeof m.roleName === "string" && m.roleName.trim()
              ? m.roleName.trim().slice(0, 100)
              : undefined,
        }))
        .sort((a, b) => b.minAmount - a.minAmount)
    : [];
  return { guildId, roleMappings: mappings };
}

export function parseDiscordSettingsJson(raw: string | null | undefined): DiscordSettings {
  try {
    const parsed = JSON.parse(raw || "{}") as Partial<DiscordSettings>;
    return normalizeDiscordSettings(parsed);
  } catch {
    return defaultDiscordSettings();
  }
}

export function getDiscordBotToken(): string | null {
  const t = process.env.DISCORD_BOT_TOKEN?.trim();
  return t || null;
}

export function getDiscordBotClientId(): string | null {
  return (
    process.env.DISCORD_BOT_CLIENT_ID?.trim() ||
    process.env.DISCORD_CLIENT_ID?.trim() ||
    null
  );
}

export function isDiscordBotConfigured(): boolean {
  return Boolean(getDiscordBotToken() && getDiscordBotClientId());
}

export function getDiscordBotInviteUrl(): string | null {
  const clientId = getDiscordBotClientId();
  if (!clientId) return null;
  // Manage Roles
  const permissions = "268435456";
  return `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(clientId)}&permissions=${permissions}&scope=bot%20applications.commands`;
}

async function discordBotFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = getDiscordBotToken();
  if (!token) throw new Error("Bot Discord não configurado");
  return fetch(`https://discord.com/api/v10${path}`, {
    ...init,
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

export interface DiscordGuildRole {
  id: string;
  name: string;
  position: number;
  managed: boolean;
}

export async function listGuildRoles(guildId: string): Promise<DiscordGuildRole[]> {
  const res = await discordBotFetch(`/guilds/${encodeURIComponent(guildId)}/roles`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      res.status === 403 || res.status === 404
        ? "Bot sem acesso a este servidor. Convide o bot e use o ID correto."
        : `Falha ao listar cargos (${res.status}): ${text.slice(0, 120)}`,
    );
  }
  const roles = (await res.json()) as Array<{
    id: string;
    name: string;
    position: number;
    managed?: boolean;
  }>;
  return roles
    .filter((r) => r.name !== "@everyone" && !r.managed)
    .map((r) => ({
      id: r.id,
      name: r.name,
      position: r.position,
      managed: Boolean(r.managed),
    }))
    .sort((a, b) => b.position - a.position);
}

export async function grantDiscordRole(
  guildId: string,
  memberId: string,
  roleId: string,
): Promise<boolean> {
  const res = await discordBotFetch(
    `/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(memberId)}/roles/${encodeURIComponent(roleId)}`,
    { method: "PUT" },
  );
  if (res.status === 204 || res.ok) return true;
  const text = await res.text().catch(() => "");
  console.warn(
    `[discord-roles] grant failed guild=${guildId} member=${memberId} role=${roleId} status=${res.status} ${text.slice(0, 200)}`,
  );
  return false;
}

/** Escolhe o cargo com maior minAmount que o tip cobre. */
export function pickRoleForAmount(
  mappings: DiscordRoleMapping[],
  amount: number,
): DiscordRoleMapping | null {
  const eligible = mappings
    .filter((m) => amount >= m.minAmount)
    .sort((a, b) => b.minAmount - a.minAmount);
  return eligible[0] ?? null;
}

export async function tryGrantDiscordRoleForDonation(input: {
  creatorId: string;
  amount: number;
  donorUserId?: string | null;
}): Promise<void> {
  if (!input.donorUserId) return;
  if (!isDiscordBotConfigured()) return;

  const prisma = getPrisma();
  const creator = await prisma.creator.findUnique({
    where: { id: input.creatorId },
    select: { discordSettings: true },
  });
  if (!creator) return;

  const settings = parseDiscordSettingsJson(creator.discordSettings);
  if (!settings.guildId || settings.roleMappings.length === 0) return;

  const mapping = pickRoleForAmount(settings.roleMappings, input.amount);
  if (!mapping) return;

  const oauth = await prisma.oAuthAccount.findFirst({
    where: { userId: input.donorUserId, provider: "discord" },
    select: { providerAccountId: true },
  });
  if (!oauth?.providerAccountId) return;

  await grantDiscordRole(settings.guildId, oauth.providerAccountId, mapping.roleId);
}
