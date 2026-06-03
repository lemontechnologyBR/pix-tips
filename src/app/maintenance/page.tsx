import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Manutenção",
  description: "A pix.tips está em manutenção programada. Voltamos em breve.",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center text-white">
      <div className="max-w-md">
        <p className="text-6xl" aria-hidden>
          🔧
        </p>
        <h1 className="mt-6 text-3xl font-bold">Manutenção programada</h1>
        <p className="mt-4 leading-relaxed text-zinc-400">
          Estamos atualizando a infraestrutura para melhorar Pix, alertas e desempenho do
          painel. A previsão de retorno é de algumas horas.
        </p>
        <p className="mt-6 text-sm text-zinc-600">
          Acompanhe em{" "}
          <Link href="/status" className="text-cyan-400 hover:underline">
            /status
          </Link>{" "}
          ou nosso canal de status.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-cyan-500 hover:text-white"
        >
          Tentar página inicial
        </Link>
      </div>
    </main>
  );
}
