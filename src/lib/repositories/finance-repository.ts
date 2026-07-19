import { prisma } from "@/lib/db";
import {
  computeFee,
  computeNetAmount,
  getCommissionFixedFee,
  getCommissionRate,
  computePayoutFee,
  maskPixKey,
  MIN_WITHDRAW_AMOUNT,
} from "@/lib/finance";
import { getKycProfile } from "@/lib/repositories/kyc-repository";
import { mapTransactionRow, type TransactionRow } from "@/lib/repositories/json-fields";
import { getActivePaymentProvider } from "@/lib/payments/mercadopago";
import type { FinanceOverview, Payout, PixKeyType } from "@/types";

const ACTIVE_PAYOUT_STATUSES = ["pending", "processing", "completed"];

function mapPayout(row: {
  id: string;
  amount: number;
  fee?: number | null;
  status: string;
  pixKey: string;
  createdAt: Date;
  completedAt: Date | null;
}): Payout {
  const fee = row.fee ?? undefined;
  const netAmount =
    fee != null
      ? Math.round((row.amount - fee) * 100) / 100
      : row.amount;

  return {
    id: row.id,
    amount: row.amount,
    fee,
    netAmount,
    status: row.status as Payout["status"],
    pixKeyMasked: row.pixKey,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString(),
  };
}

export async function syncCreatorBalance(creatorId: string): Promise<void> {
  const [creator, confirmed, payouts] = await Promise.all([
    prisma.creator.findUnique({ where: { id: creatorId } }),
    prisma.transaction.findMany({
      where: { creatorId, status: "confirmed" },
    }),
    prisma.payout.findMany({
      where: { creatorId, status: { in: ACTIVE_PAYOUT_STATUSES } },
    }),
  ]);

  if (!creator) return;

  const rate = getCommissionRate();

  const legacyConfirmed = confirmed.filter((tx) => !tx.splitPayment);

  const totalNet = legacyConfirmed.reduce(
    (sum, tx) => sum + computeNetAmount(tx.amount, rate),
    0,
  );

  const completedWithdrawn = payouts
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const reservedWithdrawals = payouts
    .filter((p) => p.status === "pending" || p.status === "processing")
    .reduce((sum, p) => sum + p.amount, 0);

  await prisma.creator.update({
    where: { id: creatorId },
    data: {
      availableBalance: Math.max(0, totalNet - completedWithdrawn - reservedWithdrawals),
      totalWithdrawn: completedWithdrawn,
    },
  });
}

