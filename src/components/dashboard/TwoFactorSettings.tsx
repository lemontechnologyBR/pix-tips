"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface TwoFactorSettingsProps {
  initialEnabled: boolean;
  hasPassword: boolean;
}

export function TwoFactorSettings({ initialEnabled, hasPassword }: TwoFactorSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [setupOpen, setSetupOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [setupCode, setSetupCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    const res = await fetch("/api/user/security");
    if (!res.ok) return;
    const data = (await res.json()) as { totpEnabled?: boolean };
    setEnabled(Boolean(data.totpEnabled));
  }, []);

  useEffect(() => {
    setEnabled(initialEnabled);
  }, [initialEnabled]);

  async function handleStartSetup() {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/user/security/totp/setup", { method: "POST" });
      const data = (await res.json()) as {
        error?: string;
        qrDataUrl?: string;
        secret?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Não foi possível iniciar a configuração.");
        return;
      }
      setQrDataUrl(data.qrDataUrl ?? null);
      setSecret(data.secret ?? null);
      setSetupCode("");
      setSetupOpen(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnable() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/user/security/totp/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: setupCode }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Código inválido.");
        return;
      }
      setSetupOpen(false);
      setQrDataUrl(null);
      setSecret(null);
      setEnabled(true);
      setMessage("Autenticação em duas etapas ativada com sucesso.");
      await refreshStatus();
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/user/security/totp/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: disableCode, password: disablePassword }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Não foi possível desativar o 2FA.");
        return;
      }
      setDisableOpen(false);
      setDisableCode("");
      setDisablePassword("");
      setEnabled(false);
      setMessage("Autenticação em duas etapas desativada.");
      await refreshStatus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-4">
        <p className="text-sm text-zinc-400">Autenticação em duas etapas (2FA)</p>
        <p className="mt-1 font-medium text-zinc-200">
          {enabled ? "Ativo — app autenticador" : "Desativado"}
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          {enabled
            ? "No login será pedido um código do Google Authenticator ou similar."
            : "Proteja sua conta com um código do app autenticador no login."}
        </p>

        {message && (
          <p className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
            {message}
          </p>
        )}

        {!hasPassword ? (
          <p className="mt-3 text-xs text-amber-400/90">
            <Link href="/forgot-password" className="underline hover:text-amber-300">
              Defina uma senha
            </Link>{" "}
            antes de ativar o 2FA.
          </p>
        ) : enabled ? (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setDisableOpen(true);
            }}
            className="mt-3 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-red-500/50 hover:text-red-300"
          >
            Desativar 2FA
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleStartSetup}
            className="mt-3 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"
          >
            {loading ? "Preparando…" : "Ativar 2FA"}
          </button>
        )}
      </div>

      {setupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-zinc-100">Configurar 2FA</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Escaneie o QR code com Google Authenticator, Authy ou similar e informe o código
              gerado.
            </p>

            {qrDataUrl && (
              <div className="mt-4 flex justify-center rounded-xl border border-zinc-800 bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="QR code 2FA" className="h-44 w-44" />
              </div>
            )}

            {secret && (
              <p className="mt-3 break-all rounded-lg bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-400">
                Chave manual: {secret}
              </p>
            )}

            {error && (
              <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <label className="mt-4 block text-sm">
              <span className="text-zinc-400">Código do autenticador</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={setupCode}
                onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ""))}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 tracking-widest outline-none focus:border-cyan-400"
              />
            </label>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setSetupOpen(false)}
                className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={loading || setupCode.length !== 6}
                onClick={handleEnable}
                className="web3-btn-primary flex-1 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Verificando…" : "Ativar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {disableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-red-400">Desativar 2FA</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Confirme sua senha e o código atual do autenticador.
            </p>

            {error && (
              <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <label className="mt-4 block text-sm">
              <span className="text-zinc-400">Senha</span>
              <input
                type="password"
                autoComplete="current-password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-cyan-400"
              />
            </label>

            <label className="mt-3 block text-sm">
              <span className="text-zinc-400">Código do autenticador</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 tracking-widest outline-none focus:border-cyan-400"
              />
            </label>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setDisableOpen(false)}
                className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={loading || disableCode.length !== 6 || !disablePassword}
                onClick={handleDisable}
                className="flex-1 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-50"
              >
                {loading ? "Desativando…" : "Desativar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
