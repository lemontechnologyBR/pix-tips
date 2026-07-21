"use client";

import type { TtsVoiceConfig } from "@/lib/tts-config";
import { getTtsVoice } from "@/lib/tts-config";

let selectedVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices();
}

function findBestVoice(
  lang: string,
  preferFemale?: boolean,
): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  const langVoices = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(lang.toLowerCase().replace("-", "_").slice(0, 2)),
  );

  if (langVoices.length === 0) {
    // fallback: any voice with "portugu" in name
    const ptVoices = voices.filter((v) =>
      v.name.toLowerCase().includes("portugu") ||
      v.name.toLowerCase().includes("brasil"),
    );
    if (ptVoices.length > 0) return ptVoices[0];
    return voices[0] ?? null;
  }

  if (preferFemale === true) {
    const female = langVoices.find(
      (v) =>
        v.name.toLowerCase().includes("female") ||
        v.name.toLowerCase().includes("vitoria") ||
        v.name.toLowerCase().includes("vitória") ||
        v.name.toLowerCase().includes("francisca") ||
        v.name.toLowerCase().includes("camila"),
    );
    if (female) return female;
  }

  if (preferFemale === false) {
    const male = langVoices.find(
      (v) =>
        v.name.toLowerCase().includes("male") ||
        v.name.toLowerCase().includes("ricardo") ||
        v.name.toLowerCase().includes("daniel"),
    );
    if (male) return male;
  }

  return langVoices[0];
}

let currentAudio: HTMLAudioElement | null = null;

function stopAudio() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.src = "";
    } catch {
      // ignore
    }
    currentAudio = null;
  }
}

/** Cancela qualquer leitura em andamento (navegador ou áudio de IA) */
export function cancelTts() {
  stopAudio();
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

/**
 * Toca a voz de IA (ElevenLabs) gerada no servidor. Retorna `true` se
 * conseguiu reproduzir o áudio até o fim, ou `false` para que o chamador
 * faça fallback para a voz do navegador.
 */
async function playElevenLabsAudio(
  text: string,
  voiceId: string,
  volume: number,
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voiceId }),
    });
    if (!res.ok) {
      console.warn(`[tts] /api/tts respondeu ${res.status} — usando voz do navegador`);
      return false;
    }
    const blob = await res.blob();
    if (!blob.size) return false;

    const url = URL.createObjectURL(blob);
    return await new Promise<boolean>((resolve) => {
      stopAudio();
      const audio = new Audio(url);
      currentAudio = audio;
      audio.volume = Math.min(1, Math.max(0, volume));

      const cleanup = () => {
        URL.revokeObjectURL(url);
        if (currentAudio === audio) currentAudio = null;
      };
      audio.onended = () => {
        cleanup();
        resolve(true);
      };
      audio.onerror = () => {
        console.warn("[tts] erro ao reproduzir áudio da voz de IA");
        cleanup();
        resolve(false);
      };
      audio.play().catch((err) => {
        console.warn("[tts] reprodução bloqueada pelo navegador:", err?.name ?? err);
        cleanup();
        resolve(false);
      });
    });
  } catch (err) {
    console.warn("[tts] falha ao buscar áudio da voz de IA:", err);
    return false;
  }
}

/** Lê o texto usando a voz do navegador (Web Speech API) */
function speakBrowser(text: string, config: TtsVoiceConfig): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = config.lang;
    utterance.pitch = config.pitch;
    utterance.rate = config.rate;
    utterance.volume = config.volume;

    const trySpeak = () => {
      const voice = findBestVoice(config.lang, config.preferFemale);
      if (voice) utterance.voice = voice;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      // Chrome bug: speechSynthesis can get stuck — keep it alive
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };

    const voices = loadVoices();
    if (voices.length > 0 || voicesLoaded) {
      trySpeak();
    } else {
      voicesLoaded = true;
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        trySpeak();
      };
      // Safety fallback if event never fires
      setTimeout(trySpeak, 300);
    }
  });
}

/**
 * Lê o texto em voz alta. Vozes de IA (ElevenLabs) são geradas no servidor e
 * tocadas como áudio; se a API não estiver disponível, faz fallback automático
 * para a voz equivalente do navegador.
 */
export async function speakText(text: string, voiceId: string): Promise<void> {
  if (typeof window === "undefined") return;

  const config: TtsVoiceConfig = getTtsVoice(voiceId);
  if (config.id === "off") return;

  cancelTts();

  if (config.provider === "elevenlabs") {
    const ok = await playElevenLabsAudio(text, voiceId, config.volume);
    if (ok) return;
    // Fallback: lê com a voz do navegador caso a IA falhe/indisponível
  }

  return speakBrowser(text, config);
}

/** Substitui variáveis no template TTS */
export function resolveTtsTemplate(
  template: string,
  name: string,
  amount: number,
  message: string,
): string {
  const valor = amount.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return template
    .replace(/\{nome\}/gi, name)
    .replace(/\{valor\}/gi, valor)
    .replace(/\{mensagem\}/gi, message || "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
