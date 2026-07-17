import { prisma } from "@/lib/db";
import { resolveCpfProvider } from "@/lib/kyc/cpf-provider";
import { isDiditConfigured } from "@/lib/didit";
import {
  getWooviMainAccountAvailable,
  getWooviSubaccount,
  isWooviConfigured,
} from "@/lib/payments/woovi";
import { maskPixKey } from "@/lib/finance";

export interface AdminOpsSnapshot {
  wooviConfigured: boolean;
  wooviMainBalanceCents: number | null;
  cpfProvider: string;
  diditConfigured: boolean;
  kyc: { status: string; count: number }[];
  pixKeys: {
    username: string;
    pixKeyMasked: string;
    isPrimary: boolean;
    balanceCents: number | null;
    withdrawBlocked: boolean | null;
    remoteOk: boolean;
  }[];
  analytics: {
    tipPageViews7d: number;
    widgetViews7d: number;
    widgets: { widget: string; count: number }[];
    topTipPages: { creatorId: string; username: string; views: number }[];
  };
  counts: {
    creators: number;
    pixKeys: number;
    confirmedTx: number;
    pendingKyc: number;
  };
}

export async function getAdminOpsSnapshot(): Promise<AdminOpsSnapshot> {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [kycGroups, keyRows, creators, confirmedTx, pendingKyc, tipEvents, widgetEvents] =
    await Promise.all([
      prisma.kycVerification.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.creatorWooviPixKey.findMany({
        include: { creator: { select: { username: true } } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.creator.count(),
      prisma.transaction.count({ where: { status: "confirmed" } }),
      prisma.kycVerification.count({ where: { status: "pending" } }),
      prisma.analyticsEvent.findMany({
        where: { type: "tip_page_view", createdAt: { gte: since } },
        select: { creatorId: true },
      }).catch(() => [] as { creatorId: string | null }[]),
      prisma.analyticsEvent.findMany({
        where: { type: "widget_view", createdAt: { gte: since } },
        select: { widget: true, creatorId: true },
      }).catch(() => [] as { widget: string | null; creatorId: string | null }[]),
    ]);

  const wooviConfigured = isWooviConfigured();
  const wooviMainBalanceCents = wooviConfigured
    ? await getWooviMainAccountAvailable()
    : null;

  const pixKeys = await Promise.all(
    keyRows.map(async (row) => {
      const remote = wooviConfigured
        ? await getWooviSubaccount(row.pixKey)
        : null;
      return {
        username: row.creator.username,
        pixKeyMasked: maskPixKey(row.pixKey, row.pixKeyType),
        isPrimary: row.isPrimary,
        balanceCents: remote?.balance ?? null,
        withdrawBlocked: remote?.withdrawBlocked ?? null,
        remoteOk: Boolean(remote),
      };
    }),
  );

  const widgetMap = new Map<string, number>();
  for (const ev of widgetEvents) {
    const key = ev.widget || "unknown";
    widgetMap.set(key, (widgetMap.get(key) ?? 0) + 1);
  }

  const tipMap = new Map<string, number>();
  for (const ev of tipEvents) {
    if (!ev.creatorId) continue;
    tipMap.set(ev.creatorId, (tipMap.get(ev.creatorId) ?? 0) + 1);
  }

  const topCreatorIds = [...tipMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const creatorsById = topCreatorIds.length
    ? await prisma.creator.findMany({
        where: { id: { in: topCreatorIds.map(([id]) => id) } },
        select: { id: true, username: true },
      })
    : [];
  const usernameById = new Map(creatorsById.map((c) => [c.id, c.username]));

  return {
    wooviConfigured,
    wooviMainBalanceCents,
    cpfProvider: resolveCpfProvider(),
    diditConfigured: isDiditConfigured(),
    kyc: kycGroups.map((g) => ({ status: g.status, count: g._count._all })),
    pixKeys,
    analytics: {
      tipPageViews7d: tipEvents.length,
      widgetViews7d: widgetEvents.length,
      widgets: [...widgetMap.entries()]
        .map(([widget, count]) => ({ widget, count }))
        .sort((a, b) => b.count - a.count),
      topTipPages: topCreatorIds.map(([creatorId, views]) => ({
        creatorId,
        username: usernameById.get(creatorId) ?? creatorId.slice(0, 8),
        views,
      })),
    },
    counts: {
      creators,
      pixKeys: keyRows.length,
      confirmedTx,
      pendingKyc,
    },
  };
}
