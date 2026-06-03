"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import { OverviewIcon } from "@/components/dashboard/OverviewIcon";

interface EarningsChartProps {
  data: { date: string; amount: number }[];
}

const PERIODS = [
  { key: "7", label: "7d", days: 7 },
  { key: "30", label: "30d", days: 30 },
  { key: "90", label: "90d", days: 90 },
] as const;

function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function EarningsChart({ data }: EarningsChartProps) {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["key"]>("30");
  const [hovered, setHovered] = useState<number | null>(null);

  const days = PERIODS.find((p) => p.key === period)?.days ?? 30;
  const sliced = data.slice(-days);
  const max = Math.max(...sliced.map((d) => d.amount), 1);
  const total = sliced.reduce((s, d) => s + d.amount, 0);
  const avg = sliced.length > 0 ? total / sliced.length : 0;
  const hasData = total > 0;

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            <OverviewIcon name="chart" className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Arrecadação</h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              Evolução diária das doações confirmadas
            </p>
          </div>
        </div>
        <div className="flex gap-1 rounded-xl border border-zinc-800 bg-zinc-950/60 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                period === p.key
                  ? "bg-cyan-500 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 py-14 text-center">
          <OverviewIcon name="spark" className="h-8 w-8 text-zinc-600" />
          <p className="mt-3 text-sm font-medium text-zinc-400">
            Nenhuma doação no período
          </p>
          <p className="mt-1 max-w-xs text-xs text-zinc-600">
            Compartilhe seu link da tip page para começar a ver o gráfico aqui.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-xs text-zinc-500">Total no período</p>
              <p className="mt-0.5 font-semibold text-emerald-400">
                {formatCurrency(total)}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Média por dia</p>
              <p className="mt-0.5 font-semibold text-zinc-200">
                {formatCurrency(avg)}
              </p>
            </div>
            {hovered !== null && sliced[hovered] && (
              <div>
                <p className="text-xs text-zinc-500">
                  {formatDayLabel(sliced[hovered].date)}
                </p>
                <p className="mt-0.5 font-semibold text-cyan-300">
                  {formatCurrency(sliced[hovered].amount)}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex h-44 items-end gap-1 sm:gap-1.5">
            {sliced.map((d, i) => {
              const heightPct = Math.max((d.amount / max) * 100, d.amount > 0 ? 6 : 0);
              const active = hovered === i;
              return (
                <div
                  key={d.date}
                  className="group relative flex flex-1 flex-col items-center justify-end"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      active
                        ? "bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                        : "bg-cyan-500/70 hover:brightness-110"
                    }`}
                    style={{
                      height: `${heightPct}%`,
                      minHeight: d.amount > 0 ? 6 : 0,
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex justify-between text-[10px] text-zinc-600">
            {sliced.length > 0 && (
              <>
                <span>{formatDayLabel(sliced[0].date)}</span>
                <span>{formatDayLabel(sliced[sliced.length - 1].date)}</span>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
