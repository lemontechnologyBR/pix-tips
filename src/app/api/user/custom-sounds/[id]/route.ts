import { NextResponse } from "next/server";
import { deleteCustomSound } from "@/lib/sound-store";
import { isSessionError, requireSession } from "@/lib/auth/require-session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const { id } = await params;
  const removed = await deleteCustomSound(session.creator.id, id);

  if (!removed) {
    return NextResponse.json({ error: "Som não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
