import { after, NextResponse } from "next/server";
import { emitDonationAlert } from "@/lib/emit-donation";
import {
  getWooviCharge,
  isWooviChargeExpired,
  isWooviChargePaid,
  verifyWooviWebhook,
} from "@/lib/payments/woovi";
import { confirmTransaction, getTransaction } from "@/lib/store";
import { getPrisma } from "@/lib/db";

interface WooviWebhookBody {
  event?: string;
  charge?: {
    correlationID?: string;
    status?: string;
  };
  correlationID?: string;
  status?: string;
}

/**
 * Webhook Woovi / OpenPix (OPENPIX:CHARGE_COMPLETED etc.).
 * Sempre reconsulta a API antes de confirmar.
 */
export async function POST(request: Request) {
  try {
    if (!verifyWooviWebhook(request)) {
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as WooviWebhookBody;
    const correlationID =
      body.charge?.correlationID?.trim() ||
      body.correlationID?.trim() ||
      "";

    if (!correlationID) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const charge = await getWooviCharge(correlationID);
    if (!charge) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const transaction = await getTransaction(correlationID);
    if (!transaction) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (isWooviChargeExpired(charge.status)) {
      if (transaction.status === "pending") {
        await getPrisma().transaction.update({
          where: { id: transaction.id },
          data: { status: "expired" },
        });
      }
      return NextResponse.json({ ok: true, status: "expired" });
    }

    if (!isWooviChargePaid(charge.status)) {
      return NextResponse.json({ ok: true, ignored: true, status: charge.status });
    }

    if (transaction.status === "confirmed") {
      return NextResponse.json({ ok: true, status: "already_confirmed" });
    }

    const transactionId = transaction.id;
    after(async () => {
      try {
        const confirmed = await confirmTransaction(transactionId);
        if (!confirmed) return;

        if (confirmed.kind === "subscription") {
          const { activateFanSubscriptionFromTransaction } = await import(
            "@/lib/fan-subscriptions"
          );
          await activateFanSubscriptionFromTransaction(confirmed.id);
          // Still notify payment-confirmed room for tip page checkout UI
          const { getIO } = await import("@/lib/socket-server");
          getIO()
            .of("/alerts")
            .to(`tx:${confirmed.id}`)
            .emit("payment-confirmed", { transactionId: confirmed.id });
          return;
        }

        await emitDonationAlert(confirmed);
      } catch (error) {
        console.error("[webhooks/woovi]", error);
      }
    });

    return NextResponse.json({ ok: true, accepted: true, transactionId });
  } catch (error) {
    console.error("[webhooks/woovi]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
