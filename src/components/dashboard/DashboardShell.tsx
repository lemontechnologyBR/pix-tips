"use client";

import Link from "next/link";
import { tipPagePath } from "@/lib/brand";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { DASHBOARD_NAV } from "@/lib/dashboard-data";
import type { Creator } from "@/types";
import { ChatwootWidget } from "./ChatwootWidget";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardNavIcon } from "./DashboardNavIcon";

interface DashboardShellProps {
  creator: Creator;
  chatwootBaseUrl?: string;
  chatwootWebsiteToken?: string;
  children: React.ReactNode;
}

export function DashboardShell({
  creator,
  chatwootBaseUrl = "https://chat.pix.tips",
  chatwootWebsiteToken = "",
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen text-white">
      <ChatwootWidget
        baseUrl={chatwootBaseUrl}
        websiteToken={chatwootWebsiteToken}
        user={{
          id: creator.id,
          email: creator.email,
          name: creator.displayName || creator.username,
          username: creator.username,
          avatar: creator.avatar,
        }}
      />
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
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {DASHBOARD_NAV.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
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
                <DashboardNavIcon
                  name={item.icon}
                  className={`h-[18px] w-[18px] shrink-0 ${active ? "text-cyan-400" : "text-zinc-500"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-cyan-500/10 p-3">
          <Link
            href={tipPagePath(creator.username)}
            target="_blank"
            className="block rounded-lg border border-zinc-700 px-3 py-2 text-center text-sm text-zinc-300 hover:border-zinc-500"
          >
            Visualizar minha página
          </Link>
          <Link
            href="/"
            className="block rounded-lg px-3 py-2 text-center text-sm text-zinc-500 hover:text-zinc-300"
          >
            Sair
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          creator={creator}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