export async function getFinanceOverview(
  creatorId: string,
): Promise<FinanceOverview> {
  await syncCreatorBalance(creatorId);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [creator, confirmed, pendingTx, payouts, recentTx] =
    await Promise.all([
      prisma.creator.findUnique({ where: { id: creatorId } }),
      prisma.transaction.findMany({
        where: { creatorId, status: "confirmed" },
      }),
      prisma.transaction.findMany({
        where: { creatorId, status: "pending" },
      }),
      prisma.payout.findMany({
        where: { creatorId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.transaction.findMany({
        where: { creatorId },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  if (!creator) {
    throw new Error("Creator not found");
  }

  const commissionRate = getCommissionRate();
  const payoutFee = computePayoutFee();

  const totalGross = confirmed.reduce((sum, tx) => sum + tx.amount, 0);
  const totalFees = confirmed.reduce((sum, tx) => {
    if (tx.splitPayment && tx.applicationFee != null) {
      return sum + tx.applicationFee;
    }
    return sum + computeFee(tx.amount, commissionRate);
  }, 0);
  const totalNet = totalGross - totalFees;

  const monthConfirmed = confirmed.filter((tx) => tx.createdAt >= monthStart);
  const monthGross = monthConfirmed.reduce((sum, tx) => sum + tx.amount, 0);
  const monthFees = monthConfirmed.reduce((sum, tx) => {
    if (tx.splitPayment && tx.applicationFee != null) {
      return sum + tx.applicationFee;
    }
    return sum + computeFee(tx.amount, commissionRate);
  }, 0);
  const monthNet = monthGross - monthFees;

  const pendingBalance = pendingTx.reduce((sum, tx) => {
    if (tx.splitPayment) return sum;
    return sum + tx.amount;
  }, 0);
  const kyc = await getKycProfile(creatorId);

  return {
    paymentProvider: getActivePaymentProvider(),
    availableBalance: creator.availableBalance,
    pendingBalance,
    totalWithdrawn: creator.totalWithdrawn,
    totalGross,
    totalFees,
    totalNet,
    commissionRate,
    commissionFixedFee: getCommissionFixedFee(),
    monthGross,
    monthFees,
    monthNet,
    minWithdrawAmount: MIN_WITHDRAW_AMOUNT,
    payoutFee,
    kyc,
    payoutSettings: {
      pixKey: creator.pixKey,
      pixKeyType: (creator.pixKeyType as PixKeyType | null) ?? null,
      pixHolderName: creator.pixHolderName,
      pixKeyMasked: creator.pixKey
        ? maskPixKey(creator.pixKey, creator.pixKeyType)
        : null,
      configured: Boolean(creator.pixKey && creator.pixHolderName),
    },
    recentPayouts: payouts.map(mapPayout),
    recentTransactions: recentTx.map((r) =>
      mapTransactionRow(r as TransactionRow),
    ),
  };
}

export async function updatePayoutSettings(
  creatorId: string,
  input: {
    pixKey: string;
    pixKeyType: PixKeyType;
    pixHolderName: string;
  },
): Promise<void> {
  await prisma.creator.update({
    where: { id: creatorId },
    data: {
      pixKey: input.pixKey.trim(),
      pixKeyType: input.pixKeyType,
      pixHolderName: input.pixHolderName.trim(),
    },
  });
}

export async function listPayouts(
  creatorId: string,
  filters: { period?: string; limit?: number } = {},
): Promise<{ items: Payout[] }> {
  const period = filters.period ?? "30";
  const limit = filters.limit ?? 50;
  const periodDays = period === "year" ? 365 : parseInt(period, 10);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - periodDays);

  const rows = await prisma.payout.findMany({
    where: {
      creatorId,
      createdAt: { gte: cutoff },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return { items: rows.map(mapPayout) };
}

/**
 * Solicitação de saque manual: cria um payout "pending" que debita
 * o valor (e a taxa de saque, se houver) do saldo. O admin envia o Pix
 * e marca como concluído no painel /admin/payouts.
 *
 * @param amount Valor líquido que o criador quer receber na chave Pix.
 */
export async function requestWithdrawal(
  creatorId: string,
  amount: number,
): Promise<Payout> {
  await syncCreatorBalance(creatorId);

  const creator = await prisma.creator.findUnique({ where: { id: creatorId } });
  if (!creator) throw new Error("Creator not found");

  if (!creator.pixKey || !creator.pixHolderName) {
    throw new Error("Configure sua chave Pix antes de solicitar saque");
  }

  const kyc = await getKycProfile(creatorId);
  if (!kyc.canWithdraw) {
    throw new Error("Complete a verificação de identidade (KYC) antes de solicitar saque");
  }

  if (amount < MIN_WITHDRAW_AMOUNT) {
    throw new Error(`Valor mínimo para saque: R$ ${MIN_WITHDRAW_AMOUNT.toFixed(2)}`);
  }

  const fee = computePayoutFee();
  const grossAmount = Math.round((amount + fee) * 100) / 100;

  if (grossAmount > creator.availableBalance + 0.001) {
    throw new Error(
      fee > 0
        ? "Saldo insuficiente (valor + taxa de saque)"
        : "Saldo insuficiente",
    );
  }

  const masked = maskPixKey(creator.pixKey, creator.pixKeyType);

  const payout = await prisma.$transaction(async (tx) => {
    const current = await tx.creator.findUnique({ where: { id: creatorId } });
    if (!current || grossAmount > current.availableBalance + 0.001) {
      throw new Error(
        fee > 0
          ? "Saldo insuficiente (valor + taxa de saque)"
          : "Saldo insuficiente",
      );
    }

    const row = await tx.payout.create({
      data: {
        creatorId,
        amount: grossAmount,
        fee,
        status: "pending",
        pixKey: masked,
      },
    });

    await tx.creator.update({
      where: { id: creatorId },
      data: {
        availableBalance: { decrement: grossAmount },
      },
    });

    return row;
  });

  return mapPayout(payout);
}

export async function seedDemoPayouts(creatorId: string) {
  const count = await prisma.payout.count({ where: { creatorId } });
  if (count > 0) return;

  const creator = await prisma.creator.findUnique({ where: { id: creatorId } });
  if (!creator) return;

  if (!creator.pixKey) {
    await prisma.creator.update({
      where: { id: creatorId },
      data: {
        pixKey: "demo@pix.tips",
        pixKeyType: "email",
        pixHolderName: creator.displayName || "Demo",
      },
    });
  }

  await prisma.payout.create({
    data: {
      creatorId,
      amount: 45,
      status: "completed",
      pixKey: "de•••@pix.tips",
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });
}
