import {
  EMAIL_MUTED,
  EMAIL_TEXT,
  emailButton,
  emailLayout,
} from "./layout";

export interface PasswordResetEmailData {
  name: string;
  resetUrl: string;
}

export function passwordResetEmail(
  data: PasswordResetEmailData,
): { subject: string; html: string } {
  const html = emailLayout(`
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:${EMAIL_TEXT};">Redefinir senha</h1>
    <p style="margin:0 0 20px;color:${EMAIL_MUTED};line-height:1.65;font-size:15px;">
      Olá ${data.name}, recebemos um pedido para redefinir sua senha na pix.tips. O link expira em 1 hora.
    </p>
    ${emailButton(data.resetUrl, "Redefinir senha")}
    <p style="margin:24px 0 0;font-size:13px;color:${EMAIL_MUTED};">
      Se você não solicitou, ignore este e-mail.
    </p>
  `);

  return { subject: "Redefinir sua senha — pix.tips", html };
}
