import { NextResponse } from "next/server";
import {
  confirmTransaction,
  getTransaction,
} from "@/lib/store";
import { emitDonationAlert } from "@/lib/emit-donation";
import {
  fromStoredMpPaymentId,
  getMercadoPagoPayment,
  isMercadoPagoPaymentApproved,
  isMercadoPagoPaymentExpired,
} from "@/lib/payments/mercadopago";
import { getPrisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const EXPIRY_MS = 15 * 60 * 1000;

async function markExpired(transactionId: string): Promise<void> {
  await getPrisma().transaction.update({
    where: { id: transactionId },
    data: { status: "expired" },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ transactionId: string }> },
) {
  try {
    const { transactionId } = await params;

    if (!rateLimit(`status:${transactionId}`, 10, 60_000)) {
      return NextResponse.json({ error: "Muitas requisições" }, { status: 429 });
    }

    const transaction = await getTransaction(transactionId);

    if (!transaction) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
    }

    if (transaction.status === "confirmed") {
      return NextResponse.json({ status: "confirmed" });
    }

    if (transaction.status === "expired") {
      return NextResponse.json({ status: "expired" });
    }

    if (
      transaction.status === "pending" &&
      Date.now() - new Date(transaction.createdAt).getTime() > EXPIRY_MS
    ) {
      await markExpired(transactionId);
      return NextResponse.json({ status: "expired" });
    }

    if (!transaction.wooviPaymentId) {
      return NextResponse.json({ status: transaction.status });
    }

    const mpPaymentId = fromStoredMpPaymentId(transaction.wooviPaymentId);
    if (!mpPaymentId) {
      return NextResponse.json({ status: transaction.status });
    }

    const payment = await getMercadoPagoPayment(mpPaymentId);
    if (!payment) {
      return NextResponse.json({ status: transaction.status });
    }

    if (isMercadoPagoPaymentApproved(payment.status)) {
      const confirmed = await confirmTransaction(transactionId);
      if (confirmed) {
        try {
          await emitDonationAlert(confirmed);
        } catch {
          // Socket pode não estar pronto
        }
        return NextResponse.json({ status: "confirmed" });
      }
      return NextResponse.json({ status: transaction.status });
    }

    if (isMercadoPagoPaymentExpired(payment.status)) {
      await markExpired(transactionId);
      return NextResponse.json({ status: "expired" });
    }

    return NextResponse.json({ status: "pending" });
  } catch (error) {
    console.error("[donate/status]", error);
    return NextResponse.json({ error: "Erro ao consultar pagamento" }, { status: 500 });
  }
}
