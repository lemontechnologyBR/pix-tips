"use client";

import { formatCurrency } from "@/lib/format";
import type { GoalOverlayPosition, OverlayDragPoint, WidgetDonationItem } from "@/types";
import { OverlayPositionShell } from "./OverlayPositionShell";

interface LastDonationOverlayProps {
  item: WidgetDonationItem | null;
  position?: GoalOverlayPosition;
  dragPosition?: OverlayDragPoint | null;
  themeColor?: string;
  embedded?: boolean;
  pulse?: boolean;
  layout?: "classic" | "minimal" | "banner" | "card";
  bgColor?: string | null;
  textColor?: string | null;
  fontSize?: number;
}

export function LastDonationOverlay({
  item,
  position = "bottom-center",
  dragPosition,
  themeColor = "#8b5cf6",
  embedded = false,
  pulse = false,
  layout = "classic",
  bgColor = null,
  textColor = null,
  fontSize = 14,
}: LastDonationOverlayProps) {
  if (!item) return null;

  const textStyle = textColor ? { color: textColor } : undefined;
  // tc is only used inside `textStyle ?` branches where textColor is guaranteed non-null
  const tc = textColor as string;
  const fontStyle = { fontSize: `${fontSize}px` };
  const pulseClass = pulse ? "animate-pop-in" : "";

  if (layout === "minimal") {
    return (
      <OverlayPositionShell position={position} dragPosition={dragPosition} embedded={embedded}>
        <div
          className={`${pulseClass}`}
          style={{ ...fontStyle, ...(bgColor ? { backgroundColor: bgColor, borderRadius: "0.5rem", padding: "0.5rem 0.75rem" } : {}) }}
        >
          <p
            className={`font-medium uppercase tracking-wider ${embedded ? "text-[9px]" : "text-[10px]"}`}
            style={textStyle ?? { color: "rgba(255,255,255,0.5)" }}
          >
            Última doação
          </p>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
            <span
              className={`font-bold ${embedded ? "text-sm" : "text-base"}`}
              style={textStyle ?? { color: "white" }}
            >
              {item.name}
            </span>
            <span
              className={`font-black ${embedded ? "text-sm" : "text-base"}`}
              style={textStyle ? { color: tc } : { color: themeColor }}
            >
              {formatCurrency(item.amount)}
            </span>
          </div>
        </div>
      </OverlayPositionShell>
    );
  }

  if (layout === "banner") {
    return (
      <OverlayPositionShell position={position} dragPosition={dragPosition} embedded={embedded}>
        <div
          className={`flex items-center gap-3 border-l-4 backdrop-blur-md ${
            embedded ? "px-3 py-2" : "px-4 py-3"
          } ${pulseClass}`}
          style={{
            borderLeftColor: themeColor,
            backgroundColor: bgColor ?? "rgba(0,0,0,0.85)",
            boxShadow: `0 0 20px ${themeColor}33`,
            borderRadius: "0 0.75rem 0.75rem 0",
            ...fontStyle,
          }}
        >
          <div className="min-w-0 flex-1">
            <p
              className={`font-medium uppercase tracking-wider ${embedded ? "text-[9px]" : "text-[10px]"}`}
              style={textStyle ?? { color: "rgba(255,255,255,0.5)" }}
            >
              Última doação
            </p>
            <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
              <span
                className={`font-bold ${embedded ? "text-sm" : "text-lg"}`}
                style={textStyle ?? { color: "white" }}
              >
                {item.name}
              </span>
              {item.message && (
                <span
                  className={`truncate ${embedded ? "text-[10px]" : "text-xs"}`}
                  style={textStyle ? { color: tc + "99" } : { color: "rgba(255,255,255,0.5)" }}
                >
                  &ldquo;{item.message}&rdquo;
                </span>
              )}
            </div>
          </div>
          <span
            className={`shrink-0 font-black ${embedded ? "text-base" : "text-xl"}`}
            style={textStyle ? { color: tc } : { color: themeColor }}
          >
            {formatCurrency(item.amount)}
          </span>
        </div>
      </OverlayPositionShell>
    );
  }

  if (layout === "card") {
    return (
      <OverlayPositionShell position={position} dragPosition={dragPosition} embedded={embedded}>
        <div
          className={`rounded-2xl border backdrop-blur-md ${
            embedded ? "px-3 py-3" : "px-5 py-4"
          } ${pulseClass}`}
          style={{
            backgroundColor: bgColor ?? "rgba(0,0,0,0.92)",
            borderColor: `${themeColor}55`,
            boxShadow: `0 0 32px ${themeColor}44, 0 4px 24px rgba(0,0,0,0.6)`,
            ...fontStyle,
          }}
        >
          <div
            className={`mb-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
              embedded ? "text-[8px]" : "text-[9px]"
            } font-semibold uppercase tracking-widest`}
            style={{ backgroundColor: `${themeColor}33`, color: themeColor }}
          >
            <span>★</span>
            <span>Última doação</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-black ${embedded ? "text-base" : "text-2xl"}`}
              style={textStyle ? { color: tc } : { color: themeColor }}
            >
              {formatCurrency(item.amount)}
            </span>
          </div>
          <p
            className={`mt-0.5 font-semibold ${embedded ? "text-xs" : "text-sm"}`}
            style={textStyle ?? { color: "white" }}
          >
            {item.name}
          </p>
          {item.message && (
            <p
              className={`mt-1 max-w-xs truncate ${embedded ? "text-[10px]" : "text-xs"}`}
              style={textStyle ? { color: tc + "99" } : { color: "rgba(255,255,255,0.55)" }}
            >
              &ldquo;{item.message}&rdquo;
            </p>
          )}
        </div>
      </OverlayPositionShell>
    );
  }

  // classic (default)
  return (
    <OverlayPositionShell position={position} dragPosition={dragPosition} embedded={embedded}>
      <div
        className={`rounded-xl border border-white/10 backdrop-blur-md ${
          embedded ? "px-3 py-2.5" : "px-4 py-3"
        } ${pulseClass}`}
        style={{
          backgroundColor: bgColor ?? "rgba(0,0,0,0.85)",
          boxShadow: `0 0 28px ${themeColor}33`,
          ...fontStyle,
        }}
      >
        <p
          className={`font-medium uppercase tracking-wider ${
            embedded ? "text-[9px]" : "text-[10px]"
          }`}
          style={textStyle ?? { color: "rgba(255,255,255,0.5)" }}
        >
          Última doação
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span
            className={`font-bold ${embedded ? "text-sm" : "text-lg"}`}
            style={textStyle ?? { color: "white" }}
          >
            {item.name}
          </span>
          <span
            className={`font-black ${embedded ? "text-base" : "text-xl"}`}
            style={textStyle ? { color: tc } : { color: themeColor }}
          >
            {formatCurrency(item.amount)}
          </span>
        </div>
        {item.message && (
          <p
            className={`mt-1 max-w-xs truncate ${
              embedded ? "text-[10px]" : "text-xs"
            }`}
            style={textStyle ? { color: tc + "99" } : { color: "rgba(255,255,255,0.6)" }}
          >
            &ldquo;{item.message}&rdquo;
          </p>
        )}
      </div>
    </OverlayPositionShell>
  );
}
