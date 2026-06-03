"use client";

import { useCallback, useEffect, useState } from "react";
import { addDonationToLeaderboard, buildLeaderboardFromItems } from "@/lib/leaderboard";
import type { DonationPayload, GoalOverlayPosition, LeaderboardEntry, WidgetDonationItem } from "@/types";
import { LeaderboardOverlay } from "./LeaderboardOverlay";
import { useDonationSocket, widgetShellClass } from "./useDonationSocket";

interface LeaderboardWidgetProps {
  userId: string;
  token: string;
  initialItems?: WidgetDonationItem[];
  position?: GoalOverlayPosition;
  maxItems?: number;
  themeColor?: string;
  previewMode?: boolean;
  title?: string;
  period?: "session" | "alltime";
  bgColor?: string | null;
  textColor?: string | null;
  fontSize?: number;
}

export function LeaderboardWidget({
  userId,
  token,
  initialItems = [],
  position = "top-left",
  maxItems = 5,
  themeColor = "#8b5cf6",
  previewMode = false,
  title,
  period,
  bgColor,
  textColor,
  fontSize,
}: LeaderboardWidgetProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() =>
    buildLeaderboardFromItems(initialItems).slice(0, maxItems),
  );

  useEffect(() => {
    setEntries(buildLeaderboardFromItems(initialItems).slice(0, maxItems));
  }, [initialItems, maxItems]);

  const onDonation = useCallback(
    (payload: DonationPayload) => {
      setEntries((prev) => addDonationToLeaderboard(prev, payload).slice(0, maxItems));
    },
    [maxItems],
  );

  useDonationSocket(userId, token, previewMode, onDonation);

  return (
    <div className={widgetShellClass(previewMode)}>
      <LeaderboardOverlay
        entries={entries}
        position={position}
        themeColor={themeColor}
        embedded={previewMode}
        title={title}
        period={period}
        bgColor={bgColor}
        textColor={textColor}
        fontSize={fontSize}
      />
    </div>
  );
}
