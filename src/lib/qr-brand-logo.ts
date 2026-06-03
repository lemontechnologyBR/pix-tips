import { BRAND_LOGO_ICON_SRC } from "@/lib/brand";
import type { PlanType } from "@/types";

/** Logo compacto no centro do QR (plano gratuito). */
export const QR_BRAND_LOGO_SRC = BRAND_LOGO_ICON_SRC;

/** @deprecated Preferir QR_BRAND_LOGO_SRC — mantido para imports legados */
export const QR_BRAND_LOGO_DATA_URL = QR_BRAND_LOGO_SRC;

export function resolveQrCenterImageUrl(
  plan: PlanType,
  avatarUrl?: string,
): string {
  if (plan === "pro" && avatarUrl?.trim()) {
    return avatarUrl.trim();
  }
  return QR_BRAND_LOGO_SRC;
}

export function isQrCenterAvatar(plan: PlanType, avatarUrl?: string): boolean {
  return plan === "pro" && Boolean(avatarUrl?.trim());
}
