import { NextResponse } from "next/server";
import { createWithdrawOtpChallenge } from "@/lib/auth/security-challenge";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { sendEmail } from "@/lib/email/email-client";
import { withdrawOtpEmail } from "@/lib/email/templates/withdraw-otp";
import { MIN_WITHDRAW_AMOUNT } from "@/lib/finance";
import {
  getKycProfile,
  hasExclusiveApprovedKyc,
} from "@/lib/repositories/kyc-repository";
import { rateLimit } from "@/lib/rate-limit";
import { getPrisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const kycProfile = await getKycProfile(session.creator.id);
  if (kycProfile.status !== "approved") {
    return NextResponse.json(
      { error: "Verificação de identidade obrigatória para sacar." },
      { status: 403 },
    );
  }
  if (!(await hasExclusiveApprovedKyc(session.creator.id))) {
    return NextResponse.json(
      {
        error:
          "Verificação de identidade duplicada ou incompleta. Entre em contato com o suporte.",
      },
      { status: 403 },
    );
  }

  if (!rateLimit(`withdraw-otp:${session.userId}`, 3, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Muitas solicitações de código. Aguarde 10 minutos antes de tentar novamente." },
      { status: 429 },
    );
  }

  let amountReais: number;
  let pixKeyId: string | undefined;

  try {
    const body = (await request.json()) as { amount?: number; pixKeyId?: string };
    amountReais = Number(body.amount);
    if (!Number.isFinite(amountReais) || amountReais <= 0) {
      return NextResponse.json({ error: "Valor de saque inválido." }, { status: 400 });
    }
    if (amountReais < MIN_WITHDRAW_AMOUNT) {
      return NextResponse.json(
        { error: `Valor mínimo para saque: R$ ${MIN_WITHDRAW_AMOUNT.toFixed(2).replace(".", ",")}` },
        { status: 400 },
      );
    }
    if (body.pixKeyId?.trim()) {
      pixKeyId = body.pixKeyId.trim();
    }
    if (!pixKeyId) {
      return NextResponse.json(
        { error: "Selecione a chave Pix para sacar." },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const db = getPrisma();
  const pixKey = await db.creatorWooviPixKey.findFirst({
    where: { id: pixKeyId, creatorId: session.creator.id },
    select: { id: true },
  });
  if (!pixKey) {
    return NextResponse.json(
      { error: "Chave Pix não encontrada." },
      { status: 404 },
    );
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { email: true, name: true, totpEnabled: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  try {
    const { code, expiresAt } = await createWithdrawOtpChallenge(session.userId, {
      amount: amountReais,
      pixKeyId,
    });

    const amountFormatted = amountReais.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    const { subject, html } = withdrawOtpEmail({
      name: user.name,
      code,
      amountFormatted,
      expiresMinutes: 10,
    });

    const sent = await sendEmail({ to: user.email, subject, html });
    if (!sent.ok) {
      return NextResponse.json(
        { error: "Não foi possível enviar o e-mail. Tente novamente." },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      expiresAt: expiresAt.toISOString(),
      totpEnabled: user.totpEnabled,
      devCode: sent.dev ? code : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao enviar código.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
