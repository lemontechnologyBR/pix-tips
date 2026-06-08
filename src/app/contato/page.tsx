import { PageHeader, PublicPageLayout } from "@/components/public/PublicPageLayout";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com a equipe da pix.tips. Suporte técnico, dúvidas sobre privacidade e LGPD, ou parcerias comerciais.",
};

export default function ContatoPage() {
  return (
    <PublicPageLayout>
      <PageHeader title="Entre em contato" />

      <div className="grid gap-8 sm:grid-cols-2">
        {/* Coluna esquerda — Formas de contato */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="mb-5 text-lg font-semibold text-white">Formas de contato</h2>

          <ul className="space-y-5 text-sm">
            <li>
              <p className="font-medium text-zinc-300">Suporte técnico</p>
              <a
                href="mailto:suporte@pix.tips"
                className="text-cyan-400 transition hover:text-cyan-300 hover:underline"
              >
                suporte@pix.tips
              </a>
            </li>

            <li>
              <p className="font-medium text-zinc-300">Privacidade e LGPD</p>
              <a
                href="mailto:privacidade@pix.tips"
                className="text-cyan-400 transition hover:text-cyan-300 hover:underline"
              >
                privacidade@pix.tips
              </a>
              <p className="mt-0.5 text-xs text-zinc-500">(exercício de direitos LGPD)</p>
            </li>

            <li>
              <p className="font-medium text-zinc-300">Parcerias</p>
              <a
                href="mailto:parcerias@pix.tips"
                className="text-cyan-400 transition hover:text-cyan-300 hover:underline"
              >
                parcerias@pix.tips
              </a>
            </li>
          </ul>

          <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-400">
            Respondemos em até <span className="font-medium text-zinc-300">2 dias úteis</span>.
          </div>
        </section>

        {/* Coluna direita — FAQ rápida */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="mb-5 text-lg font-semibold text-white">Perguntas frequentes</h2>

          <div className="space-y-5 text-sm">
            <div>
              <p className="font-medium text-zinc-300">
                Tenho um problema com uma transação
              </p>
              <p className="mt-1 text-zinc-400">
                Envie e-mail para{" "}
                <a
                  href="mailto:suporte@pix.tips"
                  className="text-cyan-400 hover:underline"
                >
                  suporte@pix.tips
                </a>{" "}
                com o ID da transação, data e valor.
              </p>
            </div>

            <div>
              <p className="font-medium text-zinc-300">Quero solicitar exclusão de dados</p>
              <p className="mt-1 text-zinc-400">
                Acesse a{" "}
                <Link
                  href="/privacidade/solicitacao"
                  className="text-cyan-400 hover:underline"
                >
                  página de solicitação LGPD
                </Link>{" "}
                para exercer seus direitos de forma estruturada.
              </p>
            </div>

            <div>
              <p className="font-medium text-zinc-300">Quero denunciar uso indevido</p>
              <p className="mt-1 text-zinc-400">
                Use o e-mail{" "}
                <a
                  href="mailto:suporte@pix.tips?subject=DENÚNCIA"
                  className="text-cyan-400 hover:underline"
                >
                  suporte@pix.tips
                </a>{" "}
                com o título{" "}
                <span className="font-mono text-xs text-zinc-300">&ldquo;DENÚNCIA&rdquo;</span>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PublicPageLayout>
  );
}
