"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatRelativeTime } from "@/lib/format";
import type { NotificationFilter, NotificationRecord } from "@/lib/notifications/service";

const FILTER_TABS: { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "donation", label: "Doações" },
  { value: "system", label: "Sistema" },
  { value: "promo", label: "Promoções" },
];

const TYPE_ICONS: Record<string, string> = {
  donation: "💰",
  system: "⚙️",
  promo: "✨",
};

function getTypeIcon(type: string): string {
  return TYPE_ICONS[type] ?? "📢";
}

export function NotificationsPage() {
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        filter,
        page: String(page),
      });
      const res = await fetch(`/api/notifications?${params}`);
      if (!res.ok) throw new Error("Falha ao carregar notificações");
      const data = await res.json();
      setItems(data.items);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setUnreadCount(data.unreadCount);
    } catch {
      setError("Não foi possível carregar as notificações.");
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchNotifications();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchNotifications]);

  function handleFilterChange(next: NotificationFilter) {
    setFilter(next);
    setPage(1);
  }

  async function handleMarkRead(id: string) {
    const res = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    if (!res.ok) return;
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function handleMarkAllRead() {
    setActionLoading(true);
    try {
      const res = await fetch("/api/notifications/mark-all-read", { method: "POST" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      setError("Não foi possível marcar todas como lidas.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleClearRead() {
    setActionLoading(true);
    try {
      const res = await fetch("/api/notifications/clear-read", { method: "DELETE" });
      if (!res.ok) throw new Error();
      await fetchNotifications();
    } catch {
      setError("Não foi possível limpar as notificações lidas.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Notificações</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {unreadCount > 0
              ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}`
              : "Tudo em dia"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={actionLoading || unreadCount === 0}
            onClick={handleMarkAllRead}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:border-zinc-500 disabled:opacity-40"
          >
            Marcar todas como lidas
          </button>
          <button
            type="button"
            disabled={actionLoading}
            onClick={handleClearRead}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-40"
          >
            Limpar lidas
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleFilterChange(tab.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === tab.value
                ? "bg-cyan-500/20 text-cyan-300"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-zinc-800 py-16 text-center text-sm text-zinc-500">
          Carregando...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center">
          <p className="text-3xl">🔔</p>
          <p className="mt-3 text-sm text-zinc-500">
            Nenhuma notificação{filter !== "all" ? " nesta categoria" : ""}.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800">
          {items.map((n) => (
            <li
              key={n.id}
              className={`flex gap-4 px-4 py-4 transition hover:bg-zinc-900/50 ${
                !n.read ? "bg-cyan-500/5" : ""
              }`}
            >
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-lg">
                {getTypeIcon(n.type)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${n.read ? "text-zinc-400" : "text-white"}`}>
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-500" />
                  )}
                </div>
                <p className="mt-0.5 text-sm text-zinc-400">{n.body}</p>
                <p className="mt-1 text-xs text-zinc-600">
                  {formatRelativeTime(n.createdAt)}
                </p>
              </div>
              {!n.read && (
                <button
                  type="button"
                  onClick={() => handleMarkRead(n.id)}
                  className="shrink-0 self-center rounded-lg border border-zinc-700 px-3 py-1.5 text-xs hover:border-zinc-500"
                >
                  Marcar lida
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>
            Página {page} de {totalPages} ({total} no total)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 hover:border-zinc-500 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 hover:border-zinc-500 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-zinc-600">
        <Link href="/dashboard/settings" className="text-cyan-400 hover:underline">
          Configurações
        </Link>
        {" · "}
        Gerencie preferências de notificação no painel
      </p>
    </div>
  );
}
