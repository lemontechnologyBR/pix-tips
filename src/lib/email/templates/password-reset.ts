import { emailButton, emailLayout } from "./layout";

export interface PasswordResetEmailData {
  name: string;
  resetUrl: string;
}

export function passwordResetEmail(
  data: PasswordResetEmailData,
): { subject: string; html: string } {
  const html = emailLayout(`
    <h1 style="margin:0 0 12px;font-size:22px;color:#fff;">Redefinir senha</h1>
    <p style="margin:0 0 20px;color:#a1a1aa;line-height:1.6;">
      Olá ${data.name}, recebemos uma solicitação para redefinir sua senha. O link expira em 1 hora.
    </p>
    ${emailButton(data.resetUrl, "Redefinir senha")}
    <p style="margin:24px 0 0;font-size:13px;color:#71717a;">
      Se você não solicitou, ignore este e-mail.
    </p>
  `);

  return { subject: "Redefinir sua senha — pix.tips", html };
}
