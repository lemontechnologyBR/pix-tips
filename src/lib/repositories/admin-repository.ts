import { prisma } from "@/lib/db";
import { mapTransactionRow, type TransactionRow } from "@/lib/repositories/json-fields";
import type { PlanType, Transaction, TransactionFilters } from "@/types";

export interface AdminCreatorRow {
  id: string;
  username: string;
  displayName: string;
  email: string;
  plan: string;
  isSuspended: boolean;
  raised: number;
  createdAt: string;
  transactionCount: number;
}

export interface AdminOverview {
  totalCreators: number;
  totalVolume: number;
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
      prisma.creator.count(),
      prisma.creator.count({ where: { plan: "pro" } }),
      prisma.transaction.findMany({ where: { status: "confirmed" } }),
      prisma.creator.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.creator.count({
        where: { createdAt: { gte: prevMonthStart, lt: monthStart } },
      }),
      prisma.kycVerification.count({ where: { status: "pending" } }),
      prisma.creatorWooviPixKey.count(),
    ]);

  const totalVolume = confirmedTx.reduce((s, t) => s + t.amount, 0);
  const creatorsGrowth =
    creatorsPrevMonth > 0
      ? ((creatorsThisMonth - creatorsPrevMonth) / creatorsPrevMonth) * 100
      : creatorsThisMonth > 0
        ? 100
        : 0;

  const allCreators = await prisma.creator.findMany({
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
    proSubscribers,
    creatorsGrowth,
    confirmedDonations: confirmedTx.length,
    pendingKyc,
    pixKeys,
    chartData,
  };
}

export async function listAllCreators(): Promise<AdminCreatorRow[]> {
  const rows = await prisma.creator.findMany({
    include: {
      user: { select: { email: true } },
      _count: { select: { transactions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r) => ({
    id: r.id,
    username: r.username,
    displayName: r.displayName,
    email: r.user.email,
    plan: r.plan,
    isSuspended: r.isSuspended,
    raised: r.raised,
    createdAt: r.createdAt.toISOString(),
    transactionCount: r._count.transactions,
  }));
}

export async function setCreatorSuspended(
  creatorId: string,
  isSuspended: boolean,
): Promise<boolean> {
  const existing = await prisma.creator.findUnique({ where: { id: creatorId } });
  if (!existing) return false;
  await prisma.creator.update({
    where: { id: creatorId },
    data: { isSuspended },
  });
  return true;
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
    OR?: Array<{ donorName: { contains: string } } | { creator: { username: { contains: string } } }>;
  } = {
    createdAt: { gte: cutoff },
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
          select: { id: true, username: true, plan: true, isSuspended: true, raised: true },
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
        select: { id: true, username: true, plan: true, isSuspended: true, raised: true },
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
  createdAt: string;
  completedAt: string | null;
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
      include: { creator: { select: { username: true, displayName: true } } },
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
      pixKey: r.pixKey,
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
    include: { creator: { select: { username: true, displayName: true } } },
  });

  return {
    id: updated.id,
    creatorId: updated.creatorId,
    username: updated.creator.username,
    displayName: updated.creator.displayName,
    amount: updated.amount,
    fee: updated.fee ?? null,
    status: updated.status,
    pixKey: updated.pixKey,
    createdAt: updated.createdAt.toISOString(),
    completedAt: updated.completedAt?.toISOString() ?? null,
  };
}
