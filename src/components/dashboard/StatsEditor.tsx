"use client";

import { useState } from "react";
import { resolveAlertSoundId } from "@/lib/alert-catalog";
import { GOAL_OVERLAY_POSITIONS } from "@/lib/goal-overlay-position";
import type { AlertSettings, Creator } from "@/types";
import { DEFAULT_TEXT_CONFIG, DEFAULT_BACKGROUND_MEDIA } from "@/types";
import { StatsOverlay } from "@/components/widget/StatsOverlay";
import { WidgetObsPanel, WidgetPositionPicker } from "./WidgetObsPanel";

interface StatsEditorProps {
  creator: Creator;
  widgetUrl: string;
}

export function StatsEditor({ creator, widgetUrl }: StatsEditorProps) {
  const [settings, setSettings] = useState<Pick<
    AlertSettings,
    | "statsPosition"
    | "statsLayout"
    | "statsLabel"
    | "statsCountLabel"
    | "statsBgColor"
    | "statsTextColor"
    | "statsFontSize"
  >>({
    statsPosition: creator.alertSettings.statsPosition,
    statsLayout: creator.alertSettings.statsLayout ?? "classic",
    statsLabel: creator.alertSettings.statsLabel ?? "Doações na live",
    statsCountLabel: creator.alertSettings.statsCountLabel ?? "doações",
    statsBgColor: creator.alertSettings.statsBgColor ?? null,
    statsTextColor: creator.alertSettings.statsTextColor ?? null,
    statsFontSize: creator.alertSettings.statsFontSize ?? 16,
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/alert-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...creator.alertSettings,
          soundId: resolveAlertSoundId(
            creator.alertSettings.soundId,
            creator.alertSettings.soundUrl,
          ),
          textConfig: creator.alertSettings.textConfig ?? DEFAULT_TEXT_CONFIG,
          backgroundMedia:
            creator.alertSettings.backgroundMedia ?? DEFAULT_BACKGROUND_MEDIA,
          ...settings,
        }),
      });
      if (res.ok) {
        setToast("Configurações salvas!");
        setTimeout(() => setToast(null), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full space-y-5">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)]">
        <div className="space-y-4">
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h2 className="font-semibold text-white">Contador da live</h2>
            <p className="text-sm text-zinc-400">
              Mostra quantidade de doações e total arrecadado desde que a fonte OBS foi aberta.
              Reinicia ao recarregar o widget.
            </p>
            <WidgetPositionPicker
              value={settings.statsPosition}
              onChange={(statsPosition) =>
                setSettings((s) => ({
                  ...s,
                  statsPosition: statsPosition as typeof settings.statsPosition,
                }))
              }
            />
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h2 className="font-semibold text-white">Aparência</h2>

            <div>
              <p className="text-xs text-zinc-500">Layout</p>
              <div className="mt-2 flex gap-2">
                {(["classic", "compact", "minimal"] as const).map((opt) => {
                  const labels = { classic: "Clássico", compact: "Compacto", minimal: "Minimal" };
                  const active = settings.statsLayout === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, statsLayout: opt }))}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                        active
                          ? "border-cyan-500 bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-500/40"
                          : "border-zinc-700 bg-zinc-950/60 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {labels[opt]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs text-zinc-500">Rótulo principal</label>
                <input
                  type="text"
                  value={settings.statsLabel}
                  onChange={(e) => setSettings((s) => ({ ...s, statsLabel: e.target.value }))}
                  placeholder="Doações na live"
                  className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Rótulo da contagem</label>
                <input
                  type="text"
                  value={settings.statsCountLabel}
                  onChange={(e) => setSettings((s) => ({ ...s, statsCountLabel: e.target.value }))}
                  placeholder="doações"
                  className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs text-zinc-500">Cor de fundo</label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.statsBgColor ?? "#000000"}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, statsBgColor: e.target.value }))
                    }
                    className="h-8 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent p-0.5"
                  />
                  <span className="font-mono text-[11px] text-zinc-400">
                    {settings.statsBgColor ?? "automático"}
                  </span>
                  {settings.statsBgColor && (
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, statsBgColor: null }))}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500">Cor do texto</label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.statsTextColor ?? "#ffffff"}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, statsTextColor: e.target.value }))
                    }
                    className="h-8 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent p-0.5"
                  />
                  <span className="font-mono text-[11px] text-zinc-400">
                    {settings.statsTextColor ?? "automático"}
                  </span>
                  {settings.statsTextColor && (
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, statsTextColor: null }))}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500">
                Tamanho da fonte — {settings.statsFontSize}px
              </label>
              <input
                type="range"
                min={10}
                max={32}
                value={settings.statsFontSize}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, statsFontSize: Number(e.target.value) }))
                }
                className="mt-1.5 w-full accent-cyan-500"
              />
            </div>
          </section>

          <WidgetObsPanel
            widgetUrl={widgetUrl}
            description="Contador compacto para canto da tela. Ideal para mostrar momentum da live."
          />

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg web3-btn-primary px-5 py-2.5 text-sm font-semibold hover:brightness-110 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start space-y-3">
          <p className="text-center text-xs font-medium uppercase tracking-wide text-zinc-500">
            Preview
          </p>
          <div className="relative aspect-video min-h-[180px] overflow-hidden rounded-xl border border-zinc-800 bg-black">
            <StatsOverlay
              count={7}
              total={342.5}
              position={settings.statsPosition}
              themeColor={creator.themeColor}
              layout={settings.statsLayout}
              label={settings.statsLabel}
              countLabel={settings.statsCountLabel}
              bgColor={settings.statsBgColor}
              textColor={settings.statsTextColor}
              fontSize={settings.statsFontSize}
              embedded
            />
          </div>
          <p className="text-center text-[11px] text-zinc-600">
            Posição: {GOAL_OVERLAY_POSITIONS.find((p) => p.id === settings.statsPosition)?.label}
          </p>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
