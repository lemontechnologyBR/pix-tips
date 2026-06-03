import { normalizeGoalOverlayPosition } from "@/lib/goal-overlay-position";
import type { GoalOverlayPosition } from "@/types";

export type TickerLayout = "list" | "marquee";

export function normalizeTickerLayout(value: string | undefined): TickerLayout {
  return value === "marquee" ? "marquee" : "list";
}

export function normalizeTickerMaxItems(value: number | undefined): number {
  if (!value || value < 1) return 5;
  return Math.min(20, Math.round(value));
}

export function normalizeSupportersMaxItems(value: number | undefined): number {
  if (!value || value < 1) return 6;
  return Math.min(12, Math.round(value));
}

export function normalizeLeaderboardMaxItems(value: number | undefined): number {
  if (!value || value < 1) return 5;
  return Math.min(10, Math.round(value));
}

export function normalizeWidgetPosition(value: string | undefined): GoalOverlayPosition {
  return normalizeGoalOverlayPosition(value);
}

export const TICKER_LAYOUTS: { id: TickerLayout; name: string; description: string }[] = [
  { id: "list", name: "Lista", description: "Itens empilhados verticalmente." },
  { id: "marquee", name: "Faixa", description: "Rolagem horizontal contínua." },
];
