export type TtsVoiceId =
  | "off"
  | "francisca"
  | "antonio"
  | "thalita"
  | "raquel"
  | "duarte"
  | "ava"
  | "emma"
  | "andrew"
  | "brian"
  | "vivienne"
  | "remy"
  // Aliases legados (ElevenLabs / nomes antigos) — resolvidos em TTS_VOICE_ALIASES
  | "helena-ia"
  | "rafael-ia"
  | "aurora-ia"
  | "bruno-ia"
  | "nina-ia"
  | "theo-ia"
  | "river-ia"
  | "alice-ia"
  | "eric-ia"
  | "ricardo-br"
  | "vitoria-br"
  | "brenda"
  | "donato"
  | "elza"
  | "fabio"
  | "giovanna"
  | "humberto"
  | "leila"
  | "leticia"
  | "manuela";

export type TtsProvider = "edge" | "browser" | "elevenlabs";

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
  emoji: string;
  avatarColor: string;
  lang: string;
  provider: TtsProvider;
  pitch: number;
  rate: number;
  volume: number;
  preferFemale?: boolean;
  edgeVoiceName?: string;
  elevenLabsVoiceId?: string;
  elevenLabsSettings?: ElevenLabsVoiceSettings;
  isMicrosoft: boolean;
  /** @deprecated use isMicrosoft / provider */
  isAi: boolean;
}

/**
 * IDs legados → vozes Edge reais (gratuitas).
 * Nunca inventar ShortName inexistente no Edge.
 */
export const TTS_VOICE_ALIASES: Record<string, TtsVoiceId> = {
  // Nomes inventados antigos → pt-BR
  brenda: "francisca",
  elza: "francisca",
  giovanna: "francisca",
  leila: "francisca",
  leticia: "francisca",
  manuela: "francisca",
  donato: "antonio",
  fabio: "antonio",
  humberto: "antonio",
  "ricardo-br": "antonio",
  "vitoria-br": "francisca",
  // Antigas “IA ElevenLabs” → multilíngues Microsoft grátis
  "helena-ia": "ava",
  "rafael-ia": "andrew",
  "aurora-ia": "emma",
  "bruno-ia": "brian",
  "nina-ia": "vivienne",
  "theo-ia": "remy",
  "river-ia": "thalita",
  "alice-ia": "raquel",
  "eric-ia": "duarte",
};

const EDGE_DEFAULTS = {
  pitch: 1,
  rate: 1,
  volume: 1,
  lang: "pt-BR" as const,
  provider: "edge" as const,
  isMicrosoft: true,
  isAi: true,
};

/**
 * Catálogo 100% gratuito via Microsoft Edge Read Aloud (neural).
 * ShortNames verificados em runtime com msedge-tts.getVoices().
 * ElevenLabs (pago) fica fora do catálogo padrão — só se reativar no futuro.
 */
