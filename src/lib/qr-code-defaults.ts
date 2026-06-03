import type { QrCodeSettings, QrCodeTextStyle } from "@/types";
import {
  normalizeQrWidgetAnimation,
} from "@/lib/qr-widget-animation";
import { normalizeGoalOverlayPosition } from "@/lib/goal-overlay-position";

export const DEFAULT_QR_TEXT_STYLE: QrCodeTextStyle = {
  fontSize: 14,
  color: "#ffffff",
  alignment: "center",
  marginTop: 8,
  marginBottom: 8,
  marginLeft: 16,
  marginRight: 16,
};

export const DEFAULT_QR_CODE_SETTINGS: QrCodeSettings = {
  description: "Apoie via Pix e envie sua mensagem!",
  linkStyle: {
    ...DEFAULT_QR_TEXT_STYLE,
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 20,
    marginBottom: 12,
  },
  descriptionStyle: {
    ...DEFAULT_QR_TEXT_STYLE,
    fontSize: 15,
    color: "#ffffff",
    marginTop: 16,
    marginBottom: 24,
  },
  cardBackground: "#1e293b",
  cardBorderRadius: 16,
  cardBorderColor: "transparent",
  cardShadow: true,
  transparentBg: false,
  fontFamily: "system-ui, sans-serif",
  qrForeground: "#0d9488",
  qrBackground: "#ffffff",
  qrSize: 220,
  qrMargin: 2,
  showAvatarInQr: true,
  animation: "float",
  animationSpeed: "normal",
  widgetPosition: "bottom-center",
};

function normalizeAnimationSpeed(
  value: string | undefined,
): "slow" | "normal" | "fast" {
  if (value === "slow" || value === "fast") return value;
  return "normal";
}

export function normalizeQrCodeSettings(
  raw: Partial<QrCodeSettings> | undefined,
): QrCodeSettings {
  const base = DEFAULT_QR_CODE_SETTINGS;
  if (!raw) return { ...base };

  return {
    ...base,
    ...raw,
    linkStyle: { ...base.linkStyle, ...raw.linkStyle },
    descriptionStyle: { ...base.descriptionStyle, ...raw.descriptionStyle },
    animation: normalizeQrWidgetAnimation(raw.animation ?? base.animation),
    animationSpeed: normalizeAnimationSpeed(raw.animationSpeed),
    widgetPosition: normalizeGoalOverlayPosition(
      raw.widgetPosition ?? base.widgetPosition,
    ),
  };
}
