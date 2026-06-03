import { getPrisma } from "@/lib/db";
import { PRO_PRICES } from "@/lib/affiliate";
import { createPixCharge } from "@/lib/payments/woovi";

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
 * Cria uma cobrança Pix para assinatura do plano Pro.
 * O correlationID é prefixado com "sub_" para identificação no webhook.
 */
export async function createProSubscriptionCharge(
  creatorId: string,
  planType: ProPlanType,
): Promise<ProCheckoutResult> {
  const amount = planType === "pro_annual" ? PRO_PRICES.annual : PRO_PRICES.monthly;
  const correlationID = `sub_${creatorId}_${Date.now()}`;

  const charge = await createPixCharge({
    amount,
    correlationID,
    comment: `Assinatura pix.tips Pro ${planType === "pro_annual" ? "Anual" : "Mensal"}`,
  });

  const db = getPrisma();
  await db.subscriptionPayment.create({
    data: {
      creatorId,
      correlationID,
      amount,
      planType,
      status: "pending",
      pixCode: charge.brCode,
    },
  });

  return {
    correlationID,
    pixCode: charge.brCode,
    amount,
    planType,
    mock: charge.mock ?? false,
  };
}

/**
 * Confirma o pagamento de uma assinatura Pro, atualiza o plano e calcula a expiração.
 * Retorna null se o pagamento não for encontrado ou já estiver confirmado.
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
      data: { plan: "pro", proExpiresAt, subscriptionCancelAtPeriodEnd: false },
    }),
  ]);

  return payment;
}