export const TTS_VOICES: TtsVoiceConfig[] = [
  {
    id: "off",
    name: "Desativado",
    subtitle: "Sem leitura",
    emoji: "🔇",
    avatarColor: "#3f3f46",
    provider: "edge",
    isMicrosoft: false,
    isAi: false,
    pitch: 1,
    rate: 1,
    volume: 1,
    lang: "pt-BR",
  },
  {
    id: "francisca",
    name: "Francisca",
    subtitle: "Brasil · feminina · grátis",
    emoji: "👩",
    avatarColor: "#be185d",
    preferFemale: true,
    edgeVoiceName: "pt-BR-FranciscaNeural",
    ...EDGE_DEFAULTS,
  },
  {
    id: "antonio",
    name: "Antônio",
    subtitle: "Brasil · masculina · grátis",
    emoji: "🧔",
    avatarColor: "#1d4ed8",
    preferFemale: false,
    edgeVoiceName: "pt-BR-AntonioNeural",
    ...EDGE_DEFAULTS,
  },
  {
    id: "thalita",
    name: "Thalita",
    subtitle: "Brasil · multilíngue · grátis",
    emoji: "✨",
    avatarColor: "#7c3aed",
    preferFemale: true,
    edgeVoiceName: "pt-BR-ThalitaMultilingualNeural",
    ...EDGE_DEFAULTS,
  },
  {
    id: "raquel",
    name: "Raquel",
    subtitle: "Portugal · feminina · grátis",
    emoji: "🎤",
    avatarColor: "#9d174d",
    preferFemale: true,
    edgeVoiceName: "pt-PT-RaquelNeural",
    lang: "pt-PT",
    pitch: 1,
    rate: 1,
    volume: 1,
    provider: "edge",
    isMicrosoft: true,
    isAi: true,
  },
  {
    id: "duarte",
    name: "Duarte",
    subtitle: "Portugal · masculina · grátis",
    emoji: "🎙️",
    avatarColor: "#1e3a8a",
    preferFemale: false,
    edgeVoiceName: "pt-PT-DuarteNeural",
    lang: "pt-PT",
    pitch: 1,
    rate: 1,
    volume: 1,
    provider: "edge",
    isMicrosoft: true,
    isAi: true,
  },
  {
    id: "ava",
    name: "Ava",
    subtitle: "Multilíngue · feminina · grátis",
    emoji: "🌐",
    avatarColor: "#86198f",
    preferFemale: true,
    edgeVoiceName: "en-US-AvaMultilingualNeural",
    ...EDGE_DEFAULTS,
  },
  {
    id: "emma",
    name: "Emma",
    subtitle: "Multilíngue · suave · grátis",
    emoji: "💫",
    avatarColor: "#9a3412",
    preferFemale: true,
    edgeVoiceName: "en-US-EmmaMultilingualNeural",
    ...EDGE_DEFAULTS,
  },
  {
    id: "andrew",
    name: "Andrew",
    subtitle: "Multilíngue · masculina · grátis",
    emoji: "🗣️",
    avatarColor: "#065f46",
    preferFemale: false,
    edgeVoiceName: "en-US-AndrewMultilingualNeural",
    ...EDGE_DEFAULTS,
  },
  {
    id: "brian",
    name: "Brian",
    subtitle: "Multilíngue · locutor · grátis",
    emoji: "📻",
    avatarColor: "#1e293b",
    preferFemale: false,
    edgeVoiceName: "en-US-BrianMultilingualNeural",
    ...EDGE_DEFAULTS,
  },
  {
    id: "vivienne",
    name: "Vivienne",
    subtitle: "Multilíngue · FR · grátis",
    emoji: "🎧",
    avatarColor: "#0e7490",
    preferFemale: true,
    edgeVoiceName: "fr-FR-VivienneMultilingualNeural",
    ...EDGE_DEFAULTS,
  },
  {
    id: "remy",
    name: "Rémy",
    subtitle: "Multilíngue · FR · grátis",
    emoji: "🎬",
    avatarColor: "#334155",
    preferFemale: false,
    edgeVoiceName: "fr-FR-RemyMultilingualNeural",
    ...EDGE_DEFAULTS,
  },
];

export function resolveTtsVoiceId(id: string | null | undefined): TtsVoiceId {
  if (!id || id === "off") return "off";
  if (TTS_VOICE_ALIASES[id]) return TTS_VOICE_ALIASES[id];
  if (TTS_VOICES.some((v) => v.id === id)) return id as TtsVoiceId;
  return "off";
}

export function getTtsVoice(id: TtsVoiceId | string | null): TtsVoiceConfig {
  const resolved = resolveTtsVoiceId(id);
  return TTS_VOICES.find((v) => v.id === resolved) ?? TTS_VOICES[0];
}

export const SELECTABLE_TTS_VOICES = TTS_VOICES.filter((v) => v.id !== "off");

export const MICROSOFT_TTS_VOICES = SELECTABLE_TTS_VOICES.filter((v) => v.isMicrosoft);

/** Mantido por compat — catálogo padrão não inclui ElevenLabs (pago). */
export const ELEVENLABS_TTS_VOICES = SELECTABLE_TTS_VOICES.filter(
  (v) => v.provider === "elevenlabs",
);

export const DEFAULT_TTS_VOICE_ID: TtsVoiceId = "francisca";

export const DEFAULT_TTS_TEMPLATE = "{nome} doou {valor} reais. {mensagem}";

export const DEFAULT_ELEVENLABS_MODEL = "eleven_multilingual_v2";

export function getTtsRuntimePrefer(): "edge" | "elevenlabs" | "auto" {
  const raw = (process.env.TTS_PROVIDER ?? "edge").trim().toLowerCase();
  if (raw === "elevenlabs" || raw === "auto" || raw === "edge") return raw;
  return "edge";
}
