import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { verifyWithdrawSecurity } from "@/lib/auth/security-challenge";
import { prisma } from "@/lib/db";
import { maskPixKey } from "@/lib/finance";
import {
  isWooviSplitConfigured,
  withdrawCreatorWooviBalance,
  WooviApiError,
} from "@/lib/payments/woovi-seller";
import {
  getKycProfile,
  hasExclusiveApprovedKyc,
} from "@/lib/repositories/kyc-repository";
import { recordWooviWithdrawal } from "@/lib/store";

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

  if (!isWooviSplitConfigured()) {
    return NextResponse.json(
      { error: "Recebimentos Pix ainda não disponíveis na plataforma." },
      { status: 503 },
    );
  }

  let amountReais: number;
  let pixKeyId: string;
  let otp: string | undefined;
  let totpCode: string | undefined;

  try {
    const body = (await request.json()) as {
      amount?: number;
      pixKeyId?: string;
      otp?: string;
      totpCode?: string;
    };
    amountReais = Number(body.amount);
    if (!Number.isFinite(amountReais) || amountReais <= 0) {
      return NextResponse.json({ error: "Valor de saque inválido." }, { status: 400 });
    }
    pixKeyId = body.pixKeyId?.trim() ?? "";
    if (!pixKeyId) {
      return NextResponse.json(
        { error: "Selecione a chave Pix para sacar." },
        { status: 400 },
      );
    }
    if (body.otp?.trim()) {
      otp = body.otp.trim();
    }
    if (body.totpCode?.trim()) {
      totpCode = body.totpCode.trim();
    }
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

  // Valida payload do OTP — apenas quando o fluxo de e-mail OTP foi usado (não TOTP)
  if (!security.usedTotp) {
    const p = security.payload;
    if (!p) {
      return NextResponse.json(
        { error: "Código OTP inválido para esta operação" },
        { status: 400 },
      );
    }
    const amountOk = Math.abs(p.amount - amountReais) <= 0.01;
    const pixKeyOk = p.pixKeyId === pixKeyId;
    if (!amountOk || !pixKeyOk) {
      return NextResponse.json(
        { error: "Código OTP inválido para esta operação" },
        { status: 400 },
      );
    }
  }

  // Cooldown: bloqueia dupla submissão dentro de 30 segundos
  const recentPayout = await prisma.payout.findFirst({
    where: {
      creatorId: session.creator.id,
      createdAt: { gte: new Date(Date.now() - 30_000) },
      status: "completed",
    },
  });
  if (recentPayout) {
    return NextResponse.json(
      { error: "Aguarde alguns segundos antes de realizar outro saque." },
      { status: 429 },
    );
  }

  try {
    const result = await withdrawCreatorWooviBalance(
      session.creator.id,
      amountReais,
      pixKeyId,
    );
    const pixKeyMasked = maskPixKey(result.pixKey, result.pixKeyType);

    await recordWooviWithdrawal(session.creator.id, {
      grossAmount: result.grossCents / 100,
      fee: result.fees.totalFees,
      pixKeyMasked,
    });

    return NextResponse.json({
      ok: true,
      value: result.netCents / 100,
      gross: result.grossCents / 100,
      fees: result.fees.totalFees,
    });
  } catch (error) {
    if (error instanceof WooviApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao sacar saldo." }, { status: 500 });
  }
}
