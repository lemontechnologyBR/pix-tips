import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { getPrisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    if (isSessionError(session)) return session;

    const { searchParams } = new URL(request.url);
    const correlationID = searchParams.get("correlationID");

    if (!correlationID) {
      return NextResponse.json({ error: "correlationID obrigatório" }, { status: 400 });
    }

    const payment = await getPrisma().subscriptionPayment.findUnique({
      where: { correlationID },
      select: { creatorId: true, status: true, planType: true },
    });

    if (!payment || payment.creatorId !== session.creator.id) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ status: payment.status, planType: payment.planType });
  } catch (err) {
    console.error("[billing/subscribe/status]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
