import {
  LegalNav,
  LegalSection,
  PageHeader,
  PublicPageLayout,
} from "@/components/public/PublicPageLayout";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Termos de serviço da pix.tips: uso da plataforma, doações, responsabilidades e conformidade com a LGPD.",
};

const SECTIONS = [
  { id: "aceitacao", label: "1. Aceitação dos termos" },
  { id: "servico", label: "2. Descrição do serviço" },
  { id: "conta", label: "3. Conta e elegibilidade" },
  { id: "pagamentos", label: "4. Pagamentos e taxas" },
  { id: "conteudo", label: "5. Conteúdo do usuário" },
  { id: "lgpd", label: "6. Proteção de dados (LGPD)" },
  { id: "responsabilidade", label: "7. Limitação de responsabilidade" },
  { id: "alteracoes", label: "8. Alterações e contato" },
];

export default function TermosPage() {
  return (
    <PublicPageLayout narrow>
      <PageHeader
        title="Termos de Uso"
        description="Leia atentamente as condições que regem o uso da plataforma pix.tips."
        updatedAt="28 de maio de 2026"
      />
      <LegalNav items={SECTIONS} />

      <article className="space-y-10">
        <LegalSection id="aceitacao" title="1. Aceitação dos termos">
          <p>
            Ao acessar ou utilizar a pix.tips (&quot;Plataforma&quot;), você concorda com estes
            Termos de Uso e com a nossa{" "}
            <Link href="/privacidade" className="text-cyan-400 hover:underline">
              Política de Privacidade
            </Link>
            . Se não concordar, não utilize os serviços.
          </p>
          <p>
            Estes termos constituem contrato entre você (&quot;Usuário&quot; ou
            &quot;Criador&quot;) e a pix.tips Tecnologia Ltda. (&quot;pix.tips&quot;,
            &quot;nós&quot;).
          </p>
        </LegalSection>

        <LegalSection id="servico" title="2. Descrição do serviço">
          <p>
            A pix.tips oferece ferramentas para recebimento de doações e gorjetas de apoiadores,
            página pública personalizável, processamento de pagamentos (incluindo Pix) e alertas
            em tempo real para transmissões ao vivo.
          </p>
          <p>
            Funcionalidades podem variar conforme o plano contratado. Recursos em beta podem ser
            alterados ou descontinuados sem aviso prévio prolongado.
          </p>
        </LegalSection>

        <LegalSection id="conta" title="3. Conta e elegibilidade">
          <p>
            Você deve ter capacidade civil e fornecer informações verdadeiras no cadastro. É
            proibido criar contas para terceiros sem autorização ou usar a Plataforma para
            atividades ilegais, lavagem de dinheiro, fraude ou conteúdo que viole direitos de
            terceiros.
          </p>
          <p>
            Você é responsável por manter a confidencialidade das credenciais de acesso e por
            todas as atividades realizadas em sua conta.
          </p>
        </LegalSection>

        <LegalSection id="pagamentos" title="4. Pagamentos e taxas">
          <p>
            Valores recebidos de apoiadores podem estar sujeitos a taxas de processamento e de
            plataforma, divulgadas no momento da transação ou no painel de cobrança. Saques
            seguem prazos e requisitos de verificação de identidade quando exigidos por lei ou
            parceiros financeiros.
          </p>
          <p>
            Disputas entre Criador e apoiador devem ser tratadas de boa-fé; a pix.tips pode
            mediar conforme políticas internas, sem obrigação de reembolso automático.
          </p>
        </LegalSection>

        <LegalSection id="conteudo" title="5. Conteúdo do usuário">
          <p>
            Você mantém os direitos sobre o conteúdo que publicar (textos, imagens, áudios nos
            alertas). Concede à pix.tips licença limitada para hospedar, exibir e processar esse
            conteúdo apenas para operar o serviço.
          </p>
          <p>
            Reservamo-nos o direito de remover conteúdo ou suspender contas que violem estes
            termos ou a legislação aplicável.
          </p>
        </LegalSection>

        <LegalSection id="lgpd" title="6. Proteção de dados (LGPD)">
          <p>
            O tratamento de dados pessoais segue a Lei nº 13.709/2018 (LGPD). Atuamos como
            controlador ou operador conforme o fluxo: dados de cadastro do Criador são tratados
            para execução do contrato; dados de apoiadores podem ser compartilhados com o Criador
            na medida necessária à doação.
          </p>
          <p>
            Titulares podem exercer direitos de acesso, correção, exclusão e portabilidade
            conforme descrito na{" "}
            <Link href="/privacidade" className="text-cyan-400 hover:underline">
              Política de Privacidade
            </Link>
            . O Encarregado de dados (DPO) pode ser contatado em privacidade@pix.tips.
          </p>
        </LegalSection>

        <LegalSection id="responsabilidade" title="7. Limitação de responsabilidade">
          <p>
            A Plataforma é fornecida &quot;como está&quot;, dentro dos limites da lei. Não nos
            responsabilizamos por lucros cessantes, indisponibilidade de terceiros (bancos,
            provedores de live) ou uso indevido da conta pelo Usuário.
          </p>
          <p>
            Em qualquer hipótese, a responsabilidade agregada da pix.tips limita-se ao valor das
            taxas pagas pelo Usuário nos últimos 12 meses, salvo dolo ou culpa grave.
          </p>
        </LegalSection>

        <LegalSection id="alteracoes" title="8. Alterações e contato">
          <p>
            Podemos atualizar estes termos publicando a nova versão nesta página. O uso continuado
            após a publicação constitui aceitação. Para questões jurídicas: legal@pix.tips.
          </p>
          <p>Foro: comarca de São Paulo/SP, Brasil, salvo disposição legal imperativa em contrário.</p>
        </LegalSection>
      </article>
    </PublicPageLayout>
  );
}
