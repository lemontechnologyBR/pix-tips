import { getPrisma } from "@/lib/db";
import type { CreatorSubPlan, FanSubscriptionPublic } from "@/types";
import { createNotification } from "@/lib/notifications/service";
import { formatCurrency } from "@/lib/format";
import { getIO } from "@/lib/socket-server";
import { resolveAlertSoundId } from "@/lib/alert-catalog";
import { getCreatorById } from "@/lib/store";
import type { DonationPayload } from "@/types";

export function mapSubPlan(row: {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  price: number;
  perks: string;
  active: boolean;
  sortOrder: number;
}): CreatorSubPlan {
  let perks: string[] = [];
  try {
    const parsed = JSON.parse(row.perks || "[]") as unknown;
    if (Array.isArray(parsed)) {
      perks = parsed.filter((p): p is string => typeof p === "string").slice(0, 12);
    }
  } catch {
    perks = [];
  }
  return {
    id: row.id,
    creatorId: row.creatorId,
    name: row.name,
    description: row.description,
    price: row.price,
    perks,
    active: row.active,
    sortOrder: row.sortOrder,
  };
}

export async function listCreatorSubPlans(
  creatorId: string,
  opts?: { activeOnly?: boolean },
): Promise<CreatorSubPlan[]> {
  const prisma = getPrisma();
  const rows = await prisma.creatorSubPlan.findMany({
    where: {
      creatorId,
      ...(opts?.activeOnly ? { active: true } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
  });
  return rows.map(mapSubPlan);
}

export async function listFanSubscriptions(
  creatorId: string,
): Promise<FanSubscriptionPublic[]> {
  const prisma = getPrisma();
  const rows = await prisma.fanSubscription.findMany({
    where: { creatorId },
    include: { plan: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return rows.map((r) => ({
    id: r.id,
    planId: r.planId,
    planName: r.plan.name,
    subscriberEmail: r.subscriberEmail,
    subscriberName: r.subscriberName,
    status: r.status,
    currentPeriodEnd: r.currentPeriodEnd?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function activateFanSubscriptionFromTransaction(
  transactionId: string,
): Promise<boolean> {
  const prisma = getPrisma();
  const tx = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!tx || tx.kind !== "subscription" || !tx.subscriptionPlanId) return false;

  const plan = await prisma.creatorSubPlan.findUnique({
    where: { id: tx.subscriptionPlanId },
  });
  if (!plan || plan.creatorId !== tx.creatorId) return false;

  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 30);

  const emailRaw =
    (tx.message.startsWith("sub:")
      ? tx.message.slice(4).split("|")[0]
      : "") || "";
  const email = (emailRaw || `anon-${tx.id}@pix.tips`).toLowerCase();
  const name = tx.anonymous ? "" : tx.donorName;

  const byTx = await prisma.fanSubscription.findFirst({
    where: { lastTransactionId: tx.id },
  });

  const existing =
    byTx ??
    (await prisma.fanSubscription.findFirst({
      where: {
        creatorId: tx.creatorId,
        planId: plan.id,
        subscriberEmail: email,
        status: { in: ["pending", "active", "expired"] },
      },
      orderBy: { createdAt: "desc" },
    }));

  if (existing) {
    const base =
      existing.status === "active" &&
      existing.currentPeriodEnd &&
      existing.currentPeriodEnd > new Date()
        ? existing.currentPeriodEnd
        : new Date();
    const extended = new Date(base);
    extended.setDate(extended.getDate() + 30);
    await prisma.fanSubscription.update({
      where: { id: existing.id },
      data: {
        status: "active",
        currentPeriodEnd: extended,
        lastTransactionId: tx.id,
        subscriberName: name || existing.subscriberName,
        subscriberUserId: tx.donorUserId ?? existing.subscriberUserId,
      },
    });
  } else {
    await prisma.fanSubscription.create({
      data: {
        creatorId: tx.creatorId,
        planId: plan.id,
        subscriberEmail: email.toLowerCase(),
        subscriberName: name,
        subscriberUserId: tx.donorUserId ?? null,
        status: "active",
        currentPeriodEnd: periodEnd,
        lastTransactionId: tx.id,
      },
    });
  }

  try {
    await createNotification(tx.creatorId, {
      type: "subscription",
      title: "Nova assinatura!",
      body: `${name || email} assinou ${plan.name} (${formatCurrency(tx.amount)})`,
    });
  } catch (err) {
    console.error("[fan-subscription] notification", err);
  }

  try {
    const creator = await getCreatorById(tx.creatorId);
    if (creator) {
      const payload: DonationPayload = {
        name: name || "Assinante",
        amount: tx.amount,
        message: `Assinou: ${plan.name}`,
        templateId: creator.alertSettings.templateId,
        soundId: resolveAlertSoundId(
          creator.alertSettings.soundId,
          creator.alertSettings.soundUrl,
        ),
        soundUrl: creator.alertSettings.soundUrl,
        textConfig: creator.alertSettings.textConfig,
        backgroundMedia: creator.alertSettings.backgroundMedia,
        ttsEnabled: creator.alertSettings.ttsEnabled,
        ttsVoiceId: creator.alertSettings.ttsVoiceId,
        ttsTemplate: creator.alertSettings.ttsTemplate,
        isSubscriber: true,
        subscriberPlanName: plan.name,
      };
      getIO().of("/alerts").to(tx.creatorId).emit("new-donation", payload);
    }
  } catch (err) {
    console.error("[fan-subscription] alert", err);
  }

  return true;
}

export async function findActiveSubscriber(
  creatorId: string,
  opts: { userId?: string | null; email?: string | null; name?: string | null },
): Promise<{ planName: string } | null> {
  const prisma = getPrisma();
  const now = new Date();

  if (opts.userId) {
    const byUser = await prisma.fanSubscription.findFirst({
      where: {
        creatorId,
        subscriberUserId: opts.userId,
        status: "active",
        currentPeriodEnd: { gt: now },
      },
      include: { plan: { select: { name: true } } },
      orderBy: { currentPeriodEnd: "desc" },
    });
    if (byUser) return { planName: byUser.plan.name };
  }

  if (opts.email?.trim()) {
    const byEmail = await prisma.fanSubscription.findFirst({
      where: {
        creatorId,
        subscriberEmail: opts.email.trim().toLowerCase(),
        status: "active",
        currentPeriodEnd: { gt: now },
      },
      include: { plan: { select: { name: true } } },
      orderBy: { currentPeriodEnd: "desc" },
    });
    if (byEmail) return { planName: byEmail.plan.name };
  }

  const name = opts.name?.trim();
  if (name && name.toLowerCase() !== "anônimo" && name.toLowerCase() !== "anonimo") {
    const byName = await prisma.fanSubscription.findFirst({
      where: {
        creatorId,
        status: "active",
        currentPeriodEnd: { gt: now },
        subscriberName: { equals: name },
      },
      include: { plan: { select: { name: true } } },
      orderBy: { currentPeriodEnd: "desc" },
    });
    if (byName) return { planName: byName.plan.name };
  }

  return null;
}

export async function expireDueFanSubscriptions(): Promise<number> {
  const prisma = getPrisma();
  const result = await prisma.fanSubscription.updateMany({
    where: {
      status: "active",
      currentPeriodEnd: { lt: new Date() },
    },
    data: { status: "expired" },
  });
  return result.count;
}
