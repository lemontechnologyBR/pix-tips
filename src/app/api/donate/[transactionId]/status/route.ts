import { NextResponse } from "next/server";
import {
  confirmTransaction,
  getTransaction,
} from "@/lib/store";
import { emitDonationAlert } from "@/lib/emit-donation";
import { creditWooviSplitReserveAfterPayment } from "@/lib/payments/woovi-seller";
import {
  getWooviChargeStatus,
  isWooviChargePaid,
} from "@/lib/payments/woovi";
import {
  fromStoredMpPaymentId,
  getMercadoPagoPayment,
  isMercadoPagoPaymentApproved,
  isMercadoPagoPaymentExpired,
} from "@/lib/payments/mercadopago";
import { getPrisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const EXPIRY_MS = 15 * 60 * 1000; // 15 minutos (mesmo valor da UI)

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

    // Verifica expiração: pending há mais de 30 minutos
    if (
      transaction.status === "pending" &&
      Date.now() - new Date(transaction.createdAt).getTime() > EXPIRY_MS
    ) {
      await markExpired(transactionId);
      return NextResponse.json({ status: "expired" });
    }

    if (transaction.wooviPaymentId) {
      if (transaction.wooviPaymentId.startsWith("mock_")) {
        return NextResponse.json({ status: transaction.status });
      }

      const mpPaymentId = fromStoredMpPaymentId(transaction.wooviPaymentId);
      if (mpPaymentId) {
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
      }

      const charge = await getWooviChargeStatus(transactionId);

      if (!isWooviChargePaid(charge.status)) {
        return NextResponse.json({ status: charge.status.toLowerCase() });
      }

      const confirmed = await confirmTransaction(transactionId);
      if (confirmed) {
        await creditWooviSplitReserveAfterPayment(transaction.creatorId, {
          id: transaction.id,
          splitPayment: transaction.splitPayment,
          applicationFee: transaction.applicationFee,
        });
        try {
          await emitDonationAlert(confirmed);
        } catch {
          // Socket pode não estar pronto
        }
        return NextResponse.json({ status: "confirmed" });
      }

      return NextResponse.json({ status: transaction.status });
    }

    return NextResponse.json({ status: transaction.status });
  } catch (error) {
    console.error("[donate/status]", error);
    return NextResponse.json({ error: "Erro ao consultar pagamento" }, { status: 500 });
  }
}
