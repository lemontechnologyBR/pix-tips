import { NextResponse } from "next/server";
import { synthesizeEdgeTts } from "@/lib/tts-edge";
import {
  getTtsRuntimePrefer,
  getTtsVoice,
  resolveTtsVoiceId,
} from "@/lib/tts-config";
import {
  isElevenLabsConfigured,
  synthesizeElevenLabs,
  ElevenLabsError,
} from "@/lib/tts-elevenlabs";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

function getClientIp(request: Request): string {
  const forwarded = (request.headers as Headers).get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = (request.headers as Headers).get("x-real-ip");
  return realIp ?? "unknown";
}

export async function GET() {
  const prefer = getTtsRuntimePrefer();
  const elevenlabs = isElevenLabsConfigured() && prefer !== "edge";
  return NextResponse.json({
    available: true,
    providers: { edge: true, elevenlabs },
    prefer,
  });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimit(`tts:${ip}`, 40, 60_000)) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em breve." },
      { status: 429, headers: NO_STORE },
    );
  }

  let body: { text?: unknown; voiceId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400, headers: NO_STORE });
  }

  const text = typeof body.text === "string" ? body.text : "";
  const rawVoiceId = typeof body.voiceId === "string" ? body.voiceId : "";
  const voiceId = resolveTtsVoiceId(rawVoiceId);
  const voice = getTtsVoice(voiceId);

  if (!text.trim() || voiceId === "off") {
    return NextResponse.json(
      { error: "Parâmetros 'text' e 'voiceId' são obrigatórios" },
      { status: 400, headers: NO_STORE },
    );
  }

  const prefer = getTtsRuntimePrefer();
  const wantEleven =
    voice.provider === "elevenlabs" &&
    isElevenLabsConfigured() &&
    prefer !== "edge";

  if (wantEleven) {
    try {
      const { audio, contentType } = await synthesizeElevenLabs(text, voiceId);
      return new NextResponse(audio, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "no-store",
          "X-TTS-Provider": "elevenlabs",
          "X-TTS-Voice": voiceId,
        },
      });
    } catch (error) {
      console.error("[api/tts] elevenlabs", error);
      const msg =
        error instanceof ElevenLabsError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Falha ElevenLabs";
      return NextResponse.json(
        { error: msg },
        {
          status: error instanceof ElevenLabsError ? error.status || 502 : 502,
          headers: NO_STORE,
        },
      );
    }
  }

  if (voice.provider === "elevenlabs" && prefer === "edge") {
    // Sem ElevenLabs ativo: cair na Microsoft por gênero
    const fallback =
      voice.preferFemale === false ? "antonio" : "francisca";
    try {
      const { audio, contentType } = await synthesizeEdgeTts(text, fallback);
      return new NextResponse(audio, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "no-store",
          "X-TTS-Provider": "edge",
          "X-TTS-Voice": fallback,
          "X-TTS-Fallback-From": voiceId,
        },
      });
    } catch (error) {
      console.error("[api/tts] edge-fallback", error);
      return NextResponse.json(
        { error: "Falha ao gerar áudio TTS." },
        { status: 500, headers: NO_STORE },
      );
    }
  }

  try {
    const { audio, contentType } = await synthesizeEdgeTts(text, voiceId);
    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
        "X-TTS-Provider": "edge",
        "X-TTS-Voice": voiceId,
      },
    });
  } catch (error) {
    console.error("[api/tts] edge", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Falha ao gerar áudio Microsoft TTS.",
      },
      { status: 500, headers: NO_STORE },
    );
  }
}
