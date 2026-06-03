import { createHmac, createVerify } from "crypto";
import { v4 as uuidv4 } from "uuid";

/** Chave pública Woovi (Base64) — mesma para todos os webhooks. */
const WOOVI_WEBHOOK_PUBLIC_KEY_B64 =
  "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlHZk1BMEdDU3FHU0liM0RRRUJBUVVBQTRHTkFEQ0JpUUtCZ1FDLytOdElranpldnZxRCtJM01NdjNiTFhEdApwdnhCalk0QnNSclNkY2EzcnRBd01jUllZdnhTbmQ3amFnVkxwY3RNaU94UU84aWVVQ0tMU1dIcHNNQWpPL3paCldNS2Jxb0c4TU5waS91M2ZwNnp6MG1jSENPU3FZc1BVVUcxOWJ1VzhiaXM1WloySVpnQk9iV1NwVHZKMGNuajYKSEtCQUE4MkpsbitsR3dTMU13SURBUUFCCi0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo=";

export const WOOVI_PAID_WEBHOOK_EVENTS = [
  "OPENPIX:CHARGE_COMPLETED",
  "OPENPIX:CHARGE_COMPLETED_NOT_SAME_CUSTOMER_PAYER",
] as const;

export interface WooviWebhookCharge {
  correlationID?: string;
  transactionID?: string;
  status?: string;
}

export interface WooviWebhookBody {
  event?: string;
  charge?: WooviWebhookCharge;
  pix?: { charge?: WooviWebhookCharge };
}

const WOOVI_API_BASE = "https://api.woovi.com/api/v1";

/** Woovi não permite split = 100% da cobrança; reserva mínima na conta principal. */
export const WOOVI_SPLIT_MAIN_RESERVE_CENTS = 1;

export class WooviApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "WooviApiError";
    this.status = status;
  }
}

export type WooviChargeStatus = "pending" | "paid" | "expired" | (string & {});

export interface WooviSplit {
  pixKey: string;
  /** Valor do split em centavos */
  value: number;
  splitType: "SPLIT_SUB_ACCOUNT";
}

export interface CreatePixChargeInput {
  /** Valor em reais */
  amount: number;
  correlationID: string;
  comment?: string;
  splits?: WooviSplit[];
}

export interface PixChargeResult {
  id: string;
  brCode: string;
  status: string;
  qrCodeImage?: string;
  paymentLinkUrl?: string;
  mock?: boolean;
  splits?: Array<{ pixKey?: string; value?: number; splitType?: string }>;
}

export interface ChargeStatusResult {
  status: WooviChargeStatus;
  correlationID?: string;
  rawStatus?: string;
}

/** @deprecated Prefer CreatePixChargeInput + createPixCharge */
export interface WooviChargeInput {
  correlationID: string;
  amount: number;
  comment?: string;
  creatorPixKey: string;
  /** Valor líquido do criador (amount - commission) */
  creatorAmount: number;
}

/** @deprecated Prefer PixChargeResult */
export interface WooviChargeResult {
  id: string;
  correlationID: string;
  pixCode: string;
  status: string;
  mock: boolean;
  splitApplied: boolean;
  /** Centavos creditados na subconta após pagamento (complemento do split). */
  splitReserveCents?: number;
}

/** @deprecated Prefer ChargeStatusResult */
export interface WooviChargeStatusResult {
  id: string;
  correlationID: string;
  status: string;
}

interface WooviChargePayload {
  identifier?: string;
  globalID?: string;
  correlationID?: string;
  status?: string;
  brCode?: string;
  qrCodeImage?: string;
  paymentLinkUrl?: string;
  splits?: Array<{ pixKey?: string; value?: number; splitType?: string }>;
}

export interface WooviSubaccountDetails {
  name: string;
  pixKey: string;
  /** Saldo em centavos */
  balance: number;
  withdrawBlocked: boolean;
}

