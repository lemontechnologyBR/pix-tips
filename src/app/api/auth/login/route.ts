import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyPassword } from "@/lib/auth/password";
import { buildMfaPendingCookie, createMfaPendingToken } from "@/lib/auth/mfa-token";
import { buildSessionCookie, createSession } from "@/lib/auth/session";
import { isValidEmail } from "@/lib/auth/validators";
import { rateLimit } from "@/lib/rate-limit";
import { getPrisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (!rateLimit(`login:${ip}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde 15 minutos antes de tentar novamente." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!isValidEmail(email) || !password) {
      return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 400 });
    }

    const db = getPrisma();
    const user = await db.user.findUnique({ where: { email } });

    if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }

    const creator = await db.creator.findUnique({ where: { userId: user.id } });
    if (!creator) {
      return NextResponse.json({ error: "Conta de criador não encontrada." }, { status: 404 });
    }

    if (creator.isSuspended) {
      return NextResponse.json(
        { error: "Sua conta foi suspensa. Entre em contato com o suporte para mais informações." },
        { status: 403 },
      );
    }

    const sessionPayload = {
      userId: user.id,
      creatorId: creator.id,
      email: user.email,
      role: user.role,
      onboardingCompleted: creator.onboardingCompleted,
    };

    const redirect = creator.onboardingCompleted ? "/dashboard" : "/onboarding";
    const cookieStore = await cookies();

    if (user.totpEnabled) {
      const mfaToken = await createMfaPendingToken(sessionPayload);
      cookieStore.set(buildMfaPendingCookie(mfaToken));
      return NextResponse.json({ requiresMfa: true, email: user.email, redirect });
    }

    const token = await createSession(sessionPayload);
    cookieStore.set(buildSessionCookie(token));

    return NextResponse.json({ redirect });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Prisma")) {
      return NextResponse.json(
        { error: "Banco de dados indisponível. Tente novamente em instantes." },
        { status: 503 },
      );
    }
    console.error("[auth/login]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
