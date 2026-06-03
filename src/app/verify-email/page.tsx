"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificação ausente.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };
        if (res.ok && data.ok) {
          setStatus("success");
          setMessage(data.message ?? "E-mail verificado com sucesso!");
        } else {
          setStatus("error");
          setMessage(data.error ?? "Erro ao verificar e-mail.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Erro de conexão. Tente novamente.");
      });
  }, [token]);

  return (
    <AuthLayout
      title="Verificação de e-mail"
      subtitle="Confirmando seu endereço de e-mail"
    >
      <div className="flex flex-col items-center gap-6 py-4 text-center">
        {status === "loading" && (
          <>
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-violet-500" />
            <p className="text-sm text-zinc-400">Verificando...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-3xl">
              ✓
            </div>
            <div>
              <p className="font-semibold text-emerald-400">{message}</p>
              <p className="mt-1 text-sm text-zinc-400">
                Seu e-mail foi confirmado. Você já pode usar todos os recursos da plataforma.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
            >
              Ir para o painel
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-3xl">
              ✕
            </div>
            <div>
              <p className="font-semibold text-red-400">{message}</p>
              <p className="mt-1 text-sm text-zinc-400">
                O link pode ter expirado ou já ter sido utilizado.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="rounded-xl bg-zinc-800 px-6 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              Voltar ao painel
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
