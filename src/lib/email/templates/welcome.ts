import { dashboardUrl, tipPageUrl } from "@/lib/brand";
import {
  EMAIL_BORDER,
  EMAIL_BG,
  EMAIL_MUTED,
  EMAIL_PRIMARY_LIGHT,
  EMAIL_TEXT,
  emailButton,
  emailLayout,
  emailPanel,
} from "./layout";

export interface WelcomeEmailData {
  name: string;
  username: string;
}

export function welcomeEmail(data: WelcomeEmailData): { subject: string; html: string } {
  const tipUrl = tipPageUrl(data.username);

  const html = emailLayout(`
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:${EMAIL_TEXT};">Bem-vindo, ${data.name}</h1>
    <p style="margin:0 0 20px;color:${EMAIL_MUTED};line-height:1.65;font-size:15px;">
      Sua conta na pix.tips está pronta. Personalize alertas, conecte sua chave Pix e comece a receber doações na live.
    </p>
    <p style="margin:0 0 8px;color:${EMAIL_MUTED};font-size:13px;">Sua página pública</p>
    ${emailPanel(`<a href="${tipUrl}" style="color:${EMAIL_PRIMARY_LIGHT};font-family:ui-monospace,monospace;font-size:13px;text-decoration:none;word-break:break-all;">${tipUrl}</a>`, `border-color:${EMAIL_BORDER};background:${EMAIL_BG};`)}
    ${emailButton(dashboardUrl(), "Abrir painel", "24px")}
  `);

  return { subject: "Bem-vindo ao pix.tips", html };
}
