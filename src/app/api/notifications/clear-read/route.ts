import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { deleteRead } from "@/lib/notifications/service";

export async function DELETE() {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const count = await deleteRead(session.creator.id);
  return NextResponse.json({ count });
}
