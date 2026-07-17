import { after, NextResponse } from "next/server";
import { emitDonationAlert } from "@/lib/emit-donation";
import {
  creditWooviSplitReserveAfterPayment,
} from "@/lib/payments/woovi-seller";
import {
  extractWooviCorrelationId,
  extractWooviTransactionId,
  isWooviChargePaid,
  isWooviPaidWebhookEvent,
  isWooviWebhookRegistrationProbe,
  normalizeWooviStatus,
  verifyWooviWebhook,
  type WooviWebhookBody,
} from "@/lib/payments/woovi";
import {
  confirmTransaction,
  getTransaction,
  getTransactionByWooviPaymentId,
} from "@/lib/store";
import { getPrisma } from "@/lib/db";

/** Resposta exigida pela Woovi no cadastro/teste do webhook. */
function wooviOkEmpty() {
  return new NextResponse(null, { status: 200 });
}

async function resolveTransaction(body: WooviWebhookBody) {
  const correlationId = extractWooviCorrelationId(body);
  if (correlationId) {
    const byCorrelation = await getTransaction(correlationId);
    if (byCorrelation) return byCorrelation;
  }

  const wooviTransactionId = extractWooviTransactionId(body);
  if (wooviTransactionId) {
    return getTransactionByWooviPaymentId(wooviTransactionId);
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    let body: WooviWebhookBody = {};
    try {
      body = rawBody ? (JSON.parse(rawBody) as WooviWebhookBody) : {};
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    // Cadastro na plataforma: probe sem cobrança real → 200 vazio.
    if (isWooviWebhookRegistrationProbe(body)) {
      return wooviOkEmpty();
    }

    if (!verifyWooviWebhook(request, rawBody)) {
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
    }

    const event = body.event;
    const rawChargeStatus = body.charge?.status ?? body.pix?.charge?.status ?? "";
    const chargeStatus = normalizeWooviStatus(rawChargeStatus);

    // Trata expiração enviada pela Woovi antes de verificar pagamento
    if (chargeStatus === "expired") {
      const transaction = await resolveTransaction(body);
      if (transaction && transaction.status === "pending") {
        await getPrisma().transaction.update({
          where: { id: transaction.id },
          data: { status: "expired" },
        });
      }
      return NextResponse.json({ ok: true, ignored: true, event, status: "expired" });
    }

    const isPaid =
      isWooviPaidWebhookEvent(event) || isWooviChargePaid(rawChargeStatus);

    if (!isPaid) {
      return NextResponse.json({ ok: true, ignored: true, event });
    }

    const transaction = await resolveTransaction(body);
    if (!transaction) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
    }

    if (transaction.status === "confirmed") {
      return NextResponse.json({ ok: true, status: "already_confirmed" });
    }

    const transactionId = transaction.id;

    after(async () => {
      try {
        const confirmed = await confirmTransaction(transactionId);
        if (confirmed) {
          await creditWooviSplitReserveAfterPayment(transaction.creatorId, {
            id: transaction.id,
            splitPayment: transaction.splitPayment,
            applicationFee: transaction.applicationFee,
          });
          await emitDonationAlert(confirmed);
        }
      } catch (error) {
        console.error("[webhooks/woovi]", error);
      }
    });

    return NextResponse.json({
      ok: true,
      accepted: true,
      transactionId,
      event,
    });
  } catch (error) {
    console.error("[webhooks/woovi]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
