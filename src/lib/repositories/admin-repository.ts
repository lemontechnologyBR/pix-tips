import { prisma } from "@/lib/db";
import {
  excludeDemoCreatorFromMetrics,
  excludeDemoTransactionsFromMetrics,
} from "@/lib/demo";
import { computeFee } from "@/lib/finance";
import { mapTransactionRow, type TransactionRow } from "@/lib/repositories/json-fields";
import type { PlanType, Transaction, TransactionFilters } from "@/types";

export interface AdminOverview {
  totalCreators: number;
  /** GMV: soma bruta de todas as doações confirmadas. */
  totalVolume: number;
  platformRevenue: number;
  mercadoPagoCost: number;
  platformProfit: number;
  mercadoPagoFeeRate: number;
  gatewayCost: number;
  gatewayFeeLabel: string;
  proSubscribers: number;
  creatorsGrowth: number;
  confirmedDonations: number;
  pendingKyc: number;
  pixKeys: number;
  chartData: { date: string; creators: number }[];
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [totalCreators, proSubscribers, confirmedTx, creatorsThisMonth, creatorsPrevMonth, pendingKyc, pixKeys] =
    await Promise.all([
      prisma.creator.count({ where: excludeDemoCreatorFromMetrics }),
      prisma.creator.count({
        where: { plan: "pro", ...excludeDemoCreatorFromMetrics },
      }),
      prisma.transaction.findMany({
        where: { status: "confirmed", ...excludeDemoTransactionsFromMetrics },
      }),
      prisma.creator.count({
        where: { createdAt: { gte: monthStart }, ...excludeDemoCreatorFromMetrics },
      }),
      prisma.creator.count({
        where: {
          createdAt: { gte: prevMonthStart, lt: monthStart },
          ...excludeDemoCreatorFromMetrics,
        },
      }),
      prisma.kycVerification.count({ where: { status: "pending" } }),
      prisma.creator.count({
        where: {
          pixKey: { not: null },
          pixHolderName: { not: null },
          ...excludeDemoCreatorFromMetrics,
        },
      }),
    ]);

  const totalVolume = confirmedTx.reduce((s, t) => s + t.amount, 0);
  const platformRevenue = confirmedTx.reduce(
    (sum, transaction) =>
      sum +
      (transaction.applicationFee != null
        ? transaction.applicationFee
        : computeFee(transaction.amount)),
    0,
  );
  const mercadoPagoFeeRate = Number(process.env.MERCADOPAGO_FEE_PERCENT ?? 1);
  const wooviFeePercent = Number(process.env.WOOVI_FEE_PERCENT ?? 0.8);
  const wooviFeeMin = Number(process.env.WOOVI_FEE_MIN ?? 0.5);
  const wooviFeeMax = Number(process.env.WOOVI_FEE_MAX ?? 5);

  const mercadoPagoCost = confirmedTx.reduce((sum, transaction) => {
    if (!transaction.wooviPaymentId?.startsWith("mp_")) return sum;
    return sum + transaction.amount * (mercadoPagoFeeRate / 100);
  }, 0);

  const wooviCost = confirmedTx.reduce((sum, transaction) => {
    if (!transaction.wooviPaymentId || transaction.wooviPaymentId.startsWith("mp_")) {
      return sum;
    }
    const pct = transaction.amount * (wooviFeePercent / 100);
    const fee = Math.min(wooviFeeMax, Math.max(wooviFeeMin, pct));
    return sum + fee;
  }, 0);

  const gatewayCost = mercadoPagoCost + wooviCost;
  const platformProfit = platformRevenue - gatewayCost;
  const creatorsGrowth =
    creatorsPrevMonth > 0
      ? ((creatorsThisMonth - creatorsPrevMonth) / creatorsPrevMonth) * 100
      : creatorsThisMonth > 0
        ? 100
        : 0;

