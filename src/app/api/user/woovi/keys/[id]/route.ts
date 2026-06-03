import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import {
  removeCreatorWooviPixKey,
  WooviApiError,
} from "@/lib/payments/woovi-seller";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  try {
    const { id } = await params;
    await removeCreatorWooviPixKey(session.creator.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof WooviApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao remover chave Pix." }, { status: 500 });
  }
}
