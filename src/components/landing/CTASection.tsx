import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 px-8 py-20 text-center shadow-2xl shadow-black/40">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/55 to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-sky-400/[0.08] to-transparent"
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
              Comece agora · é grátis
            </p>

            <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-black text-white sm:text-5xl">
              Pronto para{" "}
              <span className="live-text-accent">monetizar</span> sua live?
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-400">
              Crie sua página em 2 minutos.{" "}
              <span className="text-white">Sem cartão, sem mensalidade.</span>
            </p>

            {/* Dual CTA */}
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard"
          className="live-btn-primary px-8 py-3.5 text-base font-bold text-zinc-950"
              >
                Criar minha página grátis
              </Link>
              <Link
                href="/examples"
                className="rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-base font-medium text-zinc-300 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                Ver exemplos de páginas →
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5">
                <svg
                  className="h-4 w-4 text-cyan-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
                +2.000 streamers brasileiros já usam
              </span>
              <span className="hidden sm:block text-zinc-700">·</span>
              <span className="flex items-center gap-1.5">
                <svg
                  className="h-4 w-4 text-cyan-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
                Saque imediato
              </span>
              <span className="hidden sm:block text-zinc-700">·</span>
              <span className="flex items-center gap-1.5">
                <svg
                  className="h-4 w-4 text-cyan-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
                Sem mensalidade
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
