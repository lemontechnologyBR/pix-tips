/** Comissão percentual da plataforma sobre cada doação recebida (%). */
export const COMMISSION_RATE = 2.5;

/**
 * Taxa fixa por doação (R$).
 * Modelo atual: apenas percentual — sem taxa fixa.
 */
export const COMMISSION_FIXED_FEE = 0;

export const MIN_WITHDRAW_AMOUNT = 20;

export function getCommissionRate(): number {
  return COMMISSION_RATE;
}

export function getCommissionFixedFee(): number {
  return COMMISSION_FIXED_FEE;
}

/** Taxa total da plataforma: percentual + fixo (fixo pode ser 0). */
export function computeFee(
  amount: number,
  commissionRate: number = COMMISSION_RATE,
  fixedFee: number = COMMISSION_FIXED_FEE,
): number {
  const percent = Math.round(amount * commissionRate) / 100;
  const total = Math.round((percent + fixedFee) * 100) / 100;
  // Nunca cobrar mais do que o valor da doação (edge case de valores mínimos).
  return Math.min(amount, Math.max(0, total));
}

export function computeNetAmount(
  amount: number,
  commissionRate: number = COMMISSION_RATE,
  fixedFee: number = COMMISSION_FIXED_FEE,
): number {
  return Math.round((amount - computeFee(amount, commissionRate, fixedFee)) * 100) / 100;
}

/** Texto curto para UI: "2,5%" ou "2,5% + R$ 0,50" se houver fixo. */
export function formatCommissionLabel(
  rate: number = COMMISSION_RATE,
  fixedFee: number = COMMISSION_FIXED_FEE,
): string {
  const rateLabel = String(rate).replace(".", ",");
  if (!fixedFee || fixedFee <= 0) return `${rateLabel}%`;
  const fixed = fixedFee.toFixed(2).replace(".", ",");
  return `${rateLabel}% + R$ ${fixed}`;
}

/**
 * Taxa fixa de saque (R$).
 * Configurável via PAYOUT_FEE (padrão 0 — saque gratuito).
 */
export function computePayoutFee(): number {
  return Number(process.env.PAYOUT_FEE ?? 0);
}

/** Taxa fixa cobrada além do valor que o criador deseja receber. */
export function computeWithdrawFees(
  netWithdrawAmount: number,
  payoutFee = computePayoutFee(),
): {
  payoutFee: number;
  totalFees: number;
  grossAmount: number;
  netAmount: number;
} {
  const netAmount = Math.round(netWithdrawAmount * 100) / 100;
  const grossAmount = Math.round((netAmount + payoutFee) * 100) / 100;
  return { payoutFee, totalFees: payoutFee, grossAmount, netAmount };
}

export function maskPixKey(key: string, type?: string | null): string {
  const trimmed = key.trim();
  if (!trimmed) return "—";

  if (type === "email" && trimmed.includes("@")) {
    const [user, domain] = trimmed.split("@");
    const visible = user.slice(0, 2);
    return `${visible}•••@${domain}`;
  }

  if (type === "cpf" || type === "phone") {
    const digits = trimmed.replace(/\D/g, "");
    if (digits.length >= 4) {
      return `••••${digits.slice(-4)}`;
    }
  }

  if (trimmed.length <= 6) return "••••••";
  return `${trimmed.slice(0, 3)}•••${trimmed.slice(-3)}`;
}

export function isValidPixKey(key: string, type: string): boolean {
  const trimmed = key.trim();
  if (!trimmed) return false;

  switch (type) {
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    case "cpf":
      return /^\d{11}$/.test(trimmed.replace(/\D/g, ""));
    case "phone":
      return /^\d{10,11}$/.test(trimmed.replace(/\D/g, ""));
    case "random":
      return trimmed.length >= 32;
    default:
      return trimmed.length >= 5;
  }
}
