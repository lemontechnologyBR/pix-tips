import { emailLayout } from "./layout";

export interface DonationReceivedEmailData {
  creatorName: string;
  donorName: string;
  amount: number;
  message?: string;
  dashboardUrl?: string;
}

export function donationReceivedEmail(
  data: DonationReceivedEmailData,
): { subject: string; html: string } {
  const formatted = data.amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const dashboardUrl = data.dashboardUrl ?? "https://pix.tips/dashboard/finance";
  const messageBlock = data.message?.trim()
    ? `<p style="margin:16px 0 0;padding:12px 16px;background:#09090b;border-left:3px solid #7c3aed;border-radius:4px;color:#d4d4d8;font-style:italic;">"${data.message}"</p>`
    : "";

  const html = emailLayout(`
    <h1 style="margin:0 0 12px;font-size:22px;color:#fff;">Nova doação recebida! 💜</h1>
    <p style="margin:0;color:#a1a1aa;line-height:1.6;">
      Olá ${data.creatorName}, <strong style="color:#fff;">${data.donorName}</strong> acabou de doar
      <strong style="color:#a78bfa;">${formatted}</strong>.
    </p>
    ${messageBlock}
    <a href="${dashboardUrl}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;">Ver transações</a>
  `);

  return { subject: `Nova doação de ${formatted} — pix.tips`, html };
}
