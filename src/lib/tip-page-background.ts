import type { CSSProperties } from "react";
import type { TipPageBackgroundStyle, TipPageSettings } from "@/types";

export const BACKGROUND_GRADIENT_PRESETS = [
  { id: "studio", label: "Studio", from: "#0c4a6e", to: "#07070a" },
  { id: "sky", label: "Céu", from: "#0369a1", to: "#07070a" },
  { id: "sunset", label: "Pôr do sol", from: "#7c2d12", to: "#07070a" },
  { id: "ocean", label: "Oceano", from: "#0c4a6e", to: "#07070a" },
  { id: "rose", label: "Rosa", from: "#881337", to: "#07070a" },
  { id: "night", label: "Noite", from: "#27272a", to: "#000000" },
] as const;

export const TIP_PAGE_FONT_OPTIONS = [
  { id: "Inter", label: "Inter", value: "Inter, system-ui, sans-serif" },
  { id: "system-ui", label: "Sistema", value: "system-ui, sans-serif" },
  { id: "Georgia", label: "Serif", value: "Georgia, serif" },
  { id: "mono", label: "Monoespaçada", value: '"Courier New", monospace' },
] as const;

export const BACKGROUND_STYLE_OPTIONS: {
  id: TipPageBackgroundStyle;
  label: string;
  description: string;
}[] = [
  {
    id: "theme",
    label: "Tema",
    description: "Brilho suave na cor primária",
  },
  {
    id: "solid",
    label: "Cor sólida",
    description: "Fundo uniforme",
  },
  {
    id: "gradient",
    label: "Gradiente",
    description: "Degradê personalizado",
  },
  {
    id: "image",
    label: "Imagem",
    description: "Foto ou arte de fundo",
  },
];

export function normalizeBackgroundStyle(raw?: string): TipPageBackgroundStyle {
  if (raw === "solid" || raw === "gradient" || raw === "image" || raw === "theme") {
    return raw;
  }
  return "theme";
}

// Valores de fundo "neutros" (iguais aos defaults globais). Quando as
// configurações batem com estes, consideramos que o criador NÃO personalizou o
// fundo, então layouts temáticos podem usar o tema visual próprio. Mantidos
// como literais para evitar import circular com tip-page-defaults.
const NEUTRAL_BACKGROUND = {
  style: "theme" as TipPageBackgroundStyle,
  color: "#07070a",
  gradientFrom: "#0c4a6e",
  gradientTo: "#07070a",
};

/**
 * Retorna `true` quando o criador personalizou o fundo na aba Aparência
 * (escolheu estilo sólido/gradiente/imagem, mudou a cor base, ativou modo
 * claro ou enviou uma imagem). Layouts com tema próprio só passam a respeitar
 * as configurações de fundo quando isto é verdadeiro — assim páginas que nunca
 * mexeram no fundo continuam com o visual assinatura do layout.
 */
export function hasCustomBackground(
  settings: Pick<
    TipPageSettings,
    | "backgroundColor"
    | "backgroundStyle"
    | "backgroundGradientFrom"
    | "backgroundGradientTo"
    | "backgroundImageUrl"
    | "darkMode"
  >,
): boolean {
  return (
    normalizeBackgroundStyle(settings.backgroundStyle) !== NEUTRAL_BACKGROUND.style ||
    (settings.backgroundColor ?? NEUTRAL_BACKGROUND.color) !== NEUTRAL_BACKGROUND.color ||
    Boolean(settings.backgroundImageUrl?.trim()) ||
    settings.darkMode === false ||
    (settings.backgroundGradientFrom ?? NEUTRAL_BACKGROUND.gradientFrom) !==
      NEUTRAL_BACKGROUND.gradientFrom ||
    (settings.backgroundGradientTo ?? NEUTRAL_BACKGROUND.gradientTo) !==
      NEUTRAL_BACKGROUND.gradientTo
  );
}

export function resolveTipPageFontFamily(fontFamily: string): string {
  const found = TIP_PAGE_FONT_OPTIONS.find((f) => f.id === fontFamily);
  return found?.value ?? fontFamily;
}

/** Apenas propriedades longhand — evita conflito background vs backgroundColor no React. */
export function resolveTipPageBackground(
  settings: Pick<
    TipPageSettings,
    | "backgroundColor"
    | "backgroundStyle"
    | "backgroundGradientFrom"
    | "backgroundGradientTo"
    | "backgroundImageUrl"
    | "backgroundImageOverlay"
  >,
  themeColor: string,
  darkMode = true,
): CSSProperties {
  // Light mode: fundo claro independente do estilo configurado
  if (!darkMode) {
    const style = normalizeBackgroundStyle(settings.backgroundStyle);
    if (style === "image" && settings.backgroundImageUrl) {
      const overlay = Math.min(
        60,
        Math.max(0, settings.backgroundImageOverlay ?? 20),
      );
      return {
        backgroundColor: "#f8fafc",
        backgroundImage: `linear-gradient(rgba(255,255,255,${overlay / 100}), rgba(255,255,255,${overlay / 100})), url("${settings.backgroundImageUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      };
    }
    return {
      backgroundColor: "#f8fafc",
      backgroundImage: `radial-gradient(ellipse at top, ${themeColor}18, #f8fafc 60%)`,
      backgroundSize: "cover",
      backgroundPosition: "top center",
      backgroundAttachment: "scroll",
    };
  }

  const style = normalizeBackgroundStyle(settings.backgroundStyle);
  const base = settings.backgroundColor || "#07070a";

  if (style === "solid") {
    return {
      backgroundColor: base,
      backgroundImage: "none",
      backgroundSize: "auto",
      backgroundPosition: "initial",
      backgroundAttachment: "scroll",
    };
  }

  if (style === "gradient") {
    const from = settings.backgroundGradientFrom || "#0c4a6e";
    const to = settings.backgroundGradientTo || base;
    return {
      backgroundColor: base,
      backgroundImage: `linear-gradient(165deg, ${from} 0%, ${to} 50%, ${base} 100%)`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "scroll",
    };
  }

  if (style === "image" && settings.backgroundImageUrl) {
    const overlay = Math.min(
      90,
      Math.max(0, settings.backgroundImageOverlay ?? 45),
    );
    return {
      backgroundColor: base,
      backgroundImage: `linear-gradient(rgba(0,0,0,${overlay / 100}), rgba(0,0,0,${overlay / 100})), url("${settings.backgroundImageUrl}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    };
  }

  return {
    backgroundColor: base,
    backgroundImage: `radial-gradient(ellipse at top, ${themeColor}18, ${base} 58%)`,
    backgroundSize: "cover",
    backgroundPosition: "top center",
    backgroundAttachment: "scroll",
  };
}
