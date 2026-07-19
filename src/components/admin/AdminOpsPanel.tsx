"use client";

import { useState } from "react";
import type { AdminOpsSnapshot } from "@/lib/repositories/admin-ops-repository";

interface AdminOpsPanelProps {
  initial: AdminOpsSnapshot;
}

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

export function AdminOpsPanel({ initial }: AdminOpsPanelProps) {
  const [data] = useState(initial);
  const { analytics } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Mercado Pago"
          value={data.mercadoPagoConfigured ? "conectado" : "off"}
          hint={`${data.counts.payoutKeys} chaves Pix de saque cadastradas`}
        />
        <Metric
          label="CPF provider"
          value={data.cpfProvider}
          hint={data.diditConfigured ? "Didit KYC ativo" : "Didit off"}
        />
        <Metric
          label="Tip pages (7d)"
          value={String(analytics.tipPageViews7d)}
          hint={`${data.counts.creators} criadores`}
        />
        <Metric
          label="Widgets (7d)"
          value={String(analytics.widgetViews7d)}
          hint={`${analytics.widgetViews24h} nas últimas 24h · ${analytics.uniqueWidgetCreators7d} criadores`}
        />
      </div>

      <section className="rounded-xl border border-cyan-500/20 bg-zinc-900/40 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-semibold">Widgets OBS</h3>
            <p className="text-xs text-zinc-500">
              Aberturas rastreadas nos overlays (alert, qrcode, goal, etc.) — últimos 7 dias
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
            <span>
              <span className="font-semibold text-white">{analytics.widgetViews7d}</span>{" "}
              aberturas
            </span>
            <span>
              <span className="font-semibold text-white">{analytics.widgetViews24h}</span>{" "}
              em 24h
            </span>
            <span>
              <span className="font-semibold text-white">
                {analytics.uniqueWidgetCreators7d}
              </span>{" "}
              criadores
            </span>
            <span>
              <span className="font-semibold text-white">{analytics.widgets.length}</span>{" "}
              tipos
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Por tipo
            </h4>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-zinc-500">
                  <tr>
                    <th className="py-1.5 pr-2">Widget</th>
                    <th className="py-1.5 pr-2">Views</th>
                    <th className="py-1.5">Criadores</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.widgets.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-zinc-500">
                        Sem tracks ainda
                      </td>
                    </tr>
                  ) : (
                    analytics.widgets.map((row) => (
                      <tr key={row.widget} className="border-t border-zinc-800/60">
                        <td className="py-1.5 pr-2 font-mono text-xs text-cyan-300">
                          {row.widget}
                        </td>
                        <td className="py-1.5 pr-2 font-medium">{row.count}</td>
                        <td className="py-1.5 text-zinc-400">{row.uniqueCreators}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Criadores com mais widgets abertos
            </h4>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-zinc-500">
                  <tr>
                    <th className="py-1.5 pr-2">Criador</th>
                    <th className="py-1.5 pr-2">Total</th>
                    <th className="py-1.5">Tipos usados</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topWidgetCreators.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-zinc-500">
                        Sem tracks ainda
                      </td>
                    </tr>
                  ) : (
                    analytics.topWidgetCreators.map((row) => (
                      <tr key={row.creatorId} className="border-t border-zinc-800/60">
                        <td className="py-1.5 pr-2 text-zinc-300">@{row.username}</td>
                        <td className="py-1.5 pr-2 font-medium">{row.views}</td>
                        <td className="py-1.5">
                          <div className="flex flex-wrap gap-1">
                            {row.widgets.map((w) => (
                              <span
                                key={w.widget}
                                className="rounded border border-zinc-700 bg-zinc-950/60 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400"
                              >
                                {w.widget} · {w.count}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Últimas aberturas
          </h4>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-500">
                <tr>
                  <th className="py-1.5 pr-2">Quando</th>
                  <th className="py-1.5 pr-2">Criador</th>
                  <th className="py-1.5">Widget</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentWidgets.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-zinc-500">
                      Sem tracks ainda
                    </td>
                  </tr>
                ) : (
                  analytics.recentWidgets.map((row) => (
                    <tr key={row.id} className="border-t border-zinc-800/60">
                      <td className="py-1.5 pr-2 text-xs text-zinc-500">
                        {formatRelativePt(row.createdAt)}
                      </td>
                      <td className="py-1.5 pr-2 text-zinc-300">@{row.username}</td>
                      <td className="py-1.5 font-mono text-xs text-cyan-300">
                        {row.widget}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h3 className="font-semibold">KYC por status</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {data.kyc.length === 0 ? (
              <li className="text-zinc-500">Sem registros</li>
            ) : (
              data.kyc.map((row) => (
                <li key={row.status} className="flex justify-between">
                  <span className="text-zinc-400">{row.status}</span>
                  <span className="font-medium">{row.count}</span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h3 className="font-semibold">Tip pages mais vistas (7d)</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {analytics.topTipPages.length === 0 ? (
              <li className="text-zinc-500">Sem tracks ainda</li>
            ) : (
              analytics.topTipPages.map((row) => (
                <li key={row.creatorId} className="flex justify-between">
                  <span className="text-zinc-400">@{row.username}</span>
                  <span className="font-medium">{row.views} views</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-bold capitalize">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}
