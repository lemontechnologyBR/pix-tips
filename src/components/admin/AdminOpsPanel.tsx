"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { AdminOpsSnapshot } from "@/lib/repositories/admin-ops-repository";

interface AdminOpsPanelProps {
  initial: AdminOpsSnapshot;
}

export function AdminOpsPanel({ initial }: AdminOpsPanelProps) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function syncWoovi() {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/ops/sync-woovi", { method: "POST" });
      const body = (await res.json()) as {
        ensured?: number;
        errors?: string[];
        error?: string;
      };
      if (!res.ok) {
        setMessage(body.error ?? "Falha ao sincronizar.");
        return;
      }
      setMessage(
        `Subcontas OK: ${body.ensured ?? 0}` +
          (body.errors?.length ? ` · erros: ${body.errors.join("; ")}` : ""),
      );
      router.refresh();
      const refreshed = await fetch("/api/admin/ops");
      if (refreshed.ok) {
        setData((await refreshed.json()) as AdminOpsSnapshot);
      }
    } finally {
      setSyncing(false);
    }
  }

  const mainBalance =
    data.wooviMainBalanceCents != null
      ? formatCurrency(data.wooviMainBalanceCents / 100)
      : "—";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Woovi"
          value={data.wooviConfigured ? "conectado" : "off"}
          hint={`Conta principal: ${mainBalance}`}
        />
        <Metric
          label="CPF provider"
          value={data.cpfProvider}
          hint={data.diditConfigured ? "Didit KYC ativo" : "Didit off"}
        />
        <Metric
          label="Tip pages (7d)"
          value={String(data.analytics.tipPageViews7d)}
          hint={`${data.counts.creators} criadores`}
        />
        <Metric
          label="Widgets (7d)"
          value={String(data.analytics.widgetViews7d)}
          hint={`${data.counts.pendingKyc} KYC pendentes`}
        />
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Carteiras Pix (Woovi)</h3>
            <p className="text-xs text-zinc-500">
              Saldos das subcontas vinculadas aos criadores do pix.tips
            </p>
          </div>
          <button
            type="button"
            disabled={syncing || !data.wooviConfigured}
            onClick={() => void syncWoovi()}
            className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"
          >
            {syncing ? "Sincronizando…" : "Recriar/sincronizar subcontas"}
          </button>
        </div>
        {message && <p className="mt-3 text-sm text-zinc-300">{message}</p>}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-500">
              <tr>
                <th className="px-2 py-2">Criador</th>
                <th className="px-2 py-2">Chave</th>
                <th className="px-2 py-2">Saldo</th>
                <th className="px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.pixKeys.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 py-6 text-center text-zinc-500">
                    Nenhuma chave Pix cadastrada.
                  </td>
                </tr>
              ) : (
                data.pixKeys.map((row) => (
                  <tr key={`${row.username}-${row.pixKeyMasked}`} className="border-t border-zinc-800/60">
                    <td className="px-2 py-2">
                      @{row.username}
                      {row.isPrimary ? (
                        <span className="ml-2 text-[10px] uppercase text-cyan-400">primary</span>
                      ) : null}
                    </td>
                    <td className="px-2 py-2 font-mono text-xs text-zinc-400">
                      {row.pixKeyMasked}
                    </td>
                    <td className="px-2 py-2">
                      {row.balanceCents != null
                        ? formatCurrency(row.balanceCents / 100)
                        : "—"}
                    </td>
                    <td className="px-2 py-2 text-xs">
                      {!row.remoteOk ? (
                        <span className="text-amber-400">sem subconta na Woovi atual</span>
                      ) : row.withdrawBlocked ? (
                        <span className="text-red-400">saque bloqueado</span>
                      ) : (
                        <span className="text-emerald-400">ok</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
          <h3 className="font-semibold">Widgets mais abertos (7d)</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {data.analytics.widgets.length === 0 ? (
              <li className="text-zinc-500">Sem tracks ainda</li>
            ) : (
              data.analytics.widgets.map((row) => (
                <li key={row.widget} className="flex justify-between">
                  <span className="text-zinc-400">{row.widget}</span>
                  <span className="font-medium">{row.count}</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h3 className="font-semibold">Tip pages mais vistas (7d)</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {data.analytics.topTipPages.length === 0 ? (
            <li className="text-zinc-500">Sem tracks ainda</li>
          ) : (
            data.analytics.topTipPages.map((row) => (
              <li key={row.creatorId} className="flex justify-between">
                <span className="text-zinc-400">@{row.username}</span>
                <span className="font-medium">{row.views} views</span>
              </li>
            ))
          )}
        </ul>
      </section>
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
