"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const oauthError = searchParams.get("error");
  const mfaParam = searchParams.get("mfa");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaEmail, setMfaEmail] = useState("");
  const [error, setError] = useState(oauthError ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mfaParam !== "1") return;

    fetch("/api/auth/mfa/verify")
      .then((res) => res.json())
      .then((data: { pending?: boolean; email?: string }) => {
        if (data.pending) {
          setMfaStep(true);
          setMfaEmail(data.email ?? "");
        }
      })
      .catch(() => {
        // ignore
      });
  }, [mfaParam]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as {
        error?: string;
        redirect?: string;
        requiresMfa?: boolean;
        email?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "Não foi possível entrar.");
        return;
      }

      if (data.requiresMfa) {
        setMfaStep(true);
        setMfaEmail(data.email ?? email);
        return;
      }

      const target = data.redirect ?? redirect;
      if (window.location.protocol === "https:") {
        window.location.assign(target);
        return;
      }

      router.push(target);
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMfaSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: mfaCode }),
      });

      const data = (await res.json()) as { error?: string; redirect?: string };

      if (!res.ok) {
        setError(data.error ?? "Código inválido.");
        return;
      }

      const target = data.redirect ?? redirect;
      if (window.location.protocol === "https:") {
        window.location.assign(target);
        return;
      }

      router.push(target);
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (mfaStep) {
    return (
      <form onSubmit={handleMfaSubmit} className="space-y-4">
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-3 text-sm text-cyan-200">
          <p className="font-medium">Verificação em duas etapas</p>
          <p className="mt-1 text-cyan-300/90">
            Informe o código de 6 dígitos do seu app autenticador
            {mfaEmail ? ` para ${mfaEmail}` : ""}.
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <label className="block text-sm">
          <span className="text-zinc-400">Código do autenticador</span>
          <input
            type="text"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-center text-lg tracking-[0.35em] outline-none focus:border-cyan-400"
          />
        </label>

        <button
          type="submit"
          disabled={loading || mfaCode.length !== 6}
          className="web3-btn-primary w-full rounded-lg py-2.5 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Verificando…" : "Confirmar"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMfaStep(false);
            setMfaCode("");
            setError("");
          }}
          className="w-full text-sm text-zinc-400 hover:text-zinc-200"
        >
          Voltar ao login
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SocialLoginButtons />

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

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

      <label className="block text-sm">
        <span className="text-zinc-400">Senha</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-cyan-400"
        />
      </label>

      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm text-cyan-400 hover:underline">
          Esqueceu a senha?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="web3-btn-primary w-full rounded-lg py-2.5 font-medium text-white disabled:opacity-50"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center text-sm text-zinc-400">
        Não tem conta?{" "}
        <Link href="/register" className="text-cyan-400 hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
