"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { AdminUserRow } from "@/lib/repositories/admin-repository";

interface AdminUsersTableProps {
  initialItems: AdminUserRow[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
}

const ROLE_LABELS: Record<string, string> = { admin: "Admin", user: "Usuário" };
const PLAN_LABELS: Record<string, string> = { pro: "Pro", free: "Free" };

export function AdminUsersTable({
  initialItems,
  initialTotal,
  initialPage,
  initialTotalPages,
}: AdminUsersTableProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [selected, setSelected] = useState<AdminUserRow | null>(null);
  const [editRole, setEditRole] = useState<"admin" | "user">("user");
  const [editPlan, setEditPlan] = useState<"free" | "pro">("free");
  const [editSuspended, setEditSuspended] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPage = useCallback(async (p: number, q: string) => {
    setFetching(true);
    try {
      const url = `/api/admin/users?page=${p}&search=${encodeURIComponent(q)}&limit=20`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = (await res.json()) as {
        items: AdminUserRow[];
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
  }, []);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchPage(1, value), 350);
  }

  function openEdit(user: AdminUserRow) {
    setSelected(user);
    setEditRole((user.role as "admin" | "user") ?? "user");
    setEditPlan((user.plan as "free" | "pro") ?? "free");
    setEditSuspended(user.isSuspended ?? false);
    setError(null);
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const body: { role?: "admin" | "user"; plan?: "free" | "pro"; isSuspended?: boolean } = {};
      if (editRole !== selected.role) body.role = editRole;
      if (selected.creatorId) {
        if (editPlan !== selected.plan) body.plan = editPlan;
        if (editSuspended !== selected.isSuspended) body.isSuspended = editSuspended;
      }
      if (Object.keys(body).length === 0) {
        setSelected(null);
        return;
      }

      const res = await fetch(`/api/admin/users/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as AdminUserRow & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar.");
        return;
      }
      setItems((prev) => prev.map((u) => (u.id === data.id ? data : u)));
      setSelected(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function quickToggleSuspend(user: AdminUserRow) {
    if (!user.creatorId) return;
    setLoadingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSuspended: !user.isSuspended }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as AdminUserRow;
      setItems((prev) => prev.map((u) => (u.id === data.id ? data : u)));
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Buscar por nome, e-mail ou @username..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm sm:max-w-md"
        />
        <p className="text-sm text-zinc-500">
          {total} {total === 1 ? "usuário" : "usuários"}
        </p>
      </div>

      {fetching ? (
        <div className="rounded-xl border border-zinc-800 py-16 text-center text-sm text-zinc-500">
          Carregando...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center text-sm text-zinc-500">
          Nenhum usuário encontrado.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-900/80 text-left text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Usuário</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Plano</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Doações</th>
                  <th className="px-4 py-3">Cadastro</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-zinc-500">{u.email}</p>
                      {u.username && (
                        <p className="text-xs text-cyan-400">@{u.username}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          u.role === "admin"
                            ? "bg-red-500/15 text-red-400"
                            : "bg-zinc-700/50 text-zinc-400"
                        }`}
                      >
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.plan != null ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            u.plan === "pro"
                              ? "bg-cyan-500/15 text-cyan-400"
                              : "bg-zinc-700/50 text-zinc-400"
                          }`}
                        >
                          {PLAN_LABELS[u.plan] ?? u.plan}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.creatorId ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            u.isSuspended
                              ? "bg-red-500/15 text-red-400"
                              : "bg-emerald-500/15 text-emerald-400"
                          }`}
                        >
                          {u.isSuspended ? "Suspenso" : "Ativo"}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-600">Sem creator</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-emerald-400">
                      {u.totalRaised != null ? formatCurrency(u.totalRaised) : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {u.creatorId && (
                          <button
                            type="button"
                            disabled={loadingId === u.id}
                            onClick={() => quickToggleSuspend(u)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${
                              u.isSuspended
                                ? "border border-emerald-700 text-emerald-400 hover:bg-emerald-950"
                                : "border border-red-800 text-red-400 hover:bg-red-950"
                            }`}
                          >
                            {loadingId === u.id ? "..." : u.isSuspended ? "Reativar" : "Suspender"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="rounded-lg border border-zinc-700 px-2.5 py-1 text-xs hover:border-zinc-500"
                        >
                          Editar
                        </button>
                      </div>
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
                onClick={() => fetchPage(page - 1, search)}
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
                onClick={() => fetchPage(page + 1, search)}
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
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{selected.name}</h3>
                <p className="text-sm text-zinc-400">{selected.email}</p>
                {selected.username && (
                  <p className="text-xs text-cyan-400">@{selected.username}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as "admin" | "user")}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {selected.creatorId && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">Plano</label>
                    <select
                      value={editPlan}
                      onChange={(e) => setEditPlan(e.target.value as "free" | "pro")}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-zinc-700 px-4 py-3">
                    <span className="text-sm">Conta suspensa</span>
                    <button
                      type="button"
                      onClick={() => setEditSuspended((v) => !v)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        editSuspended ? "bg-red-600" : "bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          editSuspended ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </>
              )}
            </div>

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="flex-1 rounded-lg bg-cyan-600 py-2 text-sm font-semibold hover:bg-cyan-500 disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
