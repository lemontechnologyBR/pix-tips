import {
  EMAIL_BG,
  EMAIL_BORDER,
  EMAIL_MUTED,
  EMAIL_PRIMARY_LIGHT,
  EMAIL_TEXT,
  emailLayout,
  emailPanel,
} from "./layout";

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
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:${EMAIL_TEXT};">Confirme seu saque</h1>
    <p style="margin:0 0 20px;color:${EMAIL_MUTED};line-height:1.65;font-size:15px;">
      Olá ${data.name}, use o código abaixo para confirmar o saque de
      <strong style="color:${EMAIL_TEXT};">${data.amountFormatted}</strong> na pix.tips.
    </p>
    <p style="margin:0 0 8px;font-size:12px;color:${EMAIL_MUTED};text-transform:uppercase;letter-spacing:0.1em;">Código de verificação</p>
    ${emailPanel(`<span style="font-size:30px;font-weight:800;letter-spacing:0.28em;color:${EMAIL_PRIMARY_LIGHT};">${data.code}</span>`, `text-align:center;background:${EMAIL_BG};border-color:${EMAIL_BORDER};`)}
    <p style="margin:20px 0 0;font-size:13px;color:${EMAIL_MUTED};line-height:1.6;">
      Expira em ${data.expiresMinutes} minutos. Se você não solicitou este saque, altere sua senha imediatamente.
    </p>
  `);

  return { subject: "Código de confirmação de saque — pix.tips", html };
}
