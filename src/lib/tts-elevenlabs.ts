import { DEFAULT_ELEVENLABS_MODEL, getTtsVoice } from "@/lib/tts-config";

const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";
const MAX_CHARS = 300;

export interface ElevenLabsResult {
  audio: ArrayBuffer;
  contentType: string;
}

export class ElevenLabsError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ElevenLabsError";
    this.status = status;
  }
}

export function isElevenLabsConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY?.trim());
}

/**
 * Gera o áudio (MP3) de um texto usando a API de Text-to-Speech da ElevenLabs.
 * Lança ElevenLabsError em caso de configuração ausente ou falha da API.
 */
export async function synthesizeElevenLabs(
  text: string,
  voiceId: string,
): Promise<ElevenLabsResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    throw new ElevenLabsError("ELEVENLABS_API_KEY não configurada", 503);
  }

  const voice = getTtsVoice(voiceId);
  if (voice.provider !== "elevenlabs" || !voice.elevenLabsVoiceId) {
    throw new ElevenLabsError("Voz não é uma voz de IA da ElevenLabs", 400);
  }

  const clean = text.trim().slice(0, MAX_CHARS);
  if (!clean) {
    throw new ElevenLabsError("Texto vazio", 400);
  }

  const modelId = process.env.ELEVENLABS_MODEL_ID?.trim() || DEFAULT_ELEVENLABS_MODEL;
  const settings = voice.elevenLabsSettings ?? {
    stability: 0.5,
    similarityBoost: 0.8,
  };

  const res = await fetch(
    `${ELEVENLABS_BASE}/text-to-speech/${voice.elevenLabsVoiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: clean,
        model_id: modelId,
        voice_settings: {
          stability: settings.stability,
          similarity_boost: settings.similarityBoost,
          style: settings.style ?? 0,
          use_speaker_boost: settings.useSpeakerBoost ?? true,
        },
      }),
      cache: "no-store",
    },
  );

  if (!res.ok) {
    let detail = `ElevenLabs respondeu ${res.status}`;
    try {
      const body = await res.json();
      detail = body?.detail?.message ?? body?.detail ?? detail;
    } catch {
      // resposta não-JSON, mantém detalhe padrão
    }
    throw new ElevenLabsError(
      typeof detail === "string" ? detail : JSON.stringify(detail),
      res.status,
    );
  }

  const audio = await res.arrayBuffer();
  return { audio, contentType: "audio/mpeg" };
}
