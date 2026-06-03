import type { AlertTemplateId } from "@/types";
import { normalizeTemplateId } from "@/lib/alert-catalog";

export type BackgroundScope = "card" | "screen" | "character" | "photo" | "marquee" | "portal";

export const ACCEPTED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
] as const;

export const ACCEPTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp"] as const;

export const MIN_WIDTH = 640;
export const MIN_HEIGHT = 360;
export const MAX_WIDTH = 3840;
export const MAX_HEIGHT = 2160;

export const MAX_FILE_SIZE = 20 * 1024 * 1024;
export const MAX_MEDIA_COUNT = 50;
export const MAX_GIF_DURATION = 30;
export const UPLOAD_RATE_LIMIT = 50;

/** @deprecated use MAX_FILE_SIZE */
export const MAX_FILE_SIZE_FREE = MAX_FILE_SIZE;
/** @deprecated use MAX_FILE_SIZE */
export const MAX_FILE_SIZE_PRO = MAX_FILE_SIZE;
/** @deprecated use MAX_MEDIA_COUNT */
export const MAX_MEDIA_FREE = MAX_MEDIA_COUNT;
/** @deprecated use MAX_MEDIA_COUNT */
export const MAX_MEDIA_PRO = MAX_MEDIA_COUNT;

const SUPPORT: Partial<Record<AlertTemplateId, BackgroundScope>> = {
  "slide-up": "card",
  "slide-down": "card",
  "slide-left": "card",
  "slide-right": "card",
  "fade-in": "card",
  "zoom-bounce": "card",
  typewriter: "screen",
  glitch: "screen",
  neon: "card",
  marquee: "marquee",
  "mascot-enter": "character",
  "pet-companion": "character",
  "ghost-reveal": "screen",
  "chat-bubble": "card",
  spotlight: "screen",
  "stage-curtain": "screen",
  polaroid: "photo",
  earthquake: "screen",
  "kick-alert": "card",
  portal: "portal",
  default: "card",
  gif: "screen",
  "heart-pulse": "card",
  "neon-border": "card",
};

export function templateSupportsBackground(templateId: AlertTemplateId): boolean {
  return normalizeTemplateId(templateId) in SUPPORT;
}

export function getBackgroundScope(templateId: AlertTemplateId): BackgroundScope {
  return SUPPORT[normalizeTemplateId(templateId)] ?? "card";
}

export function getMaxFileSize(): number {
  return MAX_FILE_SIZE;
}

export function getMaxMediaCount(): number {
  return MAX_MEDIA_COUNT;
}

export function getMinOpacity(): number {
  return 0.1;
}
