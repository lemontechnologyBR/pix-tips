import { v4 as uuidv4 } from "uuid";
import { DEFAULT_TIP_PAGE_SETTINGS } from "@/lib/tip-page-defaults";
import { DEFAULT_BACKGROUND_MEDIA, DEFAULT_TEXT_CONFIG } from "@/types";
import type { AlertSettings, TipPageSettings } from "@/types";
import { defaultAlertSettings } from "@/lib/repositories/json-fields";

export function getDefaultAlertSettings(): AlertSettings {
  return defaultAlertSettings();
}

export function getDefaultTipPageSettings(): TipPageSettings {
  return { ...DEFAULT_TIP_PAGE_SETTINGS };
}

export function getDefaultAvatar(username: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
}

export function generateWidgetToken(): string {
  return uuidv4();
}
