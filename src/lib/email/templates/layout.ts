import { BRAND_NAME, BRAND_TAGLINE, SITE_URL } from "@/lib/brand";

/** Identidade visual alinhada ao site (cyan → purple, fundo slate). */
export const EMAIL_BG = "#030712";
export const EMAIL_SURFACE = "#0f172a";
export const EMAIL_BORDER = "rgba(6,182,212,0.22)";
export const EMAIL_PRIMARY = "#06b6d4";
export const EMAIL_PRIMARY_LIGHT = "#22d3ee";
export const EMAIL_PURPLE = "#a855f7";
export const EMAIL_MUTED = "#94a3b8";
export const EMAIL_TEXT = "#f8fafc";
export const EMAIL_HEADER_GRADIENT =
  "linear-gradient(135deg,#06b6d4 0%,#7c3aed 55%,#a855f7 100%)";
export const EMAIL_BTN_GRADIENT =
  "linear-gradient(135deg,#06b6d4 0%,#7c3aed 100%)";

export function emailButton(href: string, label: string, marginTop = "0"): string {
  return `<a href="${href}" style="display:inline-block;margin-top:${marginTop};padding:13px 26px;background:${EMAIL_BTN_GRADIENT};color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:0.01em;">${label}</a>`;
}

export function emailPanel(inner: string, extraStyle = ""): string {
  return `<div style="padding:14px 16px;background:${EMAIL_BG};border:1px solid ${EMAIL_BORDER};border-radius:12px;${extraStyle}">${inner}</div>`;
}

export function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
</head>
<body style="margin:0;padding:0;background:${EMAIL_BG};font-family:'Segoe UI',system-ui,-apple-system,sans-serif;color:${EMAIL_TEXT};">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${EMAIL_BG};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:${EMAIL_SURFACE};border:1px solid ${EMAIL_BORDER};border-radius:20px;overflow:hidden;">
          <tr>
            <td style="padding:22px 28px;background:${EMAIL_HEADER_GRADIENT};">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="width:40px;height:40px;border-radius:10px;background:rgba(3,7,18,0.35);text-align:center;vertical-align:middle;">
                    <span style="font-weight:800;font-size:11px;letter-spacing:-0.02em;color:#fff;">pix</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <div style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.03em;">${BRAND_NAME}</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.82);margin-top:2px;">${BRAND_TAGLINE}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px;border-top:1px solid ${EMAIL_BORDER};font-size:12px;color:${EMAIL_MUTED};line-height:1.6;">
              © ${new Date().getFullYear()} ${BRAND_NAME} · Doações via Pix para criadores<br/>
              <a href="${SITE_URL}" style="color:${EMAIL_PRIMARY_LIGHT};text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, "")}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
