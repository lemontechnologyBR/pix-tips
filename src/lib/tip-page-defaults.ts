import type { TipPageSettings } from "@/types";
import { DEFAULT_QR_CODE_SETTINGS, normalizeQrCodeSettings } from "@/lib/qr-code-defaults";
import { normalizeBackgroundStyle } from "@/lib/tip-page-background";
import { TTS_VOICES } from "@/lib/tts-config";
import { TIP_PAGE_LAYOUTS } from "@/lib/tip-page-layout-presets";
import { MIN_DONATION_AMOUNT } from "@/lib/finance";

const VALID_VOICE_IDS = TTS_VOICES.filter(v => v.id !== "off").map(v => v.id) as string[];
const VALID_LAYOUT_IDS = TIP_PAGE_LAYOUTS.map(l => l.id);

export const DEFAULT_TIP_PAGE_SETTINGS: TipPageSettings = {
  goalTitle: "Meta da live",
  presetAmounts: [5, 10, 20, 50],
  minDonation: MIN_DONATION_AMOUNT,
  thankYouMessage: "Obrigado pelo apoio!",
  backgroundColor: "#09090b",
  backgroundStyle: "theme",
  backgroundGradientFrom: "#4c1d95",
  backgroundGradientTo: "#09090b",
  backgroundImageUrl: null,
  backgroundImageOverlay: 45,
  fontFamily: "Inter",
  darkMode: true,
  showSupporterWall: true,
  allowAnonymous: true,
  maxSupportersVisible: 10,
  qrCodeSettings: { ...DEFAULT_QR_CODE_SETTINGS },
  tipTtsEnabled: false,
  tipTtsVoices: ["helena-ia", "rafael-ia", "aurora-ia", "bruno-ia", "nina-ia", "theo-ia", "river-ia", "alice-ia", "eric-ia"],
  layoutId: "default",
};

export function normalizeTipPageSettings(raw: Partial<TipPageSettings>): TipPageSettings {
  const merged = { ...DEFAULT_TIP_PAGE_SETTINGS, ...raw };
  const minDonation = Math.max(
    MIN_DONATION_AMOUNT,
    Number(merged.minDonation) || MIN_DONATION_AMOUNT,
  );
  return {
    ...merged,
    minDonation,
    presetAmounts: Array.isArray(merged.presetAmounts)
      ? merged.presetAmounts.map((a) => Math.max(MIN_DONATION_AMOUNT, Number(a) || MIN_DONATION_AMOUNT))
      : DEFAULT_TIP_PAGE_SETTINGS.presetAmounts,
    backgroundStyle: normalizeBackgroundStyle(merged.backgroundStyle),
    backgroundImageUrl: merged.backgroundImageUrl?.trim() || null,
    backgroundImageOverlay: Math.min(
      90,
      Math.max(0, merged.backgroundImageOverlay ?? 45),
    ),
    qrCodeSettings: normalizeQrCodeSettings(merged.qrCodeSettings),
    layoutId: VALID_LAYOUT_IDS.includes(merged.layoutId) ? merged.layoutId : "default",
    tipTtsEnabled: Boolean(merged.tipTtsEnabled),
    tipTtsVoices: (() => {
      const filtered = Array.isArray(merged.tipTtsVoices)
        ? merged.tipTtsVoices.filter(v => VALID_VOICE_IDS.includes(v))
        : [];
      return filtered.length > 0 ? filtered : DEFAULT_TIP_PAGE_SETTINGS.tipTtsVoices;
    })(),
  };
}
