"use client";

import { PLATFORM_FEATURES } from "@/lib/landing-data";
import { formatCommissionLabel, formatPayoutFeeLabel } from "@/lib/finance";

export function BillingContent() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border border-sky-400/30 bg-gradient-to-br from-sky-400/10 via-zinc-900 to-zinc-950 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-sky-400/15 px-3 py-1 text-xs font-semibold text-sky-300">
            Gratuito para sempre
          </span>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-white">Plano único, sem mensalidade</h2>
        <p className="mt-2 text-sm text-zinc-400">
          A pix.tips não cobra mensalidade. Você paga {formatCommissionLabel()} por doação
          recebida e {formatPayoutFeeLabel()} por saque.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Taxa por doação</p>
            <p className="mt-1 text-2xl font-black text-white sm:text-3xl">
              {formatCommissionLabel()}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Valor fixo em cada doação confirmada</p>
          </div>
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Taxa de saque</p>
            <p className="mt-1 text-3xl font-black text-sky-400">{formatPayoutFeeLabel()}</p>
            <p className="mt-1 text-xs text-zinc-500">Taxa fixa em todo saque solicitado</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h3 className="text-base font-semibold text-white">Tudo incluso, sem restrições</h3>
        <ul className="mt-4 space-y-2">
          {PLATFORM_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-zinc-400">
              <span className="mt-0.5 text-sky-400">✓</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
