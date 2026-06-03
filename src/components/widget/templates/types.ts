import type { TextConfig, BackgroundMediaConfig } from "@/types";
import { DEFAULT_TEXT_CONFIG } from "@/types";
import { formatAlertText } from "@/lib/format";
import type { DonationPayload } from "@/types";

export interface AlertTemplateProps {
  name: string;
  amount: number;
  message: string | null;
  textConfig: TextConfig;
  duration: number;
  onComplete: () => void;
  headline: string;
  backgroundMedia?: BackgroundMediaConfig | null;
}

export interface LegacyTemplateProps {
  alert: DonationPayload;
  duration: number;
  textTemplate: string;
  onComplete: () => void;
  textConfig?: TextConfig;
}

export function toAlertTemplateProps(
  props: LegacyTemplateProps,
): AlertTemplateProps {
  const textConfig = props.textConfig ?? props.alert.textConfig ?? DEFAULT_TEXT_CONFIG;
  return {
    name: props.alert.name,
    amount: props.alert.amount,
    message: props.alert.message || null,
    textConfig,
    duration: props.duration,
    onComplete: props.onComplete,
    headline: formatAlertText(
      props.textTemplate,
      props.alert.name,
      props.alert.amount,
      props.alert.message,
    ),
    backgroundMedia: props.alert.backgroundMedia ?? null,
  };
}

export function textStyle(config: TextConfig): React.CSSProperties {
  return {
    fontSize: config.fontSize,
    color: config.color,
    fontWeight: config.fontWeight,
    fontStyle: config.fontStyle,
    textAlign: config.alignment,
    fontFamily: config.fontFamily,
  };
}
