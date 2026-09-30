import { NextResponse } from "next/server";
import {
  createTransaction,
  getCreatorById,
  updateTransactionPayment,
} from "@/lib/store";
import {
  computeFee,
  computeNetAmount,
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
import { TTS_VOICES } from "@/lib/tts-config";
import { isDemoCreator } from "@/lib/demo";
import { rateLimit } from "@/lib/rate-limit";
import { getPrisma } from "@/lib/db";

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

    const validTtsVoiceIds = TTS_VOICES.filter(v => v.id !== "off").map(v => v.id) as string[];
    const tipTtsEnabled = creator.tipPageSettings?.tipTtsEnabled ?? false;
    const tipTtsVoices: string[] = creator.tipPageSettings?.tipTtsVoices ?? [];
    const sanitizedTtsVoiceId =
      tipTtsEnabled &&
      typeof ttsVoiceId === "string" &&
      ttsVoiceId !== "off" &&
      validTtsVoiceIds.includes(ttsVoiceId) &&
      tipTtsVoices.includes(ttsVoiceId)
        ? ttsVoiceId
        : undefined;

    if (isDemoCreator(creator.id, creator.username)) {
      const transaction = await createTransaction({
        creatorId,
        amount: Number(amount),
        message,
        anonymous: Boolean(anonymous),
        donorName,
        method: "pix",
        donorTtsVoiceId: sanitizedTtsVoiceId,
        pixCode: DEMO_PIX_CODE,
      });

      return NextResponse.json({
        transactionId: transaction.id,
        status: transaction.status,
        method: transaction.method,
        pixCode: DEMO_PIX_CODE,
        paymentProvider: "woovi",
        expiresIn: 900,
        amount: transaction.amount,
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
    });

    const commissionRate = getCommissionRate();
    const fixedFee = getCommissionFixedFee();
    const applicationFee = computeFee(Number(amount), commissionRate, fixedFee);
    const netAmount = computeNetAmount(Number(amount), commissionRate, fixedFee);

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
      amount: Number(amount),
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
    });

    return NextResponse.json({
      transactionId: transaction.id,
      status: transaction.status,
      method: transaction.method,
      pixCode: charge.pixCode,
      paymentProvider: "woovi",
      expiresIn: 900,
      amount: transaction.amount,
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
