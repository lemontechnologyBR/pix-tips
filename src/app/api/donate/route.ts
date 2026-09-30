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
  MIN_DONATION_AMOUNT,
} from "@/lib/finance";
import {
  createWooviPixCharge,
  isWooviConfigured,
  WooviApiError,
} from "@/lib/payments/woovi";
import { shouldUseWooviSplit } from "@/lib/payments/payout-mode";
import { resolveTtsVoiceId } from "@/lib/tts-config";
import { isDemoCreator } from "@/lib/demo";
import { rateLimit } from "@/lib/rate-limit";
import { getPrisma } from "@/lib/db";
import { findBlockedWordInMessage } from "@/lib/message-moderation";
import { getSession } from "@/lib/auth";

const DEMO_PIX_CODE =
  "00020126580014BR.GOV.BCB.PIX0136demo-pix-tips-page5204000053039865802BR5913pix.tips Demo6009SAO PAULO62070503***6304DEMO";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!rateLimit(`donate:${ip}`, 10, 60_000)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em alguns instantes." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const {
      creatorId,
      amount,
      anonymous = false,
      ttsVoiceId,
    } = body;

    const rawDonorName = body.donorName;
    const rawMessage = body.message;

    if (rawDonorName !== undefined && typeof rawDonorName !== "string") {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }
    if (rawMessage !== undefined && typeof rawMessage !== "string") {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const donorName: string =
      typeof rawDonorName === "string" && rawDonorName.trim()
        ? rawDonorName.slice(0, 80)
        : "Apoiador";
    const message: string =
      typeof rawMessage === "string" ? rawMessage.slice(0, 300) : "";

    if (!creatorId || !amount || Number(amount) < MIN_DONATION_AMOUNT) {
      return NextResponse.json(
        {
          error: `Dados inválidos. Valor mínimo: R$ ${MIN_DONATION_AMOUNT.toFixed(2).replace(".", ",")}`,
        },
        { status: 400 },
      );
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) > 10_000) {
      return NextResponse.json(
        { error: "Valor inválido. O valor máximo é R$ 10.000,00." },
        { status: 400 },
      );
    }

    const creator = await getCreatorById(creatorId);
    if (!creator) {
      return NextResponse.json(
        { error: "Criador não encontrado" },
        { status: 404 },
      );
    }

    const tipMin = creator.tipPageSettings?.minDonation ?? MIN_DONATION_AMOUNT;
    const minDonation = Math.max(MIN_DONATION_AMOUNT, tipMin);
    if (Number(amount) < minDonation) {
      return NextResponse.json(
        {
          error: `Valor mínimo de doação: R$ ${minDonation.toFixed(2).replace(".", ",")}`,
        },
        { status: 400 },
      );
    }

    const filterEnabled = creator.tipPageSettings?.messageFilterEnabled !== false;
    if (filterEnabled && message.trim()) {
      const hit = findBlockedWordInMessage(
        message,
        creator.tipPageSettings?.blockedWords ?? [],
        true,
      );
      if (hit) {
        return NextResponse.json(
          {
            error:
              "Sua mensagem contém palavras não permitidas. Edite o texto e tente novamente.",
          },
          { status: 400 },
        );
      }
    }

    const tipTtsEnabled = creator.tipPageSettings?.tipTtsEnabled ?? false;
    const tipTtsVoices = new Set(
      (creator.tipPageSettings?.tipTtsVoices ?? []).map((v) => resolveTtsVoiceId(v)),
    );
    const resolvedDonorVoice =
      typeof ttsVoiceId === "string" ? resolveTtsVoiceId(ttsVoiceId) : "off";
    const sanitizedTtsVoiceId =
      tipTtsEnabled &&
      resolvedDonorVoice !== "off" &&
      tipTtsVoices.has(resolvedDonorVoice)
        ? resolvedDonorVoice
        : undefined;

    const session = await getSession();
    const donorUserId = session?.userId;

    if (isDemoCreator(creator.id, creator.username)) {
      const transaction = await createTransaction({
        creatorId,
        amount: Number(amount),
        message,
        anonymous: Boolean(anonymous),
        donorName,
        method: "pix",
        donorTtsVoiceId: sanitizedTtsVoiceId,
        donorUserId,
        pixCode: DEMO_PIX_CODE,
      });

      const serviceFee = computeDonorServiceFee(Number(amount));
      return NextResponse.json({
        transactionId: transaction.id,
        status: transaction.status,
        method: transaction.method,
        pixCode: DEMO_PIX_CODE,
        paymentProvider: "woovi",
        expiresIn: 900,
        amount: transaction.amount,
        serviceFee,
        chargeAmount: computePixChargeAmount(Number(amount)),
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
      amount: Number(amount),
      message,
      anonymous: Boolean(anonymous),
      donorName,
      method: "pix",
      donorTtsVoiceId: sanitizedTtsVoiceId,
      donorUserId,
    });

    const commissionRate = getCommissionRate();
    const fixedFee = getCommissionFixedFee();
    const applicationFee = computeFee(Number(amount), commissionRate, fixedFee);
    const netAmount = computeNetAmount(Number(amount), commissionRate, fixedFee);
    const serviceFee = computeDonorServiceFee(Number(amount));
    const chargeAmount = computePixChargeAmount(Number(amount));

    const payoutCtx = await getPrisma().creator.findUnique({
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
      ? (payoutCtx?.wooviPixKey || payoutCtx?.pixKey || undefined)
      : undefined;

    const charge = await createWooviPixCharge({
      amount: chargeAmount,
      correlationID: transaction.id,
      comment: `Doação para ${creator.displayName} via pix.tips`,
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
      status: transaction.status,
      method: transaction.method,
      pixCode: charge.pixCode,
      paymentProvider: "woovi",
      expiresIn: 900,
      amount: transaction.amount,
      serviceFee,
      chargeAmount,
      mock: false,
      splitPayment: Boolean(splitPixKey),
    });
  } catch (error) {
    console.error("[donate]", error);
    if (error instanceof WooviApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Erro ao processar doação. Tente novamente." },
      { status: 500 },
    );
  }
}
