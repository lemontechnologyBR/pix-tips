"use client";

import { useCallback, useState } from "react";
import type { DonationPayload, GoalOverlayPosition } from "@/types";
import { StatsOverlay } from "./StatsOverlay";
import { useDonationSocket, widgetShellClass } from "./useDonationSocket";

interface StatsWidgetProps {
  userId: string;
  token: string;
  position?: GoalOverlayPosition;
  themeColor?: string;
  layout?: "classic" | "compact" | "minimal";
  label?: string;
  countLabel?: string;
  bgColor?: string | null;
  textColor?: string | null;
  fontSize?: number;
  previewMode?: boolean;
}

export function StatsWidget({
  userId,
  token,
  position = "top-right",
  themeColor = "#8b5cf6",
  layout = "classic",
  label = "Doações na live",
  countLabel = "doações",
  bgColor = null,
  textColor = null,
  fontSize = 16,
  previewMode = false,
}: StatsWidgetProps) {
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);

  const onDonation = useCallback((payload: DonationPayload) => {
    setCount((c) => c + 1);
    setTotal((t) => t + payload.amount);
  }, []);

  useDonationSocket(userId, token, previewMode, onDonation);

  return (
    <div className={widgetShellClass(previewMode)}>
      <StatsOverlay
        count={count}
        total={total}
        position={position}
        themeColor={themeColor}
        layout={layout}
        label={label}
        countLabel={countLabel}
        bgColor={bgColor}
        textColor={textColor}
        fontSize={fontSize}
        embedded={previewMode}
      />
    </div>
  );
}
