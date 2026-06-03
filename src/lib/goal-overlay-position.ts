import type { GoalOverlayPosition } from "@/types";

export const GOAL_OVERLAY_POSITIONS: {
  id: GoalOverlayPosition;
  label: string;
  icon: string;
}[] = [
  { id: "top-left", label: "Superior esquerdo", icon: "↖" },
  { id: "top-center", label: "Superior centro", icon: "↑" },
  { id: "top-right", label: "Superior direito", icon: "↗" },
  { id: "bottom-left", label: "Inferior esquerdo", icon: "↙" },
  { id: "bottom-center", label: "Inferior centro", icon: "↓" },
  { id: "bottom-right", label: "Inferior direito", icon: "↘" },
];

export function getGoalOverlayPositionClass(position: GoalOverlayPosition): string {
  switch (position) {
    case "top-left":
      return "left-3 top-3";
    case "top-center":
      return "left-1/2 top-3 -translate-x-1/2";
    case "top-right":
      return "right-3 top-3";
    case "bottom-left":
      return "left-3 bottom-3";
    case "bottom-center":
      return "left-1/2 bottom-3 -translate-x-1/2";
    case "bottom-right":
      return "right-3 bottom-3";
    default:
      return "left-1/2 top-3 -translate-x-1/2";
  }
}

export function normalizeGoalOverlayPosition(
  value: string | undefined,
): GoalOverlayPosition {
  if (
    value &&
    GOAL_OVERLAY_POSITIONS.some((p) => p.id === value)
  ) {
    return value as GoalOverlayPosition;
  }
  return "top-center";
}
