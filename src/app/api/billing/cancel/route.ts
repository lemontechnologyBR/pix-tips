import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { cancelSubscriptionAtPeriodEnd } from "@/lib/store";

export async function POST() {
  try {
    const session = await requireSession();
    if (isSessionError(session)) return session;

    const creator = await cancelSubscriptionAtPeriodEnd(session.creator.id);
    if (!creator) {
      return NextResponse.json({ error: "Criador não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      cancelAtPeriodEnd: creator.subscriptionCancelAtPeriodEnd ?? true,
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
