"use client";

import { useState } from "react";
import { resolveAlertSoundId } from "@/lib/alert-catalog";
import { GOAL_OVERLAY_POSITIONS } from "@/lib/goal-overlay-position";
import type { AlertSettings, Creator } from "@/types";
import { DEFAULT_TEXT_CONFIG, DEFAULT_BACKGROUND_MEDIA } from "@/types";
import { SupportersOverlay } from "@/components/widget/SupportersOverlay";
import { PREVIEW_DONATIONS } from "@/components/widget/useDonationSocket";
import { WidgetObsPanel, WidgetPositionPicker } from "./WidgetObsPanel";

interface SupportersEditorProps {
  creator: Creator;
  widgetUrl: string;
}

const SUPPORTERS_LAYOUTS = [
  { id: "list" as const, name: "Lista", description: "Linhas com nome e valor" },
  { id: "grid" as const, name: "Grade", description: "2 colunas compactas" },
  { id: "bubbles" as const, name: "Bolhas", description: "Avatares circulares" },
];

export function SupportersEditor({ creator, widgetUrl }: SupportersEditorProps) {
  const [settings, setSettings] = useState<
    Pick<
      AlertSettings,
      | "supportersPosition"
      | "supportersMaxItems"
      | "supportersTitle"
      | "supportersLayout"
      | "supportersBgColor"
      | "supportersTextColor"
      | "supportersFontSize"
    >
  >({
    supportersPosition: creator.alertSettings.supportersPosition,
    supportersMaxItems: creator.alertSettings.supportersMaxItems,
    supportersTitle: creator.alertSettings.supportersTitle,
    supportersLayout: creator.alertSettings.supportersLayout,
    supportersBgColor: creator.alertSettings.supportersBgColor,
    supportersTextColor: creator.alertSettings.supportersTextColor,
    supportersFontSize: creator.alertSettings.supportersFontSize,
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

  const previewItems = PREVIEW_DONATIONS.slice(0, settings.supportersMaxItems);

  return (
    <div className="w-full space-y-5">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)]">
        <div className="space-y-4">
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h2 className="font-semibold text-white">Mural de apoiadores</h2>
            <p className="text-sm text-zinc-400">
              Lista os nomes e valores das doações recentes, como o mural da sua página de tips.
            </p>

            <div>
              <p className="text-xs text-zinc-500">Apoiadores visíveis</p>
              <input
                type="range"
                min={3}
                max={12}
                value={settings.supportersMaxItems}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    supportersMaxItems: Number(e.target.value),
                  }))
                }
                className="mt-2 w-full accent-cyan-500"
              />
              <p className="mt-1 text-xs text-zinc-500">{settings.supportersMaxItems} nomes</p>
            </div>

            <WidgetPositionPicker
              value={settings.supportersPosition}
              onChange={(supportersPosition) =>
                setSettings((s) => ({
                  ...s,
                  supportersPosition: supportersPosition as typeof settings.supportersPosition,
                }))
              }
            />
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h2 className="font-semibold text-white">Aparência</h2>

            <div>
              <p className="text-xs text-zinc-500">Título</p>
              <input
                type="text"
                value={settings.supportersTitle}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, supportersTitle: e.target.value }))
                }
                placeholder="Apoiadores"
                className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <p className="text-xs text-zinc-500">Layout</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {SUPPORTERS_LAYOUTS.map((layout) => {
                  const active = settings.supportersLayout === layout.id;
                  return (
                    <button
                      key={layout.id}
                      type="button"
                      onClick={() =>
                        setSettings((s) => ({ ...s, supportersLayout: layout.id }))
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

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="text-zinc-400">Cor de fundo</span>
                <input
                  type="color"
                  value={settings.supportersBgColor ?? "#000000"}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, supportersBgColor: e.target.value }))
                  }
                  className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950"
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-400">Cor do texto</span>
                <input
                  type="color"
                  value={settings.supportersTextColor ?? "#ffffff"}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, supportersTextColor: e.target.value }))
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
                  supportersBgColor: null,
                  supportersTextColor: null,
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
                value={settings.supportersFontSize}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    supportersFontSize: Number(e.target.value),
                  }))
                }
                className="mt-2 w-full accent-cyan-500"
              />
              <p className="mt-1 text-xs text-zinc-500">{settings.supportersFontSize}px</p>
            </div>
          </section>

          <WidgetObsPanel
            widgetUrl={widgetUrl}
            description="Carrega doações recentes e atualiza a cada nova doação via socket."
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
            <SupportersOverlay
              items={previewItems}
              position={settings.supportersPosition}
              themeColor={creator.themeColor}
              title={settings.supportersTitle}
              layout={settings.supportersLayout}
              bgColor={settings.supportersBgColor}
              textColor={settings.supportersTextColor}
              fontSize={settings.supportersFontSize}
              embedded
            />
          </div>
          <p className="text-center text-[11px] text-zinc-600">
            Posição:{" "}
            {GOAL_OVERLAY_POSITIONS.find((p) => p.id === settings.supportersPosition)?.label}
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
