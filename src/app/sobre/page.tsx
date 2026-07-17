import { PageHeader, PublicPageLayout } from "@/components/public/PublicPageLayout";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre a pix.tips",
  description:
    "Conheça a pix.tips: a plataforma brasileira de doações via Pix para criadores de conteúdo.",
};

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Crie sua página",
    description: "Em minutos, sem CNPJ. Basta criar sua conta e personalizar sua página.",
  },
  {
    step: "2",
    title: "Receba via Pix",
    description: "Doações instantâneas com QR Code e alertas em tempo real no OBS.",
  },
  {
    step: "3",
    title: "Saque quando quiser",
    description: "Pix Out direto para sua conta bancária. Saldo disponível imediatamente.",
  },
] as const;

export default function SobrePage() {
  return (
    <PublicPageLayout narrow>
      <PageHeader title="Sobre a pix.tips" />

      <div className="space-y-12 text-sm leading-relaxed text-zinc-400">
        {/* O que é */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">O que é</h2>
          <p>
            A pix.tips é uma plataforma brasileira de doações via Pix para criadores de
            conteúdo. Criada para streamers, músicos, artistas, podcasters e educadores que
            querem receber apoio financeiro do público de forma simples e instantânea.
          </p>
        </section>

        {/* Como funciona */}
        <section>
          <h2 className="mb-5 text-lg font-semibold text-white">Como funciona</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-bold text-cyan-400">
                  {item.step}
                </div>
                <p className="mb-1.5 font-medium text-white">{item.title}</p>
                <p className="text-zinc-500">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Modelo de negócio */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Modelo de negócio</h2>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p>
              A plataforma cobra{" "}
              <span className="font-semibold text-white">2,5% + R$ 0,50</span> sobre cada doação
              confirmada. Não há mensalidade, plano pago ou taxa de adesão. Para saques, há
              uma taxa fixa de{" "}
              <span className="font-semibold text-white">R$ 2,50</span> por operação.
            </p>
          </div>
        </section>

        {/* Missão */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Nossa missão</h2>
          <p className="text-base italic text-zinc-300">
            &ldquo;Democratizar o apoio financeiro para criadores independentes no Brasil, sem
            burocracia.&rdquo;
          </p>
        </section>

        {/* CTA */}
        <div className="border-t border-zinc-800 pt-8 text-center">
          <Link
            href="/register"
            className="inline-block rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-400"
          >
            Criar minha página grátis
          </Link>
        </div>
      </div>
    </PublicPageLayout>
  );
}
