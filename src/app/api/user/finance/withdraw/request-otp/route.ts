import { NextResponse } from "next/server";
import { createWithdrawOtpChallenge } from "@/lib/auth/security-challenge";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { sendEmail } from "@/lib/email/email-client";
import { withdrawOtpEmail } from "@/lib/email/templates/withdraw-otp";
import { computePayoutFee, MIN_WITHDRAW_AMOUNT } from "@/lib/finance";
import {
  getKycProfile,
  hasExclusiveApprovedKyc,
} from "@/lib/repositories/kyc-repository";
import { syncCreatorBalance } from "@/lib/repositories/finance-repository";
import { rateLimit } from "@/lib/rate-limit";
import { getPrisma } from "@/lib/db";

/** Envia o código OTP para confirmar a solicitação de saque manual. */
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
  try {
    const body = (await request.json()) as { amount?: number };
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
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const db = getPrisma();
  await syncCreatorBalance(session.creator.id);
  const creator = await db.creator.findUnique({
    where: { id: session.creator.id },
    select: { pixKey: true, pixHolderName: true, availableBalance: true },
  });

  if (!creator?.pixKey || !creator.pixHolderName) {
    return NextResponse.json(
      { error: "Cadastre sua chave Pix de destino antes de solicitar o saque." },
      { status: 400 },
    );
  }

  const fee = computePayoutFee();
  if (amountReais + fee > creator.availableBalance + 0.001) {
    return NextResponse.json(
      {
        error: fee > 0
          ? "Saldo insuficiente para o valor solicitado (incluindo a taxa de saque)."
          : "Saldo insuficiente para o valor solicitado.",
      },
      { status: 400 },
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
