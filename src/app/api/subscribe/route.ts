import { NextResponse } from "next/server";
import {
  createTransaction,
  getCreatorById,
  updateTransactionPayment,
} from "@/lib/store";
import {
  computeDonorServiceFee,
  computeFee,
  computeNetAmount,
  computePixChargeAmount,
  getCommissionFixedFee,
  getCommissionRate,
} from "@/lib/finance";
import {
  createWooviPixCharge,
  isWooviConfigured,
  WooviApiError,
} from "@/lib/payments/woovi";
import { shouldUseWooviSplit } from "@/lib/payments/payout-mode";
import { isDemoCreator } from "@/lib/demo";
import { rateLimit } from "@/lib/rate-limit";
import { getPrisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { mapSubPlan } from "@/lib/fan-subscriptions";

const DEMO_PIX_CODE =
  "00020126580014BR.GOV.BCB.PIX0136demo-pix-tips-sub5204000053039865802BR5913pix.tips Demo6009SAO PAULO62070503***6304DEMO";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!rateLimit(`subscribe:${ip}`, 8, 60_000)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em alguns instantes." },
      { status: 429 },
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      creatorId?: unknown;
      planId?: unknown;
      email?: unknown;
      name?: unknown;
    };

    const creatorId = typeof body.creatorId === "string" ? body.creatorId : "";
    const planId = typeof body.planId === "string" ? body.planId : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 120) : "";
    const name =
      typeof body.name === "string" ? body.name.trim().slice(0, 80) : "Apoiador";

    if (!creatorId || !planId) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Informe um e-mail válido para renovação." },
        { status: 400 },
      );
    }

    const creator = await getCreatorById(creatorId);
    if (!creator) {
      return NextResponse.json({ error: "Criador não encontrado" }, { status: 404 });
    }

    const prisma = getPrisma();
    const planRow = await prisma.creatorSubPlan.findFirst({
      where: { id: planId, creatorId, active: true },
    });
    if (!planRow) {
      return NextResponse.json({ error: "Plano indisponível" }, { status: 404 });
    }
    const plan = mapSubPlan(planRow);

    const session = await getSession();
    const donorUserId = session?.userId;

    // Encode email in message for webhook activation (no extra schema coupling).
    const metaMessage = `sub:${email}|${plan.name}`.slice(0, 200);

    if (isDemoCreator(creator.id, creator.username)) {
      const transaction = await createTransaction({
        creatorId,
        amount: plan.price,
        message: metaMessage,
        anonymous: false,
        donorName: name || "Apoiador",
        method: "pix",
        donorUserId,
        kind: "subscription",
        subscriptionPlanId: plan.id,
        pixCode: DEMO_PIX_CODE,
      });

      await prisma.fanSubscription.create({
        data: {
          creatorId,
          planId: plan.id,
          subscriberEmail: email,
          subscriberName: name,
          subscriberUserId: donorUserId ?? null,
          status: "pending",
          lastTransactionId: transaction.id,
        },
      });

      return NextResponse.json({
        transactionId: transaction.id,
        status: transaction.status,
        pixCode: DEMO_PIX_CODE,
        paymentProvider: "woovi",
        expiresIn: 900,
        amount: plan.price,
        serviceFee: computeDonorServiceFee(plan.price),
        chargeAmount: computePixChargeAmount(plan.price),
        plan,
        mock: true,
      });
    }

    if (!isWooviConfigured()) {
      return NextResponse.json(
        { error: "Recebimentos Pix indisponíveis no momento." },
        { status: 503 },
      );
    }

    const transaction = await createTransaction({
      creatorId,
      amount: plan.price,
      message: metaMessage,
      anonymous: false,
      donorName: name || "Apoiador",
      method: "pix",
      donorUserId,
      kind: "subscription",
      subscriptionPlanId: plan.id,
    });

    await prisma.fanSubscription.create({
      data: {
        creatorId,
        planId: plan.id,
        subscriberEmail: email,
        subscriberName: name,
        subscriberUserId: donorUserId ?? null,
        status: "pending",
        lastTransactionId: transaction.id,
      },
    });

    const commissionRate = getCommissionRate();
    const fixedFee = getCommissionFixedFee();
    const applicationFee = computeFee(plan.price, commissionRate, fixedFee);
    const netAmount = computeNetAmount(plan.price, commissionRate, fixedFee);
    const serviceFee = computeDonorServiceFee(plan.price);
    const chargeAmount = computePixChargeAmount(plan.price);

    const payoutCtx = await prisma.creator.findUnique({
      where: { id: creator.id },
      select: {
        availableBalance: true,
        wooviSubaccountName: true,
        wooviPixKey: true,
        pixKey: true,
      },
    });

    const useSplit = shouldUseWooviSplit({
      availableBalance: payoutCtx?.availableBalance ?? 0,
      wooviSubaccountName: payoutCtx?.wooviSubaccountName,
      pixKey: payoutCtx?.pixKey,
    });

    const splitPixKey = useSplit
      ? payoutCtx?.wooviPixKey || payoutCtx?.pixKey || undefined
      : undefined;

    const charge = await createWooviPixCharge({
      amount: chargeAmount,
      correlationID: transaction.id,
      comment: `Assinatura ${plan.name} — ${creator.displayName}`.slice(0, 140),
      expiresInSeconds: 900,
      splitPixKey: splitPixKey || undefined,
      splitAmount: splitPixKey ? netAmount : undefined,
    });

    await updateTransactionPayment(transaction.id, {
      pixCode: charge.pixCode,
      wooviPaymentId: charge.correlationID,
      splitPayment: Boolean(splitPixKey),
      applicationFee,
      donorServiceFee: serviceFee,
    });

    return NextResponse.json({
      transactionId: transaction.id,
      status: "pending",
      pixCode: charge.pixCode,
      paymentProvider: "woovi",
      expiresIn: 900,
      amount: plan.price,
      serviceFee,
      chargeAmount,
      plan,
      mock: false,
    });
  } catch (error) {
    console.error("[subscribe]", error);
    if (error instanceof WooviApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Erro ao iniciar assinatura. Tente novamente." },
      { status: 500 },
    );
  }
}
