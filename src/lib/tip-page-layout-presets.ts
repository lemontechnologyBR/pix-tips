export interface TipPageLayoutPreset {
  id: string;
  name: string;
  description: string;
  /** Paleta de preview para o seletor visual */
  preview: {
    bg: string;
    accent: string;
    card: string;
    text: string;
  };
  /** Tags descritivas */
  tags: string[];
}

export const TIP_PAGE_LAYOUTS: TipPageLayoutPreset[] = [
  {
    id: "default",
    name: "Padrão",
    description: "Layout clássico centralizado com cards escuros",
    preview: { bg: "#09090b", accent: "#06b6d4", card: "#18181b", text: "#ffffff" },
    tags: ["dark", "clean"],
  },
  {
    id: "glass",
    name: "Vidro",
    description: "Painéis translúcidos com efeito glassmorphism",
    preview: { bg: "#1e1b4b", accent: "#818cf8", card: "rgba(255,255,255,0.08)", text: "#e0e7ff" },
    tags: ["dark", "modern", "blur"],
  },
  {
    id: "neon",
    name: "Neon",
    description: "Efeitos de brilho neon em fundo ultra-escuro",
    preview: { bg: "#050505", accent: "#00ffe0", card: "#0d0d0d", text: "#ffffff" },
    tags: ["dark", "cyberpunk", "glow"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Design limpo e espaçado sem bordas visíveis",
    preview: { bg: "#fafafa", accent: "#6366f1", card: "#ffffff", text: "#111827" },
    tags: ["light", "clean", "whitespace"],
  },
  {
    id: "retro",
    name: "Retro",
    description: "Estética retrô pixel com bordas e fontes clássicas",
    preview: { bg: "#0d0d0d", accent: "#f59e0b", card: "#1a1a1a", text: "#fde68a" },
    tags: ["dark", "retro", "pixel"],
  },
  {
    id: "split",
    name: "Split",
    description: "Duas colunas: perfil à esquerda e formulário à direita",
    preview: { bg: "#0f172a", accent: "#38bdf8", card: "#1e293b", text: "#f1f5f9" },
    tags: ["dark", "wide", "2-col"],
  },
  {
    id: "banner",
    name: "Banner",
    description: "Hero banner em destaque com seção de doação abaixo",
    preview: { bg: "#18181b", accent: "#a855f7", card: "#27272a", text: "#ffffff" },
    tags: ["dark", "hero", "banner"],
  },
  {
    id: "vip",
    name: "VIP",
    description: "Estilo premium com acentos dourados e fundo quente",
    preview: { bg: "#0a0500", accent: "#fbbf24", card: "#1c1004", text: "#fef3c7" },
    tags: ["dark", "gold", "premium"],
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Luzes do norte com gradientes animados e efeito onírico",
    preview: { bg: "#030712", accent: "#34d399", card: "rgba(16,24,40,0.8)", text: "#ecfdf5" },
    tags: ["dark", "animated", "dreamy"],
  },
  {
    id: "card",
    name: "Card",
    description: "Tudo dentro de um único cartão elevado com sombra",
    preview: { bg: "#e2e8f0", accent: "#6366f1", card: "#ffffff", text: "#1e293b" },
    tags: ["light", "card", "clean"],
  },
  {
    id: "studio",
    name: "Studio",
    description: "Visual de estúdio para lives profissionais",
    preview: { bg: "#0f172a", accent: "#ef4444", card: "#1e293b", text: "#f8fafc" },
    tags: ["dark", "streamer", "studio"],
  },
  {
    id: "ocean",
    name: "Oceano",
    description: "Azul profundo com ondas e atmosfera calma",
    preview: { bg: "#082f49", accent: "#38bdf8", card: "#0c4a6e", text: "#e0f2fe" },
    tags: ["dark", "blue", "calm"],
  },
  {
    id: "sakura",
    name: "Sakura",
    description: "Tema claro rosado com estética suave",
    preview: { bg: "#fff1f2", accent: "#fb7185", card: "#ffffff", text: "#881337" },
    tags: ["light", "pink", "soft"],
  },
  {
    id: "matrix",
    name: "Matrix",
    description: "Terminal verde com visual hacker",
    preview: { bg: "#020617", accent: "#22c55e", card: "#03130a", text: "#bbf7d0" },
    tags: ["dark", "terminal", "green"],
  },
  {
    id: "news",
    name: "Jornal",
    description: "Layout editorial com cara de manchete",
    preview: { bg: "#f5f5f0", accent: "#111827", card: "#ffffff", text: "#111827" },
    tags: ["light", "editorial", "classic"],
  },
  {
    id: "comic",
    name: "Comic",
    description: "Visual pop com bordas fortes e energia",
    preview: { bg: "#fef3c7", accent: "#ef4444", card: "#ffffff", text: "#111827" },
    tags: ["light", "fun", "pop"],
  },
  {
    id: "forest",
    name: "Floresta",
    description: "Verde escuro, natural e aconchegante",
    preview: { bg: "#052e16", accent: "#84cc16", card: "#14532d", text: "#ecfccb" },
    tags: ["dark", "green", "nature"],
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Gradiente quente para páginas vibrantes",
    preview: { bg: "#431407", accent: "#fb923c", card: "#7c2d12", text: "#ffedd5" },
    tags: ["dark", "orange", "warm"],
  },
  {
    id: "space",
    name: "Space",
    description: "Espaço profundo com brilho cósmico",
    preview: { bg: "#020617", accent: "#a78bfa", card: "#111827", text: "#ede9fe" },
    tags: ["dark", "cosmic", "stars"],
  },
  {
    id: "street",
    name: "Street",
    description: "Estilo urbano com contraste forte",
    preview: { bg: "#111827", accent: "#facc15", card: "#1f2937", text: "#f9fafb" },
    tags: ["dark", "urban", "bold"],
  },
];

export function getLayoutPreset(id: string): TipPageLayoutPreset {
  return TIP_PAGE_LAYOUTS.find((l) => l.id === id) ?? TIP_PAGE_LAYOUTS[0];
}
