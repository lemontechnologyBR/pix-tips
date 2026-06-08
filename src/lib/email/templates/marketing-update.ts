import { dashboardUrl, SITE_URL } from "@/lib/brand";
import { emailButton, emailLayout } from "./layout";

export interface MarketingUpdateEmailData {
  name: string;
  headline: string;
  bodyHtml: string;
}

export function marketingUpdateEmail(
  data: MarketingUpdateEmailData,
): { subject: string; html: string } {
  const html = emailLayout(`
    <h1 style="margin:0 0 12px;font-size:22px;color:#fff;">${data.headline}</h1>
    <p style="margin:0 0 20px;color:#a1a1aa;line-height:1.6;">
      Olá ${data.name},
    </p>
    <div style="color:#d4d4d8;line-height:1.7;">${data.bodyHtml}</div>
    ${emailButton(dashboardUrl(), "Acessar pix.tips", "24px")}
    <p style="margin:24px 0 0;font-size:12px;color:#71717a;line-height:1.6;">
      Você recebe este e-mail porque aceitou receber novidades da pix.tips.
      <a href="${dashboardUrl("/settings")}" style="color:#67e8f9;">Cancelar inscrição</a>
      · <a href="${SITE_URL}/privacidade" style="color:#67e8f9;">Política de privacidade</a>
    </p>
  `);

  return { subject: data.headline, html };
}
