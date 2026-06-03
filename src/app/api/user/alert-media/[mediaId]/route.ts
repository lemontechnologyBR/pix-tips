import { NextResponse } from "next/server";
import { deleteMedia } from "@/lib/media-store";
import { isSessionError, requireSession } from "@/lib/auth/require-session";

interface RouteParams {
  params: Promise<{ mediaId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const { mediaId } = await params;
  const removed = await deleteMedia(session.creator.id, mediaId);

  if (!removed) {
    return NextResponse.json({ error: "Mídia não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
