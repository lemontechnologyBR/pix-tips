"use client";

import { useState } from "react";
import { resolveAlertSoundId } from "@/lib/alert-catalog";
import { GOAL_OVERLAY_POSITIONS } from "@/lib/goal-overlay-position";
import type { AlertSettings, Creator } from "@/types";
import { DEFAULT_TEXT_CONFIG, DEFAULT_BACKGROUND_MEDIA } from "@/types";
import { LastDonationOverlay } from "@/components/widget/LastDonationOverlay";
import { PREVIEW_DONATIONS } from "@/components/widget/useDonationSocket";
import { WidgetObsPanel, WidgetPositionPicker } from "./WidgetObsPanel";

interface LastDonationEditorProps {
  creator: Creator;
  widgetUrl: string;
}

export function LastDonationEditor({ creator, widgetUrl }: LastDonationEditorProps) {
  const [settings, setSettings] = useState<
    Pick<
      AlertSettings,
      | "lastDonationPosition"
      | "lastDonationLayout"
      | "lastDonationBgColor"
      | "lastDonationTextColor"
      | "lastDonationFontSize"
    >
  >({
    lastDonationPosition: creator.alertSettings.lastDonationPosition,
    lastDonationLayout: creator.alertSettings.lastDonationLayout ?? "classic",
    lastDonationBgColor: creator.alertSettings.lastDonationBgColor ?? null,
    lastDonationTextColor: creator.alertSettings.lastDonationTextColor ?? null,
    lastDonationFontSize: creator.alertSettings.lastDonationFontSize ?? 14,
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
            <h2 className="font-semibold text-white">Última doação</h2>
            <p className="text-sm text-zinc-400">
              Destaque permanente com a doação mais recente. Atualiza em tempo real com animação.
            </p>
            <WidgetPositionPicker
              value={settings.lastDonationPosition}
              onChange={(lastDonationPosition) =>
                setSettings((s) => ({
                  ...s,
                  lastDonationPosition: lastDonationPosition as typeof settings.lastDonationPosition,
                }))
              }
            />
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h2 className="font-semibold text-white">Aparência</h2>

            <div>
              <p className="text-xs text-zinc-500">Layout</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["classic", "minimal", "banner", "card"] as const).map((opt) => {
                  const labels: Record<typeof opt, string> = {
                    classic: "Clássico",
                    minimal: "Minimal",
                    banner: "Banner",
                    card: "Card",
                  };
                  const active = settings.lastDonationLayout === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, lastDonationLayout: opt }))}
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
                <label className="text-xs text-zinc-500">Cor de fundo</label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.lastDonationBgColor ?? "#000000"}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, lastDonationBgColor: e.target.value }))
                    }
                    className="h-8 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent p-0.5"
                  />
                  <span className="font-mono text-[11px] text-zinc-400">
                    {settings.lastDonationBgColor ?? "automático"}
                  </span>
                  {settings.lastDonationBgColor && (
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, lastDonationBgColor: null }))}
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
                    value={settings.lastDonationTextColor ?? "#ffffff"}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, lastDonationTextColor: e.target.value }))
                    }
                    className="h-8 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent p-0.5"
                  />
                  <span className="font-mono text-[11px] text-zinc-400">
                    {settings.lastDonationTextColor ?? "automático"}
                  </span>
                  {settings.lastDonationTextColor && (
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, lastDonationTextColor: null }))}
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
                Tamanho da fonte — {settings.lastDonationFontSize}px
              </label>
              <input
                type="range"
                min={10}
                max={32}
                value={settings.lastDonationFontSize}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, lastDonationFontSize: Number(e.target.value) }))
                }
                className="mt-1.5 w-full accent-cyan-500"
              />
            </div>
          </section>

          <WidgetObsPanel widgetUrl={widgetUrl} />
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
            <LastDonationOverlay
              item={PREVIEW_DONATIONS[0]}
              position={settings.lastDonationPosition}
              themeColor={creator.themeColor}
              layout={settings.lastDonationLayout}
              bgColor={settings.lastDonationBgColor}
              textColor={settings.lastDonationTextColor}
              fontSize={settings.lastDonationFontSize}
              embedded
            />
          </div>
          <p className="text-center text-[11px] text-zinc-600">
            Posição:{" "}
            {GOAL_OVERLAY_POSITIONS.find((p) => p.id === settings.lastDonationPosition)?.label}
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
