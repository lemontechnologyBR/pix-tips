"use client";

import Link from "next/link";
import { LiveBackground } from "@/components/shared/LiveBackground";
import { tipPagePath } from "@/lib/brand";

const RECENT_DONATIONS = [
  { name: "João Victor", value: "R$ 20", message: "Vai que vai!", time: "agora" },
  { name: "Pedro", value: "R$ 50", message: "Melhor streamer do Brasil", time: "2min" },
  { name: "Ana Luiza", value: "R$ 10", message: "Te amo muito!", time: "5min" },
];

const STATS = [
  { value: "+2.000", label: "criadores" },
  { value: "R$ 1M+", label: "processado" },
  { value: "0", label: "mensalidade" },
];

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[280px] animate-fade-in-up sm:w-[310px]">
      <div className="relative rounded-[2.5rem] border-4 border-zinc-800 bg-zinc-900 p-3 shadow-2xl shadow-black/50">
        <div className="overflow-hidden rounded-[2rem] bg-zinc-950">
          <div className="relative bg-gradient-to-b from-sky-400/10 to-transparent px-4 pb-5 pt-6 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=demo"
              alt=""
              className="relative mx-auto h-16 w-16 rounded-full ring-2 ring-sky-400/35"
            />
            <p className="relative mt-2 font-bold text-white">Streamer Demo</p>
            <p className="relative text-xs text-zinc-400">Meta: R$ 127 / R$ 500</p>
            <div className="relative mx-auto mt-2.5 h-2 w-3/4 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full w-[25%] rounded-full bg-sky-400" />
            </div>
          </div>

          <div className="space-y-3 p-4">
            <div className="grid grid-cols-2 gap-2">
              {["R$ 5", "R$ 10", "R$ 20", "R$ 50"].map((v) => (
                <div
                  key={v}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 py-2 text-center text-sm font-semibold text-zinc-200 transition hover:border-sky-400/30"
                >
                  {v}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 rounded-lg border border-sky-400/25 bg-sky-400/10 py-2.5">
              <svg className="h-4 w-4 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 1 1 0 16A8 8 0 0 1 12 4zm-1 3v2H9v2h2v2H9v2h2v2h2v-2h2v-2h-2v-2h2V9h-2V7h-2z" />
              </svg>
              <span className="text-xs font-semibold text-sky-400">
                Pix · pagamento instantâneo
              </span>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Doações recentes
              </p>
              {RECENT_DONATIONS.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-2"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-400/12 text-xs font-bold text-sky-400">
                    {d.name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-zinc-200">{d.name}</p>
                    <p className="truncate text-[10px] text-zinc-500">{d.message}</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-sky-400">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <LiveBackground className="overflow-hidden pb-20 pt-28 sm:pb-28 sm:pt-32">
      <section className="relative">
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div className="animate-fade-in-up">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-sky-400">
              pix.tips · ao vivo
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
              Receba doações via{" "}
              <span className="live-text-accent">Pix</span> e veja na sua live em{" "}
              <span className="live-text-accent">tempo real</span>
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-relaxed text-zinc-400">
              Crie sua página em segundos, compartilhe o link e receba apoio direto dos seus
              fãs — sem mensalidade, só R$ 0,99 por doação.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="live-panel flex flex-col items-center rounded-xl px-4 py-2.5 text-center"
                >
                  <span className="text-lg font-black text-white">{s.value}</span>
                  <span className="text-[11px] text-zinc-500">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="live-btn-primary rounded-xl px-7 py-3.5 text-center font-semibold text-zinc-950 transition hover:brightness-110"
              >
                Criar minha página grátis →
              </Link>
              <Link
                href={tipPagePath("demo")}
                className="live-panel group flex items-center justify-center gap-2.5 rounded-xl px-7 py-3.5 font-semibold text-zinc-300 transition hover:border-sky-400/30 hover:text-white"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-400/12 transition-colors group-hover:bg-sky-400/20">
                  <svg className="h-3 w-3 text-sky-400" fill="currentColor" viewBox="0 0 12 12">
                    <polygon points="3,1 11,6 3,11" />
                  </svg>
                </span>
                Ver demo ao vivo
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="text-sky-400">✓</span>
                Pix instantâneo
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-sky-400">✓</span>
                Alerta no OBS em segundos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-sky-400">✓</span>
                Sem contrato ou fidelidade
              </span>
            </div>
          </div>

          <PhoneMockup />
        </div>
      </section>
    </LiveBackground>
  );
}
