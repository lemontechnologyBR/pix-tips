import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { emitTestDonationAlert } from "@/lib/emit-donation";

export async function POST() {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const ok = await emitTestDonationAlert(session.creator.id);
  if (!ok) {
    return NextResponse.json({ error: "Criador não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
