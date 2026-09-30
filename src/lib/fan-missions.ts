import { getPrisma } from "@/lib/db";
import { grantDiscordRole, parseDiscordSettingsJson } from "@/lib/integrations/discord-roles";
import type { CreatorFanMissionPublic } from "@/types";

export function fanKeyFromDonor(opts: {
  userId?: string | null;
  name?: string | null;
}): string | null {
  if (opts.userId) return `user:${opts.userId}`;
  const name = opts.name?.trim().toLowerCase();
  if (!name || name === "anônimo" || name === "anonimo" || name === "apoiador") {
    return null;
  }
  return `name:${name}`;
}

function mapMission(
  row: {
    id: string;
    title: string;
    description: string;
    type: string;
    targetValue: number;
    periodDays: number | null;
    rewardBadge: string;
    rewardDiscordRoleId: string | null;
    active: boolean;
    sortOrder: number;
  },
  progress?: { progressValue: number; completedAt: Date | null } | null,
): CreatorFanMissionPublic {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type === "tip_total" ? "tip_total" : "tip_count",
    targetValue: row.targetValue,
    periodDays: row.periodDays,
    rewardBadge: row.rewardBadge || "Fã",
    rewardDiscordRoleId: row.rewardDiscordRoleId,
    active: row.active,
    sortOrder: row.sortOrder,
    progressValue: progress?.progressValue,
    completed: Boolean(progress?.completedAt),
  };
}

export async function listCreatorMissions(
  creatorId: string,
  opts?: { activeOnly?: boolean; fanKey?: string | null },
): Promise<CreatorFanMissionPublic[]> {
  const prisma = getPrisma();
  const rows = await prisma.creatorFanMission.findMany({
    where: {
      creatorId,
      ...(opts?.activeOnly ? { active: true } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  if (!opts?.fanKey) {
    return rows.map((r) => mapMission(r));
  }

  const progress = await prisma.fanMissionProgress.findMany({
    where: {
      creatorId,
      fanKey: opts.fanKey,
      missionId: { in: rows.map((r) => r.id) },
    },
  });
  const byMission = new Map(progress.map((p) => [p.missionId, p]));
  return rows.map((r) => mapMission(r, byMission.get(r.id)));
}

export async function getCompletedMissionBadges(
  creatorId: string,
  fanKey: string | null,
): Promise<string[]> {
  if (!fanKey) return [];
  const prisma = getPrisma();
  const rows = await prisma.fanMissionProgress.findMany({
    where: {
      creatorId,
      fanKey,
      completedAt: { not: null },
    },
    include: { mission: { select: { rewardBadge: true, active: true } } },
  });
  return [
    ...new Set(
      rows
        .filter((r) => r.mission.active)
        .map((r) => r.mission.rewardBadge.trim())
        .filter(Boolean),
    ),
  ].slice(0, 5);
}

/**
 * Atualiza progresso das missões ativas após tip confirmado.
 * Retorna badges recém-completas nesta tip.
 */
export async function applyTipToFanMissions(input: {
  creatorId: string;
  amount: number;
  donorUserId?: string | null;
  donorName?: string | null;
}): Promise<{ newlyCompletedBadges: string[] }> {
  const fanKey = fanKeyFromDonor({
    userId: input.donorUserId,
    name: input.donorName,
  });
  if (!fanKey) return { newlyCompletedBadges: [] };

  const prisma = getPrisma();
  const missions = await prisma.creatorFanMission.findMany({
    where: { creatorId: input.creatorId, active: true },
  });
  if (missions.length === 0) return { newlyCompletedBadges: [] };

  const newlyCompletedBadges: string[] = [];

  for (const mission of missions) {
    const increment =
      mission.type === "tip_total" ? input.amount : 1;

    const existing = await prisma.fanMissionProgress.findUnique({
      where: {
        missionId_fanKey: { missionId: mission.id, fanKey },
      },
    });

    // Janela móvel: se periodDays e já passou, reseta
    let base = existing?.progressValue ?? 0;
    if (
      mission.periodDays &&
      existing?.updatedAt &&
      Date.now() - existing.updatedAt.getTime() >
        mission.periodDays * 24 * 60 * 60 * 1000 &&
      !existing.completedAt
    ) {
      base = 0;
    }

    // Já completo e sem janela: não incrementa de novo
    if (existing?.completedAt && !mission.periodDays) {
      continue;
    }

    const next = Math.round((base + increment) * 100) / 100;
    const justCompleted =
      next >= mission.targetValue && !existing?.completedAt;

    const row = await prisma.fanMissionProgress.upsert({
      where: {
        missionId_fanKey: { missionId: mission.id, fanKey },
      },
      create: {
        missionId: mission.id,
        creatorId: input.creatorId,
        fanKey,
        fanUserId: input.donorUserId ?? null,
        fanName: input.donorName?.trim() || "",
        progressValue: next,
        completedAt: justCompleted ? new Date() : null,
      },
      update: {
        progressValue: next,
        fanUserId: input.donorUserId ?? existing?.fanUserId ?? null,
        fanName: input.donorName?.trim() || existing?.fanName || "",
        ...(justCompleted
          ? { completedAt: new Date() }
          : mission.periodDays && next >= mission.targetValue
            ? { completedAt: new Date() }
            : {}),
      },
    });

    if (justCompleted || (row.completedAt && !existing?.completedAt)) {
      newlyCompletedBadges.push(mission.rewardBadge || "Fã");

      if (mission.rewardDiscordRoleId && input.donorUserId) {
        try {
          const creator = await prisma.creator.findUnique({
            where: { id: input.creatorId },
            select: { discordSettings: true },
          });
          const settings = parseDiscordSettingsJson(creator?.discordSettings);
          if (settings.guildId) {
            const oauth = await prisma.oAuthAccount.findFirst({
              where: { userId: input.donorUserId, provider: "discord" },
              select: { providerAccountId: true },
            });
            if (oauth?.providerAccountId) {
              const ok = await grantDiscordRole(
                settings.guildId,
                oauth.providerAccountId,
                mission.rewardDiscordRoleId,
              );
              if (ok) {
                await prisma.fanMissionProgress.update({
                  where: { id: row.id },
                  data: { rewardGrantedAt: new Date() },
                });
              }
            }
          }
        } catch (err) {
          console.error("[fan-missions] discord reward", err);
        }
      }
    }
  }

  return { newlyCompletedBadges: [...new Set(newlyCompletedBadges)] };
}
