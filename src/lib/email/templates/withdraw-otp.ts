import { emailLayout } from "./layout";

export interface WithdrawOtpEmailData {
  name: string;
  code: string;
  amountFormatted: string;
  expiresMinutes: number;
}

export function withdrawOtpEmail(
  data: WithdrawOtpEmailData,
): { subject: string; html: string } {
  const html = emailLayout(`
    <h1 style="margin:0 0 12px;font-size:22px;color:#fff;">Confirme seu saque</h1>
    <p style="margin:0 0 20px;color:#a1a1aa;line-height:1.6;">
      Olá ${data.name}, use o código abaixo para confirmar o saque de <strong style="color:#fff;">${data.amountFormatted}</strong>.
    </p>
    <p style="margin:0 0 8px;font-size:13px;color:#71717a;text-transform:uppercase;letter-spacing:0.08em;">Código de verificação</p>
    <p style="margin:0 0 24px;font-size:32px;font-weight:700;letter-spacing:0.35em;color:#fff;">${data.code}</p>
    <p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">
      Expira em ${data.expiresMinutes} minutos. Se você não solicitou este saque, altere sua senha imediatamente.
    </p>
  `);

  return { subject: "Código de confirmação de saque — pix.tips", html };
}
