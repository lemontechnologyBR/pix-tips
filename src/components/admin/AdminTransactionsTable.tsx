"use client";

import { useCallback, useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { Transaction, TransactionStatus } from "@/types";

export interface AdminTransaction extends Transaction {
  creatorUsername: string;
  creatorDisplayName: string;
}

interface AdminTransactionsTableProps {
  initialItems: AdminTransaction[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
}

const STATUS_STYLES: Record<TransactionStatus, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-amber-500/15 text-amber-400",
  failed: "bg-red-500/15 text-red-400",
  expired: "bg-zinc-500/15 text-zinc-400",
};

const STATUS_LABELS: Record<TransactionStatus, string> = {
  confirmed: "Confirmado",
  pending: "Pendente",
  failed: "Falhou",
  expired: "Expirado",
};

export function AdminTransactionsTable({
  initialItems,
  initialTotal,
  initialPage,
  initialTotalPages,
}: AdminTransactionsTableProps) {
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [period, setPeriod] = useState("30");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(
    async (nextPage: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          period,
          status,
          search,
          page: String(nextPage),
          limit: "20",
        });
        const res = await fetch(`/api/admin/transactions?${params}`);
        if (!res.ok) return;
        const data = (await res.json()) as {
          items: AdminTransaction[];
          total: number;
          page: number;
          totalPages: number;
        };
        setItems(data.items);
        setTotal(data.total);
        setPage(data.page);
        setTotalPages(data.totalPages);
      } finally {
        setLoading(false);
      }
    },
    [period, status, search],
  );

  function exportCsv() {
    const header =
      "Data,Criador,Username,Doador,Valor,Método,Status,Mensagem\n";
    const rows = items
      .map(
        (t) =>
          `${t.createdAt},${t.creatorDisplayName},@${t.creatorUsername},${t.donorName},${t.amount},${t.method},${t.status},"${t.message.replace(/"/g, '""')}"`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transacoes-admin-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        >
          <option value="7">Últimos 7 dias</option>
          <option value="30">30 dias</option>
          <option value="90">90 dias</option>
          <option value="year">Último ano</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        >
          <option value="all">Todos os status</option>
          <option value="confirmed">Confirmado</option>
          <option value="pending">Pendente</option>
          <option value="failed">Falhou</option>
        </select>
        <input
          type="search"
          placeholder="Buscar doador ou @criador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[160px] flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => fetchTransactions(1)}
          disabled={loading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-500 disabled:opacity-50"
        >
          {loading ? "Filtrando..." : "Filtrar"}
        </button>
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500"
        >
          Exportar CSV
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center text-sm text-zinc-500">
          Nenhuma transação encontrada com esses filtros.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 text-left text-zinc-400">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Criador</th>
                <th className="px-4 py-3">Doador</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                >
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(t.createdAt).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{t.creatorDisplayName}</p>
                    <p className="text-xs text-zinc-500">@{t.creatorUsername}</p>
                  </td>
                  <td className="px-4 py-3">
                    {t.anonymous ? "Anônimo" : t.donorName}
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-400">
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="px-4 py-3 uppercase text-zinc-400">{t.method}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[t.status]}`}
                    >
                      {STATUS_LABELS[t.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <p>
          Página {page} de {totalPages} · {total} transações
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => fetchTransactions(page - 1)}
            className="rounded border border-zinc-700 px-3 py-1 disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => fetchTransactions(page + 1)}
            className="rounded border border-zinc-700 px-3 py-1 disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}
