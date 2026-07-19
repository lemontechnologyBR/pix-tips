"use client";

import Link from "next/link";
import { useState } from "react";
import type { AdminPlatformStatus } from "@/lib/repositories/admin-platform-status";

interface AdminSettingsPanelProps {
  status: AdminPlatformStatus;
}

export function AdminSettingsPanel({ status }: AdminSettingsPanelProps) {
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function sendTest() {
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail.trim() || undefined }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; id?: string };
      if (!res.ok || !data.ok) {
        setMessage(data.error ?? "Falha ao enviar e-mail de teste.");
        return;
      }
      setMessage(`E-mail de teste enviado${data.id ? ` (${data.id})` : ""}.`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-base font-semibold">Taxas da plataforma</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Valores ativos no código (não editáveis por aqui).
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Info label="Comissão por doação" value={status.fees.commissionLabel} />
          <Info label="Taxa de saque" value={`R$ ${status.fees.payoutFee.toFixed(2).replace(".", ",")}`} />
          <Info
            label="Saque mínimo"
            value={`R$ ${status.fees.minWithdraw.toFixed(2).replace(".", ",")}`}
          />
          <Info label="URL da plataforma" value={status.appUrl} mono />
        </dl>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-base font-semibold">E-mail transacional</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Credenciais ficam no servidor (`.env`). Aqui você só valida se está funcionando.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Info
            label="Status"
            value={status.email.configured ? `OK · ${status.email.provider}` : "Não configurado"}
            tone={status.email.configured ? "ok" : "warn"}
          />
          <Info label="Remetente" value={status.email.from} mono />
          <Info label="SMTP host" value={status.email.smtpHost ?? "—"} mono />
          <Info label="SMTP user" value={status.email.smtpUser ?? "—"} mono />
        </dl>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="testEmail" className="block text-xs text-zinc-500">
              Enviar e-mail de teste
            </label>
            <input
              id="testEmail"
              type="email"
              placeholder="seu@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            disabled={sending || !status.email.configured}
            onClick={() => void sendTest()}
            className="rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
          >
            {sending ? "Enviando…" : "Enviar teste"}
          </button>
        </div>
        {message && (
          <p
            className={`mt-3 text-sm ${
              message.includes("enviado") ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-base font-semibold">Integrações</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <Info
            label="Mercado Pago / Pix"
            value={status.integrations.mercadoPago ? "conectado" : "off"}
            tone={status.integrations.mercadoPago ? "ok" : "warn"}
          />
          <Info
            label="Didit KYC"
            value={status.integrations.didit ? "ativo" : "off"}
            tone={status.integrations.didit ? "ok" : "warn"}
          />
          <Info label="Consulta CPF" value={status.integrations.cpfProvider} />
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/admin/ops"
            className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:border-cyan-500/40 hover:text-cyan-300"
          >
            Abrir Operações (widgets / KYC)
          </Link>
          <Link
            href="/admin/kyc"
            className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:border-cyan-500/40 hover:text-cyan-300"
          >
            Verificações KYC
          </Link>
        </div>
      </section>
    </div>
  );
}

function Info({
  label,
  value,
  mono,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "ok" | "warn";
}) {
  const color =
    tone === "ok" ? "text-emerald-400" : tone === "warn" ? "text-amber-400" : "text-white";
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2.5">
      <dt className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className={`mt-1 text-sm font-medium ${color} ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
