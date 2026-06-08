import { emailButton, emailLayout } from "./layout";

export interface VerifyEmailData {
  name: string;
  verifyUrl: string;
}

export function verifyEmailTemplate(data: VerifyEmailData): { subject: string; html: string } {
  const html = emailLayout(`
    <h1 style="margin:0 0 12px;font-size:22px;color:#fff;">Confirme seu e-mail</h1>
    <p style="margin:0 0 20px;color:#a1a1aa;line-height:1.6;">
      Olá ${data.name}, clique no botão abaixo para confirmar seu endereço de e-mail. O link expira em 24 horas.
    </p>
    ${emailButton(data.verifyUrl, "Confirmar e-mail")}
    <p style="margin:24px 0 0;font-size:13px;color:#71717a;">
      Se você não criou uma conta, ignore este e-mail.
    </p>
  `);

  return { subject: "Confirme seu e-mail — pix.tips", html };
}
