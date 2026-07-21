import { NextResponse } from "next/server";
import { confirmTransaction, getTransaction } from "@/lib/store";
import { emitDonationAlert } from "@/lib/emit-donation";
import { isDemoCreator } from "@/lib/demo";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ transactionId: string }> },
) {
  const { transactionId } = await params;
  const existing = await getTransaction(transactionId);

  if (!existing) {
    return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
  }

  if (process.env.NODE_ENV === "production" && !isDemoCreator(existing.creatorId)) {
    return NextResponse.json(
      { error: "Esta rota não está disponível em produção." },
      { status: 403 },
    );
  }
  if (existing.status === "confirmed") {
    return NextResponse.json({ ok: true, transaction: existing });
  }

  const confirmed = await confirmTransaction(transactionId);
  if (confirmed) {
    await emitDonationAlert(confirmed);
    return NextResponse.json({ ok: true, transaction: confirmed });
  }

  return NextResponse.json({ error: "Não foi possível confirmar" }, { status: 400 });
}
