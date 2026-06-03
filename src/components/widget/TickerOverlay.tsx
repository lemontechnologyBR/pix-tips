"use client";

import { formatCurrency } from "@/lib/format";
import type { GoalOverlayPosition, OverlayDragPoint, WidgetDonationItem } from "@/types";
import type { TickerLayout } from "@/lib/widget-settings";
import { OverlayPositionShell } from "./OverlayPositionShell";

interface TickerOverlayProps {
  items: WidgetDonationItem[];
  position?: GoalOverlayPosition;
  dragPosition?: OverlayDragPoint | null;
  layout?: TickerLayout;
  themeColor?: string;
  embedded?: boolean;
  speed?: number;
  bgColor?: string | null;
  textColor?: string | null;
  fontSize?: number;
}

function TickerItem({
  item,
  themeColor,
  compact,
  bgColor,
  textColor,
  fontSize,
}: {
  item: WidgetDonationItem;
  themeColor: string;
  compact?: boolean;
  bgColor?: string | null;
  textColor?: string | null;
  fontSize?: number;
}) {
  const baseFontSize = fontSize ?? (compact ? 10 : 12);
  const itemBg = bgColor ?? "rgba(0,0,0,0.75)";
  const nameColor = textColor ?? "#ffffff";

  return (
    <div
      className="flex shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 backdrop-blur-sm"
      style={{
        backgroundColor: itemBg,
        fontSize: `${baseFontSize}px`,
      }}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: themeColor }}
      />
      <span className="font-semibold" style={{ color: nameColor }}>
        {item.name}
      </span>
      <span className="font-bold" style={{ color: themeColor }}>
        {formatCurrency(item.amount)}
      </span>
      {item.message && (
        <span
          className="max-w-[10rem] truncate"
          style={{ color: textColor ? `${textColor}99` : "rgba(255,255,255,0.6)" }}
        >
          &ldquo;{item.message}&rdquo;
        </span>
      )}
    </div>
  );
}

export function TickerOverlay({
  items,
  position = "bottom-left",
  dragPosition,
  layout = "list",
  themeColor = "#8b5cf6",
  embedded = false,
  speed = 40,
  bgColor,
  textColor,
  fontSize,
}: TickerOverlayProps) {
  if (items.length === 0) return null;

  if (layout === "marquee") {
    const doubled = [...items, ...items];
    // Estimate total width: ~200px per item on average; duration = width / speed
    const estimatedWidth = doubled.length * 220;
    const durationSecs = Math.max(10, Math.min(100, estimatedWidth / speed));

    return (
      <OverlayPositionShell
        position={position}
        dragPosition={dragPosition}
        embedded={embedded}
        className="max-w-full"
      >
        <div
          className="overflow-hidden rounded-xl border border-white/10 px-2 py-2 backdrop-blur-sm"
          style={{ backgroundColor: bgColor ?? "rgba(0,0,0,0.4)" }}
        >
          <div
            className="flex w-max gap-3"
            style={{ animation: `ticker-marquee ${durationSecs}s linear infinite` }}
          >
            {doubled.map((item, index) => (
              <TickerItem
                key={`${item.id}-${index}`}
                item={item}
                themeColor={themeColor}
                compact={embedded}
                bgColor={bgColor}
                textColor={textColor}
                fontSize={fontSize}
              />
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
      className="flex max-w-[min(100%,20rem)] flex-col gap-2"
    >
      {items.map((item) => (
        <TickerItem
          key={item.id}
          item={item}
          themeColor={themeColor}
          compact={embedded}
          bgColor={bgColor}
          textColor={textColor}
          fontSize={fontSize}
        />
      ))}
    </OverlayPositionShell>
  );
}
