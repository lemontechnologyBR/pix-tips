import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { setPrimaryCreatorWooviPixKey } from "@/lib/payments/woovi-seller";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  try {
    const { id } = await params;
    await setPrimaryCreatorWooviPixKey(session.creator.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro ao definir chave principal." },
      { status: 500 },
    );
  }
}
