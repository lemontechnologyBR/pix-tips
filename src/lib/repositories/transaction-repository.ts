import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/db";
import { computeNetAmount, getCommissionRate } from "@/lib/finance";

import { getAdminSettings } from "@/lib/repositories/admin-settings-repository";
import { mapTransactionRow, type TransactionRow } from "@/lib/repositories/json-fields";
import type {
  DashboardOverview,
  Transaction,
  TransactionFilters,
} from "@/types";
import * as creatorRepo from "@/lib/repositories/creator-repository";

function daysAgo(days: number, hours = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d;
}

export async function getRecentDonations(
  creatorId: string,
  limit = 10,
): Promise<Transaction[]> {
  const rows = await prisma.transaction.findMany({
    where: { creatorId, status: "confirmed" },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map((r) => mapTransactionRow(r as TransactionRow));
}

export async function getTransactions(
  creatorId: string,
  filters: TransactionFilters = {},
): Promise<{
  items: Transaction[];
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
    limit = 10,
  } = filters;

  const periodDays = period === "year" ? 365 : parseInt(period, 10);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - periodDays);

  const where: {
    creatorId: string;
    createdAt: { gte: Date };
    status?: string;
    method?: string;
    donorName?: { contains: string };
  } = {
    creatorId,
    createdAt: { gte: cutoff },
  };

  if (status !== "all") where.status = status;
  if (method !== "all") where.method = method;
  if (search.trim()) {
    where.donorName = { contains: search.trim() };
  }

  const [rows, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    items: rows.map((r) => mapTransactionRow(r as TransactionRow)),
    total,
    page,
    totalPages,
  };
}

export async function getDashboardOverview(
  creatorId: string,
): Promise<DashboardOverview> {
  const creator = await creatorRepo.getById(creatorId);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const confirmed = await prisma.transaction.findMany({
    where: { creatorId, status: "confirmed" },
    orderBy: { createdAt: "desc" },
  });

  const monthTx = confirmed.filter((t) => t.createdAt >= monthStart);
  const prevMonthTx = confirmed.filter(
    (t) => t.createdAt >= prevMonthStart && t.createdAt < monthStart,
  );

  const totalMonth = monthTx.reduce((s, t) => s + t.amount, 0);
  const prevTotal = prevMonthTx.reduce((s, t) => s + t.amount, 0);
  const totalMonthChange =
    prevTotal > 0 ? ((totalMonth - prevTotal) / prevTotal) * 100 : 0;

  const supportersMonth = new Set(monthTx.map((t) => t.donorName)).size;
  const prevSupporters = new Set(prevMonthTx.map((t) => t.donorName)).size;
  const supportersChange =
    prevSupporters > 0
      ? ((supportersMonth - prevSupporters) / prevSupporters) * 100
      : 0;

  const chartData: { date: string; amount: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const amount = confirmed
      .filter((t) => t.createdAt.toISOString().slice(0, 10) === key)
      .reduce((s, t) => s + t.amount, 0);
    chartData.push({ date: key, amount });
  }

  const last = confirmed[0] ?? null;

  return {
    totalMonth,
    totalMonthChange,
    supportersMonth,
    supportersChange,
    goalProgress:
      creator && creator.goal > 0 ? (creator.raised / creator.goal) * 100 : 0,
    lastDonation: last ? mapTransactionRow(last as TransactionRow) : null,
    chartData,
  };
}

export async function createTransaction(input: {
  creatorId: string;
  amount: number;
  message: string;
  anonymous: boolean;
  donorName: string;
  method: Transaction["method"];
  pixCode?: string;
  donorTtsVoiceId?: string;
}): Promise<Transaction> {
  const row = await prisma.transaction.create({
    data: {
      creatorId: input.creatorId,
      amount: input.amount,
      message: input.message.slice(0, 200),
      anonymous: input.anonymous,
      donorName: input.anonymous ? "Anônimo" : input.donorName,
      status: "pending",
      method: input.method,
      donorTtsVoiceId: input.donorTtsVoiceId ?? null,
      pixCode:
        input.pixCode ??
        (input.method === "pix"
          ? `00020126580014BR.GOV.BCB.PIX0136${uuidv4().replace(/-/g, "")}5204000053039865802BR5913pix.tips Demo6009SAO PAULO62070503***6304ABCD`
          : null),
    },
  });
  return mapTransactionRow(row as TransactionRow);
}

