"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { AdminPayoutRow } from "@/lib/repositories/admin-repository";

interface AdminPayoutsTableProps {
  initialItems: AdminPayoutRow[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
}

type StatusFilter = "all" | "pending" | "processing" | "completed" | "failed";

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "pending", label: "Pendentes" },
  { id: "processing", label: "Processando" },
  { id: "completed", label: "Concluídos" },
  { id: "failed", label: "Falhos" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400",
  processing: "bg-blue-500/15 text-blue-400",
  completed: "bg-emerald-500/15 text-emerald-400",
  failed: "bg-red-500/15 text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  processing: "Processando",
  completed: "Concluído",
  failed: "Falhou",
};

const PIX_TYPE_LABELS: Record<string, string> = {
  email: "E-mail",
  cpf: "CPF",
  phone: "Telefone",
  random: "Chave aleatória",
};

function pixTypeLabel(type: string | null | undefined): string {
  if (!type) return "Pix";
  return PIX_TYPE_LABELS[type] ?? type;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // ignore
  }
}

export function AdminPayoutsTable({
  initialItems,
  initialTotal,
  initialPage,
  initialTotalPages,
}: AdminPayoutsTableProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [fetching, setFetching] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminPayoutRow | null>(null);
  const [failedReason, setFailedReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  async function fetchPage(p: number, status: StatusFilter) {
    setFetching(true);
    try {
      const url = `/api/admin/payouts?page=${p}&status=${status}&limit=20`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = (await res.json()) as {
        items: AdminPayoutRow[];
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

  async function handleAction(payout: AdminPayoutRow, status: "completed" | "failed") {
    setLoadingId(payout.id);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/payouts/${payout.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, failedReason: failedReason || undefined }),
      });
      const data = (await res.json()) as AdminPayoutRow & { error?: string };
      if (!res.ok) {
        setActionError(data.error ?? "Erro ao atualizar saque.");
        return;
      }
      setItems((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      setSelected(null);
      setFailedReason("");
      router.refresh();
    } finally {
      setLoadingId(null);
    }
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
          {total} {total === 1 ? "saque" : "saques"}
        </p>
      </div>

      {fetching ? (
        <div className="rounded-xl border border-zinc-800 py-16 text-center text-sm text-zinc-500">
          Carregando...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center text-sm text-zinc-500">
          Nenhum saque encontrado.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-900/80 text-left text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Criador</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Taxa</th>
                  <th className="px-4 py-3">Chave Pix</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.displayName}</p>
                      <p className="text-xs text-zinc-500">@{p.username}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-400">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {p.fee != null ? formatCurrency(p.fee) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-cyan-300">{p.pixKey}</p>
                      {p.pixKeyType ? (
                        <p className="text-[10px] text-zinc-600">{pixTypeLabel(p.pixKeyType)}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          STATUS_STYLES[p.status] ?? "bg-zinc-700/50 text-zinc-400"
                        }`}
                      >
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      {p.status === "pending" || p.status === "processing" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(p);
                            setFailedReason("");
                            setActionError(null);
                          }}
                          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs hover:border-zinc-500"
                        >
                          Revisar
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-600">
                          {p.completedAt
                            ? new Date(p.completedAt).toLocaleDateString("pt-BR")
                            : "—"}
                        </span>
                      )}
                    </td>
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

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Revisar saque</h3>
                <p className="text-sm text-zinc-400">
                  {selected.displayName} · @{selected.username}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 space-y-2 rounded-lg border border-zinc-800 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Valor</span>
                <span className="font-semibold text-emerald-400">
                  {formatCurrency(selected.amount)}
                </span>
              </div>
              {selected.fee != null && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Taxa</span>
                  <span>{formatCurrency(selected.fee)}</span>
                </div>
              )}
              <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500">Chave Pix · {pixTypeLabel(selected.pixKeyType)}</p>
                    <p className="mt-1 break-all font-mono text-sm text-cyan-300">
                      {selected.pixKey}
                    </p>
                    {selected.pixHolderName ? (
                      <p className="mt-1 text-xs text-zinc-400">
                        Titular: {selected.pixHolderName}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyText(selected.pixKey)}
                    className="shrink-0 rounded-lg border border-zinc-700 px-2 py-1 text-xs hover:border-cyan-500/50"
                  >
                    Copiar
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Status atual</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    STATUS_STYLES[selected.status] ?? "bg-zinc-700/50 text-zinc-400"
                  }`}
                >
                  {STATUS_LABELS[selected.status] ?? selected.status}
                </span>
              </div>
            </div>

            <textarea
              value={failedReason}
              onChange={(e) => setFailedReason(e.target.value)}
              placeholder="Motivo da falha (opcional, para registro)"
              rows={3}
              className="mb-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />

            {actionError && <p className="mb-3 text-sm text-red-400">{actionError}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                disabled={loadingId === selected.id}
                onClick={() => handleAction(selected, "completed")}
                className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold hover:bg-emerald-500 disabled:opacity-50"
              >
                {loadingId === selected.id ? "..." : "Marcar concluído"}
              </button>
              <button
                type="button"
                disabled={loadingId === selected.id}
                onClick={() => handleAction(selected, "failed")}
                className="flex-1 rounded-lg bg-red-600/80 py-2 text-sm font-semibold hover:bg-red-600 disabled:opacity-50"
              >
                {loadingId === selected.id ? "..." : "Marcar como falhou"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
