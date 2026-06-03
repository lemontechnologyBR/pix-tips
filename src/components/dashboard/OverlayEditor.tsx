"use client";

import Link from "next/link";
import { useState } from "react";
import { resolveAlertSoundId } from "@/lib/alert-catalog";
import { formatCurrency } from "@/lib/format";
import { OVERLAY_PRESETS, applyOverlayPreset } from "@/lib/overlay-presets";
import type { AlertSettings, Creator, OverlayWidgetSettings } from "@/types";
import { DEFAULT_TEXT_CONFIG, DEFAULT_BACKGROUND_MEDIA } from "@/types";
import { OverlayPositionEditor } from "./OverlayPositionEditor";
import { WidgetObsPanel } from "./WidgetObsPanel";

interface OverlayEditorProps {
  creator: Creator;
  widgetUrl: string;
}

const WIDGET_TOGGLES: {
  key: keyof OverlayWidgetSettings;
  label: string;
  description: string;
}[] = [
  { key: "alerts", label: "Alertas", description: "Animação e som na doação" },
  { key: "goal", label: "Meta", description: "Barra de progresso da arrecadação" },
  { key: "ticker", label: "Ticker", description: "Lista ou faixa de doações" },
  { key: "stats", label: "Contador", description: "Total e quantidade na sessão" },
  { key: "lastDonation", label: "Última doação", description: "Destaque da tip mais recente" },
  { key: "supporters", label: "Apoiadores", description: "Mural com nomes recentes" },
  { key: "leaderboard", label: "Ranking", description: "Top apoiadores acumulados" },
  { key: "viewers", label: "Espectadores", description: "Contador de viewers da Twitch" },
];

export function OverlayEditor({ creator, widgetUrl }: OverlayEditorProps) {
  const [settings, setSettings] = useState<AlertSettings>({
    ...creator.alertSettings,
    soundId: resolveAlertSoundId(
      creator.alertSettings.soundId,
      creator.alertSettings.soundUrl,
    ),
    textConfig: creator.alertSettings.textConfig ?? DEFAULT_TEXT_CONFIG,
    backgroundMedia:
      creator.alertSettings.backgroundMedia ?? DEFAULT_BACKGROUND_MEDIA,
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const hasGoal = creator.goal > 0;
  const activeCount = Object.values(settings.overlayWidgets).filter(Boolean).length;

  function updateSettings(patch: Partial<AlertSettings>) {
    setSettings((current) => ({ ...current, ...patch }));
  }

  function toggleWidget(key: keyof OverlayWidgetSettings) {
    setSettings((current) => ({
      ...current,
      overlayWidgets: {
        ...current.overlayWidgets,
        [key]: !current.overlayWidgets[key],
      },
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/alert-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setToast("Overlay salvo!");
        setTimeout(() => setToast(null), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full space-y-5">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white">Overlay unificado</h2>
            <p className="mt-1 max-w-lg text-sm text-zinc-400">
              Uma URL no OBS com alertas, meta, ticker e mais — sem várias fontes separadas.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500">Ativos</p>
              <p className="text-xl font-bold tabular-nums text-cyan-300">{activeCount}</p>
            </div>
            {hasGoal && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5">
                <p className="text-[10px] uppercase tracking-wide text-zinc-500">Meta</p>
                <p className="text-sm font-semibold tabular-nums text-white">
                  {formatCurrency(creator.raised)} / {formatCurrency(creator.goal)}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-semibold text-white">Widgets no overlay</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Escolha o que aparece na sua fonte OBS unificada.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {WIDGET_TOGGLES.map(({ key, label, description }) => {
              const enabled = settings.overlayWidgets[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleWidget(key)}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${
                    enabled
                      ? "border-cyan-500/50 bg-cyan-500/10"
                      : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[10px] ${
                      enabled
                        ? "border-cyan-400 bg-cyan-500 text-white"
                        : "border-zinc-600 bg-zinc-900"
                    }`}
                  >
                    {enabled ? "✓" : ""}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block text-sm font-medium ${
                        enabled ? "text-cyan-100" : "text-zinc-300"
                      }`}
                    >
                      {label}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-zinc-500">
                      {description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <OverlayPositionEditor
          creator={creator}
          settings={settings}
          onChange={updateSettings}
        />

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
          <div>
            <h2 className="font-semibold text-white">Preset de layout</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Aplica posições pré-configuradas. Selecione "Personalizado" para manter posições arrastadas.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => updateSettings({ overlayPresetId: null })}
              className={`rounded-lg border px-3 py-3 text-left transition ${
                settings.overlayPresetId === null
                  ? "border-cyan-500 bg-cyan-500/15 ring-1 ring-cyan-500/40"
                  : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-600"
              }`}
            >
              <span className="text-base leading-none">✏️</span>
              <span
                className={`mt-1 block text-[11px] font-medium leading-snug ${
                  settings.overlayPresetId === null ? "text-cyan-200" : "text-zinc-400"
                }`}
              >
                Personalizado
              </span>
              <span className="mt-0.5 block text-[10px] leading-snug text-zinc-500">
                Posições manuais
              </span>
            </button>

            {OVERLAY_PRESETS.map((preset) => {
              const active = settings.overlayPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSettings(applyOverlayPreset(settings, preset.id))}
                  className={`rounded-lg border px-3 py-3 text-left transition ${
                    active
                      ? "border-cyan-500 bg-cyan-500/15 ring-1 ring-cyan-500/40"
                      : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-600"
                  }`}
                >
                  <span className="text-base leading-none">{preset.icon}</span>
                  <span
                    className={`mt-1 block text-[11px] font-medium leading-snug ${
                      active ? "text-cyan-200" : "text-zinc-300"
                    }`}
                  >
                    {preset.name}
                  </span>
                  <span className="mt-0.5 block text-[10px] leading-snug text-zinc-500">
                    {preset.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-5">
          <h2 className="font-semibold text-white">Escala e opacidade</h2>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-300">Escala global</p>
              <span className="text-sm font-semibold tabular-nums text-cyan-300">
                {settings.overlayScale.toFixed(2)}×
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.05}
              value={settings.overlayScale}
              onChange={(e) => updateSettings({ overlayScale: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-600">
              <span>0.5×</span>
              <span>1×</span>
              <span>2×</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-300">Opacidade geral</p>
              <span className="text-sm font-semibold tabular-nums text-cyan-300">
                {Math.round(settings.overlayOpacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={settings.overlayOpacity}
              onChange={(e) => updateSettings({ overlayOpacity: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-600">
              <span>10%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </section>

        <WidgetObsPanel
          widgetUrl={widgetUrl}
          title="Link do overlay unificado"
          description="Adicione como fonte Navegador no OBS. Substitui várias fontes separadas por uma só."
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg web3-btn-primary px-5 py-2.5 text-sm font-semibold hover:brightness-110 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar overlay"}
          </button>
          <Link
            href="/dashboard/widgets?tab=alerts"
            className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
          >
            Editar alertas →
          </Link>
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
