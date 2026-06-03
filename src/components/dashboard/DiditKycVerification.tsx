"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { KycFormIcon } from "@/components/dashboard/KycFormIcon";
import { formatCpf, isValidCpf, kycStatusLabel, normalizeCpf } from "@/lib/kyc";
import type { KycProfile } from "@/types";

interface DiditKycVerificationProps {
  initialProfile: KycProfile;
  embedded?: boolean;
  onProfileUpdate?: (profile: KycProfile) => void;
}

function statusConfig(status: KycProfile["status"]) {
  switch (status) {
    case "approved":
      return {
        icon: "status-approved" as const,
        box: "border-emerald-500/30 bg-gradient-to-r from-emerald-600/10 to-emerald-900/5",
        title: "text-emerald-100",
        body: "text-emerald-200/80",
      };
    case "pending":
      return {
        icon: "status-pending" as const,
        box: "border-amber-500/30 bg-gradient-to-r from-amber-600/10 to-amber-900/5",
        title: "text-amber-100",
        body: "text-amber-200/80",
      };
    case "rejected":
      return {
        icon: "status-rejected" as const,
        box: "border-red-500/30 bg-gradient-to-r from-red-600/10 to-red-900/5",
        title: "text-red-100",
        body: "text-red-200/80",
      };
    default:
      return {
        icon: "status-none" as const,
        box: "border-zinc-700/80 bg-gradient-to-r from-zinc-800/40 to-zinc-900/20",
        title: "text-zinc-100",
        body: "text-zinc-400",
      };
  }
}

export function DiditKycVerification({
  initialProfile,
  embedded = false,
  onProfileUpdate,
}: DiditKycVerificationProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cpf, setCpf] = useState("");

  const status = statusConfig(profile.status);

  const syncProfile = useCallback(async () => {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch("/api/user/kyc/didit/sync", { method: "POST" });
      const data = (await res.json()) as KycProfile & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erro ao atualizar status da verificação.");
        return;
      }
      setProfile(data);
      onProfileUpdate?.(data);
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("didit") === "1") {
      void syncProfile().finally(() => {
        const cleanUrl = embedded
          ? `${window.location.pathname}?tab=verificacao`
          : window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
      });
    }
  }, [syncProfile, embedded]);

  async function startVerification() {
    const normalizedCpf = normalizeCpf(cpf);
    if (!isValidCpf(normalizedCpf)) {
      setError("Informe um CPF válido antes de iniciar a verificação.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/kyc/didit/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: normalizedCpf }),
      });
      const raw = await res.text();
      let data: { error?: string; url?: string } = {};
      if (raw) {
        try {
          data = JSON.parse(raw) as { error?: string; url?: string };
        } catch {
          setError("Resposta inválida do servidor. Reinicie o dev server e tente novamente.");
          return;
        }
      }
      if (!res.ok || !data.url) {
        setError(data.error ?? "Erro ao iniciar verificação.");
        return;
      }
      window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={embedded ? "space-y-6" : "mx-auto max-w-2xl space-y-6"}>
      {!embedded && (
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            <KycFormIcon name="shield" className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Verificação de identidade</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Verificação segura via Didit — documento + selfie em poucos minutos.
            </p>
          </div>
        </div>
      )}

      <div className={`rounded-2xl border p-5 ${status.box}`}>
        <div className="flex items-start gap-3">
          <KycFormIcon name={status.icon} className="h-5 w-5 shrink-0" />
          <div>
            <p className={`font-semibold ${status.title}`}>
              Status: {kycStatusLabel(profile.status)}
            </p>
            {profile.status === "approved" && (
              <p className={`mt-1 text-sm ${status.body}`}>
                Identidade verificada. Você já pode cadastrar sua chave Pix e sacar doações.
              </p>
            )}
            {profile.status === "pending" && (
              <p className={`mt-1 text-sm ${status.body}`}>
                Verificação em andamento. Se você já concluiu, aguarde alguns segundos ou
                atualize o status.
              </p>
            )}
            {profile.status === "rejected" && (
              <p className={`mt-1 text-sm ${status.body}`}>
                {profile.rejectionReason ?? "Verificação recusada. Tente novamente."}
              </p>
            )}
            {profile.status === "none" && (
              <p className={`mt-1 text-sm ${status.body}`}>
                Para receber doações e sacar, complete a verificação de identidade.
              </p>
            )}
          </div>
        </div>
      </div>

      {profile.legalName && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm">
          <p className="text-zinc-500">
            {profile.status === "approved" ? "Titular verificado" : "Dados da última tentativa"}
          </p>
          <p className="mt-1 font-medium text-white">{profile.legalName}</p>
          {profile.cpfMasked && (
            <p className="mt-1 text-zinc-400">CPF: {profile.cpfMasked}</p>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {profile.status !== "approved" && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="font-semibold text-white">Como funciona</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-400">
            <li>Informe o CPF que será vinculado à sua conta</li>
            <li>Clique em iniciar verificação</li>
            <li>Envie documento (RG ou CNH) e faça a selfie</li>
            <li>Aguarde aprovação automática — geralmente em minutos</li>
          </ol>

          <label className="mt-5 block text-sm">
            <span className="text-zinc-300">CPF</span>
            <input
              value={cpf}
              onChange={(event) => setCpf(formatCpf(event.target.value).slice(0, 14))}
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />
            <span className="mt-2 block text-xs text-zinc-500">
              O mesmo CPF não pode ser usado em mais de uma conta.
            </span>
          </label>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void startVerification()}
              disabled={loading}
              className="rounded-lg web3-btn-primary px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
            >
              {loading
                ? "Abrindo…"
                : profile.status === "pending"
                  ? "Continuar verificação"
                  : "Iniciar verificação"}
            </button>

            {profile.status === "pending" && (
              <button
                type="button"
                onClick={() => void syncProfile()}
                disabled={syncing}
                className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm text-zinc-300 hover:border-zinc-600 disabled:opacity-50"
              >
                {syncing ? "Atualizando…" : "Atualizar status"}
              </button>
            )}
          </div>
        </div>
      )}

      {profile.status === "approved" && !embedded && (
        <Link
          href="/dashboard/finance"
          className="inline-flex rounded-lg web3-btn-primary px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
        >
          Ir para Financeiro
        </Link>
      )}
    </div>
  );
}
