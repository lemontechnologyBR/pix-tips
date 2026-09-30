"use client";

import { useMemo } from "react";
import {
  TTS_VOICES,
  resolveTtsVoiceId,
  type TtsVoiceConfig,
} from "@/lib/tts-config";
import { speakText } from "@/lib/tts";

interface TipPageTtsSettingsProps {
  enabled: boolean;
  voices: string[];
  onEnabledChange: (v: boolean) => void;
  onVoicesChange: (v: string[]) => void;
}

export function TipPageTtsSettings({
  enabled,
  voices,
  onEnabledChange,
  onVoicesChange,
}: TipPageTtsSettingsProps) {
  const selectable = useMemo(
    () => TTS_VOICES.filter((v) => v.id !== "off"),
    [],
  );

  const resolvedVoices = [
    ...new Set(
      voices
        .map((v) => resolveTtsVoiceId(v))
        .filter((v) => v !== "off" && selectable.some((s) => s.id === v)),
    ),
  ];

  function toggleVoice(id: string) {
    const canonical = resolveTtsVoiceId(id);
    if (canonical === "off") return;
    if (resolvedVoices.includes(canonical)) {
      if (resolvedVoices.length <= 1) return;
      onVoicesChange(resolvedVoices.filter((v) => v !== canonical));
    } else {
      onVoicesChange([...resolvedVoices, canonical]);
    }
  }

  function previewVoice(voice: TtsVoiceConfig, e: React.MouseEvent) {
    e.stopPropagation();
    void speakText(
      `Olá! Eu sou ${voice.name}. Assim fica a leitura na tip page.`,
      voice.id,
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-white">Vozes no tip page</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {enabled
              ? "Vozes neurais Microsoft — 100% grátis, sem API key"
              : "Apoiadores não verão o seletor de voz"}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <span
            className={`text-xs font-medium ${enabled ? "text-sky-400" : "text-zinc-500"}`}
          >
            {enabled ? "Ativado" : "Desativado"}
          </span>
          <button
            type="button"
            onClick={() => onEnabledChange(!enabled)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${enabled ? "bg-cyan-500" : "bg-zinc-700"}`}
            aria-pressed={enabled}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${enabled ? "left-5" : "left-0.5"}`}
            />
          </button>
        </div>
      </div>

      {enabled && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {selectable.map((voice) => {
              const active = resolvedVoices.includes(voice.id);
              return (
                <div
                  key={voice.id}
                  role="checkbox"
                  aria-checked={active}
                  tabIndex={0}
                  onClick={() => toggleVoice(voice.id)}
                  onKeyDown={(e) =>
                    (e.key === " " || e.key === "Enter") && toggleVoice(voice.id)
                  }
                  className={`group relative flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition select-none ${
                    active
                      ? "border-sky-400/35 bg-cyan-500/10 ring-1 ring-cyan-500/30"
                      : "border-zinc-700/60 bg-zinc-900/50 hover:border-zinc-600"
                  }`}
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                    style={{ backgroundColor: voice.avatarColor + "40" }}
                  >
                    {voice.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-white">
                        {voice.name}
                      </span>
                      <span className="rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/30">
                        grátis
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400">{voice.subtitle}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => previewVoice(voice, e)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-600 bg-zinc-800 text-zinc-300 hover:border-sky-400/40 hover:text-sky-300"
                    aria-label={`Ouvir ${voice.name}`}
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-zinc-600">
            {resolvedVoices.length} voz(es) ativa(s)
          </p>
        </div>
      )}
    </section>
  );
}
