export type WidgetKind =
  | "qrcode"
  | "alert"
  | "goal"
  | "ticker"
  | "stats"
  | "supporters"
  | "last"
  | "leaderboard"
  | "overlay"
  | "viewers";

export type WidgetUrls = {
  overlay: string;
  qrcode: string;
  alerts: string;
  goals: string;
  ticker: string;
  stats: string;
  supporters: string;
  last: string;
  leaderboard: string;
  viewers: string;
};

const ROUTE_MAP: Record<WidgetKind, string> = {
  qrcode: "qrcode",
  alert: "alert",
  goal: "goal",
  ticker: "ticker",
  stats: "stats",
  supporters: "supporters",
  last: "last",
  leaderboard: "leaderboard",
  overlay: "overlay",
  viewers: "viewers",
};

export function buildWidgetUrl(
  kind: WidgetKind,
  creatorId: string,
  token: string,
): string {
  const segment = ROUTE_MAP[kind];
  return `/widget/${segment}/${creatorId}?token=${token}`;
}

export function buildWidgetUrls(creatorId: string, token: string): WidgetUrls {
  return {
    overlay: buildWidgetUrl("overlay", creatorId, token),
    qrcode: buildWidgetUrl("qrcode", creatorId, token),
    alerts: buildWidgetUrl("alert", creatorId, token),
    goals: buildWidgetUrl("goal", creatorId, token),
    ticker: buildWidgetUrl("ticker", creatorId, token),
    stats: buildWidgetUrl("stats", creatorId, token),
    supporters: buildWidgetUrl("supporters", creatorId, token),
    last: buildWidgetUrl("last", creatorId, token),
    leaderboard: buildWidgetUrl("leaderboard", creatorId, token),
    viewers: buildWidgetUrl("viewers", creatorId, token),
  };
}
