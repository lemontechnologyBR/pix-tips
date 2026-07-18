import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { verifyWithdrawSecurity } from "@/lib/auth/security-challenge";
import { prisma } from "@/lib/db";
import {
  getKycProfile,
  hasExclusiveApprovedKyc,
} from "@/lib/repositories/kyc-repository";
import { requestWithdrawal } from "@/lib/repositories/finance-repository";

/**
 * Solicitação de saque manual: cria um payout "pending" que o admin
 * processa (Pix enviado manualmente) e marca como concluído no painel.
 */
export async function POST(request: Request) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const kycProfile = await getKycProfile(session.creator.id);
  if (kycProfile.status !== "approved") {
    return NextResponse.json(
      { error: "Verificação de identidade obrigatória para sacar" },
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

  let amountReais: number;
  let otp: string | undefined;
  let totpCode: string | undefined;

  try {
    const body = (await request.json()) as {
      amount?: number;
      otp?: string;
      totpCode?: string;
    };
    amountReais = Number(body.amount);
    if (!Number.isFinite(amountReais) || amountReais <= 0) {
      return NextResponse.json({ error: "Valor de saque inválido." }, { status: 400 });
    }
    if (body.otp?.trim()) otp = body.otp.trim();
    if (body.totpCode?.trim()) totpCode = body.totpCode.trim();
  } catch {
    return NextResponse.json(
      { error: "Informe o código de verificação para confirmar o saque." },
      { status: 400 },
    );
  }

  const security = await verifyWithdrawSecurity(session.userId, { otp, totpCode });
  if (!security.ok) {
    return NextResponse.json({ error: security.error }, { status: 401 });
  }

  if (!security.usedTotp) {
    const p = security.payload;
    if (!p || Math.abs(p.amount - amountReais) > 0.01) {
      return NextResponse.json(
        { error: "Código OTP inválido para esta operação" },
        { status: 400 },
      );
    }
  }

  // Cooldown: evita dupla submissão em sequência
  const recentPayout = await prisma.payout.findFirst({
    where: {
      creatorId: session.creator.id,
      createdAt: { gte: new Date(Date.now() - 30_000) },
    },
  });
  if (recentPayout) {
    return NextResponse.json(
      { error: "Aguarde alguns segundos antes de solicitar outro saque." },
      { status: 429 },
    );
  }

  try {
    const payout = await requestWithdrawal(session.creator.id, amountReais);
    return NextResponse.json({
      ok: true,
      payout,
      message:
        "Saque solicitado! O valor será enviado para sua chave Pix em até 24h úteis.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao solicitar saque.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
