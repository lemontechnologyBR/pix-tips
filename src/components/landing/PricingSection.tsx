"use client";

import Link from "next/link";
import { useState } from "react";
import { computeFee, formatCommissionLabel } from "@/lib/finance";
import { PLATFORM_FEATURES } from "@/lib/landing-data";

const AVG_DONATION = 20; // R$ used in the monthly simulator

export function PricingSection() {
  const [donationCount, setDonationCount] = useState(50);

  const gross = donationCount * AVG_DONATION;
  // Taxa por doação × quantidade (3% + R$ 0,50 em cada uma)
  const fee = donationCount * computeFee(AVG_DONATION);
  const net = gross - fee;
  const commissionLabel = formatCommissionLabel();

  return (
    <section id="precos" className="relative py-24 overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[700px] w-[700px] rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Sem mensalidade. Para sempre.
          </span>
          <h2 className="mt-4 text-4xl font-black text-white sm:text-5xl">
            Preço simples e{" "}
            <span className="web3-text-gradient">transparente</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400">
            Grátis para começar, pague só quando receber
          </p>
        </div>

        {/* Main grid: pricing card + simulator */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:items-start">

          {/* LEFT: Pricing card */}
          <div className="relative web3-glass-strong rounded-3xl p-8 shadow-2xl shadow-cyan-500/20">
            <span className="absolute -top-3.5 left-8 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-1 text-xs font-bold text-white">
              Gratuito para sempre
            </span>

            {/* Price */}
            <div className="flex items-end gap-2">
              <span className="text-6xl font-black text-white leading-none">
                R$ 0
              </span>
              <span className="mb-1.5 text-base text-zinc-500">/mês</span>
            </div>
            <p className="mt-2 text-sm font-medium text-cyan-400">
              Apenas {commissionLabel} sobre cada doação recebida
            </p>

            {/* Divider */}
            <div className="my-6 border-t border-zinc-800" />

            {/* Feature list */}
            <ul className="space-y-3">
              {PLATFORM_FEATURES.map((feat) => (
                <li key={feat} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                    <svg
                      className="h-3 w-3 text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="text-sm text-zinc-300">{feat}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              href="/dashboard"
              className="web3-btn-primary mt-8 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white"
            >
              Criar conta grátis
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="mt-3 text-center text-xs text-zinc-600">
              Sem cartão de crédito. Sem contrato. Cancele quando quiser.
            </p>
          </div>

          {/* RIGHT: Monthly earnings simulator + why no subscription */}
          <div className="flex flex-col gap-6">

            {/* Simulator */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Simulador de ganhos
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Quantas doações por mês você espera receber?
              </p>

              {/* Input */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                  <span>10 doações</span>
                  <span className="font-semibold text-cyan-400 text-sm">
                    {donationCount} doações / mês
                  </span>
                  <span>500 doações</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={10}
                  value={donationCount}
                  onChange={(e) => setDonationCount(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="mt-1 text-center text-[11px] text-zinc-600">
                  Média de R$ {AVG_DONATION},00 por doação considerada
                </p>
              </div>

              {/* Result breakdown */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                  <span className="text-sm text-zinc-400">Total recebido</span>
                  <span className="text-base font-bold text-white">
                    R$ {gross.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-red-500/15 bg-red-500/5 px-4 py-3">
                  <span className="text-sm text-zinc-400">
                    Taxa pix.tips ({commissionLabel})
                  </span>
                  <span className="text-base font-bold text-red-400">
                    − R$ {fee.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-4 py-3">
                  <span className="text-sm font-semibold text-zinc-300">
                    Você recebe
                  </span>
                  <span className="text-lg font-black text-emerald-400">
                    R$ {net.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            </div>

            {/* Why no subscription */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Por que não cobramos mensalidade?
              </p>
              <div className="mt-4 space-y-4">
                {[
                  {
                    title: "Alinhamos nosso sucesso com o seu",
                    body: "Se você não recebe, nós também não ganhamos. A gente só lucra quando você lucra.",
                  },
                  {
                    title: "Zero barreira de entrada",
                    body: "Novos criadores podem começar do zero sem se preocupar com custo mensal.",
                  },
                  {
                    title: "Tudo incluso, sem gatekeeping",
                    body: "Todas as funcionalidades disponíveis desde o primeiro dia — sem tier Pro.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                      <svg
                        className="h-3 w-3 text-emerald-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-zinc-300">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Comparison note */}
        <p className="mt-10 text-center text-sm text-zinc-500">
          Outras plataformas cobram até{" "}
          <span className="line-through text-zinc-600">R$50/mês</span>.{" "}
          <span className="font-semibold text-zinc-300">
            Aqui você começa grátis.
          </span>
        </p>
      </div>
    </section>
  );
}
