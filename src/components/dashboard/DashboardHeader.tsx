"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatRelativeTime } from "@/lib/format";
import { PAGE_TITLES } from "@/lib/dashboard-data";
import type { NotificationRecord } from "@/lib/notifications/service";
import type { Creator } from "@/types";

interface DashboardHeaderProps {
  creator: Creator;
  onMenuClick: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  donation: "💰",
  system: "⚙️",
  promo: "✨",
};

export function DashboardHeader({ creator, onMenuClick }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const title = PAGE_TITLES[pathname] ?? "Dashboard";
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const [countRes, listRes] = await Promise.all([
        fetch("/api/notifications?countOnly=1"),
        fetch("/api/notifications?page=1&limit=5"),
      ]);
      if (countRes.ok) {
        const countData = await countRes.json();
        setUnreadCount(countData.unreadCount ?? 0);
      }
      if (listRes.ok) {
        const listData = await listRes.json();
        setNotifications(listData.items ?? []);
        if (countRes.ok === false && listData.unreadCount !== undefined) {
          setUnreadCount(listData.unreadCount);
        }
      }
    } catch {
      /* ignore fetch errors in header */
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchNotifications();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchNotifications, pathname]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
      setUserOpen(false);
    }
  }

  async function handleNotifClick(id: string, read: boolean) {
    if (!read) {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setNotifOpen(false);
    router.push("/dashboard/notifications");
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="web3-glass sticky top-0 z-30 flex h-16 items-center justify-between border-b border-cyan-500/10 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Abrir menu"
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 lg:hidden"
          onClick={onMenuClick}
        >
          ☰
        </button>
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="hidden text-xs text-zinc-500 sm:block">
            Dashboard › {title}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            aria-label="Notificações"
            className="relative rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
            onClick={() => {
              setNotifOpen((v) => !v);
              setUserOpen(false);
              if (!notifOpen) fetchNotifications();
            }}
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 text-[10px] font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl">
              <div className="border-b border-zinc-800 px-4 py-3 font-medium">
                Notificações
              </div>
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-zinc-500">
                  Nenhuma notificação
                </p>
              ) : (
                <ul className="max-h-64 overflow-auto">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => handleNotifClick(n.id, n.read)}
                        className="flex w-full gap-3 border-b border-zinc-800/50 px-4 py-3 text-left text-sm last:border-0 hover:bg-zinc-800/50"
                      >
                        <span className="mt-0.5 shrink-0 text-base">
                          {TYPE_ICONS[n.type] ?? "📢"}
                        </span>
                        {!n.read && (
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                        )}
                        <div className={n.read ? "" : ""}>
                          <p className={`font-medium ${n.read ? "text-zinc-400" : "text-zinc-200"}`}>
                            {n.title}
                          </p>
                          <p className="text-zinc-400">{n.body}</p>
                          <p className="text-xs text-zinc-500">
                            {formatRelativeTime(n.createdAt)}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="border-t border-zinc-800 px-4 py-2">
                <Link
                  href="/dashboard/notifications"
                  className="block text-center text-sm text-cyan-400 hover:underline"
                  onClick={() => setNotifOpen(false)}
                >
                  Ver todas
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={userRef}>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-zinc-900"
            onClick={() => {
              setUserOpen((v) => !v);
              setNotifOpen(false);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={creator.avatar}
              alt=""
              className="h-8 w-8 rounded-full"
            />
            <span className="hidden text-sm font-medium sm:block">
              {creator.displayName}
            </span>
          </button>

          {userOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-900 py-2 shadow-xl">
              <div className="border-b border-zinc-800 px-4 py-3">
                <p className="font-medium">{creator.displayName}</p>
                <p className="text-xs text-zinc-500">{creator.email}</p>
              </div>
              <Link
                href="/dashboard/settings"
                className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                onClick={() => setUserOpen(false)}
              >
                Configurações
              </Link>
              <Link
                href="/dashboard/integrations"
                className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                onClick={() => setUserOpen(false)}
              >
                Integrações
              </Link>
              <button
                type="button"
                disabled={loggingOut}
                className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-zinc-800 disabled:opacity-50"
                onClick={handleLogout}
              >
                {loggingOut ? "Saindo..." : "Sair"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
