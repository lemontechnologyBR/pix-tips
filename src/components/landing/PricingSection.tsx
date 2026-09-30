import Link from "next/link";
import {
  COMMISSION_FIXED_FEE,
  DEFAULT_PAYOUT_FEE,
  computeFee,
  computeNetAmount,
  formatCommissionLabel,
  formatPayoutFeeLabel,
} from "@/lib/finance";
import { PLATFORM_FEATURES } from "@/lib/landing-data";

const EXAMPLES = [5, 10, 20, 30, 50, 100, 200] as const;

function brl(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

export function PricingSection() {
  const commissionLabel = formatCommissionLabel();
  const payoutLabel = formatPayoutFeeLabel(DEFAULT_PAYOUT_FEE);

  return (
    <section id="precos" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[700px] w-[700px] rounded-full bg-sky-400/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-400">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            Sem mensalidade. Para sempre.
          </span>
          <h2 className="mt-4 text-4xl font-black text-white sm:text-5xl">
            Preço simples e{" "}
            <span className="live-text-accent">transparente</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400">
            Cobramos{" "}
            <span className="font-semibold text-zinc-200">R$ 0,99 fixos</span> por
            doação — não é percentual. Em R$ 100 a taxa efetiva fica em ~1%.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:items-start">
          {/* LEFT: Pricing card */}
          <div className="relative rounded-3xl p-8 shadow-2xl shadow-black/40 live-panel">
            <span className="absolute -top-3.5 left-8 rounded-full bg-sky-400 px-4 py-1 text-xs font-bold text-white">
              Gratuito para sempre
            </span>

            <div className="flex items-end gap-2">
              <span className="text-6xl font-black leading-none text-white">R$ 0</span>
              <span className="mb-1.5 text-base text-zinc-500">/mês</span>
            </div>
            <p className="mt-2 text-sm font-medium text-sky-400">
              {commissionLabel} por doação + {payoutLabel} por saque
            </p>

            <div className="my-6 border-t border-zinc-800" />

            <ul className="space-y-3">
              {PLATFORM_FEATURES.map((feat) => (
                <li key={feat} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-sky-400/30 bg-sky-400/10">
                    <svg
                      className="h-3 w-3 text-sky-400"
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

            <Link
              href="/dashboard"
              className="live-btn-primary mt-8 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white"
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

          {/* RIGHT: Fee comparison */}
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Comparativo por doação
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Sempre{" "}
                <span className="font-semibold text-zinc-200">R$ 0,99 fixo</span>
                {" "}— a % cai quando a doação é maior
              </p>

              <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-800">
                <div className="grid grid-cols-4 gap-0 border-b border-zinc-800 bg-zinc-950/80 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 sm:px-4">
                  <span>Doação</span>
                  <span>Taxa</span>
                  <span>Você fica</span>
                  <span className="text-right">% efetiva</span>
                </div>
                {EXAMPLES.map((amount, i) => {
                  const fee = computeFee(amount);
                  const net = computeNetAmount(amount);
                  const pct = (fee / amount) * 100;
                  return (
                    <div
                      key={amount}
                      className={`grid grid-cols-4 items-center gap-0 px-3 py-3.5 sm:px-4 ${
                        i < EXAMPLES.length - 1 ? "border-b border-zinc-800/80" : ""
                      } ${i === 2 ? "bg-cyan-500/[0.06]" : ""}`}
                    >
                      <span className="text-sm font-bold text-white">
                        R$ {brl(amount)}
                      </span>
                      <span className="text-sm font-medium text-red-400">
                        − R$ {brl(fee)}
                      </span>
                      <span className="text-sm font-bold text-sky-400">
                        R$ {brl(net)}
                      </span>
                      <span className="text-right text-sm text-zinc-400">
                        {pct.toFixed(1).replace(".", ",")}%
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-zinc-300">Taxa de saque</p>
                    <p className="mt-0.5 text-[11px] text-zinc-500">
                      Cobrada uma vez quando você saca pra sua Pix
                    </p>
                  </div>
                  <p className="shrink-0 text-base font-black text-white">
                    {payoutLabel}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-[11px] leading-relaxed text-zinc-600">
                Ex.: três doações de R$ 20 → você recebe R${" "}
                {brl(3 * computeNetAmount(20))}. No saque sai mais {payoutLabel}.
              </p>
            </div>

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
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-sky-400/30 bg-sky-400/10">
                      <svg
                        className="h-3 w-3 text-sky-400"
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
                      <p className="text-sm font-semibold text-zinc-300">{item.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-zinc-500">
          Outras plataformas cobram até{" "}
          <span className="text-zinc-600 line-through">R$50/mês</span>.{" "}
          <span className="font-semibold text-zinc-300">Aqui você começa grátis.</span>
        </p>
      </div>
    </section>
  );
}
