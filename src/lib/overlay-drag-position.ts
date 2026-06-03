import type { CSSProperties } from "react";
import type { GoalOverlayPosition, OverlayDragPoint, OverlayDragPositions, OverlayWidgetDragKey } from "@/types";

export const PRESET_DRAG_PERCENT: Record<GoalOverlayPosition, OverlayDragPoint> = {
  "top-left": { x: 12, y: 10 },
  "top-center": { x: 50, y: 10 },
  "top-right": { x: 88, y: 10 },
  "bottom-left": { x: 12, y: 90 },
  "bottom-center": { x: 50, y: 90 },
  "bottom-right": { x: 88, y: 90 },
};

export function clampDragPoint(point: OverlayDragPoint): OverlayDragPoint {
  return {
    x: Math.min(98, Math.max(2, Math.round(point.x * 10) / 10)),
    y: Math.min(98, Math.max(2, Math.round(point.y * 10) / 10)),
  };
}

export function resolveDragPoint(
  dragPositions: OverlayDragPositions | undefined,
  key: OverlayWidgetDragKey,
  fallbackPosition: GoalOverlayPosition,
): OverlayDragPoint {
  const custom = dragPositions?.[key];
  if (custom) return clampDragPoint(custom);
  return PRESET_DRAG_PERCENT[fallbackPosition];
}

export function getDragPositionStyle(point: OverlayDragPoint): CSSProperties {
  return {
    left: `${point.x}%`,
    top: `${point.y}%`,
    transform: "translate(-50%, -50%)",
  };
}

export function normalizeOverlayDragPositions(
  raw?: OverlayDragPositions,
): OverlayDragPositions {
  if (!raw || typeof raw !== "object") return {};
  const keys: OverlayWidgetDragKey[] = [
    "goal",
    "ticker",
    "stats",
    "lastDonation",
    "supporters",
    "leaderboard",
    "viewers",
  ];
  const result: OverlayDragPositions = {};
  for (const key of keys) {
    const value = raw[key];
    if (value && typeof value.x === "number" && typeof value.y === "number") {
      result[key] = clampDragPoint(value);
    }
  }
  return result;
}

export function pointerToDragPoint(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): OverlayDragPoint {
  return clampDragPoint({
    x: ((clientX - rect.left) / rect.width) * 100,
    y: ((clientY - rect.top) / rect.height) * 100,
  });
}
