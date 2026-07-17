import { NextResponse } from "next/server";
import {
  isAdminSessionError,
  requireAdminSession,
} from "@/lib/auth/require-admin";
import { sendEmail, isEmailConfigured } from "@/lib/email/email-client";
import { welcomeEmail } from "@/lib/email/templates/welcome";

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (isAdminSessionError(session)) return session;

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "E-mail não configurado no servidor (SMTP/Resend)." },
      { status: 503 },
    );
  }

  let to = session.email;
  try {
    const body = (await request.json()) as { to?: string };
    if (body.to?.trim()) to = body.to.trim();
  } catch {
    // empty body ok — uses admin email
  }

  if (!to.includes("@")) {
    return NextResponse.json({ error: "E-mail de destino inválido." }, { status: 400 });
  }

  const { subject, html } = welcomeEmail({
    name: "Teste Admin",
    username: "teste",
  });

  const result = await sendEmail({
    to,
    subject: `[TESTE ADMIN] ${subject}`,
    html,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "Falha no envio. Verifique SMTP/Resend nos logs do servidor." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, id: result.id, provider: result.provider, to });
}
