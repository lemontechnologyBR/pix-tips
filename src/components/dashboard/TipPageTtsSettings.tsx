"use client";

import { TTS_VOICES } from "@/lib/tts-config";
import { speakText } from "@/lib/tts";

const SELECTABLE_VOICES = TTS_VOICES.filter((v) => v.id !== "off");

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
  function toggleVoice(id: string) {
    if (voices.includes(id)) {
      if (voices.length <= 1) return;
      onVoicesChange(voices.filter((v) => v !== id));
    } else {
      onVoicesChange([...voices, id]);
    }
  }

  function previewVoice(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    void speakText("Olá! Essa é a minha voz na tip page.", id);
  }

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-white">Vozes no tip page</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {enabled
              ? "Seus apoiadores poderão escolher uma voz para sua mensagem"
              : "Apoiadores não verão o seletor de voz"}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <span
            className={`text-xs font-medium ${enabled ? "text-emerald-400" : "text-zinc-500"}`}
          >
            {enabled ? "Ativado" : "Desativado"}
          </span>
          <button
            type="button"
            onClick={() => onEnabledChange(!enabled)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${enabled ? "bg-cyan-500" : "bg-zinc-700"}`}
            aria-pressed={enabled}
            aria-label="Ativar vozes no tip page"
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${enabled ? "left-5" : "left-0.5"}`}
            />
          </button>
        </div>
      </div>

      {enabled && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-zinc-400">
            Escolha quais vozes ficarão disponíveis para seus apoiadores:
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SELECTABLE_VOICES.map((voice) => {
              const active = voices.includes(voice.id);
              return (
                <div
                  key={voice.id}
                  role="checkbox"
                  aria-checked={active}
                  tabIndex={0}
                  onClick={() => toggleVoice(voice.id)}
                  onKeyDown={(e) => (e.key === " " || e.key === "Enter") && toggleVoice(voice.id)}
                  className={`group relative flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 transition select-none ${
                    active
                      ? "border-cyan-500/50 bg-cyan-500/10 ring-1 ring-cyan-500/30"
                      : "border-zinc-700/60 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-800/50"
                  }`}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg"
                    style={{ backgroundColor: voice.avatarColor + "40" }}
                  >
                    {voice.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-white">
                        {voice.name}
                      </span>
                      {voice.isAi && (
                        <span className="rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30">
                          IA
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-500">{voice.subtitle}</span>
                  </div>

                  {/* Preview button */}
                  <button
                    type="button"
                    onClick={(e) => previewVoice(voice.id, e)}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md border border-zinc-600 bg-zinc-800 text-zinc-400 opacity-0 transition group-hover:opacity-100 hover:border-cyan-500/50 hover:text-cyan-300"
                    title="Ouvir prévia"
                    aria-label={`Ouvir prévia de ${voice.name}`}
                  >
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>

                  {/* Check indicator */}
                  {active && (
                    <span className="absolute right-2 bottom-2 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 group-hover:hidden">
                      <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-zinc-600">
            {voices.length === 1
              ? "Ao menos 1 voz precisa estar ativa"
              : `${voices.length} voz${voices.length > 1 ? "es" : ""} disponíve${voices.length > 1 ? "is" : "l"}`}
          </p>
        </div>
      )}
    </section>
  );
}
