import { dashboardUrl, SITE_URL } from "@/lib/brand";
import {
  EMAIL_MUTED,
  EMAIL_PRIMARY_LIGHT,
  EMAIL_TEXT,
  emailButton,
  emailLayout,
} from "./layout";

export interface MarketingUpdateEmailData {
  name: string;
  headline: string;
  bodyHtml: string;
}

export function marketingUpdateEmail(
  data: MarketingUpdateEmailData,
): { subject: string; html: string } {
  const html = emailLayout(`
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:${EMAIL_TEXT};">${data.headline}</h1>
    <p style="margin:0 0 16px;color:${EMAIL_MUTED};line-height:1.65;font-size:15px;">
      Olá ${data.name},
    </p>
    <div style="color:#cbd5e1;line-height:1.7;font-size:15px;">${data.bodyHtml}</div>
    ${emailButton(dashboardUrl(), "Acessar pix.tips", "24px")}
    <p style="margin:24px 0 0;font-size:12px;color:${EMAIL_MUTED};line-height:1.6;">
      Você recebe este e-mail porque aceitou novidades da pix.tips.
      <a href="${dashboardUrl("/settings")}" style="color:${EMAIL_PRIMARY_LIGHT};">Cancelar inscrição</a>
      · <a href="${SITE_URL}/privacidade" style="color:${EMAIL_PRIMARY_LIGHT};">Privacidade</a>
    </p>
  `);

  return { subject: `${data.headline} — pix.tips`, html };
}
