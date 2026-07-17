import { dashboardUrl } from "@/lib/brand";
import {
  EMAIL_BG,
  EMAIL_MUTED,
  EMAIL_PRIMARY,
  EMAIL_PRIMARY_LIGHT,
  EMAIL_TEXT,
  emailButton,
  emailLayout,
} from "./layout";

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
    ? `<p style="margin:16px 0 0;padding:12px 16px;background:${EMAIL_BG};border-left:3px solid ${EMAIL_PRIMARY};border-radius:0 8px 8px 0;color:#cbd5e1;font-style:italic;line-height:1.5;">"${data.message}"</p>`
    : "";

  const html = emailLayout(`
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:${EMAIL_TEXT};">Nova doação recebida</h1>
    <p style="margin:0;color:${EMAIL_MUTED};line-height:1.65;font-size:15px;">
      Olá ${data.creatorName}, <strong style="color:${EMAIL_TEXT};">${data.donorName}</strong> enviou
      <strong style="color:${EMAIL_PRIMARY_LIGHT};">${formatted}</strong> via Pix.
    </p>
    ${messageBlock}
    ${emailButton(dashboardUrl("/finance"), "Ver no financeiro", "24px")}
  `);

  return { subject: `Nova doação de ${formatted} — pix.tips`, html };
}
