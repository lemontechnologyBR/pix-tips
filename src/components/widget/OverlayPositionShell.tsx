"use client";

import { getGoalOverlayPositionClass } from "@/lib/goal-overlay-position";
import { getDragPositionStyle } from "@/lib/overlay-drag-position";
import type { GoalOverlayPosition, OverlayDragPoint } from "@/types";
import type { CSSProperties, ReactNode } from "react";

interface OverlayPositionShellProps {
  position: GoalOverlayPosition;
  dragPosition?: OverlayDragPoint | null;
  embedded?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function OverlayPositionShell({
  position,
  dragPosition,
  embedded = false,
  className = "",
  style,
  children,
}: OverlayPositionShellProps) {
  const mode = embedded ? "absolute" : "fixed";

  if (dragPosition) {
    return (
      <div
        className={`${mode} z-[9999] ${className}`}
        style={{ ...getDragPositionStyle(dragPosition), ...style }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`${mode} ${getGoalOverlayPositionClass(position)} z-[9999] ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
