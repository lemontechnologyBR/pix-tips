"use client";

import { useState } from "react";
import { resolveAlertSoundId } from "@/lib/alert-catalog";
import { TICKER_LAYOUTS } from "@/lib/widget-settings";
import { GOAL_OVERLAY_POSITIONS } from "@/lib/goal-overlay-position";
import type { AlertSettings, Creator } from "@/types";
import { DEFAULT_TEXT_CONFIG, DEFAULT_BACKGROUND_MEDIA } from "@/types";
import { TickerOverlay } from "@/components/widget/TickerOverlay";
import { PREVIEW_DONATIONS } from "@/components/widget/useDonationSocket";
import { WidgetObsPanel, WidgetPositionPicker } from "./WidgetObsPanel";

interface TickerEditorProps {
  creator: Creator;
  widgetUrl: string;
}

export function TickerEditor({ creator, widgetUrl }: TickerEditorProps) {
  const [settings, setSettings] = useState<
    Pick<
      AlertSettings,
      | "tickerPosition"
      | "tickerMaxItems"
      | "tickerLayout"
      | "tickerSpeed"
      | "tickerBgColor"
      | "tickerTextColor"
      | "tickerFontSize"
    >
  >({
    tickerPosition: creator.alertSettings.tickerPosition,
    tickerMaxItems: creator.alertSettings.tickerMaxItems,
    tickerLayout: creator.alertSettings.tickerLayout,
    tickerSpeed: creator.alertSettings.tickerSpeed,
    tickerBgColor: creator.alertSettings.tickerBgColor,
    tickerTextColor: creator.alertSettings.tickerTextColor,
    tickerFontSize: creator.alertSettings.tickerFontSize,
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

  const previewItems = PREVIEW_DONATIONS.slice(0, settings.tickerMaxItems);

  return (
    <div className="w-full space-y-5">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)]">
        <div className="space-y-4">
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h2 className="font-semibold text-white">Aparência</h2>

            <div>
              <p className="text-xs text-zinc-500">Layout</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {TICKER_LAYOUTS.map((layout) => {
                  const active = settings.tickerLayout === layout.id;
                  return (
                    <button
                      key={layout.id}
                      type="button"
                      onClick={() =>
                        setSettings((s) => ({ ...s, tickerLayout: layout.id }))
                      }
                      className={`rounded-lg border px-3 py-2.5 text-left transition ${
                        active
                          ? "border-cyan-500 bg-cyan-500/15 ring-1 ring-cyan-500/40"
                          : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-600"
                      }`}
                    >
                      <span
                        className={`block text-sm font-medium ${
                          active ? "text-cyan-200" : "text-zinc-300"
                        }`}
                      >
                        {layout.name}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-zinc-500">
                        {layout.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {settings.tickerLayout === "marquee" && (
              <div>
                <p className="text-xs text-zinc-500">Velocidade do marquee (px/s)</p>
                <input
                  type="range"
                  min={10}
                  max={200}
                  value={settings.tickerSpeed}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      tickerSpeed: Number(e.target.value),
                    }))
                  }
                  className="mt-2 w-full accent-cyan-500"
                />
                <p className="mt-1 text-xs text-zinc-500">{settings.tickerSpeed} px/s</p>
              </div>
            )}

            <div>
              <p className="text-xs text-zinc-500">Máximo de itens visíveis</p>
              <input
                type="range"
                min={3}
                max={20}
                value={settings.tickerMaxItems}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    tickerMaxItems: Number(e.target.value),
                  }))
                }
                className="mt-2 w-full accent-cyan-500"
              />
              <p className="mt-1 text-xs text-zinc-500">{settings.tickerMaxItems} doações</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="text-zinc-400">Cor de fundo</span>
                <input
                  type="color"
                  value={settings.tickerBgColor ?? "#000000"}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, tickerBgColor: e.target.value }))
                  }
                  className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950"
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-400">Cor do texto</span>
                <input
                  type="color"
                  value={settings.tickerTextColor ?? "#ffffff"}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, tickerTextColor: e.target.value }))
                  }
                  className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() =>
                setSettings((s) => ({
                  ...s,
                  tickerBgColor: null,
                  tickerTextColor: null,
                }))
              }
              className="text-xs text-zinc-500 hover:text-zinc-300 transition"
            >
              Resetar cores
            </button>

            <div>
              <p className="text-xs text-zinc-500">Tamanho da fonte</p>
              <input
                type="range"
                min={10}
                max={28}
                value={settings.tickerFontSize}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    tickerFontSize: Number(e.target.value),
                  }))
                }
                className="mt-2 w-full accent-cyan-500"
              />
              <p className="mt-1 text-xs text-zinc-500">{settings.tickerFontSize}px</p>
            </div>

            <WidgetPositionPicker
              value={settings.tickerPosition}
              onChange={(tickerPosition) =>
                setSettings((s) => ({
                  ...s,
                  tickerPosition: tickerPosition as typeof settings.tickerPosition,
                }))
              }
            />
          </section>

          <WidgetObsPanel
            widgetUrl={widgetUrl}
            description="Lista ou faixa rolante com as doações mais recentes. Atualiza em tempo real."
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
            <TickerOverlay
              items={previewItems}
              position={settings.tickerPosition}
              layout={settings.tickerLayout}
              themeColor={creator.themeColor}
              speed={settings.tickerSpeed}
              bgColor={settings.tickerBgColor}
              textColor={settings.tickerTextColor}
              fontSize={settings.tickerFontSize}
              embedded
            />
          </div>
          <p className="text-center text-[11px] text-zinc-600">
            Posição: {GOAL_OVERLAY_POSITIONS.find((p) => p.id === settings.tickerPosition)?.label}
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
