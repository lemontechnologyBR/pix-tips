import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { getPrisma } from "@/lib/db";

export async function GET() {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const db = getPrisma();
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      totpEnabled: true,
      totpEnabledAt: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    totpEnabled: user.totpEnabled,
    totpEnabledAt: user.totpEnabledAt?.toISOString() ?? null,
    hasPassword: Boolean(user.passwordHash),
  });
}
