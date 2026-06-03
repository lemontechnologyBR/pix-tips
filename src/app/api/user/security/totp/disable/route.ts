import { NextResponse } from "next/server";
import { verifyTotpCode } from "@/lib/auth/totp";
import { verifyPassword } from "@/lib/auth/password";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { getPrisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const body = (await request.json()) as { code?: string; password?: string };
  const code = body.code?.trim() ?? "";
  const password = body.password ?? "";

  if (!password) {
    return NextResponse.json({ error: "Informe sua senha." }, { status: 400 });
  }

  if (!/^\d{6}$/.test(code.replace(/\s/g, ""))) {
    return NextResponse.json({ error: "Informe o código de 6 dígitos." }, { status: 400 });
  }

  const db = getPrisma();
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { passwordHash: true, totpSecret: true, totpEnabled: true },
  });

  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Defina uma senha antes de desativar o 2FA." }, { status: 400 });
  }

  if (!user.totpEnabled || !user.totpSecret) {
    return NextResponse.json({ error: "2FA não está ativo." }, { status: 400 });
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const valid = await verifyTotpCode(user.totpSecret, code);
  if (!valid) {
    return NextResponse.json({ error: "Código inválido." }, { status: 401 });
  }

  await db.user.update({
    where: { id: session.userId },
    data: {
      totpEnabled: false,
      totpSecret: null,
      totpEnabledAt: null,
      totpBackupCodes: null,
    },
  });

  return NextResponse.json({ ok: true });
}
