import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { disconnectWooviPixKey } from "@/lib/payments/woovi-seller";

export async function DELETE() {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  await disconnectWooviPixKey(session.creator.id);
  return NextResponse.json({ ok: true });
}
