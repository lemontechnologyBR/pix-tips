import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyTotpCode } from "@/lib/auth/totp";
import { buildSessionCookie, createSession } from "@/lib/auth/session";
import {
  clearMfaPendingCookie,
  MFA_PENDING_COOKIE,
  verifyMfaPendingToken,
} from "@/lib/auth/mfa-token";
import {
  consumeBackupCode,
  deserializeBackupCodes,
  serializeBackupCodes,
} from "@/lib/auth/backup-codes";
import { rateLimit } from "@/lib/rate-limit";

/** Distingue código TOTP (6 dígitos) de backup code (8 chars alfanuméricos). */
function isBackupCode(code: string): boolean {
  return /^[A-Z0-9]{6,10}$/i.test(code) && !/^\d{6}$/.test(code);
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (!rateLimit(`mfa-verify:${ip}`, 5, 5 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde antes de tentar novamente." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as { code?: string };
    const code = (body.code ?? "").trim().replace(/\s/g, "");

    if (!code) {
      return NextResponse.json(
        { error: "Informe o código de verificação." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const pendingToken = cookieStore.get(MFA_PENDING_COOKIE)?.value;
    if (!pendingToken) {
      return NextResponse.json(
        { error: "Sessão de verificação expirada. Faça login novamente." },
        { status: 401 },
      );
    }

    const payload = await verifyMfaPendingToken(pendingToken);
    if (!payload) {
      return NextResponse.json(
        { error: "Sessão de verificação expirada. Faça login novamente." },
        { status: 401 },
      );
    }

    const { getPrisma } = await import("@/lib/db");
    const db = getPrisma();
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { totpSecret: true, totpEnabled: true, totpBackupCodes: true },
    });

    if (!user?.totpEnabled || !user.totpSecret) {
      return NextResponse.json({ error: "2FA não está ativo nesta conta." }, { status: 400 });
    }

    // Tenta verificar como backup code (alfanumérico, não TOTP de 6 dígitos)
    if (isBackupCode(code)) {
      const hashes = deserializeBackupCodes(user.totpBackupCodes ?? null);
      const remaining = await consumeBackupCode(code, hashes);

      if (remaining === null) {
        return NextResponse.json(
          { error: "Código de backup inválido." },
          { status: 401 },
        );
      }

      // Remove o código usado do banco
      await db.user.update({
        where: { id: payload.userId },
        data: { totpBackupCodes: serializeBackupCodes(remaining) },
      });

      const token = await createSession(payload);
      cookieStore.set(buildSessionCookie(token));
      cookieStore.set(clearMfaPendingCookie());

      const redirect = payload.onboardingCompleted ? "/dashboard" : "/onboarding";
      return NextResponse.json({ redirect, usedBackupCode: true });
    }

    // Verifica como código TOTP padrão (6 dígitos)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Informe o código de 6 dígitos ou um código de backup." },
        { status: 400 },
      );
    }

    const valid = await verifyTotpCode(user.totpSecret, code);
    if (!valid) {
      return NextResponse.json({ error: "Código inválido. Tente novamente." }, { status: 401 });
    }

    const token = await createSession(payload);
    cookieStore.set(buildSessionCookie(token));
    cookieStore.set(clearMfaPendingCookie());

    const redirect = payload.onboardingCompleted ? "/dashboard" : "/onboarding";
    return NextResponse.json({ redirect });
  } catch (error) {
    console.error("[auth/mfa/verify]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const pendingToken = cookieStore.get(MFA_PENDING_COOKIE)?.value;
  if (!pendingToken) {
    return NextResponse.json({ pending: false });
  }

  const payload = await verifyMfaPendingToken(pendingToken);
  if (!payload) {
    cookieStore.set(clearMfaPendingCookie());
    return NextResponse.json({ pending: false });
  }

  return NextResponse.json({
    pending: true,
    email: payload.email,
  });
}
