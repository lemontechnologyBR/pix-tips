import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { verifyPassword } from "@/lib/auth/password";
import { getPrisma } from "@/lib/db";
import {
  deserializeBackupCodes,
  generateBackupCodes,
  serializeBackupCodes,
} from "@/lib/auth/backup-codes";

/** GET — retorna quantos códigos de backup ainda restam (sem revelar os valores). */
export async function GET() {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const db = getPrisma();
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { totpEnabled: true, totpBackupCodes: true },
  });

  if (!user?.totpEnabled) {
    return NextResponse.json(
      { error: "2FA não está ativo." },
      { status: 400 },
    );
  }

  const codes = deserializeBackupCodes(user.totpBackupCodes ?? null);

  return NextResponse.json({ remaining: codes.length });
}

/** POST — regenera códigos de backup após verificar a senha do usuário.
 *  Body: { action: "regenerate", password: string }
 *  Retorna os novos códigos em texto claro SOMENTE nesta resposta. */
export async function POST(request: Request) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const body = (await request.json()) as { action?: string; password?: string };

  if (body.action !== "regenerate") {
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }

  if (!body.password) {
    return NextResponse.json({ error: "Informe sua senha." }, { status: 400 });
  }

  const db = getPrisma();
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { totpEnabled: true, passwordHash: true },
  });

  if (!user?.totpEnabled) {
    return NextResponse.json({ error: "2FA não está ativo." }, { status: 400 });
  }

  if (!user.passwordHash) {
    return NextResponse.json(
      { error: "Defina uma senha antes de regenerar os códigos." },
      { status: 400 },
    );
  }

  if (!(await verifyPassword(body.password, user.passwordHash))) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const { plainCodes, hashedCodes } = await generateBackupCodes();

  await db.user.update({
    where: { id: session.userId },
    data: { totpBackupCodes: serializeBackupCodes(hashedCodes) },
  });

  return NextResponse.json({ ok: true, backupCodes: plainCodes });
}
