"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-zinc-950 font-sans text-white antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <div className="max-w-md">
            <p className="text-7xl" aria-hidden>
              💥
            </p>
            <h1 className="mt-6 text-2xl font-bold">Falha crítica</h1>
            <p className="mt-4 text-zinc-400">
              A aplicação encontrou um erro grave. Recarregue a página ou tente novamente em
              alguns minutos.
            </p>
            {error.digest && (
              <p className="mt-3 font-mono text-xs text-zinc-600">{error.digest}</p>
            )}
            <button
              type="button"
              onClick={() => reset()}
              className="mt-8 rounded-lg web3-btn-primary px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              Recarregar
            </button>
            <p className="mt-6">
              <Link href="/" className="text-sm text-cyan-400 hover:underline">
                Voltar ao início
              </Link>
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
