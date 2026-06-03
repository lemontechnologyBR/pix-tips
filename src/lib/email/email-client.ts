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
}

const FROM_EMAIL = process.env.EMAIL_FROM ?? DEFAULT_FROM_EMAIL;

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("[email:dev] RESEND_API_KEY not set — email not sent:", {
      to: input.to,
      subject: input.subject,
      html: input.html.slice(0, 200) + "...",
    });
    return { ok: true, dev: true };
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
    return { ok: false };
  }

  const data = (await res.json()) as { id?: string };
  return { ok: true, id: data.id };
}