export async function updateTransactionPayment(
  id: string,
  patch: {
    pixCode?: string;
    wooviPaymentId?: string;
    splitPayment?: boolean;
    applicationFee?: number;
  },
): Promise<Transaction | null> {
  const row = await prisma.transaction.update({
    where: { id },
    data: {
      ...(patch.pixCode != null ? { pixCode: patch.pixCode } : {}),
      ...(patch.wooviPaymentId != null ? { wooviPaymentId: patch.wooviPaymentId } : {}),
      ...(patch.splitPayment != null ? { splitPayment: patch.splitPayment } : {}),
      ...(patch.applicationFee != null ? { applicationFee: patch.applicationFee } : {}),
    },
  });
  return mapTransactionRow(row as TransactionRow);
}

export async function getTransactionByWooviPaymentId(
  wooviPaymentId: string,
): Promise<Transaction | null> {
  const row = await prisma.transaction.findFirst({ where: { wooviPaymentId } });
  return row ? mapTransactionRow(row as TransactionRow) : null;
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  const row = await prisma.transaction.findUnique({ where: { id } });
  return row ? mapTransactionRow(row as TransactionRow) : null;
}

export async function confirmTransaction(
  id: string,
): Promise<Transaction | null> {
  // Atomic claim: updateMany with status condition ensures only one concurrent
  // caller can transition pending → confirmed. If count === 0 the transaction
  // was already processed (or doesn't exist) — skip all side-effects.
  const result = await prisma.transaction.updateMany({
    where: { id, status: "pending" },
    data: { status: "confirmed" },
  });

  if (result.count === 0) {
    return null;
  }

  const row = await prisma.transaction.findUnique({ where: { id } });
  if (!row) return null;

  if (!(await prisma.creator.findUnique({ where: { id: row.creatorId } }))) return null;

  const commissionRate = getCommissionRate();
  const netAmount = computeNetAmount(row.amount, commissionRate);
  const isSplit = row.splitPayment;

  await prisma.creator.update({
    where: { id: row.creatorId },
    data: {
      raised: { increment: row.amount },
      ...(isSplit ? {} : { availableBalance: { increment: netAmount } }),
    },
  });

  return mapTransactionRow(row as TransactionRow);
}

export async function seedDemoTransactions(creatorId: string) {
  const count = await prisma.transaction.count({ where: { creatorId } });
  if (count > 0) return;

  const mocks: Array<{
    amount: number;
    message: string;
    anonymous: boolean;
    donorName: string;
    status: string;
    method: string;
    createdAt: Date;
  }> = [
    {
      amount: 25,
      message: "Bora na live!",
      anonymous: false,
      donorName: "João",
      status: "confirmed",
      method: "pix",
      createdAt: daysAgo(0, 2),
    },
    {
      amount: 10,
      message: "Parabéns pelo conteúdo",
      anonymous: false,
      donorName: "Maria",
      status: "confirmed",
      method: "pix",
      createdAt: daysAgo(1),
    },
    {
      amount: 50,
      message: "",
      anonymous: true,
      donorName: "Anônimo",
      status: "confirmed",
      method: "card",
      createdAt: daysAgo(3),
    },
    {
      amount: 15,
      message: "GG",
      anonymous: false,
      donorName: "Pedro",
      status: "confirmed",
      method: "pix",
      createdAt: daysAgo(5),
    },
    {
      amount: 5,
      message: "Primeira doação!",
      anonymous: false,
      donorName: "Ana",
      status: "confirmed",
      method: "pix",
      createdAt: daysAgo(8),
    },
    {
      amount: 20,
      message: "Teste",
      anonymous: false,
      donorName: "Lucas",
      status: "pending",
      method: "pix",
      createdAt: daysAgo(0, 1),
    },
    {
      amount: 100,
      message: "Falhou",
      anonymous: false,
      donorName: "Carlos",
      status: "failed",
      method: "card",
      createdAt: daysAgo(12),
    },
  ];

  const confirmedTotal = mocks
    .filter((m) => m.status === "confirmed")
    .reduce((s, m) => s + m.amount, 0);

  await prisma.$transaction([
    ...mocks.map((m) =>
      prisma.transaction.create({
        data: { creatorId, ...m },
      }),
    ),
    prisma.creator.update({
      where: { id: creatorId },
      data: { raised: confirmedTotal },
    }),
  ]);
}
