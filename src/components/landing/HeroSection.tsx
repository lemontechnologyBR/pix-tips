"use client";

import Link from "next/link";
import { useState } from "react";
import { Web3Background } from "@/components/shared/Web3Background";
import { VideoModal } from "./VideoModal";

const RECENT_DONATIONS = [
  { name: "João Victor", value: "R$ 20", message: "Vai que vai! 🔥", time: "agora" },
  { name: "Pedro", value: "R$ 50", message: "Melhor streamer do Brasil ⭐", time: "2min" },
  { name: "Ana Luiza", value: "R$ 10", message: "Te amo muito! 💜", time: "5min" },
];

const STATS = [
  { value: "+2.000", label: "criadores" },
  { value: "R$ 1M+", label: "processado" },
  { value: "0", label: "mensalidade" },
];

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[280px] animate-fade-in-up sm:w-[310px]">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-[2.5rem] ring-2 ring-cyan-500/20 shadow-2xl shadow-cyan-500/20 blur-sm" />

      <div className="relative rounded-[2.5rem] border-4 border-zinc-700 bg-zinc-900 p-3 shadow-2xl shadow-cyan-500/10 ring-1 ring-cyan-500/10">
        <div className="overflow-hidden rounded-[2rem] bg-zinc-950">
          {/* Profile header */}
          <div className="relative bg-gradient-to-b from-cyan-500/20 to-transparent px-4 pb-5 pt-6 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.12),transparent_70%)]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=demo"
              alt=""
              className="relative mx-auto h-16 w-16 rounded-full ring-2 ring-cyan-500/60 shadow-lg shadow-cyan-500/20"
            />
            <p className="relative mt-2 font-bold text-white">Streamer Demo</p>
            <p className="relative text-xs text-zinc-400">🎯 Meta: R$ 127 / R$ 500</p>
            <div className="relative mx-auto mt-2.5 h-2 w-3/4 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full w-[25%] rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            </div>
          </div>

          {/* Donation amounts */}
          <div className="space-y-3 p-4">
            <div className="grid grid-cols-2 gap-2">
              {["R$ 5", "R$ 10", "R$ 20", "R$ 50"].map((v) => (
                <div
                  key={v}
                  className="rounded-lg border border-zinc-700/50 bg-zinc-800/80 py-2 text-center text-sm font-semibold text-zinc-200 transition hover:border-cyan-500/30 hover:bg-zinc-800"
                >
                  {v}
                </div>
              ))}
            </div>

            {/* Pix button */}
            <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-600/15 py-2.5">
              <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 1 1 0 16A8 8 0 0 1 12 4zm-1 3v2H9v2h2v2H9v2h2v2h2v-2h2v-2h-2v-2h2V9h-2V7h-2z"/>
              </svg>
              <span className="text-xs font-semibold text-emerald-400">Pix · pagamento instantâneo</span>
            </div>

            {/* Recent donations feed */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Doações recentes</p>
              {RECENT_DONATIONS.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-2"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-xs font-bold text-cyan-400">
                    {d.name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-zinc-200">{d.name}</p>
                    <p className="truncate text-[10px] text-zinc-500">{d.message}</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-cyan-400">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification — right side */}
      <div className="absolute -right-5 top-1/4 animate-pulse-soft rounded-xl border border-cyan-500/30 bg-zinc-900/95 px-3 py-2 text-xs font-semibold text-cyan-200 shadow-xl shadow-cyan-500/10 backdrop-blur-sm">
        <span className="mr-1">🔥</span>João doou R$ 20!
      </div>

      {/* Floating notification — left side */}
      <div className="absolute -left-6 bottom-1/4 rounded-xl border border-purple-500/30 bg-zinc-900/95 px-3 py-2 text-xs font-semibold text-purple-200 shadow-xl shadow-purple-500/10 backdrop-blur-sm" style={{ animation: "pulse-soft 3s ease-in-out infinite 1.2s" }}>
        <span className="mr-1">⭐</span>Pedro doou R$ 50!
      </div>
    </div>
  );
}

export function HeroSection() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <>
      <Web3Background className="overflow-hidden pb-20 pt-28 sm:pb-28 sm:pt-32">
        {/* Background depth blobs */}
        <div className="pointer-events-none absolute -left-1/4 top-1/4 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500/3 blur-3xl" />

        <section className="relative">
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
            {/* Left column */}
            <div className="animate-fade-in-up">
              {/* Top badge */}
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                  🇧🇷 Feito para streamers brasileiros
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  ✨ Grátis para começar
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
                Receba doações via{" "}
                <span className="web3-text-gradient">Pix</span>{" "}
                e veja na sua live em{" "}
                <span className="web3-text-gradient">tempo real</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-zinc-400">
                Crie sua página em segundos, compartilhe o link e receba apoio direto dos seus fãs — sem mensalidade, só 3% + R$ 0,50 quando receber.
              </p>

              {/* Stats row */}
              <div className="mt-7 flex flex-wrap gap-3">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className="web3-glass flex flex-col items-center rounded-xl border border-cyan-500/20 px-4 py-2.5 text-center"
                  >
                    <span className="text-lg font-black text-white">{s.value}</span>
                    <span className="text-[11px] text-zinc-500">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="web3-btn-primary rounded-xl px-7 py-3.5 text-center font-semibold text-white shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/50 hover:shadow-xl"
                >
                  Criar minha página grátis →
                </Link>
                <button
                  type="button"
                  onClick={() => setVideoOpen(true)}
                  className="web3-glass group flex items-center justify-center gap-2.5 rounded-xl border border-cyan-500/20 px-7 py-3.5 font-semibold text-zinc-300 transition-all duration-200 hover:border-cyan-500/40 hover:text-white"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 transition-colors group-hover:bg-cyan-500/30">
                    <svg className="h-3 w-3 text-cyan-400" fill="currentColor" viewBox="0 0 12 12">
                      <polygon points="3,1 11,6 3,11" />
                    </svg>
                  </span>
                  Ver demo ao vivo
                </button>
              </div>

              {/* Trust signals */}
              <div className="mt-7 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span>
                  Pix instantâneo
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span>
                  Alerta no OBS em segundos
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span>
                  Sem contrato ou fidelidade
                </span>
              </div>
            </div>

            {/* Right column */}
            <PhoneMockup />
          </div>
        </section>
      </Web3Background>

      <VideoModal isOpen={videoOpen} onClose={() => setVideoOpen(false)} />
    </>
  );
}
