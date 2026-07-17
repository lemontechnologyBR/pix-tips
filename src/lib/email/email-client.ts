import nodemailer from "nodemailer";
import { DEFAULT_FROM_EMAIL } from "@/lib/brand";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  dev?: boolean;
  provider?: "smtp" | "resend" | "dev";
}

const FROM_EMAIL = process.env.EMAIL_FROM ?? DEFAULT_FROM_EMAIL;

function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim(),
  );
}

async function sendViaSmtp(input: SendEmailInput): Promise<SendEmailResult> {
  const host = process.env.SMTP_HOST!.trim();
  const port = Number(process.env.SMTP_PORT ?? 465);
  const secure =
    process.env.SMTP_SECURE === "true" ||
    process.env.SMTP_SECURE === "1" ||
    port === 465;
  const user = process.env.SMTP_USER!.trim();
  const pass = process.env.SMTP_PASS!.trim();

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from: FROM_EMAIL.includes("<") ? FROM_EMAIL : `pix.tips <${FROM_EMAIL}>`,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  return {
    ok: true,
    id: typeof info.messageId === "string" ? info.messageId : undefined,
    provider: "smtp",
  };
}

async function sendViaResend(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, provider: "resend" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[email] Resend error:", err);
    return { ok: false, provider: "resend" };
  }

  const data = (await res.json()) as { id?: string };
  return { ok: true, id: data.id, provider: "resend" };
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  // Preferência: SMTP (Hostinger) → Resend → log em dev
  if (isSmtpConfigured()) {
    try {
      return await sendViaSmtp(input);
    } catch (error) {
      console.error("[email] SMTP error:", error);
      return { ok: false, provider: "smtp" };
    }
  }

  if (process.env.RESEND_API_KEY?.trim()) {
    return sendViaResend(input);
  }

  console.warn("[email:dev] Nenhum provedor de e-mail configurado — não enviado:", {
    to: input.to,
    subject: input.subject,
    html: input.html.slice(0, 200) + "...",
  });
  return { ok: true, dev: true, provider: "dev" };
}

export function isEmailConfigured(): boolean {
  return isSmtpConfigured() || Boolean(process.env.RESEND_API_KEY?.trim());
}
