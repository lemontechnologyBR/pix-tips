export type ExampleCreator = {
  id: string;
  name: string;
  username: string;
  category: "gaming" | "musica" | "arte" | "podcast" | "educacao";
  description: string;
  accent: string;
  tags: string[];
};

export const EXAMPLE_CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "gaming", label: "Gaming" },
  { id: "musica", label: "Música" },
  { id: "arte", label: "Arte" },
  { id: "podcast", label: "Podcast" },
  { id: "educacao", label: "Educação" },
] as const;

export const EXAMPLE_CREATORS: ExampleCreator[] = [
  {
    id: "1",
    name: "Luna Pixel",
    username: "demo",
    category: "gaming",
    description: "Streamer de RPG e jogos indie. Usa layout Neon com meta semanal e alertas personalizados.",
    accent: "from-violet-600 to-fuchsia-600",
    tags: ["OBS", "Meta", "Alertas"],
  },
  {
    id: "2",
    name: "DJ Carioca",
    username: "demo",
    category: "musica",
    description: "Sets ao vivo toda sexta. Layout Glass com wall de apoiadores e sugestões de valor.",
    accent: "from-cyan-600 to-violet-600",
    tags: ["Música", "Live", "Pix"],
  },
  {
    id: "3",
    name: "Arte com Manu",
    username: "demo",
    category: "arte",
    description: "Ilustração digital ao vivo com leitura de mensagens via voz IA (TTS ElevenLabs).",
    accent: "from-amber-600 to-orange-600",
    tags: ["Arte", "Voz IA", "TTS"],
  },
  {
    id: "4",
    name: "Podcast Devcast",
    username: "demo",
    category: "podcast",
    description: "Episódios semanais sobre tecnologia. Página minimalista com doações anônimas.",
    accent: "from-emerald-600 to-teal-600",
    tags: ["Podcast", "Tech", "Minimal"],
  },
  {
    id: "5",
    name: "Prof. Dev",
    username: "demo",
    category: "educacao",
    description: "Aulas gratuitas de programação. Ranking de apoiadores do mês e meta de conteúdo.",
    accent: "from-blue-600 to-indigo-600",
    tags: ["Educação", "Código", "Ranking"],
  },
  {
    id: "6",
    name: "SpeedRun Beneficente",
    username: "demo",
    category: "gaming",
    description: "Maratonas de speedrun com barra de progresso em tempo real e alertas no OBS.",
    accent: "from-rose-600 to-violet-600",
    tags: ["Gaming", "Speedrun", "OBS"],
  },
];
