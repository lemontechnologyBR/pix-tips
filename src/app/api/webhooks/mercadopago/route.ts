import { after, NextResponse } from "next/server";
import { emitDonationAlert } from "@/lib/emit-donation";
import {
  getMercadoPagoPayment,
  isMercadoPagoPaymentApproved,
  isMercadoPagoPaymentExpired,
  verifyMercadoPagoWebhookSignature,
} from "@/lib/payments/mercadopago";
import { confirmTransaction, getTransaction } from "@/lib/store";
import { getPrisma } from "@/lib/db";

interface MpWebhookBody {
  type?: string;
  action?: string;
  data?: { id?: string | number };
}

/**
 * Webhook Mercado Pago (evento `payment`).
 * A confirmação sempre reconsulta a API do MP — nunca confia só no corpo.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as MpWebhookBody;

    const dataId = body.data?.id != null ? String(body.data.id) : "";

    // Probe/teste do painel ou evento sem id → 200 para não gerar retentativas.
    if (!dataId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (!verifyMercadoPagoWebhookSignature(request, dataId)) {
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
    }

    if (body.type && body.type !== "payment") {
      return NextResponse.json({ ok: true, ignored: true, type: body.type });
    }

    const payment = await getMercadoPagoPayment(dataId);
    if (!payment?.externalReference) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const transaction = await getTransaction(payment.externalReference);
    if (!transaction) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (isMercadoPagoPaymentExpired(payment.status)) {
      if (transaction.status === "pending") {
        await getPrisma().transaction.update({
          where: { id: transaction.id },
          data: { status: "expired" },
        });
      }
      return NextResponse.json({ ok: true, status: "expired" });
    }

    if (!isMercadoPagoPaymentApproved(payment.status)) {
      return NextResponse.json({ ok: true, ignored: true, status: payment.status });
    }

    if (transaction.status === "confirmed") {
      return NextResponse.json({ ok: true, status: "already_confirmed" });
    }

    const transactionId = transaction.id;
    after(async () => {
      try {
        const confirmed = await confirmTransaction(transactionId);
        if (confirmed) {
          await emitDonationAlert(confirmed);
        }
      } catch (error) {
        console.error("[webhooks/mercadopago]", error);
      }
    });

    return NextResponse.json({ ok: true, accepted: true, transactionId });
  } catch (error) {
    console.error("[webhooks/mercadopago]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
