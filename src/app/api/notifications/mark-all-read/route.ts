import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { markAllRead } from "@/lib/notifications/service";

export async function POST() {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const count = await markAllRead(session.creator.id);
  return NextResponse.json({ count });
}
