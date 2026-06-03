import Link from "next/link";

export function CreatorNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-white">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-zinc-900 text-4xl">
          🔍
        </div>
        <h1 className="mt-6 text-2xl font-bold">Criador não encontrado</h1>
        <p className="mt-3 text-zinc-400">
          Esta página não existe ou foi removida. Verifique o link e tente
          novamente.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-xl web3-btn-primary px-6 py-3 font-semibold hover:brightness-110"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
