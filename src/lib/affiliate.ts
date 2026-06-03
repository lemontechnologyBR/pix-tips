import { randomBytes } from "crypto";
import type { PrismaClient } from "@prisma/client";

export const AFFILIATE_REF_COOKIE = "tp_affiliate_ref";
export const AFFILIATE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/** Percentual da assinatura repassado ao afiliado (20%). */
export const AFFILIATE_COMMISSION_RATE = 0.20;

export const PRO_PRICES = {
  monthly: 29.9,
  annual: 299.0,
} as const;

export interface AffiliateStats {
  clicks: number;
  signups: number;
  totalCommission: number;
}

export function generateAffiliateCode(username: string): string {
  const base = username.replace(/[^a-z0-9]/gi, "").slice(0, 12).toLowerCase();
  const suffix = randomBytes(3).toString("hex");
  return `${base || "tp"}_${suffix}`;
}

export function generateApiKey(): string {
  return `tp_live_${randomBytes(24).toString("hex")}`;
}

export function statsFromCreator(row: {
  affiliateClicks: number;
  affiliateSignups: number;
  affiliateEarnings: number;
}): AffiliateStats {
  return {
    clicks: row.affiliateClicks,
    signups: row.affiliateSignups,
    totalCommission: row.affiliateEarnings,
  };
}

/**
 * Credita comissão (20% do valor da assinatura) ao afiliado que indicou
 * o criador que acabou de confirmar o pagamento do plano Pro via Pix.
 */
export async function creditAffiliateCommission(
  db: PrismaClient,
  subscriberCreatorId: string,
  planType: "pro_monthly" | "pro_annual",
): Promise<void> {
  const subscriber = await db.creator.findUnique({
    where: { id: subscriberCreatorId },
    select: { referredByCode: true },
  });

  if (!subscriber?.referredByCode) return;

  const referrer = await db.creator.findFirst({
    where: { affiliateCode: subscriber.referredByCode },
    select: { id: true },
  });

  if (!referrer) return;

  const grossAmount = planType === "pro_annual" ? PRO_PRICES.annual : PRO_PRICES.monthly;
  const commission = Math.round(grossAmount * AFFILIATE_COMMISSION_RATE * 100) / 100;

  await db.creator.update({
    where: { id: referrer.id },
    data: { affiliateEarnings: { increment: commission } },
  });
}
