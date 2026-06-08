import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { getPrisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const EXPORT_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hora

function maskCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length < 2) return "***.***.***-**";
  const last2 = digits.slice(-2);
  return `***.***.***-${last2}`;
}

export async function GET() {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const { userId, creator } = session;

  const allowed = rateLimit(`export:${userId}`, 1, EXPORT_RATE_LIMIT_WINDOW_MS);
  if (!allowed) {
    return NextResponse.json(
      { error: "Você já exportou seus dados recentemente. Tente novamente em 1 hora." },
      { status: 429 },
    );
  }

  const db = getPrisma();

  const [userRow, transactions, kyc] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        marketingOptIn: true,
        marketingOptInAt: true,
      },
    }),
    db.transaction.findMany({
      where: { creatorId: creator.id },
      orderBy: { createdAt: "desc" },
      take: 1000,
      select: {
        id: true,
        donorName: true,
        message: true,
        amount: true,
        createdAt: true,
        status: true,
      },
    }),
    db.kycVerification.findUnique({
      where: { creatorId: creator.id },
      select: {
        legalName: true,
        cpf: true,
        birthDate: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    perfil: {
      id: userRow?.id,
      email: userRow?.email,
      name: creator.displayName,
      username: creator.username,
      createdAt: userRow?.createdAt,
      avatarUrl: creator.avatar || null,
      pixKey: creator.pixKey ? `****${creator.pixKey.slice(-4)}` : null,
      bio: creator.bio || null,
      marketingOptIn: userRow?.marketingOptIn ?? false,
      marketingOptInAt: userRow?.marketingOptInAt,
    },
    transacoesRecebidas: transactions.map((t) => ({
      id: t.id,
      donorName: t.donorName,
      message: t.message,
      amount: t.amount,
      createdAt: t.createdAt,
      status: t.status,
    })),
    kyc: kyc
      ? {
          legalName: kyc.legalName,
          cpf: kyc.cpf ? maskCpf(kyc.cpf) : null,
          birthDate: kyc.birthDate,
          status: kyc.status,
          createdAt: kyc.createdAt,
        }
      : null,
    configuracoes: {
      alertSettings: creator.alertSettings,
      tipPageSettings: creator.tipPageSettings,
    },
  };

  const json = JSON.stringify(exportData, null, 2);

  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="meus-dados-pix-tips.json"',
    },
  });
}
