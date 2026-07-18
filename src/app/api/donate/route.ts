import { NextResponse } from "next/server";
import {
  confirmTransaction,
  createTransaction,
  getCreatorById,
  updateTransactionPayment,
} from "@/lib/store";
import { emitDonationAlert } from "@/lib/emit-donation";
import { computeFee, computeNetAmount, getCommissionRate } from "@/lib/finance";
import { getCreatorWooviSubaccount } from "@/lib/payments/woovi-seller";
import { createWooviCharge, isWooviConfigured } from "@/lib/payments/woovi";
import {
  createMercadoPagoPixPayment,
  getActivePaymentProvider,
  MercadoPagoApiError,
  toStoredMpPaymentId,
} from "@/lib/payments/mercadopago";
import { TTS_VOICES } from "@/lib/tts-config";
import { rateLimit } from "@/lib/rate-limit";

const AUTO_CONFIRM_MS = 8000;

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

    if (!creatorId || !amount || amount < 10) {
      return NextResponse.json(
        { error: "Dados inválidos. Valor mínimo: R$ 10,00" },
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

    // Validar valor mínimo configurado pelo criador
    const minDonation = creator.tipPageSettings?.minDonation ?? 1;
    if (Number(amount) < minDonation) {
      return NextResponse.json(
        { error: `Valor mínimo de doação: R$ ${minDonation.toFixed(2).replace(".", ",")}` },
        { status: 400 },
      );
    }

    // Validar ttsVoiceId: só aceitar se TTS da tip page estiver ativo e a voz estiver na lista permitida
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

    if (getActivePaymentProvider() === "mercadopago") {
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
    }

      if (!isWooviConfigured()) {
        return NextResponse.json(
          { error: "Recebimentos Pix indisponíveis no momento." },
          { status: 503 },
        );
      }

      const wooviSubaccount = await getCreatorWooviSubaccount(creatorId);

      if (!wooviSubaccount?.pixKey) {
        return NextResponse.json(
          {
            error:
              "Este criador ainda não cadastrou a chave Pix. Doações indisponíveis no momento.",
          },
          { status: 503 },
        );
      }

      const creatorAmount = computeNetAmount(Number(amount), commissionRate);

      const charge = await createWooviCharge({
        correlationID: transaction.id,
        amount: Number(amount),
        comment: `Doação para ${creator.displayName}`,
        creatorPixKey: wooviSubaccount.pixKey,
        creatorAmount,
      });

      await updateTransactionPayment(transaction.id, {
        pixCode: charge.pixCode,
        wooviPaymentId: charge.id,
        splitPayment: charge.splitApplied,
        applicationFee: charge.splitApplied ? applicationFee : undefined,
      });

      if (charge.mock && process.env.NODE_ENV !== "production") {
        setTimeout(async () => {
          const confirmed = await confirmTransaction(transaction.id);
          if (confirmed) {
            try {
              await emitDonationAlert(confirmed);
            } catch {
              // Socket pode não estar pronto em build estático
            }
          }
        }, AUTO_CONFIRM_MS);
      }

      return NextResponse.json({
        transactionId: transaction.id,
        status: transaction.status,
        method: transaction.method,
        pixCode: charge.pixCode,
        wooviPaymentId: charge.id,
        paymentProvider: "woovi",
        expiresIn: 900,
        amount: transaction.amount,
        mock: charge.mock,
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
