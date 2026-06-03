import { NextResponse } from "next/server";
import {
  ElevenLabsError,
  isElevenLabsConfigured,
  synthesizeElevenLabs,
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

/**
 * Informa ao client se as vozes de IA (ElevenLabs) estão disponíveis no servidor.
 */
export async function GET() {
  return NextResponse.json({ available: isElevenLabsConfigured() });
}

/**
 * Gera o áudio de uma voz de IA. Recebe { text, voiceId } e devolve audio/mpeg.
 * Quando a ElevenLabs não está configurada ou falha, retorna um status de erro
 * para que o client faça fallback para a voz do navegador.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimit(`tts:${ip}`, 20, 60_000)) {
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
  const voiceId = typeof body.voiceId === "string" ? body.voiceId : "";

  if (!text.trim() || !voiceId) {
    return NextResponse.json(
      { error: "Parâmetros 'text' e 'voiceId' são obrigatórios" },
      { status: 400, headers: NO_STORE },
    );
  }

  try {
    const { audio, contentType } = await synthesizeElevenLabs(text, voiceId);
    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof ElevenLabsError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status, headers: NO_STORE },
      );
    }
    console.error("[api/tts]", error);
    return NextResponse.json(
      { error: "Falha ao gerar áudio" },
      { status: 500, headers: NO_STORE },
    );
  }
}
