import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/auth/emails";
import { isValidEmail } from "@/lib/auth/validators";
import { rateLimit } from "@/lib/rate-limit";
import { getPrisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (!rateLimit(`forgot-password:${ip}`, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde 60 minutos antes de tentar novamente." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase() ?? "";

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

    const db = getPrisma();
    const user = await db.user.findUnique({ where: { email } });

    if (user) {
      const rawToken = randomBytes(32).toString("hex");
      const hashedToken = createHash("sha256").update(rawToken).digest("hex");
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

      await db.user.update({
        where: { id: user.id },
        data: { resetToken: hashedToken, resetTokenExpiry },
      });

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const resetLink = `${baseUrl}/reset-password?token=${rawToken}`;

      await sendPasswordResetEmail(user.email, user.name, resetLink);
    }

    return NextResponse.json({
      message: "Se existir uma conta com esse e-mail, enviamos instruções.",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Prisma")) {
      return NextResponse.json(
        { error: "Banco de dados indisponível." },
        { status: 503 },
      );
    }
    console.error("[auth/forgot-password]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
