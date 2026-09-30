import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { getTtsVoice, resolveTtsVoiceId } from "@/lib/tts-config";

const MAX_CHARS = 300;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function resolveEdgeVoiceName(voiceId: string): string {
  const voice = getTtsVoice(resolveTtsVoiceId(voiceId));
  if (voice.edgeVoiceName) return voice.edgeVoiceName;
  if (voice.preferFemale === false) return "pt-BR-AntonioNeural";
  return "pt-BR-FranciscaNeural";
}

export function isEdgeTtsAvailable(): boolean {
  return true;
}

/**
 * TTS via Microsoft Edge Read Aloud (neural pt-BR) — sem API key.
 */
export async function synthesizeEdgeTts(
  text: string,
  voiceId: string,
): Promise<{ audio: ArrayBuffer; contentType: string }> {
  const clean = escapeXml(text.trim().slice(0, MAX_CHARS));
  if (!clean) {
    throw new Error("Texto vazio para Edge TTS.");
  }

  const voiceName = resolveEdgeVoiceName(voiceId);
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const { audioStream } = tts.toStream(clean);
  const chunks: Buffer[] = [];

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      try {
        tts.close();
      } catch {
        // ignore
      }
      reject(new Error("Timeout ao gerar áudio Edge TTS."));
    }, 25_000);

    audioStream.on("data", (chunk: Buffer | Uint8Array) => {
      chunks.push(Buffer.from(chunk));
    });
    audioStream.on("end", () => {
      clearTimeout(timer);
      resolve();
    });
    audioStream.on("close", () => {
      clearTimeout(timer);
      resolve();
    });
    audioStream.on("error", (err: Error) => {
      clearTimeout(timer);
      reject(err);
    });
  });

  try {
    tts.close();
  } catch {
    // ignore
  }

  if (chunks.length === 0) {
    throw new Error("Edge TTS não retornou áudio.");
  }

  const buf = Buffer.concat(chunks);
  return {
    audio: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
    contentType: "audio/mpeg",
  };
}
