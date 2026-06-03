"use client";

import { formatCurrency } from "@/lib/format";
import type { GoalOverlayPosition, OverlayDragPoint } from "@/types";
import { OverlayPositionShell } from "./OverlayPositionShell";

interface StatsOverlayProps {
  count: number;
  total: number;
  position?: GoalOverlayPosition;
  dragPosition?: OverlayDragPoint | null;
  themeColor?: string;
  embedded?: boolean;
  layout?: "classic" | "compact" | "minimal";
  label?: string;
  countLabel?: string;
  bgColor?: string | null;
  textColor?: string | null;
  fontSize?: number;
}

export function StatsOverlay({
  count,
  total,
  position = "top-right",
  dragPosition,
  themeColor = "#8b5cf6",
  embedded = false,
  layout = "classic",
  label = "Doações na live",
  countLabel = "doações",
  bgColor = null,
  textColor = null,
  fontSize = 16,
}: StatsOverlayProps) {
  const isMinimal = layout === "minimal";
  const isCompact = layout === "compact";

  const containerClass = [
    "rounded-xl backdrop-blur-md",
    isMinimal
      ? "border-0 bg-transparent"
      : "border border-white/10 bg-black/80",
    isCompact
      ? embedded ? "px-2 py-1.5" : "px-3 py-2"
      : embedded ? "px-3 py-2" : "px-4 py-3",
  ].join(" ");

  const bgStyle = bgColor ? { backgroundColor: bgColor } : undefined;
  const textStyle = textColor ? { color: textColor } : undefined;
  const fontStyle = { fontSize: `${fontSize}px` };

  return (
    <OverlayPositionShell
      position={position}
      dragPosition={dragPosition}
      embedded={embedded}
    >
      <div
        className={containerClass}
        style={{ boxShadow: isMinimal ? undefined : `0 0 24px ${themeColor}22`, ...bgStyle, ...fontStyle }}
      >
        <p
          className={`font-medium uppercase tracking-wider ${
            embedded ? "text-[9px]" : "text-[10px]"
          }`}
          style={textStyle ?? { color: "rgba(255,255,255,0.5)" }}
        >
          {label}
        </p>
        <p
          className={`mt-1 font-bold tabular-nums ${
            isCompact
              ? embedded ? "text-base" : "text-xl"
              : embedded ? "text-lg" : "text-2xl"
          }`}
          style={textStyle ?? { color: "white" }}
        >
          {formatCurrency(total)}
        </p>
        <p
          className={`mt-0.5 ${embedded ? "text-[10px]" : "text-xs"}`}
          style={textStyle ? { color: textColor + "99" } : { color: "rgba(255,255,255,0.6)" }}
        >
          {count} {count === 1 ? countLabel.replace(/s$/, "") : countLabel}
        </p>
        {!isMinimal && (
          <div
            className={`mt-2 h-1 overflow-hidden rounded-full bg-white/10 ${
              embedded ? "w-24" : "w-32"
            }`}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, count * 8)}%`,
                backgroundColor: themeColor,
              }}
            />
          </div>
        )}
      </div>
    </OverlayPositionShell>
  );
}
