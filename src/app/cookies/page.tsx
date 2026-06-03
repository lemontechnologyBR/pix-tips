import {
  LegalSection,
  PageHeader,
  PublicPageLayout,
} from "@/components/public/PublicPageLayout";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description:
    "Tipos de cookies utilizados na pix.tips, finalidades e como gerenciar suas preferências.",
};

const COOKIE_TABLE = [
  {
    name: "cookie-consent",
    type: "Essencial",
    purpose: "Armazena se você aceitou o banner de cookies",
    duration: "1 ano",
    provider: "pix.tips",
  },
  {
    name: "session / auth",
    type: "Essencial",
    purpose: "Mantém você autenticado no painel",
    duration: "Sessão ou 30 dias",
    provider: "pix.tips",
  },
  {
    name: "_tp_analytics",
    type: "Analítico",
    purpose: "Métricas agregadas de uso (páginas visitadas, cliques)",
    duration: "13 meses",
    provider: "pix.tips",
  },
  {
    name: "_tp_pref",
    type: "Funcional",
    purpose: "Preferências de interface no dashboard",
    duration: "6 meses",
    provider: "pix.tips",
  },
  {
    name: "payment_*",
    type: "Essencial",
    purpose: "Processamento seguro de pagamentos via parceiros",
    duration: "Conforme parceiro",
    provider: "Processador de pagamentos",
  },
] as const;

export default function CookiesPage() {
  return (
    <PublicPageLayout narrow>
      <PageHeader
        title="Política de Cookies"
        description="Entenda como usamos cookies e tecnologias similares no site e no painel."
        updatedAt="28 de maio de 2026"
      />

      <article className="space-y-10">
        <LegalSection id="o-que-sao" title="O que são cookies?">
          <p>
            Cookies são pequenos arquivos de texto armazenados no seu navegador. Eles permitem
            lembrar preferências, manter sessões seguras e entender como a Plataforma é utilizada.
          </p>
        </LegalSection>

        <LegalSection id="como-gerenciar" title="Como gerenciar">
          <p>
            Ao visitar a landing, você pode aceitar cookies não essenciais pelo banner. Também
            pode bloquear ou apagar cookies nas configurações do navegador; isso pode afetar login
            e algumas funcionalidades.
          </p>
          <p>
            Para dados pessoais associados, consulte a{" "}
            <Link href="/privacidade" className="text-cyan-400 hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </LegalSection>

        <LegalSection id="tabela" title="Cookies que utilizamos">
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  <th className="px-4 py-3 font-semibold text-zinc-300">Nome</th>
                  <th className="px-4 py-3 font-semibold text-zinc-300">Tipo</th>
                  <th className="px-4 py-3 font-semibold text-zinc-300">Finalidade</th>
                  <th className="px-4 py-3 font-semibold text-zinc-300">Duração</th>
                  <th className="px-4 py-3 font-semibold text-zinc-300">Provedor</th>
                </tr>
              </thead>
              <tbody>
                {COOKIE_TABLE.map((row) => (
                  <tr key={row.name} className="border-b border-zinc-800/80 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-cyan-300">{row.name}</td>
                    <td className="px-4 py-3 text-zinc-400">{row.type}</td>
                    <td className="px-4 py-3 text-zinc-400">{row.purpose}</td>
                    <td className="px-4 py-3 text-zinc-500">{row.duration}</td>
                    <td className="px-4 py-3 text-zinc-500">{row.provider}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LegalSection>

        <LegalSection id="terceiros" title="Cookies de terceiros">
          <p>
            Incorporações futuras (vídeos, chat de suporte) podem definir cookies próprios. Nesses
            casos, atualizaremos esta tabela e o banner de consentimento.
          </p>
        </LegalSection>
      </article>
    </PublicPageLayout>
  );
}
