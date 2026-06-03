"use client";

import { useCallback, useEffect, useState } from "react";
import type { DonationPayload, GoalOverlayPosition, WidgetDonationItem } from "@/types";
import { LastDonationOverlay } from "./LastDonationOverlay";
import {
  donationToWidgetItem,
  useDonationSocket,
  widgetShellClass,
} from "./useDonationSocket";

interface LastDonationWidgetProps {
  userId: string;
  token: string;
  initialItem?: WidgetDonationItem | null;
  position?: GoalOverlayPosition;
  themeColor?: string;
  layout?: "classic" | "minimal" | "banner" | "card";
  bgColor?: string | null;
  textColor?: string | null;
  fontSize?: number;
  previewMode?: boolean;
}

export function LastDonationWidget({
  userId,
  token,
  initialItem = null,
  position = "bottom-center",
  themeColor = "#8b5cf6",
  layout = "classic",
  bgColor = null,
  textColor = null,
  fontSize = 16,
  previewMode = false,
}: LastDonationWidgetProps) {
  const [item, setItem] = useState<WidgetDonationItem | null>(initialItem);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setItem(initialItem);
  }, [initialItem]);

  const onDonation = useCallback((payload: DonationPayload) => {
    setItem(donationToWidgetItem(payload));
    setPulse(true);
    window.setTimeout(() => setPulse(false), 500);
  }, []);

  useDonationSocket(userId, token, previewMode, onDonation);

  return (
    <div className={widgetShellClass(previewMode)}>
      <LastDonationOverlay
        item={item}
        position={position}
        themeColor={themeColor}
        layout={layout}
        bgColor={bgColor}
        textColor={textColor}
        fontSize={fontSize}
        embedded={previewMode}
        pulse={pulse}
      />
    </div>
  );
}
