import type {
  Creator,
  DashboardOverview,
  OnboardingPayload,
  TipPageSettings,
  Transaction,
  TransactionFilters,
  UserProfile,
} from "@/types";
import { listOAuthAccounts } from "@/lib/auth/oauth";
import { getPrisma } from "@/lib/db";
import * as creatorRepo from "@/lib/repositories/creator-repository";
import * as financeRepo from "@/lib/repositories/finance-repository";
import * as transactionRepo from "@/lib/repositories/transaction-repository";

export async function getCreatorByUsername(
  username: string,
): Promise<Creator | null> {
  return creatorRepo.getByUsername(username);
}

export async function getCreatorById(id: string): Promise<Creator | null> {
  return creatorRepo.getById(id);
}

export async function getCreatorByEmail(email: string): Promise<Creator | null> {
  return creatorRepo.getByEmail(email);
}

export async function getDemoCreator(): Promise<Creator> {
  return creatorRepo.getDemoOrSeed();
}

export async function updateCreator(
  id: string,
  patch: Partial<Creator>,
): Promise<Creator | null> {
  return creatorRepo.update(id, patch);
}

export async function updateTipPageSettings(
  id: string,
  settings: Partial<TipPageSettings>,
): Promise<Creator | null> {
  return creatorRepo.updateTipPageSettings(id, settings);
}

export async function getRecentDonations(
  creatorId: string,
  limit = 10,
): Promise<Transaction[]> {
  return transactionRepo.getRecentDonations(creatorId, limit);
}

export async function getTransactions(
  creatorId: string,
  filters: TransactionFilters = {},
) {
  return transactionRepo.getTransactions(creatorId, filters);
}

export async function getFinanceOverview(creatorId: string) {
  return financeRepo.getFinanceOverview(creatorId);
}

export async function updatePayoutSettings(
  creatorId: string,
  input: Parameters<typeof financeRepo.updatePayoutSettings>[1],
) {
  return financeRepo.updatePayoutSettings(creatorId, input);
}

export async function requestWithdrawal(creatorId: string, amount: number) {
  return financeRepo.requestWithdrawal(creatorId, amount);
}

export async function recordWooviWithdrawal(
  creatorId: string,
  input: Parameters<typeof financeRepo.recordWooviWithdrawal>[1],
) {
  return financeRepo.recordWooviWithdrawal(creatorId, input);
}

export async function listPayouts(
  creatorId: string,
  filters: Parameters<typeof financeRepo.listPayouts>[1] = {},
) {
  return financeRepo.listPayouts(creatorId, filters);
}

export async function getDashboardOverview(
  creatorId: string,
): Promise<DashboardOverview> {
  return transactionRepo.getDashboardOverview(creatorId);
}

export async function getUserProfile(creatorId: string): Promise<UserProfile> {
  const db = getPrisma();
  const [c, finance, userRow] = await Promise.all([
    creatorRepo.getById(creatorId),
    financeRepo.getFinanceOverview(creatorId),
    db.user.findFirst({
      where: { creator: { id: creatorId } },
      select: { id: true, passwordHash: true, totpEnabled: true },
    }),
  ]);

  if (!c) {
    throw new Error("Creator not found");
  }

  const oauthAccounts = userRow
    ? await listOAuthAccounts(userRow.id)
    : [];

  const payout = finance.payoutSettings;

  return {
    email: c.email,
    username: c.username,
    displayName: c.displayName,
    avatar: c.avatar,
    plan: c.plan,
    hasPassword: Boolean(userRow?.passwordHash),
    totpEnabled: Boolean(userRow?.totpEnabled),
    notifyEmailDonation: c.notifyEmailDonation,
    notifyEmailWeekly: c.notifyEmailWeekly,
    notifyPanelDonation: c.notifyPanelDonation,
    payoutConfigured: payout.configured,
    pixKeyMasked: payout.pixKeyMasked,
    pixKeyType: payout.pixKeyType,
    pixHolderName: payout.pixHolderName,
    wooviPixConnected: finance.woovi.connected,
    wooviPixKeyMasked: finance.woovi.pixKeyMasked,
    connectedAccounts: oauthAccounts.map((a) => ({
      provider: a.provider,
      createdAt: a.createdAt.toISOString(),
    })),
    kyc: finance.kyc,
  };
}

export async function deleteUserAccount(
  userId: string,
): Promise<{ error?: string }> {
  const db = getPrisma();
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { creator: true },
  });

  if (!user?.creator) {
    return { error: "Conta não encontrada." };
  }

  const creatorId = user.creator.id;

  const pendingPayouts = await db.payout.count({
    where: {
      creatorId,
      status: { in: ["pending", "processing"] },
    },
  });

  if (pendingPayouts > 0) {
    return { error: "Você tem saques pendentes. Aguarde a conclusão antes de excluir." };
  }

  if (user.creator.availableBalance > 0) {
    return {
      error: "Saque seu saldo disponível antes de excluir a conta.",
    };
  }

  await db.user.delete({ where: { id: userId } });
  return {};
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
  return transactionRepo.createTransaction(input);
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
  return transactionRepo.updateTransactionPayment(id, patch);
}

export async function getTransactionByWooviPaymentId(
  wooviPaymentId: string,
): Promise<Transaction | null> {
  return transactionRepo.getTransactionByWooviPaymentId(wooviPaymentId);
}

export async function getTransaction(
  id: string,
): Promise<Transaction | null> {
  return transactionRepo.getTransaction(id);
}

export async function confirmTransaction(
  id: string,
): Promise<Transaction | null> {
  return transactionRepo.confirmTransaction(id);
}

export async function completeOnboarding(
  creatorId: string,
  data: OnboardingPayload,
): Promise<Creator | null> {
  const creator = await creatorRepo.getById(creatorId);
  if (!creator) return null;

  return creatorRepo.update(creatorId, {
    avatar: data.avatar,
    displayName: data.displayName,
    bio: data.bio,
    goal: data.goal != null && data.goal > 0 ? data.goal : creator.goal,
    onboardingCompleted: true,
    alertSettings: {
      ...creator.alertSettings,
      templateId: data.templateId,
      soundId: data.soundId,
    },
  });
}

export async function upgradeCreatorPlan(creatorId: string): Promise<Creator | null> {
  return creatorRepo.update(creatorId, {
    plan: "pro",
    subscriptionCancelAtPeriodEnd: false,
  });
}

export async function cancelSubscriptionAtPeriodEnd(
  creatorId: string,
): Promise<Creator | null> {
  return creatorRepo.update(creatorId, {
    subscriptionCancelAtPeriodEnd: true,
  });
}
