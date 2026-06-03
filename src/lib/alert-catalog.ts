import type { AlertTemplateId, PlanType, SoundCategory } from "@/types";

export type TemplateCategory =
  | "classic"
  | "particles"
  | "creative"
  | "character"
  | "thematic"
  | "minimal"
  | "interactive";

export interface TemplateCatalogItem {
  id: AlertTemplateId;
  name: string;
  description: string;
  category: TemplateCategory;
  plan: PlanType;
  icon: string;
  recommendedSound: string;
}

export interface SoundCatalogItem {
  id: string;
  name: string;
  description: string;
  category: SoundCategory;
  plan: PlanType;
  duration: number;
  /** Caminho em public/ (ex.: /sounds/ncs/ncs-coin.mp3) */
  file?: string;
}

export const TEMPLATE_CATALOG: TemplateCatalogItem[] = [
  { id: "slide-up", name: "Slide Up", description: "Sobe da parte inferior", category: "classic", plan: "free", icon: "⬆️", recommendedSound: "ncs-correct" },
  { id: "slide-down", name: "Slide Down", description: "Desce do topo", category: "classic", plan: "free", icon: "⬇️", recommendedSound: "chime" },
  { id: "slide-left", name: "Slide Left", description: "Desliza da direita", category: "classic", plan: "free", icon: "⬅️", recommendedSound: "swoosh" },
  { id: "slide-right", name: "Slide Right", description: "Desliza da esquerda", category: "classic", plan: "free", icon: "➡️", recommendedSound: "swoosh" },
  { id: "fade-in", name: "Fade In", description: "Aparição suave central", category: "classic", plan: "free", icon: "✨", recommendedSound: "twinkle" },
  { id: "zoom-bounce", name: "Zoom Bounce", description: "Zoom com quique", category: "classic", plan: "free", icon: "💥", recommendedSound: "pop" },
  { id: "confetti", name: "Confete", description: "Confetes coloridos", category: "particles", plan: "free", icon: "🎉", recommendedSound: "sparkle" },
  { id: "emoji-rain", name: "Emoji Rain", description: "Chuva de emojis", category: "particles", plan: "free", icon: "💰", recommendedSound: "boing" },
  { id: "coins", name: "Moedas", description: "Moedas douradas caindo", category: "particles", plan: "pro", icon: "🪙", recommendedSound: "coin-collect" },
  { id: "stars", name: "Estrelas", description: "Explosão de estrelas", category: "particles", plan: "pro", icon: "⭐", recommendedSound: "twinkle" },
  { id: "fireworks", name: "Fogos", description: "Fogos de artifício", category: "particles", plan: "pro", icon: "🎆", recommendedSound: "orchestra-hit" },
  { id: "typewriter", name: "Typewriter", description: "Texto letra a letra", category: "creative", plan: "free", icon: "⌨️", recommendedSound: "typewriter-key" },
  { id: "glitch", name: "Glitch", description: "Distorção digital RGB", category: "creative", plan: "pro", icon: "📺", recommendedSound: "glitch-sound" },
  { id: "neon", name: "Neon", description: "Glow neon pulsante", category: "creative", plan: "pro", icon: "💜", recommendedSound: "synth-wave" },
  { id: "marquee", name: "Marquee", description: "Letreiro rolante", category: "creative", plan: "pro", icon: "📰", recommendedSound: "click" },
  { id: "split-flap", name: "Split Flap", description: "Painel aeroporto", category: "creative", plan: "pro", icon: "🛫", recommendedSound: "click" },
  { id: "mascot-enter", name: "Mascote", description: "Mascote entra e fala", category: "character", plan: "pro", icon: "🤖", recommendedSound: "robot-beep" },
  { id: "pet-companion", name: "Pet", description: "Pet reage à doação", category: "character", plan: "pro", icon: "🐶", recommendedSound: "boing" },
  { id: "ghost-reveal", name: "Fantasma", description: "Fantasma revela doador", category: "character", plan: "pro", icon: "👻", recommendedSound: "wind-chime" },
  { id: "game-achievement", name: "Achievement", description: "Conquista desbloqueada", category: "thematic", plan: "free", icon: "🏆", recommendedSound: "achievement" },
  { id: "chat-bubble", name: "Chat Bubble", description: "Balão estilo Twitch", category: "thematic", plan: "free", icon: "💬", recommendedSound: "notification" },
  { id: "spotlight", name: "Holofote", description: "Luz revela o texto", category: "thematic", plan: "pro", icon: "🔦", recommendedSound: "orchestra-hit" },
  { id: "stage-curtain", name: "Cortinas", description: "Cortinas se abrem", category: "thematic", plan: "pro", icon: "🎭", recommendedSound: "bell-chord" },
  { id: "polaroid", name: "Polaroid", description: "Foto polaroid", category: "thematic", plan: "pro", icon: "📸", recommendedSound: "camera-shutter" },
  { id: "dot", name: "Dot", description: "Círculo minimalista", category: "minimal", plan: "free", icon: "⚫", recommendedSound: "pop" },
  { id: "line", name: "Line", description: "Borda brilhante", category: "minimal", plan: "free", icon: "━", recommendedSound: "swoosh" },
  { id: "corner-badge", name: "Corner Badge", description: "Badge no canto", category: "minimal", plan: "free", icon: "🏷️", recommendedSound: "ncs-correct" },
  { id: "earthquake", name: "Earthquake", description: "Tela treme", category: "interactive", plan: "pro", icon: "🌋", recommendedSound: "thunder" },
  { id: "roulette", name: "Roleta", description: "Roleta para no valor", category: "interactive", plan: "pro", icon: "🎰", recommendedSound: "powerup" },
  { id: "kick-alert", name: "Kick", description: "Chute empurra texto", category: "interactive", plan: "pro", icon: "🦵", recommendedSound: "bonk" },
  { id: "portal", name: "Portal", description: "Portal dimensional", category: "interactive", plan: "pro", icon: "🌀", recommendedSound: "teleport" },
  { id: "default", name: "Default", description: "Alerta simples", category: "minimal", plan: "free", icon: "📋", recommendedSound: "ncs-correct" },
];

