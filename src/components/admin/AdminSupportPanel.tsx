"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { SupportCreatorRow } from "@/lib/repositories/admin-support-repository";

interface AdminSupportPanelProps {
  chatwootUrl: string;
  creators: SupportCreatorRow[];
}

export function AdminSupportPanel({ chatwootUrl, creators }: AdminSupportPanelProps) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return creators;
    return creators.filter(
      (c) =>
        c.username.toLowerCase().includes(term) ||
        c.displayName.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term),
    );
  }, [creators, q]);

  const pendingKyc = creators.filter((c) => c.kycStatus === "pending").length;
  const suspended = creators.filter((c) => c.isSuspended).length;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-zinc-900/60 p-6">
        <h3 className="text-lg font-semibold text-white">Chatwoot — suporte aos criadores</h3>
        <p className="mt-1 max-w-2xl text-sm text-zinc-400">
          Central de conversas com criadores (live chat, e-mail e histórico). Use o painel do
          Chatwoot para atender; aqui você vê o contexto rápido de cada conta.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={chatwootUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500"
          >
            Abrir Chatwoot
          </a>
          <a
            href={`${chatwootUrl}/app/accounts`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 hover:border-cyan-500/40"
          >
            Inbox / contas
          </a>
        </div>
        <p className="mt-3 text-xs text-zinc-500 font-mono">{chatwootUrl}</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Criadores" value={String(creators.length)} />
        <Stat label="KYC pendente" value={String(pendingKyc)} tone="warn" />
        <Stat label="Suspensos" value={String(suspended)} tone={suspended ? "warn" : "ok"} />
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-semibold">Contatos dos criadores</h3>
            <p className="text-xs text-zinc-500">
              Use o e-mail para abrir conversa no Chatwoot ou responder direto.
            </p>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar nome, @ ou e-mail"
            className="w-full max-w-xs rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm sm:w-64"
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-500">
              <tr>
                <th className="px-2 py-2">Criador</th>
                <th className="px-2 py-2">E-mail</th>
                <th className="px-2 py-2">KYC</th>
                <th className="px-2 py-2">Arrecadado</th>
                <th className="px-2 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-2 py-8 text-center text-zinc-500">
                    Nenhum criador encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-t border-zinc-800/60">
                    <td className="px-2 py-2.5">
                      <p className="font-medium text-white">{c.displayName}</p>
                      <p className="text-xs text-zinc-500">
                        @{c.username}
                        {c.isSuspended ? (
                          <span className="ml-2 text-amber-400">suspenso</span>
                        ) : null}
                      </p>
                    </td>
                    <td className="px-2 py-2.5 font-mono text-xs text-zinc-300">{c.email}</td>
                    <td className="px-2 py-2.5 text-xs capitalize text-zinc-400">{c.kycStatus}</td>
                    <td className="px-2 py-2.5 text-zinc-300">{formatCurrency(c.raised)}</td>
                    <td className="px-2 py-2.5">
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`mailto:${c.email}?subject=${encodeURIComponent(`Suporte pix.tips — @${c.username}`)}`}
                          className="rounded border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:border-cyan-500/40"
                        >
                          E-mail
                        </a>
                        <Link
                          href={`/admin/creators`}
                          className="rounded border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:border-cyan-500/40"
                        >
                          Perfil admin
                        </Link>
                        <a
                          href={`/${c.username}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:border-cyan-500/40"
                        >
                          Tip page
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  const color =
    tone === "warn" ? "text-amber-300" : tone === "ok" ? "text-emerald-400" : "text-white";
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
