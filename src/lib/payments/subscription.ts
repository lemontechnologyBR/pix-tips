import { getPrisma } from "@/lib/db";

export type ProPlanType = "pro_monthly" | "pro_annual";

export const PRO_DURATION_DAYS: Record<ProPlanType, number> = {
  pro_monthly: 30,
  pro_annual: 365,
};

export interface ProCheckoutResult {
  correlationID: string;
  pixCode: string;
  amount: number;
  planType: ProPlanType;
  mock: boolean;
}

/**
 * Plano Pro desativado — modelo atual é pay-per-use (sem mensalidade).
 */
export async function createProSubscriptionCharge(
  _creatorId: string,
  _planType: ProPlanType,
): Promise<ProCheckoutResult> {
  throw new Error("Assinatura Pro não está disponível. A pix.tips não cobra mensalidade.");
}

/**
 * Confirma o pagamento de uma assinatura Pro legada (se ainda houver cobranças pendentes).
 */
export async function confirmSubscriptionPayment(correlationID: string) {
  const db = getPrisma();

  const payment = await db.subscriptionPayment.findUnique({
    where: { correlationID },
    include: { creator: { select: { id: true, plan: true, proExpiresAt: true } } },
  });

  if (!payment || payment.status === "paid") return null;

  const durationDays = PRO_DURATION_DAYS[payment.planType as ProPlanType] ?? 30;
  const now = new Date();
  const base =
    payment.creator.plan === "pro" && payment.creator.proExpiresAt && payment.creator.proExpiresAt > now
      ? payment.creator.proExpiresAt
      : now;
  const proExpiresAt = new Date(base.getTime() + durationDays * 24 * 60 * 60 * 1000);

  await db.$transaction([
    db.subscriptionPayment.update({
      where: { correlationID },
      data: { status: "paid", paidAt: now },
    }),
    db.creator.update({
      where: { id: payment.creatorId },
      // Mantém free no modelo atual; só registra o pagamento legado.
      data: { plan: "free", proExpiresAt, subscriptionCancelAtPeriodEnd: false },
    }),
  ]);

  return payment;
}
