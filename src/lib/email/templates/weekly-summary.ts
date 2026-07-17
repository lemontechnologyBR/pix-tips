import { dashboardUrl } from "@/lib/brand";
import {
  EMAIL_BG,
  EMAIL_BORDER,
  EMAIL_MUTED,
  EMAIL_PRIMARY_LIGHT,
  EMAIL_TEXT,
  emailButton,
  emailLayout,
  emailPanel,
} from "./layout";

export interface WeeklySummaryEmailData {
  creatorName: string;
  periodLabel: string;
  totalAmount: number;
  donationCount: number;
  topDonor?: string;
  topDonationAmount?: number;
}

export function weeklySummaryEmail(
  data: WeeklySummaryEmailData,
): { subject: string; html: string } {
  const totalFormatted = data.totalAmount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const topDonorBlock =
    data.topDonor && data.topDonationAmount != null
      ? `<div style="margin-top:12px;">${emailPanel(
          `Maior apoiador: <strong style="color:${EMAIL_TEXT};">${data.topDonor}</strong>
          (${data.topDonationAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})`,
          `color:${EMAIL_MUTED};`,
        )}</div>`
      : "";

  const html = emailLayout(`
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:${EMAIL_TEXT};">Seu resumo semanal</h1>
    <p style="margin:0 0 20px;color:${EMAIL_MUTED};line-height:1.65;font-size:15px;">
      Olá ${data.creatorName}, resumo de ${data.periodLabel} na pix.tips:
    </p>
    ${emailPanel(`
      <span style="font-size:13px;color:${EMAIL_MUTED};">Total recebido</span><br/>
      <strong style="font-size:24px;color:${EMAIL_PRIMARY_LIGHT};letter-spacing:-0.02em;">${totalFormatted}</strong>
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid ${EMAIL_BORDER};">
        <span style="font-size:13px;color:${EMAIL_MUTED};">Doações confirmadas</span><br/>
        <strong style="font-size:18px;color:${EMAIL_TEXT};">${data.donationCount}</strong>
      </div>
    `, `background:${EMAIL_BG};`)}
    ${topDonorBlock}
    ${emailButton(dashboardUrl(), "Abrir painel", "24px")}
    <p style="margin:24px 0 0;font-size:12px;color:${EMAIL_MUTED};">
      Você recebe este e-mail porque ativou o resumo semanal.
      <a href="${dashboardUrl("/settings")}" style="color:${EMAIL_PRIMARY_LIGHT};">Gerenciar preferências</a>
    </p>
  `);

  return { subject: `Resumo semanal — ${totalFormatted} — pix.tips`, html };
}
