import { LgpdRequestForm } from "@/components/lgpd/LgpdRequestForm";
import { PageHeader, PublicPageLayout } from "@/components/public/PublicPageLayout";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Solicitação de Direitos — LGPD",
  description:
    "Exerça seus direitos sobre dados pessoais conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).",
};

const RIGHTS = [
  {
    number: 1,
    title: "Confirmação e acesso",
    description: "Confirmar se tratamos seus dados e acessar uma cópia deles.",
    how: "dashboard",
  },
  {
    number: 2,
    title: "Correção",
    description: "Corrigir dados incompletos, inexatos ou desatualizados.",
    how: "dashboard",
  },
  {
    number: 3,
    title: "Eliminação",
    description: "Excluir sua conta e dados tratados com base no consentimento.",
    how: "dashboard",
  },
  {
    number: 4,
    title: "Portabilidade",
    description: "Exportar seus dados pessoais em formato estruturado (JSON).",
    how: "dashboard",
  },
  {
    number: 5,
    title: "Informação sobre compartilhamento",
    description: "Saber com quais terceiros seus dados são compartilhados.",
    how: "email",
  },
  {
    number: 6,
    title: "Revogação de consentimento",
    description: "Retirar o consentimento para tratamento de dados a qualquer momento.",
    how: "dashboard",
  },
  {
    number: 7,
    title: "Oposição ao tratamento",
    description: "Opor-se ao tratamento de dados em casos não autorizados pela LGPD.",
    how: "email",
  },
  {
    number: 8,
    title: "Revisão de decisão automatizada",
    description:
      "Solicitar revisão humana de decisões automatizadas (ex: verificação de identidade recusada).",
    how: "email",
  },
] as const;

export default function LgpdSolicitacaoPage() {
  return (
    <PublicPageLayout narrow>
      <PageHeader
        title="Exercício de Direitos (LGPD)"
        description="Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você pode exercer os seguintes direitos sobre seus dados pessoais."
      />

      <div className="space-y-10 text-sm">
        {/* Lista de direitos */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-white">Seus direitos</h2>
          <ul className="space-y-3">
            {RIGHTS.map((right) => (
              <li
                key={right.number}
                className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
              >
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-bold text-cyan-400">
                  {right.number}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-200">{right.title}</p>
                  <p className="mt-0.5 text-zinc-500">{right.description}</p>
                  <p className="mt-1.5">
                    {right.how === "dashboard" ? (
                      <>
                        <span className="text-zinc-600">Como exercer: </span>
                        <Link
                          href="/dashboard/settings"
                          className="text-cyan-400 hover:underline"
                        >
                          Configurações da conta
                        </Link>
                      </>
                    ) : (
                      <>
                        <span className="text-zinc-600">Como exercer: </span>
                        <a
                          href="mailto:privacidade@pix.tips"
                          className="text-cyan-400 hover:underline"
                        >
                          privacidade@pix.tips
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Formulário de solicitação */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="mb-1.5 text-base font-semibold text-white">
            Enviar solicitação formal
          </h2>
          <p className="mb-5 text-zinc-500">
            Preencha o formulário abaixo para enviar sua solicitação diretamente ao nosso DPO.
          </p>
          <LgpdRequestForm />
        </section>
      </div>
    </PublicPageLayout>
  );
}
