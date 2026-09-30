import type { TipPageSettings } from "@/types";
import { DEFAULT_QR_CODE_SETTINGS, normalizeQrCodeSettings } from "@/lib/qr-code-defaults";
import { normalizeBackgroundStyle } from "@/lib/tip-page-background";
import { resolveTtsVoiceId, SELECTABLE_TTS_VOICES } from "@/lib/tts-config";
import { TIP_PAGE_LAYOUTS } from "@/lib/tip-page-layout-presets";
import { MIN_DONATION_AMOUNT } from "@/lib/finance";
import { parseBlockedWords } from "@/lib/message-moderation";

const VALID_VOICE_IDS = new Set(SELECTABLE_TTS_VOICES.map((v) => v.id));
const VALID_LAYOUT_IDS = TIP_PAGE_LAYOUTS.map((l) => l.id);

const DEFAULT_TIP_TTS_VOICES = [
  "francisca",
  "antonio",
  "thalita",
  "raquel",
  "duarte",
  "ava",
  "andrew",
];

export const DEFAULT_TIP_PAGE_SETTINGS: TipPageSettings = {
  goalTitle: "Meta da live",
  presetAmounts: [5, 10, 20, 50],
  minDonation: MIN_DONATION_AMOUNT,
  thankYouMessage: "Obrigado pelo apoio!",
  backgroundColor: "#07070a",
  backgroundStyle: "theme",
  backgroundGradientFrom: "#0c4a6e",
  backgroundGradientTo: "#07070a",
  backgroundImageUrl: null,
  backgroundImageOverlay: 45,
  fontFamily: "Inter",
  darkMode: true,
  showSupporterWall: true,
  allowAnonymous: true,
  maxSupportersVisible: 10,
  qrCodeSettings: { ...DEFAULT_QR_CODE_SETTINGS },
  tipTtsEnabled: false,
  tipTtsVoices: DEFAULT_TIP_TTS_VOICES,
  layoutId: "default",
  messageFilterEnabled: true,
  blockedWords: [],
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
      ? merged.presetAmounts.map((a) =>
          Math.max(MIN_DONATION_AMOUNT, Number(a) || MIN_DONATION_AMOUNT),
        )
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
      const resolved = Array.isArray(merged.tipTtsVoices)
        ? merged.tipTtsVoices
            .map((v) => resolveTtsVoiceId(v))
            .filter((v) => v !== "off" && VALID_VOICE_IDS.has(v))
        : [];
      const unique = [...new Set(resolved)];
      return unique.length > 0 ? unique : DEFAULT_TIP_PAGE_SETTINGS.tipTtsVoices;
    })(),
    messageFilterEnabled: merged.messageFilterEnabled !== false,
    blockedWords: parseBlockedWords(merged.blockedWords),
  };
}
