import {
  LegalNav,
  LegalSection,
  PageHeader,
  PublicPageLayout,
} from "@/components/public/PublicPageLayout";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como a pix.tips coleta, usa e protege seus dados pessoais em conformidade com a LGPD.",
};

const SECTIONS = [
  { id: "intro", label: "Introdução" },
  { id: "dados", label: "Dados que coletamos" },
  { id: "finalidades", label: "Finalidades e bases legais" },
  { id: "compartilhamento", label: "Compartilhamento" },
  { id: "direitos", label: "Seus direitos (LGPD)" },
  { id: "retencao", label: "Retenção e segurança" },
  { id: "cookies", label: "Cookies" },
  { id: "contato", label: "Contato do DPO" },
];

export default function PrivacidadePage() {
  return (
    <PublicPageLayout narrow>
      <PageHeader
        title="Política de Privacidade"
        description="Transparência sobre o tratamento de dados pessoais na pix.tips."
        updatedAt="28 de maio de 2026"
      />
      <LegalNav items={SECTIONS} />

      <article className="space-y-10">
        <LegalSection id="intro" title="Introdução">
          <p>
            A pix.tips respeita sua privacidade e trata dados pessoais em conformidade com a Lei
            Geral de Proteção de Dados (LGPD). Esta política descreve quais dados coletamos, por
            quê e como você pode exercer seus direitos.
          </p>
        </LegalSection>

        <LegalSection id="dados" title="Dados que coletamos">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-zinc-300">Cadastro:</strong> nome, e-mail, username,
              senha (hash), foto de perfil opcional.
            </li>
            <li>
              <strong className="text-zinc-300">Financeiros:</strong> chave Pix, histórico de
              transações, dados de faturamento para planos pagos.
            </li>
            <li>
              <strong className="text-zinc-300">Uso:</strong> logs de acesso, IP, dispositivo,
              interações no painel e no widget de alertas.
            </li>
            <li>
              <strong className="text-zinc-300">Apoiadores:</strong> nome ou apelido, mensagem,
              valor da doação, método de pagamento (quando aplicável).
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="finalidades" title="Finalidades e bases legais">
          <p>Utilizamos dados para:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Prestação do serviço e execução do contrato (Art. 7º, V, LGPD).</li>
            <li>Processamento de pagamentos e prevenção a fraudes (legítimo interesse e obrigação legal).</li>
            <li>Comunicações sobre conta, segurança e atualizações do produto.</li>
            <li>Melhoria da Plataforma mediante analytics agregados e anonimizados quando possível.</li>
            <li>Marketing, apenas com consentimento prévio e opção de descadastro.</li>
          </ul>
        </LegalSection>

        <LegalSection id="compartilhamento" title="Compartilhamento">
          <p>
            Podemos compartilhar dados com processadores de pagamento, hospedagem em nuvem,
            ferramentas de suporte e autoridades quando exigido por lei. Exigimos contratos e
            medidas de segurança compatíveis com a LGPD. Não vendemos dados pessoais.
          </p>
        </LegalSection>

        <LegalSection id="direitos" title="Seus direitos (LGPD)">
          <p>Você pode solicitar:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Confirmação e acesso aos dados tratados;</li>
            <li>Correção de dados incompletos ou desatualizados;</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
            <li>Portabilidade e informação sobre compartilhamentos;</li>
            <li>Revogação do consentimento, quando a base legal for o consentimento.</li>
          </ul>
          <p>
            Envie pedidos para privacidade@pix.tips. Responderemos em prazo razoável conforme a
            ANPD.
          </p>
        </LegalSection>

        <LegalSection id="retencao" title="Retenção e segurança">
          <p>
            Mantemos dados pelo tempo necessário às finalidades descritas e obrigações legais
            (ex.: registros fiscais). Aplicamos criptografia em trânsito, controle de acesso e
            monitoramento de incidentes.
          </p>
        </LegalSection>

        <LegalSection id="cookies" title="Cookies">
          <p>
            Utilizamos cookies e tecnologias similares conforme detalhado na{" "}
            <Link href="/cookies" className="text-cyan-400 hover:underline">
              Política de Cookies
            </Link>
            . Você pode gerenciar preferências no banner de consentimento.
          </p>
        </LegalSection>

        <LegalSection id="contato" title="Contato do DPO">
          <p>
            Encarregado de Proteção de Dados: privacidade@pix.tips — pix.tips Tecnologia Ltda.,
            Brasil.
          </p>
        </LegalSection>
      </article>
    </PublicPageLayout>
  );
}
