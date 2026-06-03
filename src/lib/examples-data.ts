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
    description: "Streams de RPG e indies com alertas neon e meta semanal.",
    accent: "from-violet-600 to-fuchsia-600",
    tags: ["OBS", "Meta", "Pix"],
  },
  {
    id: "2",
    name: "DJ Rio Beats",
    username: "demo",
    category: "musica",
    description: "Sets ao vivo com wall de apoiadores e valores em R$ 5–50.",
    accent: "from-cyan-600 to-violet-600",
    tags: ["Música", "Live"],
  },
  {
    id: "3",
    name: "Studio Corvo",
    username: "demo",
    category: "arte",
    description: "Ilustração em tempo real com TTS nos alertas premium.",
    accent: "from-amber-600 to-orange-600",
    tags: ["Arte", "TTS"],
  },
  {
    id: "4",
    name: "Podcast Café",
    username: "demo",
    category: "podcast",
    description: "Gravações semanais com página minimalista e doações anônimas.",
    accent: "from-emerald-600 to-teal-600",
    tags: ["Podcast", "Minimal"],
  },
  {
    id: "5",
    name: "Prof. Código",
    username: "demo",
    category: "educacao",
    description: "Aulas de programação com ranking de apoiadores do mês.",
    accent: "from-blue-600 to-indigo-600",
    tags: ["Educação", "Ranking"],
  },
  {
    id: "6",
    name: "SpeedRun BR",
    username: "demo",
    category: "gaming",
    description: "Maratonas beneficentes com barra de progresso visível.",
    accent: "from-rose-600 to-violet-600",
    tags: ["Speedrun", "Beneficente"],
  },
];
