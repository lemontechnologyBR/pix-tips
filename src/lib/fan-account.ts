import { getPrisma } from "@/lib/db";
import { listOAuthAccounts } from "@/lib/auth/oauth";
import { formatCurrency } from "@/lib/format";

export interface FanMissionItem {
  id: string;
  title: string;
  description: string;
  type: "tip_count" | "tip_total";
  targetValue: number;
  progressValue: number;
  completed: boolean;
  rewardBadge: string;
  creatorUsername: string;
  creatorDisplayName: string;
  creatorAvatar: string;
}

export interface FanBadgeItem {
  badge: string;
  missionTitle: string;
  creatorUsername: string;
  creatorDisplayName: string;
  completedAt: string;
}

export interface FanSubscriptionItem {
  id: string;
  planName: string;
  status: string;
  currentPeriodEnd: string | null;
  creatorUsername: string;
  creatorDisplayName: string;
}

export interface FanTipItem {
  id: string;
  amount: number;
  message: string;
  createdAt: string;
  creatorUsername: string;
  creatorDisplayName: string;
  creatorAvatar: string;
}

export interface FanAccountOverview {
  profile: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    hasCreator: boolean;
    username: string | null;
  };
  providers: string[];
  stats: {
    tipsCount: number;
    tipsTotal: number;
    badgesCount: number;
    missionsInProgress: number;
    missionsCompleted: number;
    activeSubscriptions: number;
  };
  badges: FanBadgeItem[];
  missions: FanMissionItem[];
  subscriptions: FanSubscriptionItem[];
  recentTips: FanTipItem[];
}

export async function getFanAccountOverview(
  userId: string,
): Promise<FanAccountOverview | null> {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      creator: { select: { username: true, onboardingCompleted: true } },
    },
  });
  if (!user) return null;

  const fanKey = `user:${userId}`;

  const [accounts, progressRows, tipAgg, tips, subs] = await Promise.all([
    listOAuthAccounts(userId),
    prisma.fanMissionProgress.findMany({
      where: { OR: [{ fanUserId: userId }, { fanKey }] },
      include: {
        mission: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            targetValue: true,
            rewardBadge: true,
            active: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.transaction.aggregate({
      where: {
        donorUserId: userId,
        status: "confirmed",
        kind: "donation",
      },
      _count: { _all: true },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: {
        donorUserId: userId,
        status: "confirmed",
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        creator: { select: { username: true, displayName: true, avatar: true } },
      },
    }),
    prisma.fanSubscription.findMany({
      where: { subscriberUserId: userId },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        plan: { select: { name: true } },
        creator: { select: { username: true, displayName: true } },
      },
    }),
  ]);

  const creatorIds = [
    ...new Set([
      ...progressRows.map((p) => p.creatorId),
      ...tips.map((t) => t.creatorId),
      ...subs.map((s) => s.creatorId),
    ]),
  ];
  const creators = creatorIds.length
    ? await prisma.creator.findMany({
        where: { id: { in: creatorIds } },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
        },
      })
    : [];
  const creatorById = new Map(creators.map((c) => [c.id, c]));

  const missions: FanMissionItem[] = progressRows
    .filter((p) => p.mission.active)
    .map((p) => {
      const creator = creatorById.get(p.creatorId);
      return {
        id: p.mission.id,
        title: p.mission.title,
        description: p.mission.description,
        type: p.mission.type === "tip_total" ? "tip_total" : "tip_count",
        targetValue: p.mission.targetValue,
        progressValue: p.progressValue,
        completed: Boolean(p.completedAt),
        rewardBadge: p.mission.rewardBadge || "Fã",
        creatorUsername: creator?.username ?? "",
        creatorDisplayName: creator?.displayName ?? "Criador",
        creatorAvatar: creator?.avatar ?? "",
      };
    });

  const badges: FanBadgeItem[] = progressRows
    .filter((p) => p.completedAt && p.mission.active)
    .map((p) => {
      const creator = creatorById.get(p.creatorId);
      return {
        badge: p.mission.rewardBadge || "Fã",
        missionTitle: p.mission.title,
        creatorUsername: creator?.username ?? "",
        creatorDisplayName: creator?.displayName ?? "Criador",
        completedAt: p.completedAt!.toISOString(),
      };
    });

  // unique badges by badge+creator
  const seenBadge = new Set<string>();
  const uniqueBadges = badges.filter((b) => {
    const key = `${b.creatorUsername}:${b.badge}`;
    if (seenBadge.has(key)) return false;
    seenBadge.add(key);
    return true;
  });

  const subscriptions: FanSubscriptionItem[] = subs.map((s) => ({
    id: s.id,
    planName: s.plan.name,
    status: s.status,
    currentPeriodEnd: s.currentPeriodEnd?.toISOString() ?? null,
    creatorUsername: s.creator.username,
    creatorDisplayName: s.creator.displayName,
  }));

  const recentTips: FanTipItem[] = tips.map((t) => ({
    id: t.id,
    amount: t.amount,
    message: t.message,
    createdAt: t.createdAt.toISOString(),
    creatorUsername: t.creator.username,
    creatorDisplayName: t.creator.displayName,
    creatorAvatar: t.creator.avatar || "",
  }));

  return {
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || "",
      hasCreator: Boolean(user.creator),
      username: user.creator?.username ?? null,
    },
    providers: accounts.map((a) => a.provider),
    stats: {
      tipsCount: tipAgg._count._all,
      tipsTotal: tipAgg._sum.amount ?? 0,
      badgesCount: uniqueBadges.length,
      missionsInProgress: missions.filter((m) => !m.completed).length,
      missionsCompleted: missions.filter((m) => m.completed).length,
      activeSubscriptions: subscriptions.filter((s) => s.status === "active")
        .length,
    },
    badges: uniqueBadges,
    missions,
    subscriptions,
    recentTips,
  };
}

export function formatFanGoal(type: "tip_count" | "tip_total", value: number) {
  if (type === "tip_total") return formatCurrency(value);
  return `${value} tip${value === 1 ? "" : "s"}`;
}
