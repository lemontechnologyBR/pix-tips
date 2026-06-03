import type { CSSProperties } from "react";
import type { QrWidgetAnimation } from "@/types";

export const QR_WIDGET_ANIMATIONS: {
  id: QrWidgetAnimation;
  name: string;
  description: string;
}[] = [
  { id: "float", name: "Flutuar", description: "Movimento suave para cima e baixo" },
  { id: "pulse", name: "Pulsar", description: "Escala leve contínua" },
  { id: "glow", name: "Brilho", description: "Aura luminosa pulsante" },
  { id: "bounce", name: "Bounce", description: "Salto suave" },
  { id: "none", name: "Sem animação", description: "Estático na tela" },
];

export function normalizeQrWidgetAnimation(value: string | undefined): QrWidgetAnimation {
  if (value && QR_WIDGET_ANIMATIONS.some((a) => a.id === value)) {
    return value as QrWidgetAnimation;
  }
  return "float";
}

/** Keyframes embutidos — garante animação no OBS mesmo sem globals.css carregado. */
export const QR_WIDGET_KEYFRAMES_CSS = `
@keyframes qr-card-enter {
  0% { opacity: 0; transform: scale(0.82) translateY(24px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes qr-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16px); }
}

@keyframes qr-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.07); }
}

@keyframes qr-glow {
  0%, 100% {
    filter: drop-shadow(0 0 8px color-mix(in srgb, var(--qr-accent, #2dd4bf) 45%, transparent));
  }
  50% {
    filter: drop-shadow(0 0 26px var(--qr-accent, #2dd4bf))
      drop-shadow(0 0 40px color-mix(in srgb, var(--qr-accent, #2dd4bf) 55%, transparent));
  }
}

@keyframes qr-bounce {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-18px); }
  45% { transform: translateY(-8px); }
  65% { transform: translateY(-14px); }
  80% { transform: translateY(-4px); }
}
`;

function loopAnimationName(animation: QrWidgetAnimation): string | null {
  switch (animation) {
    case "float":
      return "qr-float";
    case "pulse":
      return "qr-pulse";
    case "glow":
      return "qr-glow";
    case "bounce":
      return "qr-bounce";
    default:
      return null;
  }
}

function animationSpeedToDuration(speed: "slow" | "normal" | "fast"): string {
  if (speed === "slow") return "4s";
  if (speed === "fast") return "1.2s";
  return "2.5s";
}

export function getQrAnimationStyles(
  animation: QrWidgetAnimation,
  enabled: boolean,
  speed: "slow" | "normal" | "fast" = "normal",
): CSSProperties {
  if (!enabled || animation === "none") {
    return {};
  }

  const loop = loopAnimationName(animation);
  if (!loop) return {};

  const duration = animationSpeedToDuration(speed);

  return {
    animation: `qr-card-enter 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) both, ${loop} ${duration} ease-in-out 0.85s infinite`,
    transformOrigin: "center center",
    willChange: "transform, filter",
  };
}

/** @deprecated Use getQrAnimationStyles — mantido para compatibilidade */
export function getQrAnimationClass(animation: QrWidgetAnimation): string {
  switch (animation) {
    case "float":
      return "qr-anim-float";
    case "pulse":
      return "qr-anim-pulse";
    case "glow":
      return "qr-anim-glow";
    case "bounce":
      return "qr-anim-bounce";
    default:
      return "";
  }
}
