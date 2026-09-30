import { getKycProfile } from "@/lib/repositories/kyc-repository";

/**
 * Modelo único (pós-migração):
 * - Woovi split: doações com split para subconta; saque instantâneo na Woovi.
 * - Legado: só se ainda não tem chave Pix/subconta (ainda não migrou).
 */

export type PayoutMode = "legacy" | "woovi";

export interface CreatorPayoutContext {
  availableBalance: number;
  wooviSubaccountName?: string | null;
  pixKey?: string | null;
  pixKeyType?: string | null;
  pixHolderName?: string | null;
}

export function hasLegacyLedgerBalance(availableBalance: number): boolean {
  return availableBalance > 0.01;
}

/** Split Woovi sempre que já existe subconta ou chave Pix cadastrada. */
export function shouldUseWooviSplit(creator: CreatorPayoutContext): boolean {
  return Boolean(creator.wooviSubaccountName?.trim() || creator.pixKey?.trim());
}

export function resolvePayoutMode(creator: CreatorPayoutContext): PayoutMode {
  return shouldUseWooviSplit(creator) ? "woovi" : "legacy";
}

export async function canRequestLegacyWithdraw(creatorId: string): Promise<{
  ok: boolean;
  reason?: string;
  kycStatus?: string;
}> {
  const kyc = await getKycProfile(creatorId);
  if (kyc.status !== "approved") {
    return {
      ok: false,
      reason: "Complete a verificação de identidade (KYC) para sacar.",
      kycStatus: kyc.status,
    };
  }
  return { ok: true, kycStatus: kyc.status };
}

export function migrationBannerMessage(creator: CreatorPayoutContext): string | null {
  if (shouldUseWooviSplit(creator)) return null;
  return "Cadastre sua chave Pix para receber doações direto na sua subconta Woovi e sacar na hora.";
}
