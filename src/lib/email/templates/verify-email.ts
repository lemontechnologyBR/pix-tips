import {
  EMAIL_MUTED,
  EMAIL_TEXT,
  emailButton,
  emailLayout,
} from "./layout";

export interface VerifyEmailData {
  name: string;
  verifyUrl: string;
}

export function verifyEmailTemplate(data: VerifyEmailData): { subject: string; html: string } {
  const html = emailLayout(`
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:${EMAIL_TEXT};">Confirme seu e-mail</h1>
    <p style="margin:0 0 20px;color:${EMAIL_MUTED};line-height:1.65;font-size:15px;">
      Olá ${data.name}, confirme seu endereço para ativar a conta na pix.tips. O link expira em 24 horas.
    </p>
    ${emailButton(data.verifyUrl, "Confirmar e-mail")}
    <p style="margin:24px 0 0;font-size:13px;color:${EMAIL_MUTED};">
      Se você não criou uma conta, ignore este e-mail.
    </p>
  `);

  return { subject: "Confirme seu e-mail — pix.tips", html };
}
