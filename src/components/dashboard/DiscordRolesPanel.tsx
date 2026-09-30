"use client";

import { useCallback, useEffect, useState } from "react";

interface RoleOption {
  id: string;
  name: string;
  position: number;
}

interface MappingRow {
  minAmount: string;
  roleId: string;
  roleName?: string;
}

export function DiscordRolesPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [botConfigured, setBotConfigured] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [guildId, setGuildId] = useState("");
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [mappings, setMappings] = useState<MappingRow[]>([
    { minAmount: "10", roleId: "" },
  ]);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/discord-roles");
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Erro ao carregar");
        return;
      }
      setBotConfigured(Boolean(data.botConfigured));
      setInviteUrl(data.inviteUrl ?? null);
      setGuildId(data.settings?.guildId ?? "");
      setRoles(Array.isArray(data.roles) ? data.roles : []);
      setRolesError(data.rolesError ?? null);
      const rows = Array.isArray(data.settings?.roleMappings)
        ? data.settings.roleMappings.map(
            (m: { minAmount: number; roleId: string; roleName?: string }) => ({
              minAmount: String(m.minAmount),
              roleId: m.roleId,
              roleName: m.roleName,
            }),
          )
        : [];
      setMappings(rows.length ? rows : [{ minAmount: "10", roleId: "" }]);
    } catch {
      setMessage("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/discord-roles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId,
          roleMappings: mappings
            .filter((m) => m.roleId && Number(m.minAmount) >= 0)
            .map((m) => ({
              minAmount: Number(m.minAmount),
              roleId: m.roleId,
              roleName: roles.find((r) => r.id === m.roleId)?.name,
            })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Erro ao salvar");
        return;
      }
      setMessage("Cargos Discord salvos.");
      await load();
    } catch {
      setMessage("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm text-zinc-400">
        Carregando cargos Discord…
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Cargos por tip (Discord)</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-400">
            <li>
              Primeiro conecte o Discord em{" "}
              <a href="/dashboard/integrations" className="text-sky-400 hover:underline">
                Integrações
              </a>{" "}
              e convide o bot para o seu servidor.
            </li>
            <li>
              Informe o Guild ID e mapeie faixas de valor → cargo. Quem tipar com Discord
              vinculado na conta pix.tips recebe o cargo automaticamente.
            </li>
            <li>
              Missões (acima) também podem liberar um Role ID específico ao concluir a meta.
            </li>
          </ul>
        </div>
        {inviteUrl && (
          <a
            href={inviteUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-xs font-medium text-sky-200 hover:bg-sky-400/15"
          >
            Convidar bot
          </a>
        )}
      </div>

      {!botConfigured && (
        <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Configure DISCORD_BOT_TOKEN e DISCORD_BOT_CLIENT_ID no servidor para ativar.
        </p>
      )}

      <div className="mt-4 space-y-3">
        <label className="block text-xs text-zinc-400">
          Guild ID do servidor
          <input
            value={guildId}
            onChange={(e) => setGuildId(e.target.value)}
            placeholder="Ex: 123456789012345678"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            disabled={!botConfigured}
          />
        </label>

        {rolesError && (
          <p className="text-xs text-rose-300">{rolesError}</p>
        )}

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Mapeamento valor → cargo
          </p>
          {mappings.map((row, idx) => (
            <div key={idx} className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                min={0}
                step="0.01"
                value={row.minAmount}
                onChange={(e) => {
                  const next = [...mappings];
                  next[idx] = { ...row, minAmount: e.target.value };
                  setMappings(next);
                }}
                className="w-28 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-white"
                disabled={!botConfigured}
              />
              <select
                value={row.roleId}
                onChange={(e) => {
                  const next = [...mappings];
                  next[idx] = { ...row, roleId: e.target.value };
                  setMappings(next);
                }}
                className="min-w-[180px] flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-white"
                disabled={!botConfigured}
              >
                <option value="">Selecione o cargo</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setMappings(mappings.filter((_, i) => i !== idx))}
                className="text-xs text-zinc-500 hover:text-rose-300"
                disabled={mappings.length <= 1}
              >
                Remover
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setMappings([...mappings, { minAmount: "25", roleId: "" }])}
            className="text-xs text-sky-400 hover:text-sky-300"
            disabled={!botConfigured}
          >
            + faixa
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!botConfigured || saving}
            className="live-btn-primary rounded-lg px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Salvar cargos"}
          </button>
          {message && <p className="text-xs text-zinc-400">{message}</p>}
        </div>
      </div>
    </section>
  );
}
