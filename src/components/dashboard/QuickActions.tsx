"use client";

import Link from "next/link";
import { tipPagePath } from "@/lib/brand";
import { useState } from "react";
import { OverviewIcon, type OverviewIconName } from "@/components/dashboard/OverviewIcon";

interface QuickActionsProps {
  tipPageUrl: string;
  username: string;
}

const ACTIONS: {
  icon: OverviewIconName;
  title: string;
  description: string;
  href?: string;
  external?: boolean;
  action?: "copy";
}[] = [
  {
    icon: "link",
    title: "Copiar link",
    description: "Compartilhe sua tip page",
    action: "copy",
  },
  {
    icon: "bell",
    title: "Configurar alertas OBS",
    description: "Templates e sons de alerta",
    href: "/dashboard/widgets?tab=alerts",
  },
  {
    icon: "wallet",
    title: "Ver transações",
    description: "Histórico de doações",
    href: "/dashboard/finance",
  },
  {
    icon: "heart",
    title: "Personalizar página",
    description: "Cores, bio e aparência",
    href: "/dashboard/tip-page",
  },
  {
    icon: "spark",
    title: "ChatBot",
    description: "Comandos !pix no chat",
    href: "/dashboard/chat-bot",
  },
  {
    icon: "check",
    title: "Configurações",
    description: "Notificações e segurança",
    href: "/dashboard/settings",
  },
];

export function QuickActions({ tipPageUrl, username }: QuickActionsProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const full =
      typeof window !== "undefined"
        ? `${window.location.origin}${tipPageUrl}`
        : tipPageUrl;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
          <OverviewIcon name="spark" className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-white">Ações rápidas</h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            Atalhos para divulgar e configurar sua live
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIONS.map((item) => {
          const inner = (
            <>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-700/80 bg-zinc-900 text-zinc-400 transition group-hover:border-cyan-500/30 group-hover:text-cyan-300">
                <OverviewIcon name={item.icon} className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-zinc-200">{item.title}</p>
                <p className="mt-0.5 truncate text-xs text-zinc-500">
                  {item.action === "copy"
                    ? copied
                      ? "Copiado!"
                      : tipPagePath(username)
                    : item.description}
                </p>
              </div>
            </>
          );

          if (item.action === "copy") {
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => void copyLink()}
                className="group flex items-start gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4 text-left transition hover:border-cyan-500/30 hover:bg-cyan-500/[0.03]"
              >
                {inner}
              </button>
            );
          }

          return (
            <Link
              key={item.title}
              href={item.href!}
              className="group flex items-start gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4 transition hover:border-cyan-500/30 hover:bg-cyan-500/[0.03]"
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
