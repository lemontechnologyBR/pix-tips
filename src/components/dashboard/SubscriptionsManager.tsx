"use client";

import { useCallback, useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { CreatorSubPlan, FanSubscriptionPublic } from "@/types";

export function SubscriptionsManager() {
  const [plans, setPlans] = useState<CreatorSubPlan[]>([]);
  const [subscribers, setSubscribers] = useState<FanSubscriptionPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("9.90");
  const [description, setDescription] = useState("");
  const [perksText, setPerksText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/sub-plans");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao carregar");
        return;
      }
      setPlans(data.plans ?? []);
      setSubscribers(data.subscribers ?? []);
      setError(null);
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createPlan(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const perks = perksText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const res = await fetch("/api/user/sub-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price.replace(",", ".")),
          description,
          perks,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar plano");
        return;
      }
      setName("");
      setDescription("");
      setPerksText("");
      setPrice("9.90");
      await load();
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(plan: CreatorSubPlan) {
    await fetch("/api/user/sub-plans", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: plan.id, active: !plan.active }),
    });
    await load();
  }

  const activeSubs = subscribers.filter((s) => s.status === "active");

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="text-sm font-semibold text-white">Como funciona</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-400">
          <li>
            Crie um ou mais planos com preço e benefícios. Eles aparecem na sua tip page
            para o fã assinar.
          </li>
          <li>
            O pagamento é <span className="text-zinc-200">Pix a cada 30 dias</span> — não
            há débito automático no banco. No fim do ciclo, o fã gera um novo Pix para
            renovar.
          </li>
          <li>
            Enquanto a assinatura estiver ativa, o fã ganha badge ★ no alerta e no
            leaderboard ao tipar.
          </li>
          <li>
            Você acompanha assinantes ativos abaixo e pode desativar um plano a qualquer
            momento (novas vendas param; ciclos já pagos seguem até expirar).
          </li>
        </ul>
      </section>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="text-sm font-semibold text-white">Novo plano</h2>
        <form onSubmit={createPlan} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-zinc-400">
            Nome
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              placeholder="Ex: Apoio mensal"
            />
          </label>
          <label className="text-xs text-zinc-400">
            Preço (R$)
            <input
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="sm:col-span-2 text-xs text-zinc-400">
            Descrição
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="sm:col-span-2 text-xs text-zinc-400">
            Benefícios (um por linha)
            <textarea
              value={perksText}
              onChange={(e) => setPerksText(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              placeholder="Acesso ao Discord&#10;Nome nos créditos"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="live-btn-primary rounded-lg px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50 sm:col-span-2 sm:w-fit"
          >
            {saving ? "Salvando…" : "Criar plano"}
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Seus planos {loading ? "…" : `(${plans.length})`}
        </h2>
        {plans.length === 0 && !loading && (
          <p className="text-sm text-zinc-500">Nenhum plano ainda.</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-white">{plan.name}</p>
                  <p className="text-lg font-semibold text-sky-300">
                    {formatCurrency(plan.price)}
                    <span className="text-xs font-normal text-zinc-500"> /mês</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void toggleActive(plan)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    plan.active
                      ? "bg-sky-400/12 text-sky-300"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {plan.active ? "Ativo" : "Inativo"}
                </button>
              </div>
              {plan.description && (
                <p className="mt-2 text-xs text-zinc-400">{plan.description}</p>
              )}
              {plan.perks.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {plan.perks.map((p) => (
                    <li key={p} className="text-xs text-zinc-300">
                      · {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Assinantes ativos ({activeSubs.length})
        </h2>
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-900/80 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">E-mail</th>
                <th className="px-3 py-2">Plano</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Válido até</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-t border-zinc-800/80">
                  <td className="px-3 py-2 text-zinc-200">{s.subscriberName || "—"}</td>
                  <td className="px-3 py-2 text-zinc-400">{s.subscriberEmail}</td>
                  <td className="px-3 py-2 text-zinc-300">{s.planName}</td>
                  <td className="px-3 py-2 text-zinc-300">{s.status}</td>
                  <td className="px-3 py-2 text-zinc-400">
                    {s.currentPeriodEnd
                      ? new Date(s.currentPeriodEnd).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-zinc-500">
                    Nenhum assinante ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
