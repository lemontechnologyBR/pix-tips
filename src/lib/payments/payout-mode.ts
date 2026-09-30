import { getKycProfile } from "@/lib/repositories/kyc-repository";

/**
 * Regras de migração gradual:
 * - Legado: ainda tem saldo no ledger da pix.tips → doações creditam saldo + saque admin.
 * - Woovi split: saldo zerado + subconta/chave Pix → doações com split, sem incrementar ledger.
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

/** Split Woovi quando não há saldo legado e já existe subconta (ou ao menos chave Pix). */
export function shouldUseWooviSplit(creator: CreatorPayoutContext): boolean {
  if (hasLegacyLedgerBalance(creator.availableBalance)) return false;
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
  if (!hasLegacyLedgerBalance(creator.availableBalance)) return null;
  return "Você ainda tem saldo na pix.tips. Saque esse valor para migrar automaticamente para o modelo Woovi (doações diretas na sua subconta).";
}
