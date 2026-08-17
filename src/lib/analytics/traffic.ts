export interface TrafficUtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

export interface TrafficTrackPayload extends TrafficUtmParams {
  type: string;
  path?: string;
  referrer?: string;
  creatorId?: string;
  widget?: string;
}

const UTM_KEYS = [
  ["utm_source", "utmSource"],
  ["utm_medium", "utmMedium"],
  ["utm_campaign", "utmCampaign"],
  ["utm_term", "utmTerm"],
  ["utm_content", "utmContent"],
] as const;

type SearchParamsLike = {
  get(name: string): string | null;
};

const HOST_LABELS: Array<[RegExp, string]> = [
  [/twitch\.tv$/i, "Twitch"],
  [/kick\.com$/i, "Kick"],
  [/youtube\.com$/i, "YouTube"],
  [/youtu\.be$/i, "YouTube"],
  [/discord\.com$/i, "Discord"],
  [/discordapp\.com$/i, "Discord"],
  [/instagram\.com$/i, "Instagram"],
  [/facebook\.com$/i, "Facebook"],
  [/fb\.com$/i, "Facebook"],
  [/^t\.co$/i, "X / Twitter"],
  [/twitter\.com$/i, "X / Twitter"],
  [/^x\.com$/i, "X / Twitter"],
  [/tiktok\.com$/i, "TikTok"],
  [/doubleclick\.net$/i, "Google Ads"],
  [/googleadservices\.com$/i, "Google Ads"],
  [/google\.[a-z.]+$/i, "Google"],
  [/chatgpt\.com$/i, "ChatGPT"],
  [/telegram\.org$/i, "Telegram"],
  [/t\.me$/i, "Telegram"],
  [/whatsapp\.com$/i, "WhatsApp"],
];

export function extractUtmFromSearchParams(
  params: SearchParamsLike,
): TrafficUtmParams {
  const out: TrafficUtmParams = {};
  for (const [key, field] of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) out[field] = value.slice(0, 120);
  }

  if (!out.utmSource) {
    const ref =
      params.get("ref")?.trim() ||
      params.get("src")?.trim() ||
      params.get("from")?.trim();
    if (ref) {
      out.utmSource = ref.slice(0, 120);
      out.utmMedium = out.utmMedium ?? "ref";
    }
  }

  if (!out.utmSource && params.get("gclid")) {
    out.utmSource = "google";
    out.utmMedium = out.utmMedium ?? "cpc";
    out.utmCampaign = out.utmCampaign ?? "gclid";
  }
  if (!out.utmSource && params.get("fbclid")) {
    out.utmSource = "facebook";
    out.utmMedium = out.utmMedium ?? "social";
  }
  if (!out.utmSource && params.get("ttclid")) {
    out.utmSource = "tiktok";
    out.utmMedium = out.utmMedium ?? "cpc";
  }
  if (!out.utmSource && params.get("msclkid")) {
    out.utmSource = "bing";
    out.utmMedium = out.utmMedium ?? "cpc";
  }

  return out;
}

export function inferSourceFromUserAgent(
  userAgent: string | null | undefined,
): string | null {
  if (!userAgent) return null;
  const s = userAgent.toLowerCase();
  if (s.includes("twitch")) return "Twitch (app)";
  if (s.includes("discord")) return "Discord (app)";
  if (s.includes("instagram")) return "Instagram (app)";
  if (s.includes("fban") || s.includes("fbav") || s.includes("fb_iab")) {
    return "Facebook (app)";
  }
  if (s.includes("twitter") || s.includes("twitterandroid")) return "X / Twitter (app)";
  if (
    s.includes("tiktok") ||
    s.includes("musical_ly") ||
    s.includes("bytedance") ||
    s.includes("aweme")
  ) {
    return "TikTok (app)";
  }
  if (s.includes("telegram")) return "Telegram (app)";
  if (s.includes("whatsapp")) return "WhatsApp (app)";
  if (s.includes("kick/")) return "Kick (app)";
  if (s.includes("youtube/")) return "YouTube (app)";
  return null;
}

function labelForHost(host: string): string {
  for (const [pattern, label] of HOST_LABELS) {
    if (pattern.test(host)) return label;
  }
  return host;
}

/** Normaliza referrer para exibição no painel admin. */
export function normalizeReferrerLabel(
  referrer: string | null | undefined,
  siteHost = "pix.tips",
): string {
  const raw = referrer?.trim();
  if (!raw) return "Acesso direto";

  if (raw.startsWith("android-app://")) {
    if (raw.includes("com.google.android.gm")) return "Gmail";
    if (raw.includes("googlequicksearchbox")) return "Google App";
    if (raw.includes("com.zhiliaoapp.musically")) return "TikTok (app)";
    if (raw.includes("com.instagram.android")) return "Instagram (app)";
    if (raw.includes("com.discord")) return "Discord (app)";
    return "App Android";
  }

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    const own = siteHost.replace(/^www\./i, "").toLowerCase();
    if (host === own) return "Navegação interna";
    return labelForHost(host);
  } catch {
    return "Desconhecido";
  }
}

/** Origem de tráfego: UTM > click id > referrer > app (UA) > direto. */
export function resolveTrafficSource(
  utmSource: string | null | undefined,
  referrer: string | null | undefined,
  userAgent?: string | null,
  siteHost = "pix.tips",
): string {
  if (utmSource?.trim()) return utmSource.trim();
  const ref = normalizeReferrerLabel(referrer, siteHost);
  if (ref !== "Acesso direto" && ref !== "Navegação interna") return ref;
  const fromUa = inferSourceFromUserAgent(userAgent);
  if (fromUa) return fromUa;
  return ref;
}

export function buildTrafficMediumLabel(
  utmMedium: string | null | undefined,
  utmCampaign: string | null | undefined,
): string {
  const parts = [utmMedium?.trim(), utmCampaign?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "—";
}
