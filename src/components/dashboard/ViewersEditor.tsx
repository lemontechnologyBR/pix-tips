"use client";

import Link from "next/link";
import { useState } from "react";
import { resolveAlertSoundId } from "@/lib/alert-catalog";
import { GOAL_OVERLAY_POSITIONS } from "@/lib/goal-overlay-position";
import { VIEWERS_OVERLAY_LAYOUTS } from "@/lib/viewers-overlay-layout";
import type { AlertSettings, Creator } from "@/types";
import { DEFAULT_TEXT_CONFIG, DEFAULT_BACKGROUND_MEDIA } from "@/types";
import { ViewersOverlay } from "@/components/widget/ViewersOverlay";
import {
  formatViewersPlatformsLabel,
  ViewersPlatformPicker,
} from "./ViewersPlatformPicker";
import { WidgetObsPanel, WidgetPositionPicker } from "./WidgetObsPanel";

interface ViewersEditorProps {
  creator: Creator;
  widgetUrl: string;
  twitchConnected?: boolean;
  twitchChannel?: string | null;
}

export function ViewersEditor({
  creator,
  widgetUrl,
  twitchConnected = false,
  twitchChannel = null,
}: ViewersEditorProps) {
  const [settings, setSettings] = useState<
    Pick<
      AlertSettings,
      | "viewersPosition"
      | "viewersLayout"
      | "viewersPlatforms"
      | "viewersPollInterval"
      | "viewersLabel"
      | "viewersHideOffline"
      | "viewersBgColor"
      | "viewersTextColor"
    >
  >({
    viewersPosition: creator.alertSettings.viewersPosition,
    viewersLayout: creator.alertSettings.viewersLayout,
    viewersPlatforms: creator.alertSettings.viewersPlatforms,
    viewersPollInterval: creator.alertSettings.viewersPollInterval,
    viewersLabel: creator.alertSettings.viewersLabel,
    viewersHideOffline: creator.alertSettings.viewersHideOffline,
    viewersBgColor: creator.alertSettings.viewersBgColor,
    viewersTextColor: creator.alertSettings.viewersTextColor,
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
            <h2 className="font-semibold text-white">Contador de espectadores</h2>
            <p className="text-sm text-zinc-400">
              Marque as plataformas que deseja exibir. Atualiza a cada 30 segundos por plataforma.
            </p>

            {twitchConnected && twitchChannel ? (
              <div className="rounded-lg border border-[#9146ff]/30 bg-[#9146ff]/10 px-3 py-2 text-sm text-cyan-200">
                Canal Twitch: <span className="font-medium">#{twitchChannel}</span>
              </div>
            ) : (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                Vincule sua conta Twitch em{" "}
                <Link href="/dashboard/integrations" className="underline hover:text-amber-100">
                  Integrações
                </Link>{" "}
                para contador ao vivo na Twitch.
              </div>
            )}

            <div className="rounded-lg border border-green-600/30 bg-green-600/10 px-3 py-2 text-sm text-green-200">
              Para Kick, vincule sua conta Kick em{" "}
              <Link href="/dashboard/integrations" className="underline hover:text-green-100">
                Integrações
              </Link>
              .
            </div>

            <div>
              <p className="text-xs text-zinc-500">Plataformas ativas</p>
              <div className="mt-1.5">
                <ViewersPlatformPicker
                  value={settings.viewersPlatforms}
                  onChange={(viewersPlatforms) =>
                    setSettings((s) => ({ ...s, viewersPlatforms }))
                  }
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-zinc-500">Layout</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {VIEWERS_OVERLAY_LAYOUTS.map((layout) => {
                  const active = settings.viewersLayout === layout.id;
                  return (
                    <button
                      key={layout.id}
                      type="button"
                      title={layout.description}
                      onClick={() =>
                        setSettings((s) => ({ ...s, viewersLayout: layout.id }))
                      }
                      className={`rounded-lg border px-2 py-2 text-left transition ${
                        active
                          ? "border-cyan-500 bg-cyan-500/15 ring-1 ring-cyan-500/40"
                          : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-600"
                      }`}
                    >
                      <span className="text-base leading-none">{layout.icon}</span>
                      <span
                        className={`mt-1 block text-[10px] font-medium ${
                          active ? "text-cyan-200" : "text-zinc-400"
                        }`}
                      >
                        {layout.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <WidgetPositionPicker
              value={settings.viewersPosition}
              onChange={(viewersPosition) =>
                setSettings((s) => ({
                  ...s,
                  viewersPosition: viewersPosition as typeof settings.viewersPosition,
                }))
              }
            />
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h2 className="font-semibold text-white">Aparência e comportamento</h2>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  Atualizar a cada{" "}
                  <span className="font-semibold text-white">{settings.viewersPollInterval}s</span>
                </p>
              </div>
              <input
                type="range"
                min={10}
                max={300}
                step={5}
                value={settings.viewersPollInterval}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, viewersPollInterval: Number(e.target.value) }))
                }
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-600">
                <span>10s</span>
                <span>300s</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Rótulo</label>
              <input
                type="text"
                value={settings.viewersLabel}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, viewersLabel: e.target.value }))
                }
                placeholder="ex: VIEWERS, AO VIVO, ESPECTADORES"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-300">Ocultar quando offline</p>
                <p className="text-xs text-zinc-500">Esconde o widget quando viewers = 0</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings((s) => ({ ...s, viewersHideOffline: !s.viewersHideOffline }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  settings.viewersHideOffline ? "bg-cyan-500" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
                    settings.viewersHideOffline ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Cor de fundo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.viewersBgColor ?? "#000000"}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, viewersBgColor: e.target.value }))
                    }
                    className="h-8 w-10 cursor-pointer rounded border border-zinc-700 bg-transparent p-0.5"
                  />
                  {settings.viewersBgColor && (
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, viewersBgColor: null }))}
                      className="text-[11px] text-zinc-500 hover:text-zinc-300"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Cor do texto</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.viewersTextColor ?? "#ffffff"}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, viewersTextColor: e.target.value }))
                    }
                    className="h-8 w-10 cursor-pointer rounded border border-zinc-700 bg-transparent p-0.5"
                  />
                  {settings.viewersTextColor && (
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, viewersTextColor: null }))}
                      className="text-[11px] text-zinc-500 hover:text-zinc-300"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <WidgetObsPanel
            widgetUrl={widgetUrl}
            description="Contador de viewers com logo da plataforma para canto da tela no OBS."
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
            <ViewersOverlay
              viewers={1247}
              live
              platformStats={{
                twitch: { viewers: 1247, live: true, channel: twitchChannel },
                kick: { viewers: 532, live: true, channel: null },
                youtube: { viewers: 0, live: false, channel: null },
              }}
              layout={settings.viewersLayout}
              platforms={settings.viewersPlatforms}
              position={settings.viewersPosition}
              themeColor={creator.themeColor}
              embedded
              label={settings.viewersLabel || undefined}
              hideOffline={settings.viewersHideOffline}
              bgColor={settings.viewersBgColor}
              textColor={settings.viewersTextColor}
            />
          </div>
          <p className="text-center text-[11px] text-zinc-600">
            {formatViewersPlatformsLabel(settings.viewersPlatforms)} ·{" "}
            {VIEWERS_OVERLAY_LAYOUTS.find((l) => l.id === settings.viewersLayout)?.name} ·{" "}
            {GOAL_OVERLAY_POSITIONS.find((p) => p.id === settings.viewersPosition)?.label}
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
