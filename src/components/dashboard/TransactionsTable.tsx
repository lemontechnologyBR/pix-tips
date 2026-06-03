"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { Transaction, TransactionStatus } from "@/types";

interface TransactionsTableProps {
  initialItems: Transaction[];
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

export function TransactionsTable({
  initialItems,
  initialTotal,
  initialPage,
  initialTotalPages,
}: TransactionsTableProps) {
  const [items] = useState(initialItems);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [period, setPeriod] = useState("30");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return items.filter((t) => {
      if (status !== "all" && t.status !== status) return false;
      if (search && !t.donorName.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [items, status, search]);

  function exportCsv() {
    const header = "Data,Doador,Valor,Método,Status,Mensagem\n";
    const rows = filtered
      .map(
        (t) =>
          `${t.createdAt},${t.donorName},${t.amount},${t.method},${t.status},"${t.message}"`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transacoes.csv";
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
          placeholder="Buscar doador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm min-w-[160px]"
        />
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500"
        >
          Exportar CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center text-sm text-zinc-500">
          Nenhuma transação encontrada com esses filtros.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 text-left text-zinc-400">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Doador</th>
                <th className="px-4 py-3">Mensagem</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="cursor-pointer border-b border-zinc-800/50 hover:bg-zinc-900/50"
                  onClick={() => setSelected(t)}
                >
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(t.createdAt).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    {t.anonymous ? "Anônimo" : t.donorName}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-zinc-500">
                    {t.message || "—"}
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

      <p className="text-center text-xs text-zinc-500">
        Página {initialPage} de {initialTotalPages} · {initialTotal} transações
      </p>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Detalhes da transação</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">ID</dt>
                <dd className="font-mono text-xs">{selected.id.slice(0, 8)}…</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Doador</dt>
                <dd>{selected.anonymous ? "Anônimo" : selected.donorName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Valor</dt>
                <dd className="text-emerald-400">{formatCurrency(selected.amount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Método</dt>
                <dd className="uppercase">{selected.method}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Status</dt>
                <dd>{STATUS_LABELS[selected.status]}</dd>
              </div>
              {selected.message && (
                <div>
                  <dt className="text-zinc-500">Mensagem</dt>
                  <dd className="mt-1 rounded-lg bg-zinc-950 p-3">{selected.message}</dd>
                </div>
              )}
            </dl>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-6 w-full rounded-lg border border-zinc-700 py-2 text-sm hover:border-zinc-500"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
