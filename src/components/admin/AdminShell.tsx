"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ADMIN_NAV, ADMIN_PAGE_TITLES } from "@/lib/admin-data";

interface AdminShellProps {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}

export function AdminShell({ userName, userEmail, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const title = ADMIN_PAGE_TITLES[pathname] ?? "Admin";

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="flex min-h-screen text-white">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`web3-glass-strong fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-cyan-500/10 transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-cyan-500/10 px-4">
          <Link href="/admin" className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-sm">
              AD
            </span>
            Admin Panel
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {ADMIN_NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "web3-nav-active text-cyan-300"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-cyan-500/10 p-3">
          <Link
            href="/dashboard"
            className="block rounded-lg border border-zinc-700 px-3 py-2 text-center text-sm text-zinc-300 hover:border-zinc-500"
          >
            Ir para Dashboard
          </Link>
          <button
            type="button"
            disabled={loggingOut}
            onClick={handleLogout}
            className="block w-full rounded-lg px-3 py-2 text-center text-sm text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
          >
            {loggingOut ? "Saindo..." : "Sair"}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-cyan-500/10 bg-transparent px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menu"
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <div>
              <h1 className="text-lg font-semibold">{title}</h1>
              <p className="hidden text-xs text-zinc-500 sm:block">
                Admin › {title}
              </p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="font-medium">{userName}</p>
            <p className="text-xs text-zinc-500">{userEmail}</p>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
