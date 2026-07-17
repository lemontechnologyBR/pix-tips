import { dashboardUrl } from "@/lib/brand";
import {
  EMAIL_MUTED,
  EMAIL_PRIMARY_LIGHT,
  EMAIL_TEXT,
  emailButton,
  emailLayout,
} from "./layout";

export interface KycApprovedEmailData {
  name: string;
  username: string;
}

export function kycApprovedEmail(
  data: KycApprovedEmailData,
): { subject: string; html: string } {
  const name = data.name.trim() || data.username;
  const financeUrl = dashboardUrl("/finance");

  const html = emailLayout(`
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:${EMAIL_TEXT};">KYC aprovado</h1>
    <p style="margin:0 0 16px;color:${EMAIL_MUTED};line-height:1.65;font-size:15px;">
      Olá ${name}, sua verificação de identidade na pix.tips foi <strong style="color:${EMAIL_PRIMARY_LIGHT};">aprovada</strong>.
    </p>
    <p style="margin:0 0 20px;color:${EMAIL_MUTED};line-height:1.65;font-size:15px;">
      Agora você já pode sacar o saldo disponível para a sua chave Pix, direto pelo painel financeiro.
    </p>
    ${emailButton(financeUrl, "Abrir financeiro", "8px")}
    <p style="margin:24px 0 0;font-size:13px;color:${EMAIL_MUTED};line-height:1.6;">
      Conta: <strong style="color:${EMAIL_TEXT};">@${data.username}</strong>
    </p>
  `);

  return {
    subject: "KYC aprovado — você já pode sacar na pix.tips",
    html,
  };
}
