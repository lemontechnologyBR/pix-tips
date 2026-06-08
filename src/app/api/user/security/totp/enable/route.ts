import { NextResponse } from "next/server";
import { verifyTotpCode } from "@/lib/auth/totp";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { getPrisma } from "@/lib/db";
import {
  generateBackupCodes,
  serializeBackupCodes,
} from "@/lib/auth/backup-codes";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  if (!rateLimit(`totp-enable:${session.userId}`, 5, 5 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde 5 minutos." },
      { status: 429 },
    );
  }

  const body = (await request.json()) as { code?: string };
  const code = body.code?.trim() ?? "";

  if (!/^\d{6}$/.test(code.replace(/\s/g, ""))) {
    return NextResponse.json({ error: "Informe o código de 6 dígitos." }, { status: 400 });
  }

  const db = getPrisma();
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { totpSecret: true, totpEnabled: true },
  });

  if (!user?.totpSecret) {
    return NextResponse.json(
      { error: "Configure o 2FA primeiro (escaneie o QR code)." },
      { status: 400 },
    );
  }

  if (user.totpEnabled) {
    return NextResponse.json({ error: "2FA já está ativo." }, { status: 400 });
  }

  const valid = await verifyTotpCode(user.totpSecret, code);
  if (!valid) {
    return NextResponse.json({ error: "Código inválido." }, { status: 401 });
  }

  // Gera 8 códigos de backup — retornados em texto claro APENAS aqui
  const { plainCodes, hashedCodes } = await generateBackupCodes();

  await db.user.update({
    where: { id: session.userId },
    data: {
      totpEnabled: true,
      totpEnabledAt: new Date(),
      totpBackupCodes: serializeBackupCodes(hashedCodes),
    },
  });

  return NextResponse.json({ ok: true, backupCodes: plainCodes });
}
