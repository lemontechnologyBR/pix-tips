/** Comissão única da plataforma sobre cada doação recebida (%). */
export const COMMISSION_RATE = 2;

export const MIN_WITHDRAW_AMOUNT = 20;

export function getCommissionRate(): number {
  return COMMISSION_RATE;
}

export function computeFee(amount: number, commissionRate: number): number {
  return Math.round(amount * commissionRate) / 100;
}

export function computeNetAmount(amount: number, commissionRate: number): number {
  return amount - computeFee(amount, commissionRate);
}

/**
 * Taxa fixa de saque para cobrir custos operacionais de transferência Pix.
 * Configurável via WOOVI_PAYOUT_FEE (padrão R$ 2,50).
 */
export function computeWooviPayoutFee(): number {
  return Number(process.env.WOOVI_PAYOUT_FEE ?? 2.5);
}

/** Taxa por Pix recebido (referência; incluída na WOOVI_PAYOUT_FEE). */
export function computeWooviReceiveFee(amount: number): number {
  const percent = Number(process.env.WOOVI_FEE_PERCENT ?? 0.8);
  const minFee = Number(process.env.WOOVI_FEE_MIN ?? 0.5);
  const maxFee = Number(process.env.WOOVI_FEE_MAX ?? 5);
  const raw = amount * (percent / 100);
  const fee = Math.max(minFee, Math.round(raw * 100) / 100);
  return Math.min(maxFee, fee);
}

/** @deprecated Use computeWooviReceiveFee */
export const computeWooviFee = computeWooviReceiveFee;

/** Taxa real cobrada no Pix Out (saque → chave do criador). */
export function computeWooviWithdrawFee(): number {
  return Number(process.env.WOOVI_WITHDRAW_FEE ?? 1);
}

/** Taxa fixa cobrada além do valor que o criador deseja receber. */
export function computeWooviWithdrawFees(
  netWithdrawAmount: number,
  payoutFee = computeWooviPayoutFee(),
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

/** Reserva na conta principal (centavos) para a taxa real de saque Pix Out. */
export function computeWooviWithdrawReserveCents(): number {
  return Math.round(computeWooviWithdrawFee() * 100);
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
