"use client";

import Link from "next/link";
import { tipPagePath } from "@/lib/brand";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { AdminCreatorRow } from "@/lib/repositories/admin-repository";

interface AdminCreatorsTableProps {
  initialCreators: AdminCreatorRow[];
}

export function AdminCreatorsTable({ initialCreators }: AdminCreatorsTableProps) {
  const router = useRouter();
  const [creators, setCreators] = useState(initialCreators);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = creators.filter((c) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      c.username.toLowerCase().includes(q) ||
      c.displayName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  async function toggleSuspend(creator: AdminCreatorRow) {
    setLoadingId(creator.id);
    try {
      const res = await fetch(`/api/admin/creators/${creator.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSuspended: !creator.isSuspended }),
      });
      if (!res.ok) return;
      const updated = (await res.json()) as AdminCreatorRow;
      setCreators((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
      );
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <input
        type="search"
        placeholder="Buscar por nome, @username ou e-mail..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm sm:max-w-md"
      />

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center text-sm text-zinc-500">
          Nenhum criador encontrado.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 text-left text-zinc-400">
              <tr>
                <th className="px-4 py-3">Criador</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Plano</th>
                <th className="px-4 py-3">Arrecadado</th>
                <th className="px-4 py-3">Transações</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.displayName}</p>
                    <Link
                      href={tipPagePath(c.username)}
                      target="_blank"
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      @{c.username}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{c.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        c.plan === "pro"
                          ? "bg-cyan-500/15 text-cyan-400"
                          : "bg-zinc-700/50 text-zinc-400"
                      }`}
                    >
                      {c.plan === "pro" ? "Pro" : "Free"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-emerald-400">
                    {formatCurrency(c.raised)}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{c.transactionCount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        c.isSuspended
                          ? "bg-red-500/15 text-red-400"
                          : "bg-emerald-500/15 text-emerald-400"
                      }`}
                    >
                      {c.isSuspended ? "Suspenso" : "Ativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={loadingId === c.id}
                      onClick={() => toggleSuspend(c)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
                        c.isSuspended
                          ? "border border-emerald-700 text-emerald-400 hover:bg-emerald-950"
                          : "border border-red-800 text-red-400 hover:bg-red-950"
                      }`}
                    >
                      {loadingId === c.id
                        ? "..."
                        : c.isSuspended
                          ? "Reativar"
                          : "Suspender"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
