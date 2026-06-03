"use client";

import { useCallback, useEffect, useState } from "react";
import type { DonationPayload, GoalOverlayPosition, WidgetDonationItem } from "@/types";
import { SupportersOverlay } from "./SupportersOverlay";
import {
  donationToWidgetItem,
  useDonationSocket,
  widgetShellClass,
} from "./useDonationSocket";

interface SupportersWidgetProps {
  userId: string;
  token: string;
  initialItems?: WidgetDonationItem[];
  position?: GoalOverlayPosition;
  maxItems?: number;
  themeColor?: string;
  previewMode?: boolean;
  title?: string;
  layout?: "list" | "grid" | "bubbles";
  bgColor?: string | null;
  textColor?: string | null;
  fontSize?: number;
}

export function SupportersWidget({
  userId,
  token,
  initialItems = [],
  position = "bottom-right",
  maxItems = 6,
  themeColor = "#8b5cf6",
  previewMode = false,
  title,
  layout,
  bgColor,
  textColor,
  fontSize,
}: SupportersWidgetProps) {
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
      <SupportersOverlay
        items={items}
        position={position}
        themeColor={themeColor}
        embedded={previewMode}
        title={title}
        layout={layout}
        bgColor={bgColor}
        textColor={textColor}
        fontSize={fontSize}
      />
    </div>
  );
}
