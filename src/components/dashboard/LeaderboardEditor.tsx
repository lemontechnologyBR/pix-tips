"use client";

import { useState } from "react";
import { resolveAlertSoundId } from "@/lib/alert-catalog";
import { GOAL_OVERLAY_POSITIONS } from "@/lib/goal-overlay-position";
import type { AlertSettings, Creator } from "@/types";
import { DEFAULT_TEXT_CONFIG, DEFAULT_BACKGROUND_MEDIA } from "@/types";
import { LeaderboardOverlay } from "@/components/widget/LeaderboardOverlay";
import { PREVIEW_DONATIONS } from "@/components/widget/useDonationSocket";
import { buildLeaderboardFromItems } from "@/lib/leaderboard";
import { WidgetObsPanel, WidgetPositionPicker } from "./WidgetObsPanel";

interface LeaderboardEditorProps {
  creator: Creator;
  widgetUrl: string;
}

const PERIOD_OPTIONS = [
  { id: "session" as const, label: "Sessão atual" },
  { id: "alltime" as const, label: "Histórico geral" },
];

export function LeaderboardEditor({ creator, widgetUrl }: LeaderboardEditorProps) {
  const [settings, setSettings] = useState<
    Pick<
      AlertSettings,
      | "leaderboardPosition"
      | "leaderboardMaxItems"
      | "leaderboardTitle"
      | "leaderboardPeriod"
      | "leaderboardBgColor"
      | "leaderboardTextColor"
      | "leaderboardFontSize"
    >
  >({
    leaderboardPosition: creator.alertSettings.leaderboardPosition,
    leaderboardMaxItems: creator.alertSettings.leaderboardMaxItems,
    leaderboardTitle: creator.alertSettings.leaderboardTitle,
    leaderboardPeriod: creator.alertSettings.leaderboardPeriod,
    leaderboardBgColor: creator.alertSettings.leaderboardBgColor,
    leaderboardTextColor: creator.alertSettings.leaderboardTextColor,
    leaderboardFontSize: creator.alertSettings.leaderboardFontSize,
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const previewEntries = buildLeaderboardFromItems(PREVIEW_DONATIONS).slice(
    0,
    settings.leaderboardMaxItems,
  );

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
            <h2 className="font-semibold text-white">Ranking da live</h2>
            <p className="text-sm text-zinc-400">
              Soma doações por apoiador na sessão atual e ordena por valor total.
            </p>
            <div>
              <p className="text-xs text-zinc-500">Top exibido</p>
              <input
                type="range"
                min={3}
                max={10}
                value={settings.leaderboardMaxItems}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    leaderboardMaxItems: Number(e.target.value),
                  }))
                }
                className="mt-2 w-full accent-cyan-500"
              />
              <p className="mt-1 text-xs text-zinc-500">{settings.leaderboardMaxItems} posições</p>
            </div>
            <WidgetPositionPicker
              value={settings.leaderboardPosition}
              onChange={(leaderboardPosition) =>
                setSettings((s) => ({
                  ...s,
                  leaderboardPosition: leaderboardPosition as typeof settings.leaderboardPosition,
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
                value={settings.leaderboardTitle}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, leaderboardTitle: e.target.value }))
                }
                placeholder="Top Apoiadores"
                className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <p className="text-xs text-zinc-500">Período</p>
              <div className="mt-2 flex gap-2">
                {PERIOD_OPTIONS.map((opt) => {
                  const active = settings.leaderboardPeriod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setSettings((s) => ({ ...s, leaderboardPeriod: opt.id }))
                      }
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        active
                          ? "border-cyan-500 bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-500/40"
                          : "border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      {opt.label}
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
                  value={settings.leaderboardBgColor ?? "#000000"}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, leaderboardBgColor: e.target.value }))
                  }
                  className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950"
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-400">Cor do texto</span>
                <input
                  type="color"
                  value={settings.leaderboardTextColor ?? "#ffffff"}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, leaderboardTextColor: e.target.value }))
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
                  leaderboardBgColor: null,
                  leaderboardTextColor: null,
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
                value={settings.leaderboardFontSize}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    leaderboardFontSize: Number(e.target.value),
                  }))
                }
                className="mt-2 w-full accent-cyan-500"
              />
              <p className="mt-1 text-xs text-zinc-500">{settings.leaderboardFontSize}px</p>
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
            <LeaderboardOverlay
              entries={previewEntries}
              position={settings.leaderboardPosition}
              themeColor={creator.themeColor}
              title={settings.leaderboardTitle}
              period={settings.leaderboardPeriod}
              bgColor={settings.leaderboardBgColor}
              textColor={settings.leaderboardTextColor}
              fontSize={settings.leaderboardFontSize}
              embedded
            />
          </div>
          <p className="text-center text-[11px] text-zinc-600">
            Posição:{" "}
            {GOAL_OVERLAY_POSITIONS.find((p) => p.id === settings.leaderboardPosition)?.label}
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
