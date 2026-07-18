import { createHmac } from "crypto";
import { randomUUID } from "crypto";

/**
 * Integração Mercado Pago — pagamentos Pix.
 *
 * O dinheiro das doações cai na conta Mercado Pago da plataforma.
 * O saldo de cada criador é controlado no nosso banco (transactions - payouts)
 * e o saque é feito por solicitação, processado manualmente pelo admin.
 */

const MP_API_BASE = "https://api.mercadopago.com";

export class MercadoPagoApiError extends Error {
  constructor(
    message: string,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = "MercadoPagoApiError";
  }
}

function getAccessToken(): string | null {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  return token || null;
}

export function isMercadoPagoConfigured(): boolean {
  return Boolean(getAccessToken());
}

/** Provider ativo para recebimentos Pix. */
export function getActivePaymentProvider(): "mercadopago" | "woovi" {
  const configured = process.env.PAYMENT_PROVIDER?.trim().toLowerCase();
  if (configured === "woovi") return "woovi";
  if (configured === "mercadopago") return "mercadopago";
  // Auto: prefere Mercado Pago quando o token está configurado.
  return isMercadoPagoConfigured() ? "mercadopago" : "woovi";
}

export interface MercadoPagoPixPayment {
  id: string;
  status: string;
  pixCode: string;
  qrCodeBase64: string | null;
  expiresAt: string | null;
}

interface MpPaymentResponse {
  id?: number | string;
  status?: string;
  external_reference?: string;
  date_of_expiration?: string;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
    };
  };
  message?: string;
}

export async function createMercadoPagoPixPayment(input: {
  amount: number;
  description: string;
  externalReference: string;
  payerEmail?: string;
  payerFirstName?: string;
  notificationUrl?: string;
  expiresInMinutes?: number;
}): Promise<MercadoPagoPixPayment> {
  const token = getAccessToken();
  if (!token) {
    throw new MercadoPagoApiError("Pagamentos Pix indisponíveis no momento.", 503);
  }

  const expiresInMinutes = input.expiresInMinutes ?? 15;
  const expiration = new Date(Date.now() + expiresInMinutes * 60_000);
  // Formato exigido: yyyy-MM-dd'T'HH:mm:ss.SSSZZ (com offset)
  const dateOfExpiration = expiration.toISOString().replace("Z", "-00:00");

  const res = await fetch(`${MP_API_BASE}/v1/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": randomUUID(),
    },
    body: JSON.stringify({
      transaction_amount: Math.round(input.amount * 100) / 100,
      description: input.description.slice(0, 250),
      payment_method_id: "pix",
      external_reference: input.externalReference,
      date_of_expiration: dateOfExpiration,
      notification_url: input.notificationUrl,
      payer: {
        email: input.payerEmail?.trim() || "doador@pix.tips",
        first_name: input.payerFirstName?.slice(0, 60) || "Apoiador",
      },
    }),
  });

  const body = (await res.json().catch(() => ({}))) as MpPaymentResponse;

  if (!res.ok || body.id == null) {
    console.error("[mercadopago] createPayment failed", res.status, body);
    throw new MercadoPagoApiError(
      "Não foi possível gerar o Pix. Tente novamente.",
      res.status >= 500 ? 502 : 400,
    );
  }

  const pixCode = body.point_of_interaction?.transaction_data?.qr_code ?? "";
  if (!pixCode) {
    throw new MercadoPagoApiError("Pix indisponível para esta cobrança.", 502);
  }

  return {
    id: String(body.id),
    status: body.status ?? "pending",
    pixCode,
    qrCodeBase64: body.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
    expiresAt: body.date_of_expiration ?? null,
  };
}

export interface MercadoPagoPaymentStatus {
  id: string;
  status: string;
  externalReference: string | null;
}

export async function getMercadoPagoPayment(
  paymentId: string,
): Promise<MercadoPagoPaymentStatus | null> {
  const token = getAccessToken();
  if (!token) return null;

  const res = await fetch(`${MP_API_BASE}/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 404) return null;
  const body = (await res.json().catch(() => ({}))) as MpPaymentResponse;
  if (!res.ok || body.id == null) {
    console.error("[mercadopago] getPayment failed", res.status, body);
    return null;
  }

  return {
    id: String(body.id),
    status: body.status ?? "pending",
    externalReference: body.external_reference ?? null,
  };
}

export function isMercadoPagoPaymentApproved(status: string): boolean {
  return status.toLowerCase() === "approved";
}

export function isMercadoPagoPaymentExpired(status: string): boolean {
  const s = status.toLowerCase();
  return s === "cancelled" || s === "expired" || s === "rejected";
}

/** Prefixo usado para distinguir pagamentos MP no campo wooviPaymentId. */
export const MP_PAYMENT_ID_PREFIX = "mp_";

export function toStoredMpPaymentId(paymentId: string): string {
  return `${MP_PAYMENT_ID_PREFIX}${paymentId}`;
}

export function fromStoredMpPaymentId(stored: string): string | null {
  return stored.startsWith(MP_PAYMENT_ID_PREFIX)
    ? stored.slice(MP_PAYMENT_ID_PREFIX.length)
    : null;
}

/**
 * Valida o header x-signature dos webhooks (quando MERCADOPAGO_WEBHOOK_SECRET
 * está configurado). Mesmo sem secret o webhook é seguro: o pagamento é sempre
 * reconsultado na API do Mercado Pago antes de confirmar.
 */
export function verifyMercadoPagoWebhookSignature(
  request: Request,
  dataId: string,
): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim();
  if (!secret) return true;

  const signature = request.headers.get("x-signature") ?? "";
  const requestId = request.headers.get("x-request-id") ?? "";

  const parts = new Map<string, string>();
  for (const part of signature.split(",")) {
    const [k, v] = part.split("=", 2).map((s) => s?.trim());
    if (k && v) parts.set(k, v);
  }
  const ts = parts.get("ts");
  const v1 = parts.get("v1");
  if (!ts || !v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  return expected === v1;
}
