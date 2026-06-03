"use client";

import { formatCurrency } from "@/lib/format";
import type { GoalOverlayPosition, OverlayDragPoint, WidgetDonationItem } from "@/types";
import { OverlayPositionShell } from "./OverlayPositionShell";

interface SupportersOverlayProps {
  items: WidgetDonationItem[];
  position?: GoalOverlayPosition;
  dragPosition?: OverlayDragPoint | null;
  themeColor?: string;
  embedded?: boolean;
  title?: string;
  layout?: "list" | "grid" | "bubbles";
  bgColor?: string | null;
  textColor?: string | null;
  fontSize?: number;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

export function SupportersOverlay({
  items,
  position = "bottom-right",
  dragPosition,
  themeColor = "#8b5cf6",
  embedded = false,
  title,
  layout = "list",
  bgColor,
  textColor,
  fontSize,
}: SupportersOverlayProps) {
  if (items.length === 0) return null;

  const displayTitle = title || "Apoiadores";
  const baseFontSize = fontSize ?? (embedded ? 10 : 12);
  const containerBg = bgColor ?? "rgba(0,0,0,0.75)";
  const titleColor = textColor ? `${textColor}80` : "rgba(255,255,255,0.5)";
  const nameColor = textColor ?? "#ffffff";

  if (layout === "bubbles") {
    return (
      <OverlayPositionShell
        position={position}
        dragPosition={dragPosition}
        embedded={embedded}
        className="max-w-[min(100%,20rem)]"
      >
        <div
          className={`rounded-xl border border-white/10 backdrop-blur-md ${embedded ? "p-2" : "p-3"}`}
          style={{ backgroundColor: containerBg }}
        >
          <p
            className={`mb-2 font-semibold uppercase tracking-wide ${embedded ? "text-[9px]" : "text-[10px]"}`}
            style={{ color: titleColor }}
          >
            {displayTitle}
          </p>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex shrink-0 items-center justify-center rounded-full border-2 font-bold"
                style={{
                  width: embedded ? 32 : 40,
                  height: embedded ? 32 : 40,
                  borderColor: themeColor,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: nameColor,
                  fontSize: `${Math.max(9, baseFontSize - 3)}px`,
                }}
                title={`${item.name} – ${formatCurrency(item.amount)}`}
              >
                {getInitials(item.name)}
              </div>
            ))}
          </div>
        </div>
      </OverlayPositionShell>
    );
  }

  if (layout === "grid") {
    return (
      <OverlayPositionShell
        position={position}
        dragPosition={dragPosition}
        embedded={embedded}
        className="max-w-[min(100%,20rem)]"
      >
        <div
          className={`rounded-xl border border-white/10 backdrop-blur-md ${embedded ? "p-2" : "p-3"}`}
          style={{ backgroundColor: containerBg }}
        >
          <p
            className={`mb-2 font-semibold uppercase tracking-wide ${embedded ? "text-[9px]" : "text-[10px]"}`}
            style={{ color: titleColor }}
          >
            {displayTitle}
          </p>
          <div className={`grid grid-cols-2 ${embedded ? "gap-1" : "gap-1.5"}`}>
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-white/5 bg-white/5 px-2 py-1.5"
                style={{ fontSize: `${baseFontSize}px` }}
              >
                <p className="truncate font-medium" style={{ color: nameColor }}>
                  {item.name}
                </p>
                <p className="font-bold" style={{ color: themeColor }}>
                  {formatCurrency(item.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </OverlayPositionShell>
    );
  }

  return (
    <OverlayPositionShell
      position={position}
      dragPosition={dragPosition}
      embedded={embedded}
      className="max-w-[min(100%,16rem)]"
    >
      <div
        className={`rounded-xl border border-white/10 backdrop-blur-md ${embedded ? "p-2" : "p-3"}`}
        style={{ backgroundColor: containerBg }}
      >
        <p
          className={`mb-2 font-semibold uppercase tracking-wide ${embedded ? "text-[9px]" : "text-[10px]"}`}
          style={{ color: titleColor }}
        >
          {displayTitle}
        </p>
        <ul className={`space-y-1.5 ${embedded ? "max-h-32" : "max-h-64"} overflow-hidden`}>
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-2"
              style={{ fontSize: `${baseFontSize}px` }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-medium" style={{ color: nameColor }}>
                  {item.name}
                </span>
                <span className="shrink-0 font-bold" style={{ color: themeColor }}>
                  {formatCurrency(item.amount)}
                </span>
              </div>
              {item.message && (
                <p
                  className="mt-0.5 truncate"
                  style={{ color: textColor ? `${textColor}80` : "rgba(255,255,255,0.5)" }}
                >
                  &ldquo;{item.message}&rdquo;
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </OverlayPositionShell>
  );
}
