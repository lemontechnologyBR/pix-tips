import type { GoalOverlayLayout } from "@/types";

export const GOAL_OVERLAY_LAYOUTS: {
  id: GoalOverlayLayout;
  name: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "stream",
    name: "Stream",
    description: "Faixa horizontal estilo live",
    icon: "🎭",
  },
  {
    id: "classic",
    name: "Clássico",
    description: "Card com título, barra e valores",
    icon: "▬",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Barra fina e percentual",
    icon: "—",
  },
  {
    id: "pill",
    name: "Pílula",
    description: "Uma linha compacta",
    icon: "◉",
  },
  {
    id: "banner",
    name: "Faixa",
    description: "Faixa horizontal larga",
    icon: "▭",
  },
  {
    id: "ring",
    name: "Anel",
    description: "Progresso circular",
    icon: "◎",
  },
  {
    id: "neon",
    name: "Neon",
    description: "Borda brilhante com destaque",
    icon: "✦",
  },
  {
    id: "bold",
    name: "Destaque",
    description: "Percentual grande e barra grossa",
    icon: "▮",
  },
];

export function normalizeGoalOverlayLayout(
  value: string | undefined,
): GoalOverlayLayout {
  if (value && GOAL_OVERLAY_LAYOUTS.some((l) => l.id === value)) {
    return value as GoalOverlayLayout;
  }
  return "classic";
}

export function getGoalOverlayShellClass(
  layout: GoalOverlayLayout,
  compact: boolean,
): string {
  switch (layout) {
    case "stream":
      return compact
        ? "w-[calc(100%-1rem)] max-w-[18rem]"
        : "w-[min(92vw,28rem)] max-w-[calc(100%-1.5rem)]";
    case "minimal":
      return compact
        ? "w-36 max-w-[calc(100%-1rem)] px-2 py-1.5"
        : "w-44 max-w-[calc(100%-1.5rem)] px-2.5 py-2";
    case "pill":
      return compact
        ? "w-auto max-w-[calc(100%-1rem)] px-2.5 py-1"
        : "w-auto max-w-[calc(100%-1.5rem)] px-3 py-1.5";
    case "banner":
      return compact
        ? "w-52 max-w-[calc(100%-1rem)] px-3 py-2"
        : "w-64 max-w-[calc(100%-1.5rem)] px-4 py-2.5";
    case "ring":
      return compact ? "w-[4.5rem] p-1.5" : "w-[5.5rem] p-2";
    case "neon":
      return compact
        ? "w-44 max-w-[calc(100%-1rem)] px-2.5 py-2"
        : "w-56 max-w-[calc(100%-1.5rem)] px-3 py-2.5";
    case "bold":
      return compact
        ? "w-48 max-w-[calc(100%-1rem)] px-3 py-2.5"
        : "w-60 max-w-[calc(100%-1.5rem)] px-4 py-3";
    case "classic":
    default:
      return compact
        ? "w-40 max-w-[calc(100%-1rem)] px-2.5 py-2"
        : "w-56 max-w-[calc(100%-1.5rem)] px-3 py-2.5";
  }
}

export function getGoalOverlaySurfaceClass(layout: GoalOverlayLayout): string {
  switch (layout) {
    case "stream":
      return "bg-transparent p-0 shadow-none border-0";
    case "minimal":
      return "rounded-md border border-white/5 bg-black/60 backdrop-blur-sm";
    case "pill":
      return "rounded-full border border-white/10 bg-black/70 backdrop-blur-sm";
    case "banner":
      return "rounded-lg border border-white/10 bg-gradient-to-r from-black/85 via-black/75 to-black/85 backdrop-blur-md";
    case "ring":
      return "rounded-full border border-white/10 bg-black/80 backdrop-blur-sm";
    case "neon":
      return "rounded-xl border-2 bg-black/80 shadow-[0_0_20px_rgba(139,92,246,0.35)] backdrop-blur-sm";
    case "bold":
      return "rounded-xl border border-white/15 bg-black/80 backdrop-blur-md";
    case "classic":
    default:
      return "rounded-lg border border-white/10 bg-black/75 backdrop-blur-sm";
  }
}