  const allCreators = await prisma.creator.findMany({
    where: excludeDemoCreatorFromMetrics,
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const chartData: { date: string; creators: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const endOfDay = new Date(key);
    endOfDay.setHours(23, 59, 59, 999);
    const creators = allCreators.filter((c) => c.createdAt <= endOfDay).length;
    chartData.push({ date: key, creators });
  }

  return {
    totalCreators,
    totalVolume,
    platformRevenue: Math.round(platformRevenue * 100) / 100,
    mercadoPagoCost: Math.round(mercadoPagoCost * 100) / 100,
    gatewayCost: Math.round(gatewayCost * 100) / 100,
    gatewayFeeLabel: `Woovi ~${wooviFeePercent}% (mín R$ ${wooviFeeMin.toFixed(2).replace(".", ",")} / máx R$ ${wooviFeeMax.toFixed(2).replace(".", ",")})`,
    platformProfit: Math.round(platformProfit * 100) / 100,
    mercadoPagoFeeRate,
    proSubscribers,
    creatorsGrowth,
    confirmedDonations: confirmedTx.length,
    pendingKyc,
    pixKeys,
    chartData,
  };
}

export async function getAllTransactions(
  filters: TransactionFilters = {},
): Promise<{
  items: (Transaction & { creatorUsername: string; creatorDisplayName: string })[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const {
    period = "30",
    status = "all",
    method = "all",
    search = "",
    page = 1,
    limit = 20,
  } = filters;

  const periodDays = period === "year" ? 365 : parseInt(period, 10);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - periodDays);

  const where: {
    createdAt: { gte: Date };
    status?: string;
    method?: string;
    creatorId?: { not: string };
    OR?: Array<{ donorName: { contains: string } } | { creator: { username: { contains: string } } }>;
  } = {
    createdAt: { gte: cutoff },
    ...excludeDemoTransactionsFromMetrics,
  };

  if (status !== "all") where.status = status;
  if (method !== "all") where.method = method;
  if (search.trim()) {
    const q = search.trim();
    where.OR = [
      { donorName: { contains: q } },
      { creator: { username: { contains: q.toLowerCase() } } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        creator: { select: { username: true, displayName: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items: rows.map((r) => ({
      ...mapTransactionRow(r as unknown as TransactionRow),
      creatorUsername: r.creator.username,
      creatorDisplayName: r.creator.displayName,
    })),
    total,
    page,
    totalPages,
  };
}

export function resolveTemplatePlan(
  templateId: string,
  catalogPlan: PlanType,
  overrides: Record<string, PlanType>,
): PlanType {
  return overrides[templateId] ?? catalogPlan;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  plan: string | null;
  isSuspended: boolean | null;
  totalRaised: number | null;
  availableBalance: number | null;
  creatorId: string | null;
  username: string | null;
}

export async function listAllUsers(opts: {
  page?: number;
  search?: string;
  limit?: number;
} = {}): Promise<{ items: AdminUserRow[]; total: number; page: number; totalPages: number }> {
  const { page = 1, search = "", limit = 20 } = opts;

  const where: {
    OR?: Array<
      | { email: { contains: string } }
      | { name: { contains: string } }
      | { creator: { username: { contains: string } } }
    >;
  } = {};

  if (search.trim()) {
    const q = search.trim();
    where.OR = [
      { email: { contains: q } },
      { name: { contains: q } },
      { creator: { username: { contains: q.toLowerCase() } } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            plan: true,
            isSuspended: true,
            raised: true,
            availableBalance: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: rows.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      role: r.role,
      createdAt: r.createdAt.toISOString(),
      plan: r.creator?.plan ?? null,
      isSuspended: r.creator?.isSuspended ?? null,
      totalRaised: r.creator?.raised ?? null,
      availableBalance: r.creator?.availableBalance ?? null,
      creatorId: r.creator?.id ?? null,
      username: r.creator?.username ?? null,
    })),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function updateUser(
  userId: string,
  patch: { isSuspended?: boolean; role?: string; plan?: string },
): Promise<AdminUserRow | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { creator: true },
  });
  if (!user) return null;

  if (patch.role != null) {
    await prisma.user.update({ where: { id: userId }, data: { role: patch.role } });
  }

  if (patch.isSuspended != null || patch.plan != null) {
    if (user.creator) {
      const creatorData: { isSuspended?: boolean; plan?: string } = {};
      if (patch.isSuspended != null) creatorData.isSuspended = patch.isSuspended;
      if (patch.plan != null) creatorData.plan = patch.plan;
      await prisma.creator.update({ where: { id: user.creator.id }, data: creatorData });
    }
  }

  const updated = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          plan: true,
          isSuspended: true,
          raised: true,
          availableBalance: true,
        },
      },
    },
  });

  if (!updated) return null;
  return {
    id: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role,
    createdAt: updated.createdAt.toISOString(),
    plan: updated.creator?.plan ?? null,
    isSuspended: updated.creator?.isSuspended ?? null,
    totalRaised: updated.creator?.raised ?? null,
    availableBalance: updated.creator?.availableBalance ?? null,
    creatorId: updated.creator?.id ?? null,
    username: updated.creator?.username ?? null,
  };
}

