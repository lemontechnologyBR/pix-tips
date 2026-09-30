"use client";

import type { DonationPayload, TextConfig } from "@/types";
import { DEFAULT_TEXT_CONFIG } from "@/types";
import { AlertTemplateSwitch } from "./template-registry";
import { toAlertTemplateProps } from "./templates/types";

interface AlertRendererProps {
  alert: DonationPayload;
  duration: number;
  textTemplate: string;
  textConfig?: TextConfig;
  onComplete: () => void;
  contained?: boolean;
}

export function AlertRenderer({
  alert,
  duration,
  textTemplate,
  textConfig = DEFAULT_TEXT_CONFIG,
  onComplete,
  contained = false,
}: AlertRendererProps) {
  const props = toAlertTemplateProps({
    alert: { ...alert, textConfig: alert.textConfig ?? textConfig },
    duration,
    textTemplate,
    onComplete,
    textConfig: alert.textConfig ?? textConfig,
  });

  const badges: string[] = [];
  if (alert.isSubscriber) {
    badges.push(alert.subscriberPlanName ? `★ ${alert.subscriberPlanName}` : "★ Assinante");
  }
  for (const b of alert.missionBadges ?? []) {
    if (b.trim()) badges.push(b.trim());
  }

  const content = (
    <div className="relative">
      {badges.length > 0 && (
        <div className="pointer-events-none absolute left-1/2 top-2 z-20 flex -translate-x-1/2 flex-wrap justify-center gap-1.5">
          {badges.slice(0, 3).map((b) => (
            <span
              key={b}
              className="rounded-full bg-amber-400/95 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-zinc-950 shadow-lg ring-1 ring-amber-200/80"
            >
              {b}
            </span>
          ))}
        </div>
      )}
      <AlertTemplateSwitch
        key={`${alert.name}-${alert.amount}-${alert.templateId}-${duration}`}
        templateId={alert.templateId}
        {...props}
      />
    </div>
  );

  if (!contained) {
    return content;
  }

  return (
    <div className="absolute inset-0 overflow-hidden [&_.alert-layer]:!absolute">
      {content}
    </div>
  );
}
