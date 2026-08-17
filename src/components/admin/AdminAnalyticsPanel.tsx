"use client";

import { useCallback, useState } from "react";
import type { AdminTrafficAnalytics } from "@/lib/repositories/admin-analytics-repository";

interface AdminAnalyticsPanelProps {
  initial: AdminTrafficAnalytics;
}

const PERIODS = [
  { days: 7, label: "7 dias" },
  { days: 30, label: "30 dias" },
  { days: 90, label: "90 dias" },
] as const;

function formatRelativePt(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  return `${days} d`;
}

function formatDayLabel(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}

function ShareBar({ share }: { share: number }) {
  return (
    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
      <div
        className="h-full rounded-full bg-cyan-500/80"
        style={{ width: `${Math.min(share, 100)}%` }}
      />
    </div>
  );
}

function SourceTable({
  title,
  subtitle,
  rows,
  valueLabel = "Acessos",
}: {
  title: string;
  subtitle?: string;
  rows: { label: string; count: number; share: number }[];
  valueLabel?: string;
}) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="mb-4">
        <h3 className="font-semibold">{title}</h3>
        {subtitle ? <p className="text-xs text-zinc-500">{subtitle}</p> : null}
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-zinc-500">Sem dados no período.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-500">
              <tr>
                <th className="py-1.5 pr-3">Origem</th>
                <th className="py-1.5 pr-3">{valueLabel}</th>
                <th className="py-1.5 w-28">%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-zinc-800/60">
                  <td className="py-2 pr-3">
                    <div className="font-medium text-zinc-200">{row.label}</div>
                    <ShareBar share={row.share} />
                  </td>
                  <td className="py-2 pr-3 font-mono text-cyan-300">{row.count}</td>
                  <td className="py-2 text-zinc-400">{row.share}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function AdminAnalyticsPanel({ initial }: AdminAnalyticsPanelProps) {
  const [data, setData] = useState(initial);
  const [periodDays, setPeriodDays] = useState(initial.periodDays);
  const [creator, setCreator] = useState(initial.creator ?? "");
  const [creatorInput, setCreatorInput] = useState(initial.creator ?? "");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (days: number, creatorSlug: string) => {
    setLoading(true);
    setPeriodDays(days);
    setCreator(creatorSlug);
    try {
      const params = new URLSearchParams({ days: String(days) });
      if (creatorSlug) params.set("creator", creatorSlug);
      const res = await fetch(`/api/admin/analytics?${params.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as AdminTrafficAnalytics;
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  function applyCreator(raw: string) {
    const slug = raw.trim().replace(/^@/, "").toLowerCase();
    setCreatorInput(slug);
    void load(periodDays, slug);
  }

  const maxDay = Math.max(...data.byDay.map((d) => d.count), 1);
  const dayDelta =
    data.visitsYesterday > 0
      ? Math.round(
          ((data.visitsToday - data.visitsYesterday) / data.visitsYesterday) *
            100,
        )
      : data.visitsToday > 0
        ? 100
        : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            applyCreator(creatorInput);
          }}
        >
          <input
            type="search"
            value={creatorInput}
            onChange={(e) => setCreatorInput(e.target.value)}
            placeholder="Filtrar por @criador"
            className="w-52 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs hover:border-cyan-500/50 disabled:opacity-50"
          >
            Ver origem
          </button>
          {creator ? (
            <button
              type="button"
              onClick={() => applyCreator("")}
              className="text-xs text-zinc-500 hover:text-white"
            >
              limpar @{creator}
            </button>
          ) : (
            <p className="text-sm text-zinc-400">
              Visitas ao site e tip pages · demo excluído
            </p>
          )}
        </form>
        <div className="flex gap-1 rounded-lg bg-zinc-800 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              disabled={loading}
              onClick={() => void load(p.days, creator)}
              className={`rounded-md px-3 py-1 text-xs font-medium disabled:opacity-50 ${
                periodDays === p.days
                  ? "bg-cyan-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Total de acessos"
          value={String(data.totalVisits)}
          hint={`Últimos ${data.periodDays} dias`}
        />
        <Metric
          label="Hoje"
          value={String(data.visitsToday)}
          hint={
            dayDelta !== 0
              ? `${dayDelta >= 0 ? "+" : ""}${dayDelta}% vs ontem`
              : `${data.visitsYesterday} ontem`
          }
        />
        <Metric
          label="Páginas de entrada"
          value={String(data.uniqueLandingPages)}
          hint="URLs únicas visitadas"
        />
        <Metric
          label="Campanhas UTM"
          value={String(data.byCampaign.length)}
          hint="Combinações source/medium/campaign"
        />
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="mb-4">
          <h3 className="font-semibold">Acessos por dia</h3>
          <p className="text-xs text-zinc-500">
            Site + tip pages (sem widgets OBS)
          </p>
        </div>
        <div className="flex h-44 items-end gap-1">
          {data.byDay.map((d) => (
            <div
              key={d.date}
              className="group relative flex-1"
              title={`${d.date}: ${d.count} acessos`}
            >
              <div
                className="w-full rounded-t bg-cyan-600/80 transition hover:bg-cyan-500"
                style={{
                  height: `${Math.max((d.count / maxDay) * 100, d.count > 0 ? 4 : 0)}%`,
                  minHeight: d.count > 0 ? 4 : 0,
                }}
              />
              <span className="pointer-events-none absolute -bottom-5 left-1/2 hidden -translate-x-1/2 text-[9px] text-zinc-600 group-hover:block">
                {formatDayLabel(d.date)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <SourceTable
          title="Origem do tráfego"
          subtitle="UTM, referrer, Google Ads ou app (Twitch/Kick/Discord)"
          rows={data.bySource}
        />
        <SourceTable
          title="Referrers"
          subtitle="De onde o visitante veio antes de entrar"
          rows={data.byReferrer}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SourceTable
          title="Páginas de entrada"
          subtitle="URL visitada"
          rows={data.byLandingPage}
          valueLabel="Visitas"
        />

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="mb-4">
            <h3 className="font-semibold">Campanhas (UTM)</h3>
            <p className="text-xs text-zinc-500">
              source · medium · campaign
            </p>
          </div>
          {data.byCampaign.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhuma campanha rastreada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-zinc-500">
                  <tr>
                    <th className="py-1.5 pr-2">Campanha</th>
                    <th className="py-1.5 pr-2">Acessos</th>
                    <th className="py-1.5">%</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byCampaign.map((row) => (
                    <tr
                      key={`${row.source}-${row.medium}-${row.campaign}`}
                      className="border-t border-zinc-800/60"
                    >
                      <td className="py-2 pr-2">
                        <div className="font-medium text-zinc-200">
                          {row.campaign !== "—" ? row.campaign : row.source}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {row.source} · {row.medium}
                        </div>
                      </td>
                      <td className="py-2 pr-2 font-mono text-cyan-300">
                        {row.count}
                      </td>
                      <td className="py-2 text-zinc-400">{row.share}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {!creator ? (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="mb-4">
            <h3 className="font-semibold">Tip pages mais acessadas</h3>
            <p className="text-xs text-zinc-500">
              Clique no criador para ver de onde vieram os acessos
            </p>
          </div>
          {data.byCreator.length === 0 ? (
            <p className="text-sm text-zinc-500">Sem tip pages no período.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-zinc-500">
                  <tr>
                    <th className="py-1.5 pr-3">Criador</th>
                    <th className="py-1.5 pr-3">Acessos</th>
                    <th className="py-1.5 w-28">%</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byCreator.map((row) => (
                    <tr key={row.label} className="border-t border-zinc-800/60">
                      <td className="py-2 pr-3">
                        <button
                          type="button"
                          onClick={() => applyCreator(row.label)}
                          className="font-medium text-cyan-300 hover:underline"
                        >
                          {row.label}
                        </button>
                        <ShareBar share={row.share} />
                      </td>
                      <td className="py-2 pr-3 font-mono text-cyan-300">{row.count}</td>
                      <td className="py-2 text-zinc-400">{row.share}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="mb-4">
          <h3 className="font-semibold">Acessos recentes</h3>
          <p className="text-xs text-zinc-500">Últimas visitas registradas</p>
        </div>
        {data.recentVisits.length === 0 ? (
          <p className="text-sm text-zinc-500">Sem visitas ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-500">
                <tr>
                  <th className="py-1.5 pr-3">Quando</th>
                  <th className="py-1.5 pr-3">Tipo</th>
                  <th className="py-1.5 pr-3">Página</th>
                  <th className="py-1.5 pr-3">Origem</th>
                  <th className="py-1.5">Referrer</th>
                </tr>
              </thead>
              <tbody>
                {data.recentVisits.map((row) => (
                  <tr key={row.id} className="border-t border-zinc-800/60">
                    <td className="py-2 pr-3 text-zinc-400">
                      {formatRelativePt(row.createdAt)}
                    </td>
                    <td className="py-2 pr-3">{row.type}</td>
                    <td className="py-2 pr-3 font-mono text-xs text-cyan-300">
                      {row.path ?? "—"}
                    </td>
                    <td className="py-2 pr-3">{row.source}</td>
                    <td className="py-2 text-zinc-400">
                      {row.referrer}
                      {row.medium !== "—" ? (
                        <span className="block text-xs text-zinc-600">
                          {row.medium}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
