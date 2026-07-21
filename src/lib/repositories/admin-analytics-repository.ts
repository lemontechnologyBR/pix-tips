import { prisma } from "@/lib/db";
import { DEMO_CREATOR_ID } from "@/lib/demo";
import {
  buildTrafficMediumLabel,
  normalizeReferrerLabel,
  resolveTrafficSource,
} from "@/lib/analytics/traffic";

export interface TrafficRow {
  label: string;
  count: number;
  share: number;
}

export interface AdminTrafficAnalytics {
  periodDays: number;
  totalVisits: number;
  uniqueLandingPages: number;
  visitsToday: number;
  visitsYesterday: number;
  byDay: { date: string; count: number }[];
  bySource: TrafficRow[];
  byReferrer: TrafficRow[];
  byLandingPage: TrafficRow[];
  byCampaign: Array<{
    source: string;
    medium: string;
    campaign: string;
    count: number;
    share: number;
  }>;
  recentVisits: Array<{
    id: string;
    type: string;
    path: string | null;
    source: string;
    referrer: string;
    medium: string;
    createdAt: string;
  }>;
}

type AnalyticsRow = {
  id: string;
  type: string;
  path: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  creatorId: string | null;
  createdAt: Date;
};

function isDemoPath(path: string | null): boolean {
  if (!path) return false;
  return path === "/demo" || path.startsWith("/demo/");
}

function shouldInclude(row: AnalyticsRow): boolean {
  if (row.creatorId === DEMO_CREATOR_ID) return false;
  if (isDemoPath(row.path)) return false;
  return row.type === "site_visit" || row.type === "tip_page_view";
}

function bump(map: Map<string, number>, key: string, amount = 1) {
  map.set(key, (map.get(key) ?? 0) + amount);
}

function toRows(map: Map<string, number>, total: number, limit = 12): TrafficRow[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({
      label,
      count,
      share: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }));
}

export async function getAdminTrafficAnalytics(
  periodDays: number,
): Promise<AdminTrafficAnalytics> {
  const days = Math.min(90, Math.max(1, periodDays));
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const rows = await prisma.analyticsEvent.findMany({
    where: {
      createdAt: { gte: since },
      type: { in: ["site_visit", "tip_page_view", "widget_view"] },
    },
    select: {
      id: true,
      type: true,
      path: true,
      referrer: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      creatorId: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const visits = rows.filter(shouldInclude);
  const totalVisits = visits.length;

  const sourceMap = new Map<string, number>();
  const referrerMap = new Map<string, number>();
  const landingMap = new Map<string, number>();
  const campaignMap = new Map<string, number>();
  const dayMap = new Map<string, number>();
  const landingSet = new Set<string>();

  let visitsToday = 0;
  let visitsYesterday = 0;

  for (const row of visits) {
    const source = resolveTrafficSource(row.utmSource, row.referrer);
    const referrer = normalizeReferrerLabel(row.referrer);
    const landing = row.path?.trim() || "/";
    const dayKey = row.createdAt.toISOString().slice(0, 10);

    bump(sourceMap, source);
    bump(referrerMap, referrer);
    bump(landingMap, landing);
    bump(dayMap, dayKey);
    landingSet.add(landing);

    if (row.utmSource || row.utmCampaign || row.utmMedium) {
      const campaignKey = [
        row.utmSource ?? "—",
        row.utmMedium ?? "—",
        row.utmCampaign ?? "—",
      ].join("|");
      bump(campaignMap, campaignKey);
    }

    if (row.createdAt >= todayStart) visitsToday += 1;
    else if (row.createdAt >= yesterdayStart && row.createdAt < todayStart) {
      visitsYesterday += 1;
    }
  }

  const byDay: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    byDay.push({ date: key, count: dayMap.get(key) ?? 0 });
  }

  const byCampaign = [...campaignMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([key, count]) => {
      const [source, medium, campaign] = key.split("|");
      return {
        source,
        medium,
        campaign,
        count,
        share: totalVisits > 0 ? Math.round((count / totalVisits) * 1000) / 10 : 0,
      };
    });

  const recentVisits = visits.slice(0, 25).map((row) => ({
    id: row.id,
    type: row.type === "tip_page_view" ? "Tip page" : "Site",
    path: row.path,
    source: resolveTrafficSource(row.utmSource, row.referrer),
    referrer: normalizeReferrerLabel(row.referrer),
    medium: buildTrafficMediumLabel(row.utmMedium, row.utmCampaign),
    createdAt: row.createdAt.toISOString(),
  }));

  return {
    periodDays: days,
    totalVisits,
    uniqueLandingPages: landingSet.size,
    visitsToday,
    visitsYesterday,
    byDay,
    bySource: toRows(sourceMap, totalVisits),
    byReferrer: toRows(referrerMap, totalVisits),
    byLandingPage: toRows(landingMap, totalVisits, 15),
    byCampaign,
    recentVisits,
  };
}
