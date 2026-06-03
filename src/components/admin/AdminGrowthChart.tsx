"use client";

import { useState } from "react";

interface AdminGrowthChartProps {
  data: { date: string; creators: number }[];
}

const PERIODS = [
  { key: "7", label: "7 dias", days: 7 },
  { key: "30", label: "30 dias", days: 30 },
] as const;

export function AdminGrowthChart({ data }: AdminGrowthChartProps) {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["key"]>("30");

  const days = PERIODS.find((p) => p.key === period)?.days ?? 30;
  const sliced = data.slice(-days);
  const max = Math.max(...sliced.map((d) => d.creators), 1);
  const latest = sliced[sliced.length - 1]?.creators ?? 0;
  const first = sliced[0]?.creators ?? 0;
  const growth = first > 0 ? ((latest - first) / first) * 100 : 0;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Crescimento de criadores</h2>
          <p className="text-sm text-zinc-400">
            {latest} criadores ·{" "}
            <span className={growth >= 0 ? "text-emerald-400" : "text-red-400"}>
              {growth >= 0 ? "+" : ""}
              {growth.toFixed(0)}% no período
            </span>
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-zinc-800 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                period === p.key
                  ? "bg-red-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex h-40 items-end gap-1">
        {sliced.map((d) => (
          <div
            key={d.date}
            className="group relative flex-1"
            title={`${d.date}: ${d.creators} criadores`}
          >
            <div
              className="w-full rounded-t bg-red-600/80 transition hover:bg-red-500"
              style={{
                height: `${Math.max((d.creators / max) * 100, d.creators > 0 ? 4 : 0)}%`,
                minHeight: d.creators > 0 ? 4 : 0,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
