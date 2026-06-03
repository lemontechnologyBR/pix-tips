import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim() ?? "";

  if (!token) {
    return NextResponse.json({ error: "Token inválido ou ausente." }, { status: 400 });
  }

  const db = getPrisma();
  const user = await db.user.findFirst({
    where: { emailVerificationToken: token },
  });

  if (!user) {
    return NextResponse.json({ error: "Token inválido ou já utilizado." }, { status: 400 });
  }

  if (!user.emailVerificationTokenExpiry || user.emailVerificationTokenExpiry < new Date()) {
    return NextResponse.json({ error: "Token expirado. Solicite um novo e-mail de verificação." }, { status: 400 });
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiry: null,
    },
  });

  return NextResponse.json({ ok: true, message: "E-mail verificado com sucesso!" });
}