export interface WooviPixKeyCheckResult {
  pixKey: string;
  type: string;
  pixKeyEndToEndId: string | null;
  owner: {
    name: string;
    taxID: string | null;
  };
}

export async function checkWooviPixKey(
  pixKey: string,
): Promise<WooviPixKeyCheckResult> {
  const appId = getWooviAppId();
  if (!appId) {
    throw new WooviApiError("Integração Woovi não configurada na plataforma.", 503);
  }

  const trimmed = pixKey.trim();
  const res = await fetch(`${WOOVI_API_BASE}/pix-keys/check`, {
    method: "POST",
    headers: wooviHeaders(appId),
    body: JSON.stringify({ pixKey: trimmed }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new WooviApiError(
      parseWooviError(raw, "Falha ao verificar chave Pix."),
      res.status,
    );
  }

  const data = JSON.parse(raw) as {
    pixKey?: string;
    type?: string;
    pixKeyEndToEndId?: string;
    owner?: { name?: string; taxID?: string };
    owne?: { name?: string; taxID?: string };
  };

  const owner = data.owner ?? data.owne;
  if (!owner?.name) {
    throw new WooviApiError("Não foi possível obter o titular desta chave Pix.", 422);
  }

  return {
    pixKey: data.pixKey ?? trimmed,
    type: data.type ?? "UNKNOWN",
    pixKeyEndToEndId: data.pixKeyEndToEndId ?? null,
    owner: {
      name: owner.name,
      taxID: owner.taxID ?? null,
    },
  };
}


function mockBrCode(): string {
  return `00020126580014BR.GOV.BCB.PIX0136${uuidv4().replace(/-/g, "")}5204000053039865802BR5913pix.tips6009SAO PAULO62070503***6304ABCD`;
}

export function getWooviAppId(): string | null {
  const id = process.env.WOOVI_APP_ID?.trim();
  return id || null;
}

export function isWooviConfigured(): boolean {
  return Boolean(getWooviAppId());
}

/** Alias de isWooviConfigured — usado em rotas de split */
export function isWooviSplitConfigured(): boolean {
  return isWooviConfigured();
}

function wooviHeaders(appId: string): HeadersInit {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: appId,
  };
}

function reaisToCentavos(amount: number): number {
  return Math.round(amount * 100);
}

function parseWooviError(raw: string, fallback: string): string {
  try {
    const data = JSON.parse(raw) as {
      error?: string;
      message?: string;
      errors?: Array<{ message?: string; description?: string }>;
    };
    if (data.error) return data.error;
    if (data.message) return data.message;
    const first = data.errors?.[0];
    if (first?.description) return first.description;
    if (first?.message) return first.message;
  } catch {
    // ignore
  }

  if (raw.includes("PIX_KEY_INFO_NOT_FOUND")) {
    return "Chave Pix não encontrada em nenhuma instituição bancária.";
  }
  if (raw.includes("INVALID_PIX_KEY")) {
    return "Chave Pix inválida.";
  }
  if (raw.includes("PIX_KEY_CHECK_NOT_ALLOWED")) {
    return "Consulta de titular Pix indisponível na conta de pagamentos.";
  }
  if (
    raw.includes("Saldo insuficiente") ||
    raw.includes("NOT_ENOUGH_BALANCE")
  ) {
    return "Saldo insuficiente na Woovi para sacar. Há valor a mais na subconta (split antigo sem desconto da taxa). O sistema tentará ajustar automaticamente — clique em Sacar novamente.";
  }
  if (raw.includes("Unauthorized")) {
    return "Credenciais Woovi inválidas. Verifique WOOVI_APP_ID.";
  }

  return raw.trim() || fallback;
}

export function normalizeWooviStatus(raw: string): WooviChargeStatus {
  const upper = raw.toUpperCase();
  if (upper === "COMPLETED" || upper === "CONFIRMED") return "paid";
  if (upper === "ACTIVE" || upper === "ACTIVE_WAITING_PAYMENT_METHOD") return "pending";
  if (upper === "EXPIRED") return "expired";
  return raw.toLowerCase();
}

function mapChargeResponse(
  charge: WooviChargePayload,
  topLevelBrCode?: string,
): PixChargeResult {
  return {
    id: charge.identifier ?? charge.globalID ?? charge.correlationID ?? "",
    brCode: charge.brCode ?? topLevelBrCode ?? mockBrCode(),
    status: normalizeWooviStatus(charge.status ?? "pending"),
    qrCodeImage: charge.qrCodeImage,
    paymentLinkUrl: charge.paymentLinkUrl,
    mock: false,
    splits: charge.splits,
  };
}

export async function createPixCharge(input: CreatePixChargeInput): Promise<PixChargeResult> {
  const appId = getWooviAppId();
  if (!appId) {
    return {
      id: `mock_${uuidv4()}`,
      brCode: mockBrCode(),
      status: "pending",
      mock: true,
    };
  }

  const value = reaisToCentavos(input.amount);
  if (value < 1) {
    throw new WooviApiError("Valor mínimo para cobrança Pix é R$ 0,01.", 400);
  }

  const payload: Record<string, unknown> = {
    value,
    correlationID: input.correlationID,
  };

  if (input.comment?.trim()) {
    payload.comment = input.comment.trim().slice(0, 140);
  }

  if (input.splits?.length) {
    payload.splits = input.splits.map((split) => ({
      pixKey: split.pixKey,
      value: split.value,
      splitType: split.splitType,
    }));
  }

  const res = await fetch(`${WOOVI_API_BASE}/charge`, {
    method: "POST",
    headers: wooviHeaders(appId),
    body: JSON.stringify(payload),
  });

  const raw = await res.text();
  if (!res.ok) {
    console.error("[woovi] createPixCharge error:", raw);
    throw new WooviApiError(
      parseWooviError(raw, "Falha ao criar cobrança Pix na Woovi."),
      res.status,
    );
  }

  const data = JSON.parse(raw) as {
    charge?: WooviChargePayload;
    brCode?: string;
    correlationID?: string;
  };

  const charge = data.charge ?? {
    correlationID: data.correlationID ?? input.correlationID,
    status: "pending",
  };

  return mapChargeResponse(charge, data.brCode);
}

export async function getWooviSubaccount(
  pixKey: string,
): Promise<WooviSubaccountDetails | null> {
  const appId = getWooviAppId();
  if (!appId || !pixKey.trim()) return null;

  const res = await fetch(
    `${WOOVI_API_BASE}/subaccount/${encodePixKeyForUrl(pixKey)}`,
    { headers: wooviHeaders(appId) },
  );

  if (res.status === 404) return null;

  const raw = await res.text();
  if (!res.ok) {
    console.error("[woovi] getWooviSubaccount error:", raw);
    return null;
  }

  const data = JSON.parse(raw) as {
    subAccount?: {
      name?: string;
      pixKey?: string;
      balance?: number;
      withdrawBlocked?: boolean;
    };
    subaccount?: {
      name?: string;
      pixKey?: string;
      balance?: number;
      withdrawBlocked?: boolean;
    };
  };

  const sub = data.subAccount ?? data.subaccount;
  if (!sub) return null;

  return {
    name: sub.name ?? pixKey,
    pixKey: sub.pixKey ?? pixKey,
    balance: sub.balance ?? 0,
    withdrawBlocked: sub.withdrawBlocked ?? false,
  };
}

function encodePixKeyForUrl(pixKey: string): string {
  return encodeURIComponent(pixKey.trim());
}

/** Saldo disponível (centavos) na conta principal Woovi. */
export async function getWooviMainAccountAvailable(): Promise<number | null> {
  const appId = getWooviAppId();
  if (!appId) return null;

  const res = await fetch(`${WOOVI_API_BASE}/account`, {
    headers: wooviHeaders(appId),
  });

  if (!res.ok) return null;

  type WooviAccount = { isDefault?: boolean; balance?: { available?: number } };
  const data = (await res.json()) as {
    accounts?: WooviAccount[];
    account?: WooviAccount;
  };

  const accounts: WooviAccount[] = data.accounts ?? (data.account ? [data.account] : []);
  const main =
    accounts.find((a) => a.isDefault) ?? accounts[0];
  return main?.balance?.available ?? null;
}

/** Transfere saldo da conta principal para a subconta (complemento de split). */
export async function creditWooviSubaccount(
  pixKey: string,
  valueCents: number,
  description = "Complemento saldo pix.tips",
): Promise<void> {
  const appId = getWooviAppId();
  if (!appId) {
    throw new WooviApiError("Integração Woovi não configurada na plataforma.", 503);
  }
  if (valueCents < 1) return;

  const res = await fetch(
    `${WOOVI_API_BASE}/subaccount/${encodePixKeyForUrl(pixKey)}/credit`,
    {
      method: "POST",
      headers: wooviHeaders(appId),
      body: JSON.stringify({ value: valueCents, description }),
    },
  );

  const raw = await res.text();
  if (!res.ok) {
    console.error("[woovi] creditWooviSubaccount error:", raw);
    throw new WooviApiError(
      parseWooviError(raw, "Falha ao creditar saldo na subconta Woovi."),
      res.status,
    );
  }
}

/** Transfere saldo virtual da subconta de volta para a conta principal. */
export async function debitWooviSubaccount(
  pixKey: string,
  valueCents: number,
  description = "Ajuste split pix.tips",
): Promise<void> {
  const appId = getWooviAppId();
  if (!appId) {
    throw new WooviApiError("Integração Woovi não configurada na plataforma.", 503);
  }
  if (valueCents < 1) return;

  const res = await fetch(
    `${WOOVI_API_BASE}/subaccount/${encodePixKeyForUrl(pixKey)}/debit`,
    {
      method: "POST",
      headers: wooviHeaders(appId),
      body: JSON.stringify({ value: valueCents, description }),
    },
  );

  const raw = await res.text();
  if (!res.ok) {
    console.error("[woovi] debitWooviSubaccount error:", raw);
    throw new WooviApiError(
      parseWooviError(raw, "Falha ao ajustar saldo da subconta Woovi."),
      res.status,
    );
  }
}

export async function withdrawWooviSubaccount(
  pixKey: string,
  valueCents?: number,
): Promise<{ value: number; correlationID?: string }> {
  const appId = getWooviAppId();
  if (!appId) {
    throw new WooviApiError("Integração Woovi não configurada na plataforma.", 503);
  }

  const sub = await getWooviSubaccount(pixKey);
  if (!sub || sub.balance < 1) {
    throw new WooviApiError("Subconta sem saldo disponível para saque.", 400);
  }
  if (sub.withdrawBlocked) {
    throw new WooviApiError(
      "Saque bloqueado. Verifique se sua chave Pix é válida.",
      403,
    );
  }

  const withdrawCents = valueCents ?? sub.balance;
  if (withdrawCents < 1) {
    throw new WooviApiError("Informe um valor válido para saque.", 400);
  }
  if (withdrawCents > sub.balance) {
    throw new WooviApiError("Saldo insuficiente para este valor.", 400);
  }

  const res = await fetch(
    `${WOOVI_API_BASE}/subaccount/${encodePixKeyForUrl(pixKey)}/withdraw`,
    {
      method: "POST",
      headers: wooviHeaders(appId),
      body: JSON.stringify({ value: withdrawCents }),
    },
  );

  const raw = await res.text();
  if (!res.ok) {
    console.error("[woovi] withdrawWooviSubaccount error:", raw);
    throw new WooviApiError(
      parseWooviError(raw, "Falha ao sacar saldo da subconta Woovi."),
      res.status,
    );
  }

  const data = JSON.parse(raw) as {
    transaction?: { value?: number; correlationID?: string };
  };

  return {
    value: data.transaction?.value ?? sub.balance,
    correlationID: data.transaction?.correlationID,
  };
}

/** Saca saldo virtual da subconta para a chave Pix real do criador. */
export async function payoutWooviSubaccountIfNeeded(
  pixKey: string,
): Promise<{ withdrawn: boolean; value?: number; error?: string }> {
  try {
    const sub = await getWooviSubaccount(pixKey);
    if (!sub || sub.balance < 1 || sub.withdrawBlocked) {
      return { withdrawn: false };
    }

    const result = await withdrawWooviSubaccount(pixKey);
    console.info(
      `[woovi] saque subconta ${pixKey}: R$ ${(result.value / 100).toFixed(2)}`,
    );
    return { withdrawn: true, value: result.value };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro no saque Woovi";
    console.error("[woovi] payoutWooviSubaccountIfNeeded:", message);
    return { withdrawn: false, error: message };
  }
}

export async function getChargeStatus(id: string): Promise<ChargeStatusResult> {
  const appId = getWooviAppId();

  if (!appId || id.startsWith("mock_")) {
    return { status: "pending", correlationID: id, rawStatus: "ACTIVE" };
  }

  const res = await fetch(`${WOOVI_API_BASE}/charge/${encodeURIComponent(id)}`, {
    headers: wooviHeaders(appId),
  });

  if (res.status === 404) {
    throw new WooviApiError("Cobrança não encontrada na Woovi.", 404);
  }

  const raw = await res.text();
  if (!res.ok) {
    console.error("[woovi] getChargeStatus error:", raw);
    throw new WooviApiError(
      parseWooviError(raw, "Falha ao consultar status da cobrança."),
      res.status,
    );
  }

  const data = JSON.parse(raw) as { charge?: WooviChargePayload };
  const charge = data.charge;
  const rawStatus = charge?.status ?? "ACTIVE";

  return {
    status: normalizeWooviStatus(rawStatus),
    correlationID: charge?.correlationID ?? id,
    rawStatus,
  };
}

export function isChargePaid(status: WooviChargeStatus | string): boolean {
  return status === "paid" || status.toUpperCase() === "COMPLETED";
}

export async function createWooviCharge(
  input: WooviChargeInput,
): Promise<WooviChargeResult> {
  const totalCents = reaisToCentavos(input.amount);
  let creatorCents = reaisToCentavos(input.creatorAmount);
  let splitReserveCents = 0;

  if (input.creatorPixKey && creatorCents > 0) {
    if (creatorCents >= totalCents) {
      if (totalCents <= WOOVI_SPLIT_MAIN_RESERVE_CENTS) {
        throw new WooviApiError(
          "Valor mínimo para doação Pix é R$ 0,02.",
          400,
        );
      }
      creatorCents = totalCents - WOOVI_SPLIT_MAIN_RESERVE_CENTS;
      splitReserveCents = WOOVI_SPLIT_MAIN_RESERVE_CENTS;
    }
  }

  const splits: WooviSplit[] = [];
  let splitApplied = false;

  if (input.creatorPixKey && creatorCents > 0 && creatorCents < totalCents) {
    splits.push({
      pixKey: input.creatorPixKey,
      value: creatorCents,
      splitType: "SPLIT_SUB_ACCOUNT",
    });
    splitApplied = true;
  }

  const charge = await createPixCharge({
    amount: input.amount,
    correlationID: input.correlationID,
    comment: input.comment,
    splits: splits.length ? splits : undefined,
  });

  const apiHadSplit = Boolean(
    charge.splits?.some(
      (s) => s.splitType === "SPLIT_SUB_ACCOUNT" && (s.value ?? 0) > 0,
    ),
  );

  return {
    id: charge.id || input.correlationID,
    correlationID: input.correlationID,
    pixCode: charge.brCode,
    status: charge.status,
    mock: charge.mock ?? false,
    splitApplied: charge.mock ? splitApplied : splitApplied && apiHadSplit,
    splitReserveCents: splitApplied ? splitReserveCents : 0,
  };
}

export async function getWooviChargeStatus(
  idOrCorrelation: string,
): Promise<WooviChargeStatusResult> {
  const result = await getChargeStatus(idOrCorrelation);
  return {
    id: idOrCorrelation,
    correlationID: result.correlationID ?? idOrCorrelation,
    status: result.rawStatus ?? result.status,
  };
}

export function isWooviChargePaid(status: string): boolean {
  return isChargePaid(status);
}

export function isWooviPaidWebhookEvent(event?: string): boolean {
  return WOOVI_PAID_WEBHOOK_EVENTS.includes(
    event as (typeof WOOVI_PAID_WEBHOOK_EVENTS)[number],
  );
}

export function extractWooviCorrelationId(
  body: WooviWebhookBody,
): string | null {
  return (
    body.charge?.correlationID ??
    body.pix?.charge?.correlationID ??
    null
  );
}

export function extractWooviTransactionId(
  body: WooviWebhookBody,
): string | null {
  return (
    body.charge?.transactionID ??
    body.pix?.charge?.transactionID ??
    null
  );
}

export function verifyWooviWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!signature) return false;

  try {
    const publicKey = Buffer.from(WOOVI_WEBHOOK_PUBLIC_KEY_B64, "base64").toString(
      "utf8",
    );
    const verifier = createVerify("RSA-SHA256");
    verifier.update(rawBody);
    return verifier.verify(publicKey, signature, "base64");
  } catch {
    return false;
  }
}

