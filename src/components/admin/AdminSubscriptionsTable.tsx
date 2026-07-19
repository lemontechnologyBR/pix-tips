"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { AdminSubscriptionRow } from "@/lib/repositories/admin-repository";

interface AdminSubscriptionsTableProps {
  initialItems: AdminSubscriptionRow[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
}

type StatusFilter = "all" | "paid" | "pending";

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "paid", label: "Pagos" },
  { id: "pending", label: "Pendentes" },
];

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-amber-500/15 text-amber-400",
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Pago",
  pending: "Pendente",
};

const PLAN_LABELS: Record<string, string> = {
  pro_monthly: "Pro Mensal",
  pro_annual: "Pro Anual",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function AdminSubscriptionsTable({
  initialItems,
  initialTotal,
  initialPage,
  initialTotalPages,
}: AdminSubscriptionsTableProps) {
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [fetching, setFetching] = useState(false);

  async function fetchPage(p: number, status: StatusFilter) {
    setFetching(true);
    try {
      const url = `/api/admin/subscriptions?page=${p}&status=${status}&limit=20`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = (await res.json()) as {
        items: AdminSubscriptionRow[];
        total: number;
        page: number;
        totalPages: number;
      };
      setItems(data.items);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } finally {
      setFetching(false);
    }
  }

  function handleFilterChange(f: StatusFilter) {
    setFilter(f);
    fetchPage(1, f);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => handleFilterChange(f.id)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                filter === f.id
                  ? "bg-red-600/20 text-red-300"
                  : "border border-zinc-700 text-zinc-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-zinc-500">
          {total} {total === 1 ? "pagamento" : "pagamentos"}
        </p>
      </div>

      {fetching ? (
        <div className="rounded-xl border border-zinc-800 py-16 text-center text-sm text-zinc-500">
          Carregando...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center text-sm text-zinc-500">
          Nenhum pagamento de assinatura encontrado.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-900/80 text-left text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Criador</th>
                  <th className="px-4 py-3">Plano</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Pago em</th>
                  <th className="px-4 py-3">Pro expira em</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{s.displayName}</p>
                      <p className="text-xs text-zinc-500">
                        @{s.username}
                        {s.currentPlan === "pro" && (
                          <span className="ml-2 rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] text-violet-300">
                            PRO
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {PLAN_LABELS[s.planType] ?? s.planType}
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-400">
                      {formatCurrency(s.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          STATUS_STYLES[s.status] ?? "bg-zinc-700/50 text-zinc-400"
                        }`}
                      >
                        {STATUS_LABELS[s.status] ?? s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {s.status === "paid" ? formatDate(s.paidAt ?? s.createdAt) : formatDate(null)}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{formatDate(s.proExpiresAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={page <= 1 || fetching}
                onClick={() => fetchPage(page - 1, filter)}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:text-white disabled:opacity-40"
              >
                ← Anterior
              </button>
              <span className="text-sm text-zinc-500">
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages || fetching}
                onClick={() => fetchPage(page + 1, filter)}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:text-white disabled:opacity-40"
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
