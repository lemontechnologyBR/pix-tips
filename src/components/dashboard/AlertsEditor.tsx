"use client";

import Link from "next/link";
import { useState } from "react";
import { resolveAlertSoundId } from "@/lib/alert-catalog";
import { playCatalogSound } from "@/lib/sounds";
import type { AlertSettings, Creator } from "@/types";
import { DEFAULT_TEXT_CONFIG, DEFAULT_BACKGROUND_MEDIA } from "@/types";
import { AlertRenderer } from "@/components/widget/AlertRenderer";
import { SoundLibrary } from "./SoundLibrary";
import { TemplateGallery } from "./TemplateGallery";
import { BackgroundMediaUploader } from "./BackgroundMediaUploader";
import { TtsVoiceSelector } from "./TtsVoiceSelector";

interface AlertsEditorProps {
  creator: Creator;
  widgetUrl: string;
  embedded?: boolean;
}

export function AlertsEditor({ creator, widgetUrl, embedded = false }: AlertsEditorProps) {
  const [settings, setSettings] = useState<AlertSettings>({
    ...creator.alertSettings,
    soundId: resolveAlertSoundId(
      creator.alertSettings.soundId,
      creator.alertSettings.soundUrl,
    ),
    textConfig: creator.alertSettings.textConfig ?? DEFAULT_TEXT_CONFIG,
    backgroundMedia: creator.alertSettings.backgroundMedia ?? { ...DEFAULT_BACKGROUND_MEDIA },
  });
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [testingLive, setTestingLive] = useState(false);
  const [liveFeedback, setLiveFeedback] = useState<string | null>(null);

  const widgetPath = widgetUrl.replace(/^https?:\/\/[^/]+/, "");

  function selectTemplate(templateId: AlertSettings["templateId"]) {
    setSettings((s) => ({ ...s, templateId }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/user/alert-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
    } finally {
      setSaving(false);
    }
  }

  async function copyWidget() {
    const full =
      typeof window !== "undefined" && !widgetUrl.startsWith("http")
        ? `${window.location.origin}${widgetUrl}`
        : widgetUrl;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function testLive() {
    setTestingLive(true);
    setLiveFeedback(null);
    try {
      const saveRes = await fetch("/api/user/alert-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!saveRes.ok) throw new Error("save");

      const testRes = await fetch("/api/user/alert-settings/test", { method: "POST" });
      if (!testRes.ok) throw new Error("test");

      setLiveFeedback("Enviado ao OBS.");
      window.setTimeout(() => setLiveFeedback(null), 4000);
    } catch {
      setLiveFeedback("Verifique se o widget OBS está aberto.");
    } finally {
      setTestingLive(false);
    }
  }

  function playPreview() {
    setPreviewActive(false);
    setPreviewKey((k) => k + 1);
    requestAnimationFrame(() => {
      setPreviewActive(true);
      void playCatalogSound(settings.soundId, settings.soundUrl);
    });
    window.setTimeout(
      () => setPreviewActive(false),
      settings.duration * 1000 + 500,
    );
  }

  return (
    <div className="w-full space-y-5">
      {!embedded && (
        <div>
          <h1 className="text-xl font-bold text-white">Alertas de doação</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Escolha o template, ajuste texto e som, e use no OBS.
          </p>
        </div>
      )}

      <TemplateGallery settings={settings} onSelect={selectTemplate} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
        <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-white">Personalizar</h2>

          <div className="grid grid-cols-[1fr_3.5rem] items-end gap-3">
            <label className="block text-sm">
              <span className="text-zinc-400">Duração ({settings.duration}s)</span>
              <input
                type="range"
                min={3}
                max={10}
                value={settings.duration}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, duration: Number(e.target.value) }))
                }
                className="mt-1.5 w-full"
              />
            </label>
            <label className="block text-sm">
              <span className="text-zinc-400">Cor</span>
              <input
                type="color"
                value={settings.textConfig.color}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    textConfig: { ...s.textConfig, color: e.target.value },
                  }))
                }
                className="mt-1.5 h-9 w-full cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950"
              />
            </label>
          </div>

          {/* Estilo do Texto */}
          <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
            <p className="text-xs font-medium text-zinc-400">Estilo do Texto</p>

            {/* Tamanho da fonte */}
            <label className="block text-sm">
              <span className="text-zinc-400">Tamanho ({settings.textConfig.fontSize}px)</span>
              <input
                type="range"
                min={12}
                max={64}
                value={settings.textConfig.fontSize}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    textConfig: { ...s.textConfig, fontSize: Number(e.target.value) },
                  }))
                }
                className="mt-1.5 w-full"
              />
            </label>

            {/* Família da fonte */}
            <label className="block text-sm">
              <span className="text-zinc-400">Fonte</span>
              <select
                value={settings.textConfig.fontFamily}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    textConfig: { ...s.textConfig, fontFamily: e.target.value },
                  }))
                }
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              >
                <option value="system-ui, sans-serif">Sistema</option>
                <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
                <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Impact, sans-serif">Impact</option>
                <option value="'Comic Sans MS', cursive">Comic Sans</option>
              </select>
            </label>

            {/* Peso da fonte */}
            <div className="text-sm">
              <span className="text-zinc-400">Peso</span>
              <div className="mt-1.5 flex gap-1.5">
                {(["normal", "bold", "black"] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() =>
                      setSettings((s) => ({
                        ...s,
                        textConfig: { ...s.textConfig, fontWeight: w },
                      }))
                    }
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-xs capitalize transition ${
                      settings.textConfig.fontWeight === w
                        ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-300"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                    }`}
                    style={{
                      fontWeight: w === "black" ? 900 : w === "bold" ? 700 : 400,
                    }}
                  >
                    {w === "normal" ? "Normal" : w === "bold" ? "Bold" : "Black"}
                  </button>
                ))}
              </div>
            </div>

            {/* Estilo itálico + Alinhamento */}
            <div className="flex items-end gap-3">
              <div className="text-sm">
                <span className="text-zinc-400">Estilo</span>
                <div className="mt-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((s) => ({
                        ...s,
                        textConfig: {
                          ...s.textConfig,
                          fontStyle:
                            s.textConfig.fontStyle === "italic" ? "normal" : "italic",
                        },
                      }))
                    }
                    className={`rounded-lg border px-3 py-1.5 text-xs italic transition ${
                      settings.textConfig.fontStyle === "italic"
                        ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-300"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                    }`}
                  >
                    Itálico
                  </button>
                </div>
              </div>

              <div className="flex-1 text-sm">
                <span className="text-zinc-400">Alinhamento</span>
                <div className="mt-1.5 flex gap-1.5">
                  {(
                    [
                      { value: "left", label: "←" },
                      { value: "center", label: "↔" },
                      { value: "right", label: "→" },
                    ] as const
                  ).map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setSettings((s) => ({
                          ...s,
                          textConfig: { ...s.textConfig, alignment: value },
                        }))
                      }
                      className={`flex-1 rounded-lg border py-1.5 text-sm transition ${
                        settings.textConfig.alignment === value
                          ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-300"
                          : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <label className="block text-sm">
            <span className="text-zinc-400">Texto do alerta</span>
            <input
              value={settings.textTemplate}
              onChange={(e) =>
                setSettings((s) => ({ ...s, textTemplate: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {["{nome}", "{valor}", "{mensagem}"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() =>
                    setSettings((s) => ({
                      ...s,
                      textTemplate: `${s.textTemplate} ${v}`.trim(),
                    }))
                  }
                  className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] text-cyan-300 hover:bg-zinc-700"
                >
                  {v}
                </button>
              ))}
            </div>
          </label>

          <div className="border-t border-zinc-800/80 pt-4">
            <p className="mb-2 text-xs font-medium text-zinc-500">Som do alerta</p>
            <SoundLibrary
              selectedId={settings.soundId}
              selectedUrl={settings.soundUrl}
              onSelect={({ soundId, soundUrl }) =>
                setSettings((s) => ({ ...s, soundId, soundUrl }))
              }
            />
          </div>

          <TtsVoiceSelector
            enabled={settings.ttsEnabled}
            voiceId={settings.ttsVoiceId}
            template={settings.ttsTemplate}
            onEnabledChange={(v) => setSettings((s) => ({ ...s, ttsEnabled: v }))}
            onVoiceChange={(id) => setSettings((s) => ({ ...s, ttsVoiceId: id }))}
            onTemplateChange={(t) => setSettings((s) => ({ ...s, ttsTemplate: t }))}
          />

          <BackgroundMediaUploader
            settings={settings}
            onChange={(backgroundMedia) =>
              setSettings((s) => ({ ...s, backgroundMedia }))
            }
          />

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg web3-btn-primary py-2.5 text-sm font-semibold hover:brightness-110 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar alerta"}
          </button>
        </section>

        <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-zinc-400">Preview</p>
              {previewActive && (
                <span className="text-[10px] text-cyan-400">Reproduzindo…</span>
              )}
            </div>

            <div className="relative mt-2 aspect-video max-h-60 w-full overflow-hidden rounded-lg border border-zinc-800 bg-black xl:max-h-64">
              {!previewActive &&
                settings.backgroundMedia.useBackgroundMedia &&
                settings.backgroundMedia.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.backgroundMedia.url}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-30"
                />
              ) : !previewActive ? (
                <p className="absolute inset-0 flex items-center justify-center text-[11px] text-zinc-600">
                  Toque em testar abaixo
                </p>
              ) : null}
              {previewActive && (
                <AlertRenderer
                  key={previewKey}
                  contained
                  alert={{
                    name: "Fulano",
                    amount: 10,
                    message: "Mensagem de teste",
                    templateId: settings.templateId,
                    soundId: settings.soundId,
                    soundUrl: settings.soundUrl,
                    textConfig: settings.textConfig,
                    backgroundMedia: settings.backgroundMedia.useBackgroundMedia
                      ? settings.backgroundMedia
                      : null,
                  }}
                  duration={settings.duration}
                  textTemplate={settings.textTemplate}
                  textConfig={settings.textConfig}
                  onComplete={() => setPreviewActive(false)}
                />
              )}
            </div>

            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={playPreview}
                disabled={previewActive || testingLive}
                className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-2 py-2 text-xs font-medium text-cyan-100 hover:bg-cyan-500/20 disabled:opacity-50"
              >
                Testar aqui
              </button>
              <button
                type="button"
                onClick={testLive}
                disabled={previewActive || testingLive}
                className="rounded-lg bg-emerald-600 px-2 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {testingLive ? "…" : "Testar OBS"}
              </button>
            </div>
            {liveFeedback && (
              <p
                className={`mt-1.5 text-[10px] leading-snug ${
                  liveFeedback.startsWith("Enviado")
                    ? "text-emerald-400"
                    : "text-amber-400"
                }`}
              >
                {liveFeedback}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
            <p className="text-xs font-medium text-zinc-400">Widget OBS</p>
            <p
              className="mt-1.5 truncate rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1.5 font-mono text-[10px] text-zinc-500"
              title={widgetUrl}
            >
              {widgetPath}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={copyWidget}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                  copied
                    ? "border-emerald-500/50 bg-emerald-600/15 text-emerald-300"
                    : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                }`}
              >
                {copied ? "Copiado!" : "Copiar"}
              </button>
              <Link
                href={widgetPath}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-lg border border-zinc-700 px-2 py-2 text-xs text-zinc-300 hover:border-zinc-500"
              >
                Abrir
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
