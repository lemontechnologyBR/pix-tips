/**
 * Integração Woovi / OpenPix — cobranças Pix com split para subcontas.
 *
 * Split: valor líquido vai para a subconta do criador; a taxa fixa (R$ 0,99)
 * permanece na conta da plataforma.
 * Legado: cobrança sem split; saldo controlado no ledger interno + saque admin.
 */

const WOOVI_API_BASE =
  process.env.WOOVI_API_BASE?.trim() || "https://api.woovi.com/api/v1";

export class WooviApiError extends Error {
  constructor(
    message: string,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = "WooviApiError";
  }
}

function getAuthHeader(): string | null {
  const token = process.env.WOOVI_AUTH_TOKEN?.trim();
  if (token) return token;

  const appId = process.env.WOOVI_APP_ID?.trim();
  const appSecret = process.env.WOOVI_APP_SECRET?.trim();
  if (appId && appSecret) {
    return Buffer.from(`${appId}:${appSecret}`).toString("base64");
  }
  return null;
}

export function isWooviConfigured(): boolean {
  return Boolean(getAuthHeader());
}

export function getActivePaymentProvider(): "woovi" {
  return "woovi";
}

export interface WooviPixCharge {
  id: string;
  correlationID: string;
  status: string;
  pixCode: string;
  qrCodeImage: string | null;
  expiresAt: string | null;
}

interface WooviChargeResponse {
  charge?: {
    correlationID?: string;
    status?: string;
    value?: number;
    brCode?: string;
    qrCodeImage?: string;
    paymentLinkUrl?: string;
    expiresDate?: string;
    globalID?: string;
  };
  brCode?: string;
  error?: string;
  message?: string;
}

