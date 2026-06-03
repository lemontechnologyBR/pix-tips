"use client";

import { formatCurrency } from "@/lib/format";
import { useEffect, useState } from "react";

const GOAL_PRESETS = [100, 250, 500, 1000, 2000] as const;
const GOAL_TITLES = ["Meta da live", "Meta do mês", "Ajude a stream", "Meta especial"] as const;
const AMOUNT_OPTIONS = [5, 10, 15, 20, 25, 30, 50, 75, 100, 200] as const;
const MAX_PRESET_BUTTONS = 4;

interface TipPageDonationSettingsProps {
  goal: number;
  raised: number;
  goalTitle: string;
  presetAmounts: number[];
  minDonation: number;
  themeColor: string;
  onGoalChange: (goal: number) => void;
  onGoalTitleChange: (title: string) => void;
  onPresetAmountsChange: (amounts: number[]) => void;
  onMinDonationChange: (min: number) => void;
}

function GoalToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        enabled ? "bg-cyan-500" : "bg-zinc-700"
      }`}
      aria-pressed={enabled}
      aria-label={enabled ? "Desativar meta" : "Ativar meta"}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
          enabled ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
}

export function TipPageDonationSettings({
  goal,
  raised,
  goalTitle,
  presetAmounts,
  minDonation,
  themeColor,
  onGoalChange,
  onGoalTitleChange,
  onPresetAmountsChange,
  onMinDonationChange,
}: TipPageDonationSettingsProps) {
  const hasGoal = goal > 0;
  const [lastGoal, setLastGoal] = useState(goal > 0 ? goal : 500);
  const goalPercent = hasGoal ? Math.min((raised / goal) * 100, 100) : 0;
  const sliderValue = hasGoal ? Math.min(Math.max(goal, 50), 5000) : lastGoal;

  useEffect(() => {
    if (goal > 0) setLastGoal(goal);
  }, [goal]);

  function setGoalEnabled(enabled: boolean) {
    if (enabled) {
      onGoalChange(lastGoal > 0 ? lastGoal : 500);
      return;
    }
    if (goal > 0) setLastGoal(goal);
    onGoalChange(0);
  }

  function toggleAmount(value: number) {
    const sorted = [...presetAmounts].sort((a, b) => a - b);
    if (sorted.includes(value)) {
      if (sorted.length <= 1) return;
      onPresetAmountsChange(sorted.filter((v) => v !== value));
      return;
    }
    if (sorted.length >= MAX_PRESET_BUTTONS) {
      onPresetAmountsChange([...sorted.slice(1), value].sort((a, b) => a - b));
      return;
    }
    onPresetAmountsChange([...sorted, value].sort((a, b) => a - b));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-white">Meta de doação</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              {hasGoal
                ? "Barra de progresso visível na tip page"
                : "Meta oculta na página pública"}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              className={`text-xs font-medium ${
                hasGoal ? "text-emerald-400" : "text-zinc-500"
              }`}
            >
              {hasGoal ? "Ativa" : "Desativada"}
            </span>
            <GoalToggle enabled={hasGoal} onChange={setGoalEnabled} />
          </div>
        </div>

        {hasGoal ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-3">
              <div className="mb-2 flex items-end justify-between gap-2">
                <span className="text-xs text-zinc-500">{goalTitle}</span>
                <span className="text-sm font-semibold text-white">
                  {formatCurrency(raised)}{" "}
                  <span className="font-normal text-zinc-500">
                    / {formatCurrency(goal)}
                  </span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${goalPercent}%`, backgroundColor: themeColor }}
                />
              </div>
              <p className="mt-1 text-right text-[10px] text-zinc-500">
                {goalPercent.toFixed(0)}% arrecadado
              </p>
            </div>

            <div>
              <div className="flex flex-wrap gap-1.5">
                {GOAL_PRESETS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => onGoalChange(v)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      goal === v
                        ? "bg-cyan-500 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {formatCurrency(v)}
                  </button>
                ))}
              </div>
            </div>

            <label className="block text-sm">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Valor da meta</span>
                <span className="font-semibold text-white">{formatCurrency(sliderValue)}</span>
              </div>
              <input
                type="range"
                min={50}
                max={5000}
                step={50}
                value={sliderValue}
                onChange={(e) => onGoalChange(Number(e.target.value))}
                className="mt-2 w-full accent-cyan-500"
              />
              <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
                <span>R$ 50</span>
                <span>R$ 5.000</span>
              </div>
            </label>

            <div>
              <span className="text-sm text-zinc-400">Título</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {GOAL_TITLES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onGoalTitleChange(t)}
                    className={`rounded-lg px-2 py-1 text-[11px] transition ${
                      goalTitle === t
                        ? "bg-cyan-500/30 text-cyan-200 ring-1 ring-cyan-500/50"
                        : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                value={goalTitle}
                onChange={(e) => onGoalTitleChange(e.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-zinc-700/80 bg-zinc-950/40 px-4 py-8 text-center">
            <p className="text-sm text-zinc-500">
              Ative o toggle acima para exibir a meta na sua página.
            </p>
            <button
              type="button"
              onClick={() => setGoalEnabled(true)}
              className="mt-4 rounded-xl web3-btn-primary px-5 py-2.5 text-sm font-medium text-white hover:brightness-110"
            >
              Ativar meta — {formatCurrency(lastGoal)}
            </button>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 sm:p-5">
        <h2 className="font-semibold">Pagamentos</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Escolha até {MAX_PRESET_BUTTONS} botões rápidos na tip page
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {AMOUNT_OPTIONS.map((v) => {
            const selected = presetAmounts.includes(v);
            return (
              <button
                key={v}
                type="button"
                onClick={() => toggleAmount(v)}
                className={`min-w-[3rem] rounded-lg px-2.5 py-2 text-sm font-semibold transition ${
                  selected
                    ? "bg-cyan-500 text-white ring-2 ring-cyan-400/40"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                }`}
              >
                R${v}
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/80 p-3">
          <p className="mb-2 text-[11px] text-zinc-500">Preview dos botões</p>
          <div className="grid grid-cols-4 gap-2">
            {(presetAmounts.length > 0 ? presetAmounts : [5, 10, 20, 50]).map((v) => (
              <div
                key={v}
                className="rounded-lg bg-zinc-800 py-2 text-center text-sm font-semibold text-zinc-200"
              >
                R${v}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 border-t border-zinc-800 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Valor mínimo</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={minDonation <= 1}
                onClick={() => onMinDonationChange(Math.max(1, minDonation - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:border-cyan-500 hover:text-white disabled:opacity-30"
              >
                −
              </button>
              <span className="min-w-[4rem] text-center text-lg font-bold text-white">
                {formatCurrency(minDonation)}
              </span>
              <button
                type="button"
                disabled={minDonation >= 100}
                onClick={() => onMinDonationChange(Math.min(100, minDonation + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:border-cyan-500 hover:text-white disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={minDonation}
            onChange={(e) => onMinDonationChange(Number(e.target.value))}
            className="mt-3 w-full accent-cyan-500"
          />
        </div>
      </section>
    </div>
  );
}
