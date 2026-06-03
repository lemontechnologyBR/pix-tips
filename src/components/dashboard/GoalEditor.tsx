"use client";

import Link from "next/link";
import { useState } from "react";
import { resolveAlertSoundId } from "@/lib/alert-catalog";
import { formatCurrency } from "@/lib/format";
import { GOAL_OVERLAY_LAYOUTS, normalizeGoalOverlayLayout } from "@/lib/goal-overlay-layout";
import { GOAL_OVERLAY_POSITIONS, normalizeGoalOverlayPosition } from "@/lib/goal-overlay-position";
import type { AlertSettings, Creator } from "@/types";
import { DEFAULT_TEXT_CONFIG, DEFAULT_BACKGROUND_MEDIA } from "@/types";
import { GoalOverlay } from "@/components/widget/GoalOverlay";

interface GoalEditorProps {
  creator: Creator;
  widgetUrl: string;
}

export function GoalEditor({ creator, widgetUrl }: GoalEditorProps) {
  const [settings, setSettings] = useState<Pick<
    AlertSettings,
    | "goalOverlayLayout"
    | "goalOverlayPosition"
    | "goalBarColor"
    | "goalBgColor"
    | "goalTextColor"
    | "goalShowPercentage"
    | "goalShowValues"
    | "goalFontSize"
  >>({
    goalOverlayPosition: normalizeGoalOverlayPosition(
      creator.alertSettings.goalOverlayPosition,
    ),
    goalOverlayLayout: normalizeGoalOverlayLayout(
      creator.alertSettings.goalOverlayLayout,
    ),
    goalBarColor: creator.alertSettings.goalBarColor ?? null,
    goalBgColor: creator.alertSettings.goalBgColor ?? null,
    goalTextColor: creator.alertSettings.goalTextColor ?? null,
    goalShowPercentage: creator.alertSettings.goalShowPercentage ?? true,
    goalShowValues: creator.alertSettings.goalShowValues ?? true,
    goalFontSize: creator.alertSettings.goalFontSize ?? 14,
  });
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const widgetPath = widgetUrl.replace(/^https?:\/\/[^/]+/, "");
  const hasGoal = creator.goal > 0;
  const progress = hasGoal
    ? Math.min((creator.raised / creator.goal) * 100, 100)
    : 0;

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

  async function copyWidget() {
    const full =
      typeof window !== "undefined" && !widgetUrl.startsWith("http")
        ? `${window.location.origin}${widgetUrl}`
        : widgetUrl;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full space-y-5">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)]">
        <div className="space-y-4">
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h2 className="font-semibold text-white">Valor da meta</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Defina quanto você quer arrecadar nesta live ou campanha.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
                <p className="text-xs text-zinc-500">Arrecadado</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {formatCurrency(creator.raised)}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
                <p className="text-xs text-zinc-500">Meta</p>
                <p className="text-lg font-semibold text-white">
                  {hasGoal ? formatCurrency(creator.goal) : "Não definida"}
                </p>
              </div>
              {hasGoal && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
                  <p className="text-xs text-zinc-500">Progresso</p>
                  <p className="text-lg font-semibold text-cyan-300">
                    {progress.toFixed(0)}%
                  </p>
                </div>
              )}
            </div>
            <Link
              href="/dashboard/tip-page"
              className="mt-4 inline-flex rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-cyan-500/50 hover:text-white"
            >
              Editar meta e título →
            </Link>
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h2 className="font-semibold text-white">Aparência</h2>

            <div>
              <p className="text-xs text-zinc-500">Layout</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {GOAL_OVERLAY_LAYOUTS.map((layout) => {
                  const active = settings.goalOverlayLayout === layout.id;
                  return (
                    <button
                      key={layout.id}
                      type="button"
                      title={layout.description}
                      onClick={() =>
                        setSettings((s) => ({ ...s, goalOverlayLayout: layout.id }))
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

            <div>
              <p className="text-xs text-zinc-500">Posição na tela (OBS)</p>
              <div className="mt-2 grid max-w-[14rem] grid-cols-6 gap-1">
                {GOAL_OVERLAY_POSITIONS.map((p) => {
                  const active = settings.goalOverlayPosition === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      title={p.label}
                      onClick={() =>
                        setSettings((s) => ({ ...s, goalOverlayPosition: p.id }))
                      }
                      className={`rounded border py-1 text-xs transition ${
                        active
                          ? "border-cyan-500 bg-cyan-500/20 text-cyan-200"
                          : "border-zinc-700 text-zinc-500 hover:border-zinc-500"
                      }`}
                    >
                      {p.icon}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4 space-y-4">
              <p className="text-xs font-medium text-zinc-400">Cores e tipografia</p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-xs text-zinc-500">Cor da barra</label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.goalBarColor ?? creator.themeColor}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, goalBarColor: e.target.value }))
                      }
                      className="h-8 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent p-0.5"
                    />
                    <span className="font-mono text-[11px] text-zinc-400">
                      {settings.goalBarColor ?? "automático"}
                    </span>
                    {settings.goalBarColor && (
                      <button
                        type="button"
                        onClick={() => setSettings((s) => ({ ...s, goalBarColor: null }))}
                        className="text-[10px] text-zinc-500 hover:text-zinc-300"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-500">Cor de fundo</label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.goalBgColor ?? "#000000"}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, goalBgColor: e.target.value }))
                      }
                      className="h-8 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent p-0.5"
                    />
                    <span className="font-mono text-[11px] text-zinc-400">
                      {settings.goalBgColor ?? "automático"}
                    </span>
                    {settings.goalBgColor && (
                      <button
                        type="button"
                        onClick={() => setSettings((s) => ({ ...s, goalBgColor: null }))}
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
                      value={settings.goalTextColor ?? "#ffffff"}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, goalTextColor: e.target.value }))
                      }
                      className="h-8 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent p-0.5"
                    />
                    <span className="font-mono text-[11px] text-zinc-400">
                      {settings.goalTextColor ?? "automático"}
                    </span>
                    {settings.goalTextColor && (
                      <button
                        type="button"
                        onClick={() => setSettings((s) => ({ ...s, goalTextColor: null }))}
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
                  Tamanho da fonte — {settings.goalFontSize}px
                </label>
                <input
                  type="range"
                  min={10}
                  max={32}
                  value={settings.goalFontSize}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, goalFontSize: Number(e.target.value) }))
                  }
                  className="mt-1.5 w-full accent-cyan-500"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.goalShowPercentage}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, goalShowPercentage: e.target.checked }))
                    }
                    className="h-4 w-4 rounded accent-cyan-500"
                  />
                  <span className="text-sm text-zinc-300">Mostrar percentual</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.goalShowValues}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, goalShowValues: e.target.checked }))
                    }
                    className="h-4 w-4 rounded accent-cyan-500"
                  />
                  <span className="text-sm text-zinc-300">Mostrar valores</span>
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <h2 className="font-semibold text-white">Widget OBS</h2>
            <p className="text-sm text-zinc-400">
              Adicione como fonte <strong className="text-zinc-300">Navegador</strong> no OBS.
              O valor atualiza automaticamente a cada doação.
            </p>
            <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/90">
              <p className="truncate px-3 py-2 font-mono text-[11px] text-zinc-500">
                {widgetPath}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:max-w-md">
              <button
                type="button"
                onClick={copyWidget}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                  copied
                    ? "border-emerald-500/50 bg-emerald-600/15 text-emerald-300"
                    : "border-zinc-700 bg-zinc-800/80 text-zinc-200 hover:border-zinc-600"
                }`}
              >
                {copied ? "Link copiado!" : "Copiar link OBS"}
              </button>
              <Link
                href={widgetPath}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2.5 text-sm font-medium text-zinc-200 hover:border-zinc-500"
              >
                Abrir widget
              </Link>
            </div>
          </section>

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
            <GoalOverlay
              raised={creator.raised}
              goal={creator.goal}
              goalTitle={creator.tipPageSettings.goalTitle}
              themeColor={creator.themeColor}
              position={settings.goalOverlayPosition}
              layout={settings.goalOverlayLayout}
              barColor={settings.goalBarColor}
              bgColor={settings.goalBgColor}
              textColor={settings.goalTextColor}
              showPercentage={settings.goalShowPercentage}
              showValues={settings.goalShowValues}
              fontSize={settings.goalFontSize}
              embedded
              show
            />
          </div>
          <p className="text-center text-[11px] text-zinc-600">
            Título: {creator.tipPageSettings.goalTitle}
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
