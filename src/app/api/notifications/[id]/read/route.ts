import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { markRead } from "@/lib/notifications/service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(_request: Request, { params }: RouteParams) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const { id } = await params;
  const notification = await markRead(session.creator.id, id);

  if (!notification) {
    return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ notification });
}
