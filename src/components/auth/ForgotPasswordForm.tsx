"use client";

import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        setError(data.error ?? "Não foi possível enviar o link.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-zinc-300">
          Se existir uma conta com esse e-mail, enviamos instruções para redefinir a senha.
        </p>
        <Link href="/login" className="inline-block text-sm text-cyan-400 hover:underline">
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <p className="text-sm text-zinc-400">
        Informe seu e-mail e enviaremos um link para redefinir sua senha.
      </p>

      <label className="block text-sm">
        <span className="text-zinc-400">E-mail</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-cyan-400"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="web3-btn-primary w-full rounded-lg py-2.5 font-medium text-white disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Enviar link"}
      </button>

      <p className="text-center text-sm text-zinc-400">
        <Link href="/login" className="text-cyan-400 hover:underline">
          Voltar ao login
        </Link>
      </p>
    </form>
  );
}
