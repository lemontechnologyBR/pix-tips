import { dashboardUrl } from "@/lib/brand";
import { emailButton, emailLayout } from "./layout";

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
      ? `<p style="margin:16px 0 0;padding:12px 16px;background:#09090b;border:1px solid #3f3f46;border-radius:8px;color:#d4d4d8;">
          Maior apoiador: <strong style="color:#fff;">${data.topDonor}</strong>
          (${data.topDonationAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
        </p>`
      : "";

  const html = emailLayout(`
    <h1 style="margin:0 0 12px;font-size:22px;color:#fff;">Seu resumo semanal 📊</h1>
    <p style="margin:0 0 20px;color:#a1a1aa;line-height:1.6;">
      Olá ${data.creatorName}, aqui está o resumo de ${data.periodLabel}:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
      <tr>
        <td style="padding:12px 16px;background:#09090b;border:1px solid #3f3f46;border-radius:8px 8px 0 0;">
          <span style="font-size:13px;color:#71717a;">Total recebido</span><br/>
          <strong style="font-size:22px;color:#67e8f9;">${totalFormatted}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#09090b;border:1px solid #3f3f46;border-top:none;border-radius:0 0 8px 8px;">
          <span style="font-size:13px;color:#71717a;">Doações confirmadas</span><br/>
          <strong style="font-size:18px;color:#fff;">${data.donationCount}</strong>
        </td>
      </tr>
    </table>
    ${topDonorBlock}
    ${emailButton(dashboardUrl(), "Abrir painel", "24px")}
    <p style="margin:24px 0 0;font-size:12px;color:#71717a;">
      Você recebe este e-mail porque ativou o resumo semanal nas configurações.
      <a href="${dashboardUrl("/settings")}" style="color:#67e8f9;">Gerenciar preferências</a>
    </p>
  `);

  return { subject: `Resumo semanal — ${totalFormatted} — pix.tips`, html };
}
