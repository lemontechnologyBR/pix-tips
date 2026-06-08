import { dashboardUrl, tipPageUrl } from "@/lib/brand";
import { emailButton, emailLayout } from "./layout";

export interface WelcomeEmailData {
  name: string;
  username: string;
}

export function welcomeEmail(data: WelcomeEmailData): { subject: string; html: string } {
  const tipUrl = tipPageUrl(data.username);

  const html = emailLayout(`
    <h1 style="margin:0 0 12px;font-size:22px;color:#fff;">Bem-vindo, ${data.name}! 🎉</h1>
    <p style="margin:0 0 20px;color:#a1a1aa;line-height:1.6;">
      Sua conta pix.tips foi criada. Configure seus alertas e comece a receber doações na live.
    </p>
    <p style="margin:0 0 8px;color:#d4d4d8;font-size:14px;">Sua página pública:</p>
    <p style="margin:0 0 24px;padding:12px 16px;background:#09090b;border:1px solid #3f3f46;border-radius:8px;color:#67e8f9;font-family:monospace;font-size:13px;">${tipUrl}</p>
    ${emailButton(dashboardUrl(), "Ir para o painel")}
  `);

  return { subject: "Bem-vindo ao pix.tips!", html };
}
