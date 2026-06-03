"use client";

import { QrCodeWidgetCard } from "@/components/widget/QrCodeWidgetCard";
import type { PlanType, QrCodeSettings } from "@/types";

interface QrCodePreviewCardProps {
  pageUrl: string;
  displayUrl: string;
  settings: QrCodeSettings;
  avatarUrl?: string;
  plan?: PlanType;
}

export function QrCodePreviewCard(props: QrCodePreviewCardProps) {
  return (
    <QrCodeWidgetCard
      {...props}
      animated
      className="mx-auto w-full"
    />
  );
}
