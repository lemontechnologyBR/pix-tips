import { prisma } from "@/lib/db";
import {
  DEMO_CREATOR_ID,
  excludeDemoCreatorFromMetrics,
  excludeDemoTransactionsFromMetrics,
} from "@/lib/demo";
import { resolveCpfProvider } from "@/lib/kyc/cpf-provider";
import { isDiditConfigured } from "@/lib/didit";
import { isMercadoPagoConfigured } from "@/lib/payments/mercadopago";

export interface AdminOpsWidgetByType {
  widget: string;
  count: number;
  uniqueCreators: number;
}

export interface AdminOpsWidgetCreator {
  creatorId: string;
  username: string;
  views: number;
  widgets: { widget: string; count: number }[];
}

export interface AdminOpsRecentWidget {
  id: string;
  creatorId: string;
  username: string;
  widget: string;
  createdAt: string;
}

export interface AdminOpsSnapshot {
  mercadoPagoConfigured: boolean;
  cpfProvider: string;
  diditConfigured: boolean;
  kyc: { status: string; count: number }[];
  analytics: {
    tipPageViews7d: number;
    widgetViews7d: number;
    widgetViews24h: number;
    uniqueWidgetCreators7d: number;
    widgets: AdminOpsWidgetByType[];
    topWidgetCreators: AdminOpsWidgetCreator[];
    recentWidgets: AdminOpsRecentWidget[];
    topTipPages: { creatorId: string; username: string; views: number }[];
  };
  counts: {
    creators: number;
    payoutKeys: number;
    confirmedTx: number;
    pendingKyc: number;
  };
}

type TipEvent = { creatorId: string | null };
type WidgetEvent = {
  id: string;
  widget: string | null;
  creatorId: string | null;
  createdAt: Date;
};

export async function getAdminOpsSnapshot(): Promise<AdminOpsSnapshot> {
  const since7d = new Date();
  since7d.setDate(since7d.getDate() - 7);
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [kycGroups, creators, confirmedTx, pendingKyc, payoutKeys, tipEvents, widgetEvents] =
    await Promise.all([
      prisma.kycVerification.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.creator.count({ where: excludeDemoCreatorFromMetrics }),
      prisma.transaction.count({
        where: { status: "confirmed", ...excludeDemoTransactionsFromMetrics },
      }),
      prisma.kycVerification.count({ where: { status: "pending" } }),
      prisma.creator.count({
        where: {
          pixKey: { not: null },
          pixHolderName: { not: null },
          ...excludeDemoCreatorFromMetrics,
        },
      }),
      prisma.analyticsEvent
        .findMany({
          where: {
            type: "tip_page_view",
            createdAt: { gte: since7d },
            NOT: { creatorId: DEMO_CREATOR_ID },
          },
          select: { creatorId: true },
        })
        .catch(() => [] as TipEvent[]),
      prisma.analyticsEvent
        .findMany({
          where: {
            type: "widget_view",
            createdAt: { gte: since7d },
            NOT: { creatorId: DEMO_CREATOR_ID },
          },
          select: { id: true, widget: true, creatorId: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        })
        .catch(() => [] as WidgetEvent[]),
    ]);

  const widgetTypeMap = new Map<string, { count: number; creators: Set<string> }>();
  const creatorWidgetMap = new Map<string, Map<string, number>>();
  let widgetViews24h = 0;

  for (const ev of widgetEvents) {
    if (ev.createdAt >= since24h) widgetViews24h += 1;

    const widget = ev.widget || "unknown";
    const typeRow = widgetTypeMap.get(widget) ?? {
      count: 0,
      creators: new Set<string>(),
    };
    typeRow.count += 1;
    if (ev.creatorId) typeRow.creators.add(ev.creatorId);
    widgetTypeMap.set(widget, typeRow);

    if (!ev.creatorId) continue;
    const byWidget = creatorWidgetMap.get(ev.creatorId) ?? new Map<string, number>();
    byWidget.set(widget, (byWidget.get(widget) ?? 0) + 1);
    creatorWidgetMap.set(ev.creatorId, byWidget);
  }

  const tipMap = new Map<string, number>();
  for (const ev of tipEvents) {
    if (!ev.creatorId) continue;
    tipMap.set(ev.creatorId, (tipMap.get(ev.creatorId) ?? 0) + 1);
  }

  const topTipCreatorIds = [...tipMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const topWidgetCreatorIds = [...creatorWidgetMap.entries()]
    .map(([creatorId, byWidget]) => {
      let views = 0;
      for (const n of byWidget.values()) views += n;
      return { creatorId, views };
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 12);

  const usernameLookupIds = [
    ...new Set([
      ...topTipCreatorIds.map(([id]) => id),
      ...topWidgetCreatorIds.map((r) => r.creatorId),
      ...widgetEvents
        .slice(0, 30)
        .map((e) => e.creatorId)
        .filter((id): id is string => Boolean(id)),
    ]),
  ];

  const creatorsById = usernameLookupIds.length
    ? await prisma.creator.findMany({
        where: { id: { in: usernameLookupIds } },
        select: { id: true, username: true },
      })
    : [];
  const usernameById = new Map(creatorsById.map((c) => [c.id, c.username]));

  const shortId = (id: string) => id.slice(0, 8);

  return {
    mercadoPagoConfigured: isMercadoPagoConfigured(),
    cpfProvider: resolveCpfProvider(),
    diditConfigured: isDiditConfigured(),
    kyc: kycGroups.map((g) => ({ status: g.status, count: g._count._all })),
    analytics: {
      tipPageViews7d: tipEvents.length,
      widgetViews7d: widgetEvents.length,
      widgetViews24h,
      uniqueWidgetCreators7d: creatorWidgetMap.size,
      widgets: [...widgetTypeMap.entries()]
        .map(([widget, row]) => ({
          widget,
          count: row.count,
          uniqueCreators: row.creators.size,
        }))
        .sort((a, b) => b.count - a.count),
      topWidgetCreators: topWidgetCreatorIds.map(({ creatorId, views }) => {
        const byWidget = creatorWidgetMap.get(creatorId) ?? new Map();
        return {
          creatorId,
          username: usernameById.get(creatorId) ?? shortId(creatorId),
          views,
          widgets: [...byWidget.entries()]
            .map(([widget, count]) => ({ widget, count }))
            .sort((a, b) => b.count - a.count),
        };
      }),
      recentWidgets: widgetEvents.slice(0, 20).map((ev) => ({
        id: ev.id,
        creatorId: ev.creatorId ?? "",
        username: ev.creatorId
          ? usernameById.get(ev.creatorId) ?? shortId(ev.creatorId)
          : "—",
        widget: ev.widget || "unknown",
        createdAt: ev.createdAt.toISOString(),
      })),
      topTipPages: topTipCreatorIds.map(([creatorId, views]) => ({
        creatorId,
        username: usernameById.get(creatorId) ?? shortId(creatorId),
        views,
      })),
    },
    counts: {
      creators,
      payoutKeys,
      confirmedTx,
      pendingKyc,
    },
  };
}
