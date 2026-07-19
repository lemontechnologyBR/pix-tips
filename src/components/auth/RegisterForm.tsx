"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { trackGoogleAdsSignupConversion } from "@/lib/analytics/google-ads";
import { slugifyUsername } from "@/lib/auth/validators";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  const slug = slugifyUsername(username);
  const baseStatus: UsernameStatus | null = !username.trim()
    ? "idle"
    : slug.length < 3
      ? "invalid"
      : null;

  useEffect(() => {
    if (baseStatus !== null) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      setUsernameStatus("checking");
      try {
        const res = await fetch(
          `/api/auth/check-username?username=${encodeURIComponent(slug)}`,
        );
        if (cancelled) return;
        const data = (await res.json()) as { available?: boolean };
        setUsernameStatus(data.available ? "available" : "taken");
      } catch {
        if (!cancelled) setUsernameStatus("idle");
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [username, baseStatus, slug]);

  const usernameStatusDisplay = baseStatus ?? usernameStatus;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!terms) {
      setError("Você precisa aceitar os termos de uso.");
      return;
    }

    if (usernameStatusDisplay !== "available") {
      setError("Escolha um nome de usuário disponível.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, terms, marketingOptIn }),
      });

      const data = (await res.json()) as { error?: string; redirect?: string };

      if (!res.ok) {
        setError(data.error ?? "Não foi possível criar a conta.");
        return;
      }

      trackGoogleAdsSignupConversion();
      router.push(data.redirect ?? "/onboarding");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const usernameHint = {
    idle: null,
    checking: "Verificando disponibilidade...",
    available: "Nome de usuário disponível",
    taken: "Nome de usuário já está em uso",
    invalid: "Use 3–30 caracteres: letras minúsculas, números ou _",
  }[usernameStatusDisplay];

  const hintColor =
    usernameStatusDisplay === "available"
      ? "text-emerald-400"
      : usernameStatusDisplay === "taken" || usernameStatusDisplay === "invalid"
        ? "text-red-400"
        : "text-zinc-500";

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
        <span className="text-zinc-400">Nome de usuário</span>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">@</span>
          <input
            required
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pl-8 pr-3 outline-none focus:border-cyan-400"
          />
        </div>
        {usernameHint && <p className={`mt-1 text-xs ${hintColor}`}>{usernameHint}</p>}
      </label>

      <label className="block text-sm">
        <span className="text-zinc-400">Senha</span>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-cyan-400"
        />
        <p className="mt-1 text-xs text-zinc-500">Mínimo de 8 caracteres</p>
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          className="mt-1 rounded border-zinc-600"
        />
        <span className="text-zinc-400">
          Li e aceito os{" "}
          <Link href="/termos" className="text-cyan-400 hover:underline">
            termos de uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" className="text-cyan-400 hover:underline">
            política de privacidade
          </Link>
        </span>
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={marketingOptIn}
          onChange={(e) => setMarketingOptIn(e.target.checked)}
          className="mt-1 rounded border-zinc-600 accent-cyan-500"
        />
        <span className="text-zinc-400">
          Quero receber novidades e dicas da pix.tips por e-mail (opcional). Você pode cancelar
          a qualquer momento nas{" "}
          <Link href="/dashboard/settings" className="text-cyan-400 hover:underline">
            configurações
          </Link>
          .
        </span>
      </label>

      <button
        type="submit"
        disabled={loading || usernameStatusDisplay !== "available" || !terms}
        className="web3-btn-primary w-full rounded-lg py-2.5 font-medium text-white disabled:opacity-50"
      >
        {loading ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="text-center text-sm text-zinc-400">
        Já tem conta?{" "}
        <Link href="/login" className="text-cyan-400 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
