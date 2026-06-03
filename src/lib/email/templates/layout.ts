import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:system-ui,-apple-system,sans-serif;color:#fafafa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#18181b;border:1px solid #3f3f46;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:24px 28px;background:linear-gradient(135deg,#059669 0%,#5b21b6 100%);">
              <span style="display:inline-block;width:36px;height:36px;line-height:36px;text-align:center;border-radius:8px;background:linear-gradient(135deg,#10b981,#7c3aed);font-weight:800;font-size:10px;color:#fff;">pix</span>
              <span style="margin-left:10px;font-size:18px;font-weight:700;color:#fff;">${BRAND_NAME}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;border-top:1px solid #27272a;font-size:12px;color:#71717a;">
              © ${new Date().getFullYear()} ${BRAND_NAME} · ${BRAND_TAGLINE}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
