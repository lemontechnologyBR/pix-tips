import { emailLayout } from "./layout";

export interface SubscriptionConfirmedEmailData {
  name: string;
  planName?: string;
  amount?: number;
  billingUrl?: string;
}

export function subscriptionConfirmedEmail(
  data: SubscriptionConfirmedEmailData,
): { subject: string; html: string } {
  const planName = data.planName ?? "Pro";
  const amount = (data.amount ?? 19.9).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const billingUrl = data.billingUrl ?? "https://pix.tips/dashboard/billing";

  const html = emailLayout(`
    <h1 style="margin:0 0 12px;font-size:22px;color:#fff;">Assinatura ${planName} ativada! 💎</h1>
    <p style="margin:0 0 20px;color:#a1a1aa;line-height:1.6;">
      Olá ${data.name}, seu plano ${planName} está ativo. Aproveite templates premium, 0% de comissão e recursos exclusivos.
    </p>
    <p style="margin:0;padding:12px 16px;background:#09090b;border:1px solid #3f3f46;border-radius:8px;color:#d4d4d8;">
      Valor: <strong style="color:#a78bfa;">${amount}/mês</strong>
    </p>
    <a href="${billingUrl}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;">Gerenciar assinatura</a>
  `);

  return { subject: `Plano ${planName} confirmado — pix.tips`, html };
}
