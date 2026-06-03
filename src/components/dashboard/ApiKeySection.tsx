"use client";

import { useState } from "react";

export function ApiKeySection() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function loadOrCreateKey() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/api-key");
      const data = (await res.json()) as { apiKey?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Não foi possível obter a chave.");
        return;
      }
      setApiKey(data.apiKey ?? null);
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  async function copyKey() {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
      <h2 className="text-base font-semibold text-white">API para desenvolvedores</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Gere uma chave para integrações e webhooks.{" "}
        <a href="/developers" className="text-cyan-400 hover:underline">
          Ver documentação
        </a>
      </p>
      {error && (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      )}
      {apiKey ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            readOnly
            value={apiKey}
            className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-300"
          />
          <button
            type="button"
            onClick={copyKey}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-cyan-500"
          >
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={loadOrCreateKey}
          className="mt-4 rounded-lg web3-btn-primary px-4 py-2 text-sm font-medium hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Gerando..." : "Gerar chave de API"}
        </button>
      )}
    </section>
  );
}