function authHeaders(): HeadersInit {
  const auth = getAuthHeader();
  if (!auth) {
    throw new WooviApiError("Pagamentos Pix indisponíveis no momento.", 503);
  }
  return {
    Authorization: auth,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/** Converte reais → centavos (inteiro). */
export function toCents(reais: number): number {
  return Math.round(reais * 100);
}

export async function createWooviPixCharge(input: {
  amount: number;
  correlationID: string;
  comment?: string;
  expiresInSeconds?: number;
  /** Chave Pix da subconta do criador — ativa split SPLIT_SUB_ACCOUNT. */
  splitPixKey?: string | null;
  /** Valor em reais destinado à subconta (líquido do criador). */
  splitAmount?: number;
}): Promise<WooviPixCharge> {
  const valueCents = toCents(input.amount);
  if (valueCents < 1) {
    throw new WooviApiError("Valor inválido para cobrança.", 400);
  }

  const body: Record<string, unknown> = {
    correlationID: input.correlationID,
    value: valueCents,
    comment: (input.comment ?? "Doação via pix.tips").slice(0, 140),
    expiresIn: input.expiresInSeconds ?? 900,
  };

  if (
    input.splitPixKey &&
    input.splitAmount != null &&
    input.splitAmount > 0
  ) {
    const splitCents = toCents(input.splitAmount);
    if (splitCents >= valueCents) {
      throw new WooviApiError("Split inválido: líquido deve ser menor que o total.", 400);
    }
    body.splits = [
      {
        pixKey: input.splitPixKey,
        value: splitCents,
        splitType: "SPLIT_SUB_ACCOUNT",
      },
    ];
  }

  const res = await fetch(`${WOOVI_API_BASE}/charge?return_existing=true`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as WooviChargeResponse;
  if (!res.ok || !data.charge) {
    console.error("[woovi] createCharge failed", res.status, data);
    throw new WooviApiError(
      data.message || data.error || "Não foi possível gerar o Pix. Tente novamente.",
      res.status >= 500 ? 502 : 400,
    );
  }

  const pixCode = data.charge.brCode || data.brCode || "";
  if (!pixCode) {
    throw new WooviApiError("Pix indisponível para esta cobrança.", 502);
  }

  return {
    id: data.charge.globalID || data.charge.correlationID || input.correlationID,
    correlationID: data.charge.correlationID || input.correlationID,
    status: data.charge.status ?? "ACTIVE",
    pixCode,
    qrCodeImage: data.charge.qrCodeImage ?? null,
    expiresAt: data.charge.expiresDate ?? null,
  };
}

export interface WooviChargeStatus {
  correlationID: string;
  status: string;
  valueCents: number | null;
}

export async function getWooviCharge(
  correlationID: string,
): Promise<WooviChargeStatus | null> {
  if (!isWooviConfigured()) return null;

  const res = await fetch(
    `${WOOVI_API_BASE}/charge/${encodeURIComponent(correlationID)}`,
    { headers: authHeaders() },
  );

  if (res.status === 404) return null;
  const data = (await res.json().catch(() => ({}))) as WooviChargeResponse;
  if (!res.ok || !data.charge) {
    console.error("[woovi] getCharge failed", res.status, data);
    return null;
  }

  return {
    correlationID: data.charge.correlationID || correlationID,
    status: data.charge.status ?? "UNKNOWN",
    valueCents: data.charge.value ?? null,
  };
}

export function isWooviChargePaid(status: string): boolean {
  const s = status.toUpperCase();
  return s === "COMPLETED" || s === "RECEIVED" || s === "PAID" || s === "CONFIRMED";
}

export function isWooviChargeExpired(status: string): boolean {
  const s = status.toUpperCase();
  return s === "EXPIRED" || s === "REMOVED" || s === "CANCELED" || s === "CANCELLED";
}

/**
 * Cria (ou reutiliza) subconta Woovi vinculada à chave Pix do criador.
 * Retorna o nome/identificador da subconta.
 */
export async function ensureWooviSubaccount(input: {
  name: string;
  pixKey: string;
}): Promise<{ name: string; pixKey: string }> {
  const pixKey = input.pixKey.trim();
  const name = input.name.trim().slice(0, 100) || "Criador pix.tips";

  const res = await fetch(`${WOOVI_API_BASE}/subaccount`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name, pixKey }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    subAccount?: { name?: string; pixKey?: string };
    error?: string;
    message?: string;
  };

  // Já existe → buscar / aceitar
  if (!res.ok) {
    // Tentativa de GET por pixKey (algumas contas retornam 409)
    const existing = await fetch(
      `${WOOVI_API_BASE}/subaccount?pixKey=${encodeURIComponent(pixKey)}`,
      { headers: authHeaders() },
    ).catch(() => null);

    if (existing?.ok) {
      const list = (await existing.json().catch(() => ({}))) as {
        subAccounts?: Array<{ name?: string; pixKey?: string }>;
        subAccount?: { name?: string; pixKey?: string };
      };
      const found =
        list.subAccount ||
        list.subAccounts?.find((s) => s.pixKey === pixKey) ||
        list.subAccounts?.[0];
      if (found?.name) {
        return { name: found.name, pixKey: found.pixKey || pixKey };
      }
    }

    console.error("[woovi] ensureSubaccount failed", res.status, data);
    throw new WooviApiError(
      data.message || data.error || "Não foi possível criar a subconta Woovi.",
      res.status >= 500 ? 502 : 400,
    );
  }

  return {
    name: data.subAccount?.name || name,
    pixKey: data.subAccount?.pixKey || pixKey,
  };
}

/**
 * Webhook OpenPix/Woovi: se WOOVI_WEBHOOK_SECRET estiver definido,
 * exige header Authorization igual ao secret (padrão OpenPix).
 */
export function verifyWooviWebhook(request: Request): boolean {
  const secret = process.env.WOOVI_WEBHOOK_SECRET?.trim();
  if (!secret) return true;
  const auth = request.headers.get("authorization")?.trim() ?? "";
  return auth === secret || auth === `Bearer ${secret}`;
}
