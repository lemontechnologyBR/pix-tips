import type { ViewersOverlayLayout } from "@/types";

export const VIEWERS_OVERLAY_LAYOUTS: {
  id: ViewersOverlayLayout;
  name: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "classic",
    name: "Clássico",
    description: "Ícone, rótulo e contador",
    icon: "👁",
  },
  {
    id: "pill",
    name: "Pílula",
    description: "Linha compacta com ponto LIVE",
    icon: "◉",
  },
  {
    id: "compact",
    name: "Compacto",
    description: "Só ícone e número",
    icon: "—",
  },
  {
    id: "badge",
    name: "Plataforma",
    description: "Logo Twitch, YouTube ou Kick",
    icon: "▣",
  },
  {
    id: "stream",
    name: "Stream",
    description: "Faixa horizontal de live",
    icon: "▭",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Número grande, sem borda",
    icon: "▬",
  },
  {
    id: "neon",
    name: "Neon",
    description: "Borda brilhante com glow",
    icon: "✦",
  },
  {
    id: "bold",
    name: "Destaque",
    description: "Contador grande em evidência",
    icon: "▮",
  },
];

export function normalizeViewersOverlayLayout(
  value: string | undefined,
): ViewersOverlayLayout {
  if (value && VIEWERS_OVERLAY_LAYOUTS.some((l) => l.id === value)) {
    return value as ViewersOverlayLayout;
  }
  return "classic";
}
