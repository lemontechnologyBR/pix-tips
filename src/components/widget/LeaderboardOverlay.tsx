"use client";

import { formatCurrency } from "@/lib/format";
import type { GoalOverlayPosition, LeaderboardEntry, OverlayDragPoint } from "@/types";
import { OverlayPositionShell } from "./OverlayPositionShell";

interface LeaderboardOverlayProps {
  entries: LeaderboardEntry[];
  position?: GoalOverlayPosition;
  dragPosition?: OverlayDragPoint | null;
  themeColor?: string;
  embedded?: boolean;
  title?: string;
  period?: "session" | "alltime";
  bgColor?: string | null;
  textColor?: string | null;
  fontSize?: number;
}

export function LeaderboardOverlay({
  entries,
  position = "top-left",
  dragPosition,
  themeColor = "#8b5cf6",
  embedded = false,
  title,
  period,
  bgColor,
  textColor,
  fontSize,
}: LeaderboardOverlayProps) {
  if (entries.length === 0) return null;

  const medals = ["🥇", "🥈", "🥉"];
  const displayTitle = title || "Top apoiadores";
  const baseFontSize = fontSize ?? (embedded ? 10 : 12);
  const containerBg = bgColor ?? "rgba(0,0,0,0.8)";
  const titleColor = textColor ? `${textColor}80` : "rgba(255,255,255,0.5)";
  const nameColor = textColor ?? "#ffffff";

  return (
    <OverlayPositionShell position={position} dragPosition={dragPosition} embedded={embedded}>
      <div
        className={`rounded-xl border border-white/10 backdrop-blur-md ${
          embedded ? "min-w-[9rem] p-2" : "min-w-[11rem] p-3"
        }`}
        style={{ backgroundColor: containerBg }}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <p
            className={`font-semibold uppercase tracking-wide ${
              embedded ? "text-[9px]" : "text-[10px]"
            }`}
            style={{ color: titleColor }}
          >
            {displayTitle}
          </p>
          {period && (
            <span
              className={`rounded px-1 py-0.5 font-medium ${embedded ? "text-[8px]" : "text-[9px]"}`}
              style={{
                backgroundColor: themeColor + "33",
                color: themeColor,
              }}
            >
              {period === "alltime" ? "Geral" : "Sessão"}
            </span>
          )}
        </div>
        <ol className="space-y-1.5">
          {entries.map((entry, index) => (
            <li
              key={entry.name}
              className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-2 py-1.5"
              style={{ fontSize: `${baseFontSize}px` }}
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="shrink-0 w-4 text-center">
                  {index < 3 ? medals[index] : `${index + 1}.`}
                </span>
                <span className="truncate font-medium" style={{ color: nameColor }}>
                  {entry.name}
                </span>
              </span>
              <span className="shrink-0 font-bold" style={{ color: themeColor }}>
                {formatCurrency(entry.amount)}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </OverlayPositionShell>
  );
}
