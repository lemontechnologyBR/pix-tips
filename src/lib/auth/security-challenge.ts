import { createHash, randomInt } from "node:crypto";
import { getPrisma } from "@/lib/db";
import { verifyTotpCode } from "@/lib/auth/totp";

export type SecurityChallengePurpose = "withdraw_otp";

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_COOLDOWN_MS = 60 * 1000;

function getOtpPepper(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET environment variable is required in production",
      );
    }
    console.warn(
      "[auth/security-challenge] AVISO: AUTH_SECRET não definido. Usando pepper temporário apenas para desenvolvimento.",
    );
    return "dev-secret-change-in-production-min-32-chars!!";
  }
  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error(
      "AUTH_SECRET must be at least 32 characters in production",
    );
  }
  return secret;
}

function hashOtp(code: string): string {
  const pepper = getOtpPepper();
  return createHash("sha256").update(`${pepper}:${code}`).digest("hex");
}

export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function createWithdrawOtpChallenge(
  userId: string,
  payload: { amount: number; pixKeyId?: string },
): Promise<{ code: string; expiresAt: Date }> {
  const db = getPrisma();
  const now = new Date();

  const recent = await db.securityChallenge.findFirst({
    where: {
      userId,
      purpose: "withdraw_otp",
      usedAt: null,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recent && now.getTime() - recent.createdAt.getTime() < OTP_COOLDOWN_MS) {
    const waitSec = Math.ceil(
      (OTP_COOLDOWN_MS - (now.getTime() - recent.createdAt.getTime())) / 1000,
    );
    throw new Error(`Aguarde ${waitSec}s antes de solicitar outro código.`);
  }

  await db.securityChallenge.updateMany({
    where: {
      userId,
      purpose: "withdraw_otp",
      usedAt: null,
    },
    data: { usedAt: now },
  });

  const code = generateOtpCode();
  const expiresAt = new Date(now.getTime() + OTP_TTL_MS);

  await db.securityChallenge.create({
    data: {
      userId,
      purpose: "withdraw_otp",
      codeHash: hashOtp(code),
      payload: JSON.stringify(payload),
      expiresAt,
    },
  });

  return { code, expiresAt };
}

async function verifyEmailOtp(
  userId: string,
  otp: string,
): Promise<{ payload: string | null } | null> {
  const db = getPrisma();
  const now = new Date();
  const normalized = otp.replace(/\s/g, "");
  if (!/^\d{6}$/.test(normalized)) {
    return null;
  }

  const challenge = await db.securityChallenge.findFirst({
    where: {
      userId,
      purpose: "withdraw_otp",
      usedAt: null,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge || challenge.codeHash !== hashOtp(normalized)) {
    return null;
  }

  await db.securityChallenge.update({
    where: { id: challenge.id },
    data: { usedAt: now },
  });

  return { payload: challenge.payload };
}

export type WithdrawSecurityResult =
  | { ok: true; usedTotp: true }
  | { ok: true; usedTotp: false; payload: { amount: number; pixKeyId?: string } | null }
  | { ok: false; error: string };

export async function verifyWithdrawSecurity(
  userId: string,
  input: { otp?: string; totpCode?: string },
): Promise<WithdrawSecurityResult> {
  const db = getPrisma();
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { totpSecret: true, totpEnabled: true },
  });

  if (!user) {
    return { ok: false, error: "Usuário não encontrado." };
  }

  const totpCode = input.totpCode?.replace(/\s/g, "") ?? "";
  const emailOtp = input.otp?.replace(/\s/g, "") ?? "";

  if (user.totpEnabled && user.totpSecret && totpCode) {
    const valid = await verifyTotpCode(user.totpSecret, totpCode);
    if (valid) {
      return { ok: true, usedTotp: true };
    }
    return { ok: false, error: "Código do autenticador inválido." };
  }

  if (emailOtp) {
    const result = await verifyEmailOtp(userId, emailOtp);
    if (result !== null) {
      let parsedPayload: { amount: number; pixKeyId?: string } | null = null;
      if (result.payload) {
        try {
          parsedPayload = JSON.parse(result.payload) as { amount: number; pixKeyId?: string };
        } catch {
          // payload malformado — deixa nulo para a rota rejeitar
        }
      }
      return { ok: true, usedTotp: false, payload: parsedPayload };
    }
    return { ok: false, error: "Código de verificação inválido ou expirado." };
  }

  if (user.totpEnabled) {
    return {
      ok: false,
      error: "Informe o código do autenticador ou solicite um código por e-mail.",
    };
  }

  return { ok: false, error: "Informe o código enviado por e-mail." };
}
