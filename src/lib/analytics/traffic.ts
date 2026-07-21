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

export function extractUtmFromSearchParams(
  params: SearchParamsLike,
): TrafficUtmParams {
  const out: TrafficUtmParams = {};
  for (const [key, field] of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) out[field] = value.slice(0, 120);
  }
  return out;
}

/** Normaliza referrer para exibição no painel admin. */
export function normalizeReferrerLabel(
  referrer: string | null | undefined,
  siteHost = "pix.tips",
): string {
  const raw = referrer?.trim();
  if (!raw) return "Acesso direto";

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    const own = siteHost.replace(/^www\./i, "").toLowerCase();
    if (host === own) return "Navegação interna";
    return host;
  } catch {
    return "Desconhecido";
  }
}

/** Origem de tráfego para relatórios: UTM source > referrer > direto. */
export function resolveTrafficSource(
  utmSource: string | null | undefined,
  referrer: string | null | undefined,
  siteHost = "pix.tips",
): string {
  if (utmSource?.trim()) return utmSource.trim();
  const ref = normalizeReferrerLabel(referrer, siteHost);
  if (ref === "Acesso direto" || ref === "Navegação interna") return ref;
  return ref;
}

export function buildTrafficMediumLabel(
  utmMedium: string | null | undefined,
  utmCampaign: string | null | undefined,
): string {
  const parts = [utmMedium?.trim(), utmCampaign?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "—";
}
