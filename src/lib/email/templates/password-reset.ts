import { emailLayout } from "./layout";

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
    <a href="${data.resetUrl}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;">Redefinir senha</a>
    <p style="margin:24px 0 0;font-size:13px;color:#71717a;">
      Se você não solicitou, ignore este e-mail.
    </p>
  `);

  return { subject: "Redefinir sua senha — pix.tips", html };
}
