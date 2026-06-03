import { NextResponse } from "next/server";
import { buildTotpQrDataUrl, createTotpSecret } from "@/lib/auth/totp";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { getPrisma } from "@/lib/db";

export async function POST() {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const db = getPrisma();
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { email: true, totpEnabled: true, passwordHash: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  if (!user.passwordHash) {
    return NextResponse.json(
      { error: "Defina uma senha antes de ativar o 2FA." },
      { status: 400 },
    );
  }

  if (user.totpEnabled) {
    return NextResponse.json({ error: "2FA já está ativo." }, { status: 400 });
  }

  const secret = createTotpSecret();
  await db.user.update({
    where: { id: session.userId },
    data: { totpSecret: secret, totpEnabled: false, totpEnabledAt: null },
  });

  const qrDataUrl = await buildTotpQrDataUrl(user.email, secret);

  return NextResponse.json({
    qrDataUrl,
    secret,
  });
}
