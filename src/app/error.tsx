"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center text-white">
      <div className="max-w-md">
        <p className="text-7xl" aria-hidden>
          😵
        </p>
        <p className="mt-4 text-sm font-medium uppercase tracking-wider text-cyan-400">
          Erro 500
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Algo deu errado</h1>
        <p className="mt-4 text-zinc-400">
          Encontramos um problema inesperado ao carregar esta página. Nossa equipe foi
          notificada automaticamente.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-zinc-600">ID: {error.digest}</p>
        )}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full rounded-lg web3-btn-primary px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110 sm:w-auto"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="w-full rounded-lg border border-zinc-700 px-6 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-600 hover:text-white sm:w-auto"
          >
            Ir para o início
          </Link>
        </div>
        <p className="mt-8 text-sm text-zinc-500">
          Precisa de ajuda?{" "}
          <Link href="/help" className="text-cyan-400 hover:underline">
            Central de Ajuda
          </Link>
        </p>
      </div>
    </main>
  );
}
