import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export function getPwaManifest() {
  return {
    name: `${BRAND_NAME} — Doações Pix`,
    short_name: "pix.tips",
    description: BRAND_TAGLINE,
    start_url: "/",
    scope: "/",
    id: "/",
    display: "standalone" as const,
    background_color: "#030712",
    theme_color: "#06b6d4",
    lang: "pt-BR",
    categories: ["finance", "social", "entertainment"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any" as const,
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any" as const,
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable" as const,
      },
    ],
  };
}
