import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center text-white">
      <div className="max-w-md">
        <div
          className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/60 text-6xl shadow-lg shadow-cyan-950/30"
          aria-hidden
        >
          🧭
        </div>
        <p className="mt-8 text-sm font-medium uppercase tracking-wider text-cyan-400">
          Erro 404
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Página não encontrada</h1>
        <p className="mt-4 leading-relaxed text-zinc-400">
          O endereço que você acessou não existe ou foi movido. Confira o link ou volte para a
          página inicial.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="w-full rounded-lg web3-btn-primary px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110 sm:w-auto"
          >
            Voltar ao início
          </Link>
          <Link
            href="/help"
            className="w-full rounded-lg border border-zinc-700 px-6 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-600 hover:text-white sm:w-auto"
          >
            Central de Ajuda
          </Link>
        </div>
        <p className="mt-8 text-sm text-zinc-500">
          Procurando exemplos?{" "}
          <Link href="/examples" className="text-cyan-400 hover:underline">
            Ver galeria de páginas
          </Link>
        </p>
      </div>
    </main>
  );
}
