"use client";

import { useCallback, useEffect, useState } from "react";
import type { DonationPayload, GoalOverlayPosition, WidgetDonationItem } from "@/types";
import type { TickerLayout } from "@/lib/widget-settings";
import { TickerOverlay } from "./TickerOverlay";
import {
  donationToWidgetItem,
  useDonationSocket,
  widgetShellClass,
} from "./useDonationSocket";

interface TickerWidgetProps {
  userId: string;
  token: string;
  initialItems?: WidgetDonationItem[];
  position?: GoalOverlayPosition;
  layout?: TickerLayout;
  maxItems?: number;
  themeColor?: string;
  previewMode?: boolean;
  speed?: number;
  bgColor?: string | null;
  textColor?: string | null;
  fontSize?: number;
}

export function TickerWidget({
  userId,
  token,
  initialItems = [],
  position = "bottom-left",
  layout = "list",
  maxItems = 5,
  themeColor = "#8b5cf6",
  previewMode = false,
  speed,
  bgColor,
  textColor,
  fontSize,
}: TickerWidgetProps) {
  const [items, setItems] = useState<WidgetDonationItem[]>(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const onDonation = useCallback(
    (payload: DonationPayload) => {
      setItems((prev) => {
        const next = [donationToWidgetItem(payload), ...prev];
        return next.slice(0, maxItems);
      });
    },
    [maxItems],
  );

  useDonationSocket(userId, token, previewMode, onDonation);

  return (
    <div className={widgetShellClass(previewMode)}>
      <TickerOverlay
        items={items}
        position={position}
        layout={layout}
        themeColor={themeColor}
        embedded={previewMode}
        speed={speed}
        bgColor={bgColor}
        textColor={textColor}
        fontSize={fontSize}
      />
    </div>
  );
}
