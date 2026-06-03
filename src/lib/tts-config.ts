export type TtsVoiceId =
  | "off"
  | "ricardo-br"
  | "vitoria-br"
  | "helena-ia"
  | "rafael-ia"
  | "aurora-ia"
  | "bruno-ia"
  | "nina-ia"
  | "theo-ia"
  | "river-ia"
  | "alice-ia"
  | "eric-ia";

export type TtsProvider = "browser" | "elevenlabs";

export interface ElevenLabsVoiceSettings {
  stability: number;
  similarityBoost: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export interface TtsVoiceConfig {
  id: TtsVoiceId;
  name: string;
  subtitle: string;
  /** Emoji usado como avatar no seletor */
  emoji: string;
  /** Cor de fundo do avatar */
  avatarColor: string;
  lang: string;
  /** Provedor da voz: navegador (Web Speech API) ou ElevenLabs (IA neural) */
  provider: TtsProvider;
  /** Parâmetros usados apenas pelo provedor "browser" (speechSynthesis) */
  pitch: number;
  rate: number;
  volume: number;
  /** Preferência de gênero para seleção de voz do sistema (provider browser) */
  preferFemale?: boolean;
  /** ID da voz na ElevenLabs (obrigatório quando provider === "elevenlabs") */
  elevenLabsVoiceId?: string;
  /** Ajustes de geração da ElevenLabs */
  elevenLabsSettings?: ElevenLabsVoiceSettings;
  /** Se true, mostra badge "IA" */
  isAi: boolean;
}

export const TTS_VOICES: TtsVoiceConfig[] = [
  {
    id: "off",
    name: "Desativado",
    subtitle: "Sem leitura",
    emoji: "🔇",
    avatarColor: "#3f3f46",
    lang: "pt-BR",
    provider: "browser",
    pitch: 1,
    rate: 1,
    volume: 1,
    isAi: false,
  },
  // ─────────────── Vozes de IA (ElevenLabs, neural realista) ───────────────
  {
    id: "helena-ia",
    name: "Sarah",
    subtitle: "IA · feminina",
    emoji: "💁‍♀️",
    avatarColor: "#9d174d",
    lang: "pt-BR",
    provider: "elevenlabs",
    pitch: 1,
    rate: 1,
    volume: 1,
    elevenLabsVoiceId: "EXAVITQu4vr4xnSDxMaL",
    elevenLabsSettings: { stability: 0.45, similarityBoost: 0.8, style: 0.2, useSpeakerBoost: true },
    isAi: true,
  },
  {
    id: "rafael-ia",
    name: "Adam",
    subtitle: "IA · masculina",
    emoji: "🧔",
    avatarColor: "#1e40af",
    lang: "pt-BR",
    provider: "elevenlabs",
    pitch: 1,
    rate: 1,
    volume: 1,
    elevenLabsVoiceId: "pNInz6obpgDQGcFmaJgB",
    elevenLabsSettings: { stability: 0.5, similarityBoost: 0.8, style: 0.15, useSpeakerBoost: true },
    isAi: true,
  },
  {
    id: "aurora-ia",
    name: "Jessica",
    subtitle: "IA · animada",
    emoji: "✨",
    avatarColor: "#831843",
    lang: "pt-BR",
    provider: "elevenlabs",
    pitch: 1,
    rate: 1,
    volume: 1,
    elevenLabsVoiceId: "cgSgspJ2msm6clMCkdW9",
    elevenLabsSettings: { stability: 0.4, similarityBoost: 0.75, style: 0.35, useSpeakerBoost: true },
    isAi: true,
  },
  {
    id: "bruno-ia",
    name: "Brian",
    subtitle: "IA · locutor",
    emoji: "🎙️",
    avatarColor: "#065f46",
    lang: "pt-BR",
    provider: "elevenlabs",
    pitch: 1,
    rate: 1,
    volume: 1,
    elevenLabsVoiceId: "nPczCjzI2devNBz1zQrb",
    elevenLabsSettings: { stability: 0.55, similarityBoost: 0.85, style: 0.25, useSpeakerBoost: true },
    isAi: true,
  },
  {
    id: "nina-ia",
    name: "Liam",
    subtitle: "IA · jovem",
    emoji: "🌟",
    avatarColor: "#4c1d95",
    lang: "pt-BR",
    provider: "elevenlabs",
    pitch: 1,
    rate: 1,
    volume: 1,
    elevenLabsVoiceId: "TX3LPaxmHKxFdv7VOQHJ",
    elevenLabsSettings: { stability: 0.45, similarityBoost: 0.75, style: 0.35, useSpeakerBoost: true },
    isAi: true,
  },
  {
    id: "theo-ia",
    name: "Charlie",
    subtitle: "IA · enérgico",
    emoji: "🧑‍🎤",
    avatarColor: "#92400e",
    lang: "pt-BR",
    provider: "elevenlabs",
    pitch: 1,
    rate: 1,
    volume: 1,
    elevenLabsVoiceId: "IKne3meq5aSn9XLyUdCD",
    elevenLabsSettings: { stability: 0.45, similarityBoost: 0.8, style: 0.3, useSpeakerBoost: true },
    isAi: true,
  },
  {
    id: "river-ia",
    name: "River",
    subtitle: "IA · neutra",
    emoji: "🌊",
    avatarColor: "#0e7490",
    lang: "pt-BR",
    provider: "elevenlabs",
    pitch: 1,
    rate: 1,
    volume: 1,
    elevenLabsVoiceId: "SAz9YHcvj6GT2YYXdXww",
    elevenLabsSettings: { stability: 0.5, similarityBoost: 0.8, style: 0.2, useSpeakerBoost: true },
    isAi: true,
  },
  {
    id: "alice-ia",
    name: "Alice",
    subtitle: "IA · educadora",
    emoji: "👩‍🏫",
    avatarColor: "#166534",
    lang: "pt-BR",
    provider: "elevenlabs",
    pitch: 1,
    rate: 1,
    volume: 1,
    elevenLabsVoiceId: "Xb7hH8MSUJpSbSDYk0k2",
    elevenLabsSettings: { stability: 0.5, similarityBoost: 0.8, style: 0.2, useSpeakerBoost: true },
    isAi: true,
  },
  {
    id: "eric-ia",
    name: "Eric",
    subtitle: "IA · suave",
    emoji: "🎧",
    avatarColor: "#1e3a5f",
    lang: "pt-BR",
    provider: "elevenlabs",
    pitch: 1,
    rate: 1,
    volume: 1,
    elevenLabsVoiceId: "cjVigY5qzO86Huf0OWal",
    elevenLabsSettings: { stability: 0.5, similarityBoost: 0.85, style: 0.15, useSpeakerBoost: true },
    isAi: true,
  },
  // ─────────────── Vozes do navegador (offline, sem custo) ───────────────
  {
    id: "ricardo-br",
    name: "Ricardo",
    subtitle: "Navegador",
    emoji: "🧑",
    avatarColor: "#334155",
    lang: "pt-BR",
    provider: "browser",
    pitch: 0.95,
    rate: 1.0,
    volume: 1,
    preferFemale: false,
    isAi: false,
  },
  {
    id: "vitoria-br",
    name: "Vitória",
    subtitle: "Navegador",
    emoji: "👩",
    avatarColor: "#475569",
    lang: "pt-BR",
    provider: "browser",
    pitch: 1.25,
    rate: 1.0,
    volume: 1,
    preferFemale: true,
    isAi: false,
  },
];

export function getTtsVoice(id: TtsVoiceId | string | null): TtsVoiceConfig {
  return TTS_VOICES.find((v) => v.id === id) ?? TTS_VOICES[0];
}

export const DEFAULT_TTS_TEMPLATE = "{nome} doou {valor} reais. {mensagem}";

/** Modelo padrão da ElevenLabs (boa qualidade em pt-BR). Pode ser sobrescrito por env. */
export const DEFAULT_ELEVENLABS_MODEL = "eleven_multilingual_v2";
