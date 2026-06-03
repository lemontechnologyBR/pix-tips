"use client";

import { useRef } from "react";
import { TTS_VOICES, DEFAULT_TTS_TEMPLATE, type TtsVoiceId } from "@/lib/tts-config";
import { speakText, resolveTtsTemplate } from "@/lib/tts";

interface TtsVoiceSelectorProps {
  enabled: boolean;
  voiceId: string;
  template: string;
  onEnabledChange: (v: boolean) => void;
  onVoiceChange: (id: string) => void;
  onTemplateChange: (t: string) => void;
}

export function TtsVoiceSelector({
  enabled,
  voiceId,
  template,
  onEnabledChange,
  onVoiceChange,
  onTemplateChange,
}: TtsVoiceSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function handlePreview(id: TtsVoiceId) {
    if (id === "off") return;
    const text = resolveTtsTemplate(
      template || DEFAULT_TTS_TEMPLATE,
      "Fulano",
      10,
      "Teste na live!",
    );
    void speakText(text, id);
  }

  return (
    <div className="space-y-3 border-t border-zinc-800/80 pt-4">
      {/* Header row with toggle */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-zinc-300">Voz leitora da mensagem</p>
          <p className="text-[11px] text-zinc-500">
            Lê o nome, valor e mensagem da doação em voz alta no OBS
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onEnabledChange(!enabled)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            enabled ? "bg-cyan-600" : "bg-zinc-700"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
              enabled ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <>
          {/* Voice grid */}
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {TTS_VOICES.map((voice) => {
              const isSelected = voiceId === voice.id;
              return (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => {
                    onVoiceChange(voice.id);
                    if (voice.id !== "off") handlePreview(voice.id as TtsVoiceId);
                  }}
                  className={`group flex shrink-0 flex-col items-center gap-1.5 rounded-xl border p-2.5 transition ${
                    isSelected
                      ? "border-cyan-500/60 bg-cyan-500/10"
                      : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600"
                  }`}
                  style={{ scrollSnapAlign: "start", minWidth: 72 }}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition ${
                      isSelected ? "ring-2 ring-cyan-400 ring-offset-1 ring-offset-zinc-950" : ""
                    }`}
                    style={{ backgroundColor: voice.avatarColor }}
                  >
                    {voice.emoji}
                  </div>

                  {/* Name */}
                  <p
                    className={`text-center text-[11px] font-medium leading-tight ${
                      isSelected ? "text-cyan-300" : "text-zinc-300"
                    }`}
                  >
                    {voice.name}
                    {"\n"}
                    <span className={isSelected ? "text-cyan-500" : "text-zinc-500"}>
                      {voice.subtitle}
                    </span>
                  </p>

                  {/* Selected indicator */}
                  {isSelected && voice.id !== "off" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Preview button */}
          {voiceId !== "off" && (
            <button
              type="button"
              onClick={() => handlePreview(voiceId as TtsVoiceId)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 py-2 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Testar voz selecionada
            </button>
          )}

          {/* TTS Template */}
          <div>
            <label className="mb-1 block text-[11px] font-medium text-zinc-500">
              Texto lido (variáveis: {"{nome}"} {"{valor}"} {"{mensagem}"})
            </label>
            <input
              type="text"
              value={template}
              onChange={(e) => onTemplateChange(e.target.value)}
              placeholder={DEFAULT_TTS_TEMPLATE}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 placeholder-zinc-600 outline-none focus:border-zinc-500"
            />
          </div>
        </>
      )}
    </div>
  );
}