export const DEFAULT_ALERT_SOUND_ID = "ncs-correct";

/** Som efetivo do alerta: Tom Positivo, salvo que o criador tenha escolhido outro ou upload. */
export function resolveAlertSoundId(
  soundId: string | null | undefined,
  soundUrl?: string | null,
): string {
  if (soundUrl) return soundId ?? DEFAULT_ALERT_SOUND_ID;
  return soundId ?? DEFAULT_ALERT_SOUND_ID;
}

export const SOUND_CATALOG: SoundCatalogItem[] = [
  // Sem copyright — Mixkit Free License (mixkit.co/license)
  { id: "ncs-correct", name: "Tom Positivo", description: "Resposta correta — alerta clean", category: "ncs", plan: "free", duration: 1.0, file: "/sounds/ncs/ncs-correct.mp3" },
  { id: "ncs-pop", name: "Pop", description: "Pop longo estilo notificação", category: "ncs", plan: "free", duration: 1.0, file: "/sounds/ncs/ncs-pop.mp3" },
  { id: "ncs-bell", name: "Sino", description: "Sino de notificação", category: "ncs", plan: "free", duration: 3.0, file: "/sounds/ncs/ncs-bell.mp3" },
  { id: "ncs-scifi", name: "Sci-Fi Click", description: "Clique futurista", category: "ncs", plan: "free", duration: 1.0, file: "/sounds/ncs/ncs-scifi.mp3" },
  { id: "ncs-message", name: "Mensagem", description: "Pop de mensagem / alerta", category: "ncs", plan: "free", duration: 1.0, file: "/sounds/ncs/ncs-message.mp3" },
  { id: "ncs-happy", name: "Sinos Alegres", description: "Notificação alegre", category: "ncs", plan: "free", duration: 3.0, file: "/sounds/ncs/ncs-happy.mp3" },
  { id: "ncs-interface", name: "Interface", description: "Start de interface / app", category: "ncs", plan: "free", duration: 2.0, file: "/sounds/ncs/ncs-interface.mp3" },
  { id: "ncs-coin", name: "Moeda", description: "Moeda de video game", category: "ncs", plan: "free", duration: 1.0, file: "/sounds/ncs/ncs-coin.mp3" },
  { id: "ncs-level", name: "Level Up", description: "Fase completada", category: "ncs", plan: "free", duration: 3.0, file: "/sounds/ncs/ncs-level.mp3" },
  { id: "ncs-arcade", name: "Arcade", description: "Casino / arcade retro", category: "ncs", plan: "free", duration: 4.0, file: "/sounds/ncs/ncs-arcade.mp3" },
  { id: "ncs-unlock", name: "Unlock", description: "Item desbloqueado", category: "ncs", plan: "free", duration: 1.0, file: "/sounds/ncs/ncs-unlock.mp3" },
  { id: "ncs-bonus", name: "Bônus", description: "Bônus conquistado", category: "ncs", plan: "free", duration: 1.0, file: "/sounds/ncs/ncs-bonus.mp3" },
  { id: "ncs-positive", name: "Positivo", description: "Notificação positiva rápida", category: "ncs", plan: "free", duration: 4.0, file: "/sounds/ncs/ncs-positive.mp3" },
  { id: "ncs-bling", name: "Bling", description: "Achievement casino bling", category: "ncs", plan: "pro", duration: 4.0, file: "/sounds/ncs/ncs-bling.mp3" },
  { id: "ding", name: "Ding Simples", description: "Sino metálico curto", category: "classic", plan: "free", duration: 0.4 },
  { id: "double-ding", name: "Ding Duplo", description: "Dois dings em sequência", category: "classic", plan: "free", duration: 0.6 },
  { id: "bell", name: "Sino", description: "Sino de recepção", category: "classic", plan: "free", duration: 0.8 },
  { id: "bell-chord", name: "Acorde de Sino", description: "Sinos em acorde", category: "classic", plan: "free", duration: 1.2 },
  { id: "chime", name: "Carrilhão", description: "Notas subindo", category: "classic", plan: "free", duration: 1.0 },
  { id: "twinkle", name: "Brilho", description: "Brilho mágico", category: "classic", plan: "free", duration: 0.7 },
  { id: "sparkle", name: "Faísca", description: "Faísca elétrica", category: "classic", plan: "free", duration: 0.5 },
  { id: "pop", name: "Pop", description: "Estouro suave", category: "classic", plan: "free", duration: 0.3 },
  { id: "click", name: "Click", description: "Clique estilizado", category: "classic", plan: "free", duration: 0.2 },
  { id: "swoosh", name: "Swoosh", description: "Vento rápido", category: "classic", plan: "free", duration: 0.5 },
  { id: "coin-collect", name: "Moeda", description: "Moeda coletada", category: "gaming", plan: "free", duration: 0.4 },
  { id: "powerup", name: "Power Up", description: "Power-up arcade", category: "gaming", plan: "free", duration: 0.8 },
  { id: "level-up", name: "Level Up", description: "Subida de nível", category: "gaming", plan: "free", duration: 1.5 },
  { id: "achievement", name: "Conquista", description: "Achievement unlocked", category: "gaming", plan: "free", duration: 1.2 },
  { id: "combo", name: "Combo", description: "Combo!", category: "gaming", plan: "pro", duration: 0.8 },
  { id: "critical-hit", name: "Hit Crítico", description: "Impacto metálico", category: "gaming", plan: "pro", duration: 0.6 },
  { id: "victory", name: "Vitória", description: "Fanfarra triunfal", category: "gaming", plan: "pro", duration: 2.0 },
  { id: "boing", name: "Boing", description: "Mola cartoon", category: "funny", plan: "free", duration: 0.5 },
  { id: "slide-whistle", name: "Apito", description: "Apito deslizante", category: "funny", plan: "free", duration: 0.8 },
  { id: "bonk", name: "Bonk", description: "Impacto cômico", category: "funny", plan: "free", duration: 0.3 },
  { id: "sad-trombone", name: "Trombone", description: "Wah-wah-wah", category: "funny", plan: "pro", duration: 1.5 },
  { id: "airhorn", name: "Airhorn", description: "Corneta de festa", category: "funny", plan: "pro", duration: 1.0 },
  { id: "harp", name: "Harpa", description: "Glissando de harpa", category: "musical", plan: "free", duration: 1.2 },
  { id: "piano-up", name: "Piano Subindo", description: "Escala maior", category: "musical", plan: "free", duration: 1.0 },
  { id: "orchestra-hit", name: "Orquestra", description: "Impacto orquestral", category: "musical", plan: "free", duration: 1.0 },
  { id: "synth-wave", name: "Synthwave", description: "Acorde retrô", category: "musical", plan: "pro", duration: 1.5 },
  { id: "water-drop", name: "Gota", description: "Gota na água", category: "nature", plan: "free", duration: 0.5 },
  { id: "fire-crackle", name: "Fogueira", description: "Estalo de fogo", category: "nature", plan: "free", duration: 0.8 },
  { id: "thunder", name: "Trovão", description: "Trovão distante", category: "nature", plan: "pro", duration: 2.0 },
  { id: "notification", name: "Notificação", description: "Alerta de celular", category: "tech", plan: "free", duration: 0.5 },
  { id: "robot-beep", name: "Robô", description: "Beep eletrônico", category: "tech", plan: "free", duration: 0.4 },
  { id: "scanner", name: "Scanner", description: "Radar/scan", category: "tech", plan: "free", duration: 0.8 },
  { id: "glitch-sound", name: "Glitch", description: "Glitch digital", category: "tech", plan: "pro", duration: 0.6 },
  { id: "teleport", name: "Teleporte", description: "Sci-fi teleport", category: "tech", plan: "pro", duration: 1.0 },
  { id: "typewriter-key", name: "Máquina Escrever", description: "Tecla mecânica", category: "tech", plan: "pro", duration: 0.15 },
  { id: "thank-you-male", name: "Obrigado (M)", description: "Voz masculina", category: "voice", plan: "free", duration: 0.8 },
  { id: "thank-you-female", name: "Obrigado (F)", description: "Voz feminina", category: "voice", plan: "free", duration: 0.8 },
  { id: "crowd-cheer", name: "Torcida", description: "Plateia vibrando", category: "voice", plan: "pro", duration: 2.0 },
  { id: "camera-shutter", name: "Câmera", description: "Disparo de câmera", category: "classic", plan: "free", duration: 0.3 },
  { id: "wind-chime", name: "Sinos de Vento", description: "Sinos balançando", category: "nature", plan: "pro", duration: 1.5 },
];

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  classic: "Clássicos",
  particles: "Partículas",
  creative: "Texto criativo",
  character: "Personagem",
  thematic: "Temáticos",
  minimal: "Minimalistas",
  interactive: "Interativos",
};

export const SOUND_CATEGORY_LABELS: Record<SoundCategory, string> = {
  classic: "Clássicos",
  gaming: "Gaming",
  ncs: "Sem copyright",
  funny: "Engraçados",
  musical: "Musicais",
  nature: "Natureza",
  tech: "Tecnológicos",
  voice: "Vozes",
  custom: "Meus Sons",
};

export function normalizeTemplateId(id: AlertTemplateId): AlertTemplateId {
  const map: Partial<Record<AlertTemplateId, AlertTemplateId>> = {
    gif: "glitch",
    "heart-pulse": "neon",
    "neon-border": "neon",
  };
  return map[id] ?? id;
}

export function getTemplateById(id: AlertTemplateId) {
  return TEMPLATE_CATALOG.find((t) => t.id === normalizeTemplateId(id));
}

export function getSoundById(id: string) {
  return SOUND_CATALOG.find((s) => s.id === id);
}

export const RECOMMENDED_SOUND_MAP: Record<string, string> = Object.fromEntries(
  TEMPLATE_CATALOG.map((t) => [t.id, t.recommendedSound]),
);