export function verifyWooviWebhookHmac(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;

  const expected = createHmac("sha1", secret).update(rawBody).digest("base64");
  return expected === signature;
}

export function verifyWooviWebhook(
  request: Request,
  rawBody: string,
): boolean {
  if (process.env.WOOVI_WEBHOOK_SKIP_VERIFY === "1") {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[woovi] CRITICAL: WOOVI_WEBHOOK_SKIP_VERIFY=1 is set in production — " +
          "this flag is IGNORED in production. Webhook signature will be verified.",
      );
    } else {
      return true;
    }
  }

  const rsaSignature = request.headers.get("x-webhook-signature");
  if (rsaSignature && verifyWooviWebhookSignature(rawBody, rsaSignature)) {
    return true;
  }

  const hmacSecret = process.env.WOOVI_WEBHOOK_SECRET?.trim();
  const hmacSignature =
    request.headers.get("X-OpenPix-Signature") ??
    request.headers.get("x-openpix-signature");
  if (
    hmacSecret &&
    hmacSignature &&
    verifyWooviWebhookHmac(rawBody, hmacSignature, hmacSecret)
  ) {
    return true;
  }

  return false;
}

export async function createWooviSubaccount(input: {
  name: string;
  pixKey: string;
}): Promise<{ name: string; pixKey: string }> {
  const appId = getWooviAppId();
  if (!appId) {
    throw new WooviApiError("Integração Woovi não configurada na plataforma.", 503);
  }

  const res = await fetch(`${WOOVI_API_BASE}/subaccount`, {
    method: "POST",
    headers: wooviHeaders(appId),
    body: JSON.stringify({
      name: input.name,
      pixKey: input.pixKey,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new WooviApiError(
      parseWooviError(raw, "Falha ao criar subconta na Woovi."),
      res.status,
    );
  }

  const data = JSON.parse(raw) as {
    subAccount?: { name?: string; pixKey?: string };
    subaccount?: { name?: string; pixKey?: string };
  };
  const sub = data.subAccount ?? data.subaccount ?? {};
  return {
    name: sub.name ?? input.name,
    pixKey: sub.pixKey ?? input.pixKey,
  };
}
