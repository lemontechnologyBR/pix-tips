export const BRAND_NAME = "pix.tips";
export const BRAND_NAME_PRO = "pix.tips Pro";
export const BRAND_LEGAL = "pix.tips Tecnologia Ltda.";
export const BRAND_TAGLINE = "Doações para criadores de conteúdo";

export const BRAND_LOGO_SRC = "/brand/pix-tips.svg";
export const BRAND_LOGO_LIGHT_SRC = "/brand/pix-tips-light.svg";
export const BRAND_LOGO_ICON_SRC = "/brand/pix-tips-icon.svg";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://pix.tips";

export const DEMO_EMAIL = "demo@pix.tips";
export const NOREPLY_EMAIL = "noreply@pix.tips";
export const PRIVACY_EMAIL = "privacidade@pix.tips";
export const DEFAULT_FROM_EMAIL = `${BRAND_NAME} <${NOREPLY_EMAIL}>`;

export function tipPagePath(username: string) {
  return `/${username}`;
}

export function tipThanksPath(username: string) {
  return `/${username}/thanks`;
}

export function tipPageUrl(username: string) {
  return `${SITE_URL}${tipPagePath(username)}`;
}

export function dashboardUrl(path = "") {
  return `${SITE_URL}/dashboard${path}`;
}
