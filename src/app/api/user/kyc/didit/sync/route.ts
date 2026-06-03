import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { syncDiditKycForCreator } from "@/lib/kyc/didit-sync";
import { isDiditConfigured } from "@/lib/didit";

export async function POST() {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  if (!isDiditConfigured()) {
    return NextResponse.json(
      { error: "Verificação Didit não configurada na plataforma." },
      { status: 503 },
    );
  }

  try {
    const profile = await syncDiditKycForCreator(session.creator.id);
    return NextResponse.json(profile);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao sincronizar verificação Didit.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
