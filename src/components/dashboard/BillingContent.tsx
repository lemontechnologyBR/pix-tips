"use client";

import { PLATFORM_FEATURES } from "@/lib/landing-data";
import { COMMISSION_RATE } from "@/lib/finance";
import { computeWooviPayoutFee } from "@/lib/finance";

export function BillingContent() {
  const payoutFee = computeWooviPayoutFee();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-zinc-900/80 to-zinc-950 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
            Gratuito para sempre
          </span>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-white">Plano único, sem mensalidade</h2>
        <p className="mt-2 text-sm text-zinc-400">
          A pix.tips não cobra mensalidade. Você só paga quando recebe ou saca — simples assim.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Comissão por doação</p>
            <p className="mt-1 text-3xl font-black text-white">{COMMISSION_RATE}%</p>
            <p className="mt-1 text-xs text-zinc-500">Descontado automaticamente de cada doação confirmada</p>
          </div>
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Taxa de saque</p>
            <p className="mt-1 text-3xl font-black text-white">
              R$ {payoutFee.toFixed(2).replace(".", ",")}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Taxa fixa por saque para cobrir custos do Pix Out</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h3 className="text-base font-semibold text-white">Tudo incluso, sem restrições</h3>
        <ul className="mt-4 space-y-2">
          {PLATFORM_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-zinc-400">
              <span className="mt-0.5 text-emerald-400">✓</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
