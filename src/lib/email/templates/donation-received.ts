import { dashboardUrl } from "@/lib/brand";
import { EMAIL_PRIMARY, emailButton, emailLayout } from "./layout";

export interface DonationReceivedEmailData {
  creatorName: string;
  donorName: string;
  amount: number;
  message?: string;
}

export function donationReceivedEmail(
  data: DonationReceivedEmailData,
): { subject: string; html: string } {
  const formatted = data.amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const messageBlock = data.message?.trim()
    ? `<p style="margin:16px 0 0;padding:12px 16px;background:#09090b;border-left:3px solid ${EMAIL_PRIMARY};border-radius:4px;color:#d4d4d8;font-style:italic;">"${data.message}"</p>`
    : "";

  const html = emailLayout(`
    <h1 style="margin:0 0 12px;font-size:22px;color:#fff;">Nova doação recebida! 💜</h1>
    <p style="margin:0;color:#a1a1aa;line-height:1.6;">
      Olá ${data.creatorName}, <strong style="color:#fff;">${data.donorName}</strong> acabou de doar
      <strong style="color:#67e8f9;">${formatted}</strong>.
    </p>
    ${messageBlock}
    ${emailButton(dashboardUrl("/finance"), "Ver transações", "24px")}
  `);

  return { subject: `Nova doação de ${formatted} — pix.tips`, html };
}
