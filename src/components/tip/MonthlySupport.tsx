"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { computeDonorServiceFee } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import type { CreatorSubPlan } from "@/types";
import { PixPayment } from "@/components/tip/PixPayment";

interface MonthlySupportProps {
  creatorId: string;
  themeColor: string;
  plans: CreatorSubPlan[];
  suggestedName?: string;
  suggestedEmail?: string;
}

type CheckoutState = "idle" | "paying" | "done";

export function MonthlySupport({
  creatorId,
  themeColor,
  plans,
  suggestedName,
  suggestedEmail,
}: MonthlySupportProps) {
  const [selected, setSelected] = useState<CreatorSubPlan | null>(plans[0] ?? null);
  const [name, setName] = useState(suggestedName ?? "");
  const [email, setEmail] = useState(suggestedEmail ?? "");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<CheckoutState>("idle");
  const [pix, setPix] = useState<{
    transactionId: string;
    pixCode: string;
    amount: number;
    tipAmount?: number;
    serviceFee?: number;
    expiresIn: number;
    mock: boolean;
  } | null>(null);

  useEffect(() => {
    if (suggestedName && !name.trim()) setName(suggestedName);
  }, [suggestedName, name]);

  useEffect(() => {
    if (suggestedEmail && !email.trim()) setEmail(suggestedEmail);
  }, [suggestedEmail, email]);

  useEffect(() => {
    if (!pix || state !== "paying") return;
    const socket: Socket = io("/alerts", {
      path: "/api/socket",
      auth: { transactionId: pix.transactionId },
    });
    socket.on("payment-confirmed", () => setState("done"));
    return () => {
      socket.disconnect();
    };
  }, [pix, state]);

  if (plans.length === 0) return null;

  async function startCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId,
          planId: selected.id,
          email,
          name: name.trim() || "Apoiador",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao iniciar assinatura");
        return;
      }
      setPix({
        transactionId: data.transactionId,
        pixCode: data.pixCode,
        amount: data.chargeAmount ?? data.amount,
        tipAmount: data.amount,
        serviceFee: data.serviceFee,
        expiresIn: data.expiresIn ?? 900,
        mock: Boolean(data.mock),
      });
      setState("paying");
    } catch {
      setError("Erro de conexão");
    }
  }

  if (state === "done") {
    return (
      <section className="rounded-2xl border border-sky-400/30 bg-sky-400/10 p-5 text-center">
        <p className="font-semibold text-sky-200">Assinatura confirmada!</p>
        <p className="mt-1 text-sm text-sky-200/80">
          Seu apoio mensal está ativo por 30 dias. Renove com um novo Pix quando quiser.
        </p>
      </section>
    );
  }

  if (state === "paying" && pix) {
    return (
      <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
        <h2 className="text-sm font-semibold text-white">Pague o Pix do apoio mensal</h2>
        <PixPayment
          pixCode={pix.pixCode}
          amount={pix.amount}
          tipAmount={pix.tipAmount}
          serviceFee={pix.serviceFee}
          expiresIn={pix.expiresIn}
          mock={pix.mock}
        />
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
      <h2 className="text-base font-semibold text-white">Apoio mensal</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Pix avulso a cada 30 dias — sem cobrança automática no banco.
      </p>

      <div className="mt-4 grid gap-2">
        {plans.map((plan) => {
          const active = selected?.id === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelected(plan)}
              className={`rounded-xl border px-3 py-3 text-left transition ${
                active
                  ? "border-sky-400/35 bg-cyan-500/10"
                  : "border-zinc-700/70 bg-zinc-900/40 hover:border-zinc-600"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-white">{plan.name}</span>
                <span className="text-right text-sm font-semibold" style={{ color: themeColor }}>
                  {formatCurrency(plan.price)}/mês
                  <span className="mt-0.5 block text-[10px] font-normal text-zinc-500">
                    + {formatCurrency(computeDonorServiceFee(plan.price))} taxa de serviço
                  </span>
                </span>
              </div>
              {plan.description && (
                <p className="mt-1 text-xs text-zinc-400">{plan.description}</p>
              )}
              {plan.perks.length > 0 && (
                <ul className="mt-2 space-y-0.5">
                  {plan.perks.map((p) => (
                    <li key={p} className="text-[11px] text-zinc-400">
                      · {p}
                    </li>
                  ))}
                </ul>
              )}
            </button>
          );
        })}
      </div>

      <form onSubmit={startCheckout} className="mt-4 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail para renovação"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
        />
        {error && <p className="text-xs text-rose-300">{error}</p>}
        <button
          type="submit"
          disabled={!selected}
          className="w-full rounded-xl py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-50"
          style={{ backgroundColor: themeColor }}
        >
          Apoiar com Pix
        </button>
      </form>
    </section>
  );
}
