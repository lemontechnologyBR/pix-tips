import { NextResponse } from "next/server";
import { isOAuthProvider, unlinkOAuthAccount } from "@/lib/auth/oauth";
import { isSessionError, requireSession } from "@/lib/auth/require-session";

interface RouteContext {
  params: Promise<{ provider: string }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const { provider } = await context.params;

  if (!isOAuthProvider(provider)) {
    return NextResponse.json({ error: "Provedor OAuth inválido." }, { status: 400 });
  }

  try {
    await unlinkOAuthAccount(session.userId, provider);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível desvincular a conta.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
