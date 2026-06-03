"use client";

import { getGoalOverlayPositionClass } from "@/lib/goal-overlay-position";
import type { PlanType, QrCodeSettings } from "@/types";
import { QrCodeWidgetCard } from "./QrCodeWidgetCard";

interface QrCodeWidgetProps {
  pageUrl: string;
  displayUrl: string;
  settings: QrCodeSettings;
  avatarUrl?: string;
  plan?: PlanType;
}

export function QrCodeWidget({
  pageUrl,
  displayUrl,
  settings,
  avatarUrl,
  plan = "free",
}: QrCodeWidgetProps) {
  const positionClass = getGoalOverlayPositionClass(settings.widgetPosition);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9998]">
      <div className={`fixed ${positionClass}`}>
        <QrCodeWidgetCard
          pageUrl={pageUrl}
          displayUrl={displayUrl}
          settings={settings}
          avatarUrl={avatarUrl}
          plan={plan}
          animated
          maxQrSize={settings.qrSize}
        />
      </div>
    </div>
  );
}
