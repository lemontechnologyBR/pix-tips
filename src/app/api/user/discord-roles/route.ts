import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { getPrisma } from "@/lib/db";
import {
  getDiscordBotInviteUrl,
  isDiscordBotConfigured,
  listGuildRoles,
  normalizeDiscordSettings,
  type DiscordRoleMapping,
} from "@/lib/integrations/discord-roles";

export async function GET() {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const settings = session.creator.discordSettings ?? normalizeDiscordSettings({});
  let roles: Awaited<ReturnType<typeof listGuildRoles>> = [];
  let rolesError: string | null = null;

  if (settings.guildId && isDiscordBotConfigured()) {
    try {
      roles = await listGuildRoles(settings.guildId);
    } catch (err) {
      rolesError = err instanceof Error ? err.message : "Erro ao listar cargos";
    }
  }

  return NextResponse.json({
    botConfigured: isDiscordBotConfigured(),
    inviteUrl: getDiscordBotInviteUrl(),
    settings,
    roles,
    rolesError,
  });
}

export async function PUT(request: Request) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  if (!isDiscordBotConfigured()) {
    return NextResponse.json(
      { error: "Bot Discord não configurado no servidor." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    guildId?: unknown;
    roleMappings?: unknown;
  };

  const guildId =
    typeof body.guildId === "string" ? body.guildId.trim() : "";
  if (guildId && !/^\d{15,25}$/.test(guildId)) {
    return NextResponse.json(
      { error: "Guild ID inválido. Cole o ID numérico do servidor." },
      { status: 400 },
    );
  }

  const rawMappings = Array.isArray(body.roleMappings) ? body.roleMappings : [];
  const roleMappings: DiscordRoleMapping[] = [];
  for (const m of rawMappings) {
    if (!m || typeof m !== "object") continue;
    const item = m as Record<string, unknown>;
    const roleId = typeof item.roleId === "string" ? item.roleId.trim() : "";
    const minAmount = Number(item.minAmount);
    if (!roleId || !Number.isFinite(minAmount) || minAmount < 0) continue;
    roleMappings.push({
      roleId,
      minAmount,
      roleName:
        typeof item.roleName === "string" ? item.roleName.slice(0, 100) : undefined,
    });
  }

  const settings = normalizeDiscordSettings({
    guildId: guildId || null,
    roleMappings,
  });

  if (settings.guildId) {
    try {
      await listGuildRoles(settings.guildId);
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Não foi possível acessar o servidor Discord.",
        },
        { status: 400 },
      );
    }
  }

  const prisma = getPrisma();
  await prisma.creator.update({
    where: { id: session.creator.id },
    data: { discordSettings: JSON.stringify(settings) },
  });

  return NextResponse.json({ ok: true, settings });
}
