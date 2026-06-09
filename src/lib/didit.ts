import { createHmac, timingSafeEqual } from "crypto";

const DIDIT_API_BASE = "https://verification.didit.me";

export class DiditApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "DiditApiError";
    this.status = status;
  }
}

export interface DiditSessionResponse {
  session_id: string;
  session_token: string;
  url: string;
  status: string;
  vendor_data?: string;
}

export type DiditDocumentKind = "front" | "back" | "selfie";

export interface DiditIdVerification {
  status?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  personal_number?: string;
  document_number?: string;
  date_of_birth?: string;
  document_type?: string;
  nationality?: string;
  portrait_image?: string | null;
  front_image?: string | null;
  back_image?: string | null;
  full_front_image?: string | null;
  full_back_image?: string | null;
}

export interface DiditDecisionResponse {
  session_id: string;
  session_url?: string;
  status: string;
  vendor_data?: string | null;
  id_verifications?: DiditIdVerification[] | null;
  reviews?: Array<{ comment?: string; reason?: string }> | null;
}

export function isDiditConfigured(): boolean {
  return Boolean(process.env.DIDIT_API_KEY?.trim());
}

function getDiditApiKey(): string {
  const key = process.env.DIDIT_API_KEY?.trim();
  if (!key) {
    throw new DiditApiError("Integração Didit não configurada.", 503);
  }
  return key;
}

function getDiditWorkflowId(): string {
  return (
    process.env.DIDIT_WORKFLOW_ID?.trim() ??
    "0d591c51-d990-4aa2-a26f-cb455bc0342b"
  );
}

function diditHeaders(apiKey: string): HeadersInit {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-api-key": apiKey,
  };
}

function parseDiditError(raw: string, fallback: string): string {
  try {
    const data = JSON.parse(raw) as { error?: string; detail?: string; message?: string };
    return data.error ?? data.detail ?? data.message ?? fallback;
  } catch {
    return raw.trim() || fallback;
  }
}

export async function createDiditSession(input: {
  vendorData: string;
  callbackUrl: string;
  email?: string;
}): Promise<DiditSessionResponse> {
  const apiKey = getDiditApiKey();

  const payload: Record<string, unknown> = {
    workflow_id: getDiditWorkflowId(),
    vendor_data: input.vendorData,
    callback: input.callbackUrl,
  };

  if (input.email) {
    payload.contact_details = {
      email: input.email,
      email_lang: "pt",
    };
  }

  const res = await fetch(`${DIDIT_API_BASE}/v3/session/`, {
    method: "POST",
    headers: diditHeaders(apiKey),
    body: JSON.stringify(payload),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new DiditApiError(
      parseDiditError(raw, "Falha ao iniciar verificação Didit."),
      res.status,
    );
  }

  return JSON.parse(raw) as DiditSessionResponse;
}

function pickDiditIdVerification(
  decision: DiditDecisionResponse,
): DiditIdVerification | null {
  return (
    decision.id_verifications?.find(
      (item) => item.status?.toLowerCase() === "approved",
    ) ??
    decision.id_verifications?.[0] ??
    null
  );
}

export function pickDiditDocumentImageUrl(
  idVerification: DiditIdVerification,
  kind: DiditDocumentKind,
): string | null {
  if (kind === "front") {
    return idVerification.front_image ?? idVerification.full_front_image ?? null;
  }
  if (kind === "back") {
    return idVerification.back_image ?? idVerification.full_back_image ?? null;
  }
  return idVerification.portrait_image ?? null;
}

export async function fetchDiditDocumentImage(
  sessionId: string,
  kind: DiditDocumentKind,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (!isDiditConfigured()) return null;

  try {
    const decision = await getDiditSessionDecision(sessionId);
    const idVerification = pickDiditIdVerification(decision);
    if (!idVerification) return null;

    const url = pickDiditDocumentImageUrl(idVerification, kind);
    if (!url) return null;

    const res = await fetch(url);
    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    return { buffer, contentType };
  } catch (error) {
    console.error("[didit] document image fetch failed:", error);
    return null;
  }
}

export async function getDiditSessionDecision(
  sessionId: string,
): Promise<DiditDecisionResponse> {
  const apiKey = getDiditApiKey();
  const res = await fetch(
    `${DIDIT_API_BASE}/v3/session/${encodeURIComponent(sessionId)}/decision/`,
    { headers: diditHeaders(apiKey) },
  );

  const raw = await res.text();
  if (!res.ok) {
    throw new DiditApiError(
      parseDiditError(raw, "Falha ao consultar verificação Didit."),
      res.status,
    );
  }

  return JSON.parse(raw) as DiditDecisionResponse;
}

function shortenFloats(value: unknown): unknown {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Number.isInteger(value) ? value : Number(value.toFixed(6));
  }
  if (Array.isArray(value)) {
    return value.map(shortenFloats);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, shortenFloats(nested)]),
    );
  }
  return value;
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeys((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

export function verifyDiditWebhookSignature(
  rawBody: string,
  timestamp: string | null,
  signatureV2: string | null,
): boolean {
  const secret = process.env.DIDIT_WEBHOOK_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[didit] CRITICAL: DIDIT_WEBHOOK_SECRET is not configured in production. " +
          "DIDIT_WEBHOOK_SKIP_VERIFY is IGNORED in production — rejecting webhook.",
      );
      return false;
    }
    return process.env.DIDIT_WEBHOOK_SKIP_VERIFY === "1";
  }
  if (!timestamp || !signatureV2) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - ts);
  if (ageSeconds > 300) return false;

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return false;
  }

  const canonical = JSON.stringify(sortKeys(shortenFloats(parsed)));
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}:${canonical}`)
    .digest("hex");

  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signatureV2, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function mapDiditStatusToKycStatus(
  diditStatus: string,
): "none" | "pending" | "approved" | "rejected" {
  const normalized = diditStatus.trim().toLowerCase();

  if (normalized === "approved") return "approved";
  if (normalized === "declined") return "rejected";
  if (
    normalized === "abandoned" ||
    normalized === "expired" ||
    normalized === "kyc expired"
  ) {
    return "none";
  }

  return "pending";
}

export function extractIdentityFromDecision(
  decision: DiditDecisionResponse,
): {
  legalName: string | null;
  cpf: string | null;
  birthDate: string | null;
  documentType: string | null;
} {
  const idVerification =
    decision.id_verifications?.find(
      (item) => item.status?.toLowerCase() === "approved",
    ) ?? decision.id_verifications?.[0];

  if (!idVerification) {
    return {
      legalName: null,
      cpf: null,
      birthDate: null,
      documentType: null,
    };
  }

  const legalName =
    idVerification.full_name?.trim() ||
    [idVerification.first_name, idVerification.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    null;

  // `document_number` pode ser RG/CNH ou outro identificador do documento.
  // CPF só deve vir de `personal_number`; quando ausente, usamos o CPF
  // informado previamente pelo usuário no fluxo da plataforma.
  const cpfRaw = idVerification.personal_number?.trim() || null;
  const cpf = cpfRaw ? cpfRaw.replace(/\D/g, "") : null;

  const birthDate = idVerification.date_of_birth?.slice(0, 10) ?? null;
  const documentType = idVerification.document_type?.toLowerCase().includes("cnh")
    ? "cnh"
    : "rg";

  return { legalName, cpf, birthDate, documentType };
}
