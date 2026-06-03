import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { isValidPassword } from "@/lib/auth/validators";
import { getPrisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string; password?: string };
    const token = body.token?.trim() ?? "";
    const password = body.password ?? "";

    if (!token) {
      return NextResponse.json({ error: "Token inválido." }, { status: 400 });
    }
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 8 caracteres." },
        { status: 400 },
      );
    }

    const db = getPrisma();
    const hashedToken = createHash("sha256").update(token).digest("hex");
    const user = await db.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Link inválido ou expirado." },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        // Preserve timestamp as passwordChangedAt sentinel (resetToken=null signals it's not an active reset).
        // require-session.ts uses this to invalidate JWTs issued before the password change.
        resetTokenExpiry: new Date(),
      },
    });

    return NextResponse.json({ redirect: "/login" });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Prisma")) {
      return NextResponse.json(
        { error: "Banco de dados indisponível." },
        { status: 503 },
      );
    }
    console.error("[auth/reset-password]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
