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

  const content = (
    <AlertTemplateSwitch
      key={`${alert.name}-${alert.amount}-${alert.templateId}-${duration}`}
      templateId={alert.templateId}
      {...props}
    />
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
