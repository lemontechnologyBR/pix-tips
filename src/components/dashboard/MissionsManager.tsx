"use client";

import { useCallback, useEffect, useState } from "react";
import { DiscordRolesPanel } from "@/components/dashboard/DiscordRolesPanel";
import type { CreatorFanMissionPublic } from "@/types";

export function MissionsManager() {
  const [missions, setMissions] = useState<CreatorFanMissionPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState("3");
  const [type, setType] = useState<"tip_count" | "tip_total">("tip_count");
  const [rewardBadge, setRewardBadge] = useState("");
  const [rewardDiscordRoleId, setRewardDiscordRoleId] = useState("");
  const [description, setDescription] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/missions");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao carregar");
        return;
      }
      setMissions(data.missions ?? []);
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

  async function createMission(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/user/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          type,
          targetValue: Number(targetValue.replace(",", ".")),
          rewardBadge,
          rewardDiscordRoleId: rewardDiscordRoleId.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar");
        return;
      }
      setTitle("");
      setDescription("");
      setTargetValue("3");
      setRewardBadge("");
      setRewardDiscordRoleId("");
      setMissions(data.missions ?? []);
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(m: CreatorFanMissionPublic) {
    const res = await fetch("/api/user/missions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: m.id, active: !m.active }),
    });
    const data = await res.json();
    if (res.ok) setMissions(data.missions ?? []);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="text-sm font-semibold text-white">Missões do fã</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-400">
          <li>
            Missões aparecem na tip page. Com login opcional (Discord/Google/Twitch), o
            progresso fica na conta do fã; sem login, conta pelo mesmo nome no tip.
          </li>
          <li>
            Tipos: <span className="text-zinc-200">número de tips</span> (ex.: 3 doações) ou{" "}
            <span className="text-zinc-200">soma em R$</span> (ex.: R$ 50 no total).
          </li>
          <li>
            Ao concluir, o badge aparece no alerta ao vivo. Se informar um Discord Role ID
            (e o bot + Discord do fã estiverem vinculados), o cargo é liberado
            automaticamente.
          </li>
          <li>
            Desative uma missão para parar novas conclusões sem apagar o histórico.
          </li>
        </ul>
      </section>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="text-sm font-semibold text-white">Nova missão</h2>
        <form onSubmit={createMission} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-zinc-400">
            Título
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              placeholder="Ex: Fã da semana"
            />
          </label>
          <label className="text-xs text-zinc-400">
            Badge no alerta
            <input
              required
              value={rewardBadge}
              onChange={(e) => setRewardBadge(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              maxLength={24}
              placeholder="Ex: Fã VIP"
            />
          </label>
          <label className="text-xs text-zinc-400">
            Tipo
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "tip_count" | "tip_total")}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            >
              <option value="tip_count">Número de tips</option>
              <option value="tip_total">Soma em R$</option>
            </select>
          </label>
          <label className="text-xs text-zinc-400">
            Meta
            <input
              required
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              placeholder={type === "tip_total" ? "Ex: 50" : "Ex: 3"}
            />
          </label>
          <label className="text-xs text-zinc-400">
            Discord Role ID (opcional)
            <input
              value={rewardDiscordRoleId}
              onChange={(e) => setRewardDiscordRoleId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              placeholder="Ex: 123456789012345678"
            />
          </label>
          <label className="sm:col-span-2 text-xs text-zinc-400">
            Descrição (visível na tip page)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              placeholder="Explique o que o fã precisa fazer e o que ganha"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="live-btn-primary rounded-lg px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50 sm:col-span-2 sm:w-fit"
          >
            {saving ? "Salvando…" : "Criar missão"}
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Suas missões {loading ? "…" : `(${missions.length})`}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {missions.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-white">{m.title}</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {m.type === "tip_total"
                      ? `Doe R$ ${m.targetValue.toFixed(2).replace(".", ",")} no total`
                      : `Doe ${m.targetValue}×`}
                    {" · badge "}
                    <span className="text-amber-300">{m.rewardBadge}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void toggleActive(m)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    m.active
                      ? "bg-sky-400/12 text-sky-300"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {m.active ? "Ativa" : "Inativa"}
                </button>
              </div>
              {m.description && (
                <p className="mt-2 text-xs text-zinc-500">{m.description}</p>
              )}
            </div>
          ))}
          {!loading && missions.length === 0 && (
            <p className="text-sm text-zinc-500 sm:col-span-2">Nenhuma missão ainda.</p>
          )}
        </div>
      </section>

      <DiscordRolesPanel />
    </div>
  );
}
