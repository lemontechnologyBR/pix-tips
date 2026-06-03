"use client";

import Link from "next/link";
import { useState } from "react";
import { tipPagePath } from "@/lib/brand";
import { formatCurrency } from "@/lib/format";
import { OverviewIcon } from "@/components/dashboard/OverviewIcon";
import type { Creator, DashboardOverview } from "@/types";

interface OverviewHeroProps {
  creator: Pick<
    Creator,
    "displayName" | "username" | "plan" | "raised" | "goal" | "themeColor"
  >;
  overview: Pick<DashboardOverview, "totalMonth" | "supportersMonth">;
  tipPageUrl: string;
}

export function OverviewHero({ creator, overview, tipPageUrl }: OverviewHeroProps) {
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

  const hasActivity = overview.totalMonth > 0 || overview.supportersMonth > 0;

  return (
    <section className="web3-card relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 via-zinc-900/80 to-zinc-950 p-5 sm:p-6">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl"
        style={{ backgroundColor: creator.themeColor }}
      />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/15 text-cyan-300">
            <OverviewIcon name="chart" className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-white sm:text-2xl">
                Olá, {creator.displayName.split(" ")[0]}
              </h1>
            </div>
            <p className="mt-1 max-w-lg text-sm text-zinc-400">
              {hasActivity
                ? "Seu painel está atualizado com as métricas da sua página de doações."
                : "Compartilhe seu link e configure os widgets para começar a receber apoio."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copyLink()}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-950/50 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-cyan-500/40 hover:text-white"
          >
            <OverviewIcon name="link" className="h-4 w-4" />
            {copied ? "Copiado!" : "Copiar link"}
          </button>
          <Link
            href={tipPagePath(creator.username)}
            target="_blank"
            className="web3-btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          >
            Ver página
          </Link>
        </div>
      </div>

      <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
          <p className="text-xs text-zinc-500">Link público</p>
          <p className="mt-1 truncate font-mono text-sm text-cyan-300">
            {tipPagePath(creator.username)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
          <p className="text-xs text-zinc-500">Arrecadado no mês</p>
          <p className="mt-1 text-sm font-semibold text-emerald-400">
            {formatCurrency(overview.totalMonth)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
          <p className="text-xs text-zinc-500">Meta geral</p>
          <p className="mt-1 text-sm font-semibold text-zinc-200">
            {formatCurrency(creator.raised)}{" "}
            <span className="font-normal text-zinc-500">
              / {formatCurrency(creator.goal)}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
