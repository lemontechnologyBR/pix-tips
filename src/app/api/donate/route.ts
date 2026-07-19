import { NextResponse } from "next/server";
import {
  createTransaction,
  getCreatorById,
  updateTransactionPayment,
} from "@/lib/store";
import { computeFee, getCommissionRate } from "@/lib/finance";
import {
  createMercadoPagoPixPayment,
  isMercadoPagoConfigured,
  MercadoPagoApiError,
  toStoredMpPaymentId,
} from "@/lib/payments/mercadopago";
import { TTS_VOICES } from "@/lib/tts-config";
import { rateLimit } from "@/lib/rate-limit";

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

    if (!creatorId || !amount || Number(amount) < 1) {
      return NextResponse.json(
        { error: "Dados inválidos. Valor mínimo: R$ 1,00" },
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

    const minDonation = creator.tipPageSettings?.minDonation ?? 1;
    if (Number(amount) < minDonation) {
      return NextResponse.json(
        { error: `Valor mínimo de doação: R$ ${minDonation.toFixed(2).replace(".", ",")}` },
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

    if (!isMercadoPagoConfigured()) {
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
    const applicationFee = computeFee(Number(amount), commissionRate);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

    const payment = await createMercadoPagoPixPayment({
      amount: Number(amount),
      description: `Doação para ${creator.displayName} via pix.tips`,
      externalReference: transaction.id,
      payerFirstName: donorName,
      notificationUrl: appUrl ? `${appUrl}/api/webhooks/mercadopago` : undefined,
      expiresInMinutes: 15,
    });

    await updateTransactionPayment(transaction.id, {
      pixCode: payment.pixCode,
      wooviPaymentId: toStoredMpPaymentId(payment.id),
      splitPayment: false,
      applicationFee,
    });

    return NextResponse.json({
      transactionId: transaction.id,
      status: transaction.status,
      method: transaction.method,
      pixCode: payment.pixCode,
      paymentProvider: "mercadopago",
      expiresIn: 900,
      amount: transaction.amount,
      mock: false,
    });
  } catch (error) {
    console.error("[donate]", error);
    if (error instanceof MercadoPagoApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Erro ao processar doação. Tente novamente." },
      { status: 500 },
    );
  }
}