// ─── Payouts (admin) ──────────────────────────────────────────────────────────

export interface AdminPayoutRow {
  id: string;
  creatorId: string;
  username: string;
  displayName: string;
  amount: number;
  fee: number | null;
  status: string;
  pixKey: string;
  pixKeyType: string | null;
  pixHolderName: string | null;
  createdAt: string;
  completedAt: string | null;
}

function resolveAdminPixKey(
  payoutKey: string,
  creatorKey: string | null | undefined,
): string {
  if (payoutKey.includes("•")) return creatorKey?.trim() || payoutKey;
  return payoutKey;
}

export async function listAllPayouts(opts: {
  status?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ items: AdminPayoutRow[]; total: number; page: number; totalPages: number }> {
  const { status = "all", page = 1, limit = 20 } = opts;

  const where: { status?: string } = {};
  if (status !== "all") where.status = status;

  const [rows, total] = await Promise.all([
    prisma.payout.findMany({
      where,
      include: {
        creator: {
          select: {
            username: true,
            displayName: true,
            pixKey: true,
            pixKeyType: true,
            pixHolderName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.payout.count({ where }),
  ]);

  return {
    items: rows.map((r) => ({
      id: r.id,
      creatorId: r.creatorId,
      username: r.creator.username,
      displayName: r.creator.displayName,
      amount: r.amount,
      fee: r.fee ?? null,
      status: r.status,
      pixKey: resolveAdminPixKey(r.pixKey, r.creator.pixKey),
      pixKeyType: r.creator.pixKeyType,
      pixHolderName: r.creator.pixHolderName,
      createdAt: r.createdAt.toISOString(),
      completedAt: r.completedAt?.toISOString() ?? null,
    })),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function updateAdminPayout(
  id: string,
  patch: { status: "completed" | "failed" },
): Promise<AdminPayoutRow | null> {
  const payout = await prisma.payout.findUnique({ where: { id } });
  if (!payout) return null;

  const data: { status: string; completedAt?: Date } = { status: patch.status };
  if (patch.status === "completed") data.completedAt = new Date();

  const updated = await prisma.payout.update({
    where: { id },
    data,
    include: {
      creator: {
        select: {
          username: true,
          displayName: true,
          pixKey: true,
          pixKeyType: true,
          pixHolderName: true,
        },
      },
    },
  });

  return {
    id: updated.id,
    creatorId: updated.creatorId,
    username: updated.creator.username,
    displayName: updated.creator.displayName,
    amount: updated.amount,
    fee: updated.fee ?? null,
    status: updated.status,
    pixKey: resolveAdminPixKey(updated.pixKey, updated.creator.pixKey),
    pixKeyType: updated.creator.pixKeyType,
    pixHolderName: updated.creator.pixHolderName,
    createdAt: updated.createdAt.toISOString(),
    completedAt: updated.completedAt?.toISOString() ?? null,
  };
}
