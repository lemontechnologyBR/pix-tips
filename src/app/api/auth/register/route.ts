import { createHash, randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import {
  generateWidgetToken,
  getDefaultAlertSettings,
  getDefaultAvatar,
  getDefaultTipPageSettings,
} from "@/lib/auth/creator-defaults";
import { sendWelcomeEmail } from "@/lib/auth/emails";
import { hashPassword } from "@/lib/auth/password";
import { buildSessionCookie, createSession } from "@/lib/auth/session";
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  slugifyUsername,
} from "@/lib/auth/validators";
import { generateAffiliateCode } from "@/lib/affiliate";
import { SITE_URL } from "@/lib/brand";
import { sendEmail } from "@/lib/email/email-client";
import { syncMarketingContact } from "@/lib/email/resend-audience";
import { verifyEmailTemplate } from "@/lib/email/templates/verify-email";
import { getPrisma } from "@/lib/db";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!rateLimit(`register:${ip}`, 5, 3_600_000)) {
    return NextResponse.json(
      { error: "Muitas tentativas de cadastro. Tente novamente mais tarde." },
      { status: 429 },
    );
  }

  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      username?: string;
      terms?: boolean;
      marketingOptIn?: boolean;
    };

    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const username = body.username ?? "";

    if (!body.terms) {
      return NextResponse.json({ error: "Aceite os termos de uso." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 8 caracteres." },
        { status: 400 },
      );
    }
    if (!isValidUsername(username)) {
      return NextResponse.json({ error: "Nome de usuário inválido." }, { status: 400 });
    }

    const slug = slugifyUsername(username);
    const db = getPrisma();
    const passwordHash = await hashPassword(password);

    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });
    }

    const existingUsername = await db.creator.findUnique({ where: { username: slug } });
    if (existingUsername) {
      return NextResponse.json({ error: "Nome de usuário indisponível." }, { status: 409 });
    }

    const alertSettings = getDefaultAlertSettings();
    const tipPageSettings = getDefaultTipPageSettings();

    const cookieStore = await cookies();

    const rawVerificationToken = randomBytes(32).toString("hex");
    const hashedVerificationToken = createHash("sha256")
      .update(rawVerificationToken)
      .digest("hex");

    const marketingOptIn = Boolean(body.marketingOptIn);

    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        name: username.trim(),
        marketingOptIn,
        marketingOptInAt: marketingOptIn ? new Date() : null,
        emailVerificationToken: hashedVerificationToken,
        emailVerificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        creator: {
          create: {
            username: slug,
            displayName: username.trim(),
            avatar: getDefaultAvatar(slug),
            widgetToken: generateWidgetToken(),
            affiliateCode: generateAffiliateCode(slug),
            paymentMethods: JSON.stringify(["pix"]),
            alertSettings: JSON.stringify(alertSettings),
            tipPageSettings: JSON.stringify(tipPageSettings),
          },
        },
      },
      include: { creator: true },
    });

    const creator = user.creator!;
    await sendWelcomeEmail(user.email, creator.displayName, creator.username);

    if (user.emailVerificationToken) {
      const verifyUrl = `${SITE_URL}/verify-email?token=${rawVerificationToken}`;
      const { subject, html } = verifyEmailTemplate({ name: user.name, verifyUrl });
      await sendEmail({ to: user.email, subject, html });
    }

    if (marketingOptIn) {
      await syncMarketingContact(user.email, creator.displayName, true).catch(
        console.error,
      );
    }

    const token = await createSession({
      userId: user.id,
      creatorId: creator.id,
      email: user.email,
      role: user.role,
      onboardingCompleted: creator.onboardingCompleted,
    });
    cookieStore.set(buildSessionCookie(token));

    return NextResponse.json({ redirect: "/onboarding" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientValidationError ||
      (error instanceof Error && error.name === "PrismaClientValidationError")
    ) {
      console.error("[auth/register] Prisma client desatualizado:", error);
      return NextResponse.json(
        {
          error:
            "Banco desatualizado. Rode npm run db:push e reinicie o servidor (npm run dev).",
        },
        { status: 503 },
      );
    }
    if (error instanceof Error && error.message.includes("Prisma")) {
      return NextResponse.json(
        { error: "Banco de dados indisponível. Tente novamente em instantes." },
        { status: 503 },
      );
    }
    console.error("[auth/register]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
