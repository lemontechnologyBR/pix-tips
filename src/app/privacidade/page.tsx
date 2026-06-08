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
    "Como a pix.tips coleta, usa e protege seus dados pessoais em conformidade com a LGPD (Lei 13.709/2018).",
};

const SECTIONS = [
  { id: "intro", label: "1. Introdução" },
  { id: "definicoes", label: "2. Definições" },
  { id: "dados", label: "3. Dados que coletamos" },
  { id: "finalidades", label: "4. Finalidades e bases legais" },
  { id: "compartilhamento", label: "5. Compartilhamento de dados" },
  { id: "transferencias", label: "6. Transferências internacionais" },
  { id: "sensiveis", label: "7. Dados pessoais sensíveis" },
  { id: "retencao", label: "8. Retenção de dados" },
  { id: "direitos", label: "9. Seus direitos (LGPD)" },
  { id: "dpo", label: "10. Encarregado de Dados (DPO)" },
  { id: "criancas", label: "11. Crianças e adolescentes" },
  { id: "seguranca", label: "12. Segurança" },
  { id: "incidentes", label: "13. Notificação de incidentes" },
  { id: "atualizacoes", label: "14. Atualizações desta política" },
  { id: "legislacao", label: "15. Legislação aplicável" },
];

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-700">
            {headers.map((h) => (
              <th
                key={h}
                className="py-2 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-zinc-800/60">
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-4 align-top text-zinc-400">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrivacidadePage() {
  return (
    <PublicPageLayout narrow>
      <PageHeader
        title="Política de Privacidade"
        description="Transparência sobre o tratamento de dados pessoais na pix.tips, em conformidade com a LGPD (Lei 13.709/2018)."
        updatedAt="Junho de 2026"
      />
      <LegalNav items={SECTIONS} />

      <article className="space-y-10">
        <LegalSection id="intro" title="1. Introdução">
          <p>
            A <strong className="text-zinc-300">pix.tips</strong> é uma plataforma de doações
            para criadores de conteúdo, operada por{" "}
            <strong className="text-zinc-300">pix.tips Tecnologia Ltda.</strong> (CNPJ pendente
            de registro), com sede no Brasil. Como controladora dos dados pessoais tratados nesta
            plataforma, nos comprometemos a proteger sua privacidade e a cumprir integralmente a
            Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018).
          </p>
          <p>
            Esta Política de Privacidade descreve quais dados coletamos, para que finalidades,
            com quem compartilhamos, por quanto tempo guardamos e como você pode exercer seus
            direitos. Ao usar a pix.tips, você confirma que leu e compreendeu este documento.
          </p>
          <p>
            Dúvidas? Entre em contato com nosso Encarregado de Dados pelo e-mail{" "}
            <a href="mailto:privacidade@pix.tips" className="text-cyan-400 hover:underline">
              privacidade@pix.tips
            </a>
            .
          </p>
        </LegalSection>

        <LegalSection id="definicoes" title="2. Definições">
          <p>
            Os termos abaixo têm o significado estabelecido no Art. 5º da LGPD e são utilizados
            ao longo desta política:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-zinc-300">Titular:</strong> pessoa natural a quem se
              referem os dados pessoais tratados — você, usuário da pix.tips.
            </li>
            <li>
              <strong className="text-zinc-300">Controlador:</strong> pessoa jurídica responsável
              pelas decisões referentes ao tratamento de dados pessoais — a pix.tips Tecnologia
              Ltda.
            </li>
            <li>
              <strong className="text-zinc-300">Operador:</strong> pessoa que realiza o
              tratamento em nome do controlador — como prestadores de serviços terceiros
              contratados pela pix.tips.
            </li>
            <li>
              <strong className="text-zinc-300">Dado pessoal:</strong> qualquer informação
              relacionada a pessoa natural identificada ou identificável.
            </li>
            <li>
              <strong className="text-zinc-300">Dado pessoal sensível:</strong> dado sobre origem
              racial ou étnica, convicção religiosa, opinião política, filiação sindical ou de
              organização de caráter religioso, filosófico ou político, dado referente à saúde ou
              à vida sexual, dado genético ou biométrico, quando vinculado a pessoa natural.
            </li>
            <li>
              <strong className="text-zinc-300">Tratamento:</strong> toda operação realizada com
              dados pessoais, como coleta, produção, recepção, classificação, utilização, acesso,
              reprodução, transmissão, distribuição, processamento, arquivamento, armazenamento,
              eliminação, avaliação ou controle da informação, modificação, comunicação,
              transferência, difusão ou extração.
            </li>
            <li>
              <strong className="text-zinc-300">Consentimento:</strong> manifestação livre,
              informada e inequívoca pela qual o titular concorda com o tratamento de seus dados
              pessoais para uma finalidade determinada.
            </li>
            <li>
              <strong className="text-zinc-300">ANPD:</strong> Autoridade Nacional de Proteção
              de Dados, órgão responsável por zelar pela proteção dos dados pessoais no Brasil.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="dados" title="3. Dados que coletamos">
          <p>
            Coletamos apenas os dados necessários para prestar o serviço e cumprir obrigações
            legais. A tabela abaixo detalha cada categoria:
          </p>
          <Table
            headers={["Categoria", "Dados", "Quando coletado"]}
            rows={[
              [
                <strong key="c1" className="text-zinc-300">Conta</strong>,
                "E-mail, nome/username, senha (armazenada como hash bcrypt), foto de perfil (opcional), data de criação",
                "No cadastro e nas atualizações de perfil",
              ],
              [
                <strong key="c2" className="text-zinc-300">Financeiros</strong>,
                "Chave Pix (tipo e valor), nome do titular da conta Pix, histórico de transações (valor, status, método), saldo disponível, histórico de saques",
                "Ao configurar recebimentos e ao processar doações",
              ],
              [
                <span key="c3" className="font-medium text-amber-400">KYC / Identidade (dados sensíveis)</span>,
                "CPF, data de nascimento, nome completo legal, imagem da frente e do verso do documento (RG ou CNH), selfie (dado biométrico), status de verificação, motivo de rejeição",
                "Ao solicitar verificação de identidade para habilitar saques",
              ],
              [
                <strong key="c4" className="text-zinc-300">OAuth</strong>,
                "Provedor de login (ex.: Twitch, Google), identificador externo do provedor — sem acesso à senha do provedor",
                "Ao conectar conta de rede social",
              ],
              [
                <strong key="c5" className="text-zinc-300">Segurança</strong>,
                "Segredo TOTP (2FA), códigos de recuperação (hashes bcrypt), tokens de redefinição de senha, tokens de verificação de e-mail, histórico de desafios de segurança",
                "Ao ativar autenticação em dois fatores e em operações sensíveis",
              ],
              [
                <strong key="c6" className="text-zinc-300">Comunicação</strong>,
                "E-mail para envio de notificações transacionais e suporte",
                "No cadastro e em solicitações de suporte",
              ],
              [
                <strong key="c7" className="text-zinc-300">Técnicos</strong>,
                "Endereço IP (temporário, utilizado para rate limiting e prevenção a abusos), logs de erros da aplicação",
                "Automaticamente durante o uso da plataforma",
              ],
              [
                <strong key="c8" className="text-zinc-300">Apoiadores (não cadastrados)</strong>,
                "Nome escolhido pelo apoiador (ou 'Anônimo'), mensagem da doação (até 300 caracteres), valor da doação, método de pagamento, data e hora",
                "Ao realizar uma doação na página do criador",
              ],
            ]}
          />
        </LegalSection>

        <LegalSection id="finalidades" title="4. Finalidades e bases legais">
          <p>
            Todo tratamento de dados na pix.tips possui uma finalidade legítima e uma base legal
            expressamente prevista na LGPD:
          </p>
          <Table
            headers={["Finalidade", "Base legal"]}
            rows={[
              [
                "Criar e manter a conta do usuário",
                "Execução de contrato — Art. 7º, V",
              ],
              [
                "Processar doações e pagamentos via Pix",
                "Execução de contrato — Art. 7º, V",
              ],
              [
                "Verificação de identidade KYC (prevenção a fraudes e cumprimento de normas PLD/CFT)",
                "Obrigação legal e regulatória — Art. 11, II, a",
              ],
              [
                "Tratamento de dados biométricos (selfie e imagens de documento com rosto)",
                "Obrigação legal — Art. 11, II, a",
              ],
              [
                "Envio de e-mails transacionais (confirmações, notificações de doação, segurança)",
                "Legítimo interesse — Art. 7º, IX",
              ],
              [
                "Envio de e-mails de marketing e novidades da plataforma",
                "Consentimento — Art. 7º, I",
              ],
              [
                "Segurança da conta, prevenção a abusos e rate limiting",
                "Legítimo interesse — Art. 7º, IX",
              ],
              [
                "Síntese de voz via ElevenLabs (alerta de doação em tempo real com TTS)",
                "Execução do serviço contratado — Art. 7º, V",
              ],
              [
                "Validação de CPF junto a fontes oficiais",
                "Obrigação legal — Art. 11, II, a",
              ],
              [
                "Melhoria contínua do serviço e análise de uso",
                "Legítimo interesse — Art. 7º, IX",
              ],
              [
                "Programa de afiliados (rastreamento de cliques e conversões)",
                "Execução de contrato — Art. 7º, V",
              ],
            ]}
          />
        </LegalSection>

        <LegalSection id="compartilhamento" title="5. Compartilhamento de dados">
          <p>
            Não vendemos dados pessoais. Compartilhamos apenas o estritamente necessário com
            operadores que prestam serviços essenciais à plataforma, todos sujeitos a obrigações
            contratuais de confidencialidade e segurança compatíveis com a LGPD:
          </p>
          <ul className="space-y-4">
            <li>
              <strong className="text-zinc-300">Processador de pagamentos Pix</strong>{" "}
              <span className="text-zinc-500 text-xs">(parceiro contratado pela pix.tips — Brasil)</span>{" "}
              — Processamento de pagamentos via Pix. Dados compartilhados: chave Pix, nome do
              titular, valor e identificadores de transação.
            </li>
            <li>
              <strong className="text-zinc-300">Didit</strong>{" "}
              <span className="text-zinc-500 text-xs">(verification.didit.me — internacional)</span>{" "}
              — Verificação de identidade KYC. Dados compartilhados: documentos de identidade
              (frente/verso), selfie, CPF, data de nascimento. Garantias: padrões internacionais
              de segurança da informação e cláusulas contratuais específicas para proteção de
              dados sensíveis.
            </li>
            <li>
              <strong className="text-zinc-300">ElevenLabs</strong>{" "}
              <span className="text-zinc-500 text-xs">(EUA — internacional)</span> — Síntese de
              voz para alertas de doação em tempo real. Dados compartilhados: texto da mensagem
              do apoiador (até 300 caracteres). Garantias: Data Processing Agreement (DPA) em
              vigor.
            </li>
            <li>
              <strong className="text-zinc-300">Provedores de consulta de CPF</strong>{" "}
              <span className="text-zinc-500 text-xs">(SERPRO / parceiros brasileiros)</span> —
              Validação de CPF. Dados compartilhados: CPF, nome completo, data de nascimento.
            </li>
            <li>
              <strong className="text-zinc-300">Cloudflare / Amazon S3 ou equivalente</strong>{" "}
              <span className="text-zinc-500 text-xs">(possivelmente exterior)</span> —
              Armazenamento de arquivos KYC (documentos e selfies) e mídias de alerta. Dados
              compartilhados: imagens de documentos, arquivos de mídia. Garantias: certificações
              SOC 2 Tipo II e ISO 27001.
            </li>
            <li>
              <strong className="text-zinc-300">Provedor de e-mail transacional</strong> —
              Envio de notificações e e-mails de segurança. Dados compartilhados: endereço de
              e-mail, nome do usuário.
            </li>
            <li>
              <strong className="text-zinc-300">Provedores OAuth</strong>{" "}
              <span className="text-zinc-500 text-xs">(Twitch, Google e outros)</span> —
              Autenticação social. Dados recebidos: identificador externo, e-mail e nome público
              fornecidos pelo provedor.
            </li>
            <li>
              <strong className="text-zinc-300">Autoridades públicas</strong> — Quando exigido
              por lei, ordem judicial ou requisição de autoridade competente.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="transferencias" title="6. Transferências internacionais de dados">
          <p>
            Alguns dos nossos operadores processam dados fora do Brasil, o que configura
            transferência internacional nos termos dos Arts. 33 a 36 da LGPD. Os casos
            identificados são:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-zinc-300">Didit</strong> (verificação KYC) — país de
              operação fora do Brasil. Garantias: cláusulas contratuais padrão e adoção de
              salvaguardas específicas para dados sensíveis.
            </li>
            <li>
              <strong className="text-zinc-300">ElevenLabs</strong> (síntese de voz) — operações
              nos EUA. Garantias: Data Processing Agreement com obrigações equivalentes às da
              LGPD, incluindo limitação de finalidade e segurança.
            </li>
            <li>
              <strong className="text-zinc-300">Armazenamento em nuvem</strong> — servidores
              podem estar localizados fora do Brasil. Garantias: certificações internacionais de
              segurança (SOC 2, ISO 27001) e cláusulas contratuais adequadas.
            </li>
          </ul>
          <p>
            Caso você tenha dúvidas sobre as garantias adotadas em transferências específicas,
            entre em contato com nosso DPO pelo e-mail{" "}
            <a href="mailto:privacidade@pix.tips" className="text-cyan-400 hover:underline">
              privacidade@pix.tips
            </a>
            .
          </p>
        </LegalSection>

        <LegalSection id="sensiveis" title="7. Dados pessoais sensíveis">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="font-medium text-amber-400">
              Atenção: esta seção descreve o tratamento de dados pessoais sensíveis conforme o
              Art. 11 da LGPD.
            </p>
          </div>
          <p>
            Para habilitar a função de saque, exigimos a verificação de identidade (KYC). Nesse
            processo, coletamos:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-zinc-300">Dado biométrico:</strong> selfie (fotografia do
              rosto) utilizada para comparação com o documento de identidade;
            </li>
            <li>
              <strong className="text-zinc-300">Imagens de documento:</strong> frente e verso de
              RG ou CNH, que contêm a fotografia do titular.
            </li>
          </ul>
          <p>
            <strong className="text-zinc-300">Base legal:</strong> obrigação legal e regulatória
            (Art. 11, II, a da LGPD) — prevenção à lavagem de dinheiro (PLD/CFT) e cumprimento
            de normas do Banco Central do Brasil.
          </p>
          <p>
            <strong className="text-zinc-300">Medidas de proteção adicionais:</strong>
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Acesso restrito a sistemas e pessoal estritamente necessários;</li>
            <li>Armazenamento em ambiente isolado com criptografia em repouso;</li>
            <li>
              Documentos KYC são excluídos em até 30 dias após aprovação ou rejeição da
              verificação, salvo prazo legal maior;
            </li>
            <li>
              O processamento biométrico é realizado pela Didit, operador especializado, sob
              contrato com obrigações específicas de segurança e confidencialidade.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="retencao" title="8. Por quanto tempo guardamos seus dados">
          <p>
            Guardamos dados pelo tempo necessário às finalidades descritas e ao cumprimento de
            obrigações legais. Abaixo os prazos aplicáveis:
          </p>
          <Table
            headers={["Categoria de dados", "Prazo de retenção"]}
            rows={[
              [
                "Dados da conta (e-mail, perfil, configurações)",
                "Enquanto a conta estiver ativa",
              ],
              [
                "Dados de transações financeiras",
                "5 anos após a transação (obrigação fiscal — Receita Federal / Código Tributário Nacional)",
              ],
              [
                "Documentos KYC e imagens biométricas",
                "Excluídos em até 30 dias após aprovação ou rejeição; excluídos imediatamente ao encerrar a conta, salvo prazo legal maior",
              ],
              [
                "Logs técnicos e registros de acesso",
                "Até 6 meses",
              ],
              [
                "Tokens de redefinição de senha e verificação de e-mail",
                "Até o uso ou expiração (geralmente 24 horas)",
              ],
              [
                "Dados de apoiadores (transações)",
                "5 anos (obrigação fiscal), associados ao criador",
              ],
              [
                "Cookies e identificadores de sessão",
                "Conforme a Política de Cookies — gerenciável pelo usuário",
              ],
            ]}
          />
          <p>
            Após o encerramento dos prazos, os dados são excluídos ou anonimizados de forma
            irreversível.
          </p>
        </LegalSection>

        <LegalSection id="direitos" title="9. Seus direitos (Art. 18 da LGPD)">
          <p>
            A LGPD garante a você os seguintes direitos em relação aos seus dados pessoais:
          </p>
          <ul className="space-y-4">
            <li>
              <strong className="text-zinc-300">1. Confirmação e acesso</strong> — Saber se
              tratamos seus dados e acessar uma cópia deles.{" "}
              <span className="text-zinc-500">Como exercer: Painel → Configurações.</span>
            </li>
            <li>
              <strong className="text-zinc-300">2. Correção</strong> — Solicitar a atualização
              de dados incompletos, inexatos ou desatualizados.{" "}
              <span className="text-zinc-500">Como exercer: Painel → Configurações.</span>
            </li>
            <li>
              <strong className="text-zinc-300">3. Anonimização, bloqueio ou eliminação</strong>{" "}
              — Solicitar a eliminação de dados desnecessários ou tratados em desconformidade
              com a LGPD.{" "}
              <span className="text-zinc-500">
                Como exercer: Painel → Configurações → Excluir conta; ou e-mail ao DPO.
              </span>
            </li>
            <li>
              <strong className="text-zinc-300">4. Portabilidade</strong> — Receber seus dados
              em formato estruturado e interoperável.{" "}
              <span className="text-zinc-500">
                Como exercer: Painel → Configurações → Exportar meus dados.
              </span>
            </li>
            <li>
              <strong className="text-zinc-300">5. Informação sobre compartilhamento</strong> —
              Saber com quais entidades públicas e privadas compartilhamos seus dados.{" "}
              <span className="text-zinc-500">Como exercer: veja a Seção 5 desta política.</span>
            </li>
            <li>
              <strong className="text-zinc-300">6. Revogação do consentimento</strong> — Retirar
              o consentimento para tratamentos baseados nessa base legal (ex.: e-mails de
              marketing), a qualquer momento, sem prejuízo da licitude dos tratamentos anteriores.{" "}
              <span className="text-zinc-500">
                Como exercer: Painel → Configurações; para cookies: gerenciar no banner de
                consentimento.
              </span>
            </li>
            <li>
              <strong className="text-zinc-300">7. Oposição</strong> — Opor-se a tratamentos
              realizados com base em legítimo interesse, quando houver motivo legítimo.{" "}
              <span className="text-zinc-500">
                Como exercer: e-mail ao DPO (privacidade@pix.tips).
              </span>
            </li>
            <li>
              <strong className="text-zinc-300">
                8. Revisão de decisões automatizadas
              </strong>{" "}
              — Solicitar revisão humana de decisões tomadas exclusivamente com base em
              tratamento automatizado, como o resultado da verificação KYC (aprovação/rejeição).{" "}
              <span className="text-zinc-500">
                Como exercer: e-mail ao DPO (privacidade@pix.tips), informando o número do
                pedido de verificação.
              </span>
            </li>
          </ul>
          <p>
            Para exercer qualquer direito ou obter mais informações, envie sua solicitação para{" "}
            <a href="mailto:privacidade@pix.tips" className="text-cyan-400 hover:underline">
              privacidade@pix.tips
            </a>
            . Responderemos em até 15 dias úteis. Você também pode peticionar à ANPD (
            <a
              href="https://www.gov.br/anpd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              gov.br/anpd
            </a>
            ).
          </p>
        </LegalSection>

        <LegalSection id="dpo" title="10. Encarregado de Dados (DPO)">
          <p>
            Nomeamos um Encarregado de Proteção de Dados (Data Protection Officer — DPO) nos
            termos do Art. 41 da LGPD, responsável por atuar como canal de comunicação entre a
            pix.tips, os titulares e a ANPD.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-zinc-300">Empresa:</strong> pix.tips Tecnologia Ltda.
            </li>
            <li>
              <strong className="text-zinc-300">E-mail do DPO:</strong>{" "}
              <a href="mailto:privacidade@pix.tips" className="text-cyan-400 hover:underline">
                privacidade@pix.tips
              </a>
            </li>
            <li>
              <strong className="text-zinc-300">Prazo de resposta:</strong> até 15 dias úteis a
              partir do recebimento da solicitação.
            </li>
          </ul>
          <p>
            Ao entrar em contato, informe seu nome completo, o e-mail associado à sua conta e
            uma descrição clara da sua solicitação para agilizar o atendimento.
          </p>
        </LegalSection>

        <LegalSection id="criancas" title="11. Crianças e adolescentes">
          <p>
            A pix.tips é um serviço financeiro destinado exclusivamente a pessoas com{" "}
            <strong className="text-zinc-300">18 anos ou mais</strong>. Não coletamos
            intencionalmente dados pessoais de crianças (menores de 12 anos) ou adolescentes
            (entre 12 e 17 anos), em conformidade com o Art. 14 da LGPD.
          </p>
          <p>
            Caso identifiquemos que dados de um menor foram coletados sem o consentimento
            adequado, procederemos com a exclusão imediata. Se você tiver conhecimento de que um
            menor está utilizando nossa plataforma, entre em contato com nosso DPO.
          </p>
        </LegalSection>

        <LegalSection id="seguranca" title="12. Segurança da informação">
          <p>
            Adotamos medidas técnicas e administrativas proporcionais ao risco, conforme
            exigido pelo Art. 46 da LGPD, incluindo:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-zinc-300">Criptografia de senhas:</strong> todas as senhas
              são armazenadas exclusivamente como hashes bcrypt — nunca em texto simples;
            </li>
            <li>
              <strong className="text-zinc-300">Comunicação segura:</strong> tráfego protegido
              por HTTPS/TLS em todas as conexões;
            </li>
            <li>
              <strong className="text-zinc-300">Autenticação em dois fatores (2FA):</strong>{" "}
              disponível via TOTP para todos os usuários;
            </li>
            <li>
              <strong className="text-zinc-300">Controle de acesso:</strong> dados KYC e
              biométricos acessíveis apenas por sistemas e pessoas com necessidade legítima;
            </li>
            <li>
              <strong className="text-zinc-300">Rate limiting:</strong> proteção contra
              tentativas de acesso indevido e abuso automatizado;
            </li>
            <li>
              <strong className="text-zinc-300">Monitoramento:</strong> logs de erros e
              atividades suspeitas monitorados continuamente;
            </li>
            <li>
              <strong className="text-zinc-300">Sessões seguras:</strong> tokens de sessão com
              expiração e revogação automática em caso de inatividade ou logout.
            </li>
          </ul>
          <p>
            Apesar de todas as medidas adotadas, nenhum sistema é absolutamente seguro. Em caso
            de incidente, atuaremos conforme descrito na seção a seguir.
          </p>
        </LegalSection>

        <LegalSection id="incidentes" title="13. Notificação de incidentes de segurança">
          <p>
            Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos
            titulares, cumpriremos as obrigações previstas no Art. 48 da LGPD:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Notificaremos a <strong className="text-zinc-300">ANPD</strong> dentro do prazo
              legal estabelecido;
            </li>
            <li>
              Comunicaremos os <strong className="text-zinc-300">titulares afetados</strong>{" "}
              com informações sobre a natureza dos dados envolvidos, os riscos decorrentes e as
              medidas adotadas;
            </li>
            <li>
              A comunicação ocorrerá preferencialmente por e-mail, no endereço cadastrado na
              conta do titular.
            </li>
          </ul>
        </LegalSection>

        <LegalSection id="atualizacoes" title="14. Atualizações desta política">
          <p>
            Esta política pode ser atualizada periodicamente para refletir mudanças no serviço,
            na legislação ou nas práticas de privacidade. A{" "}
            <strong className="text-zinc-300">data de vigência</strong> desta versão é{" "}
            <strong className="text-zinc-300">junho de 2026</strong>.
          </p>
          <p>Quando houver alterações relevantes:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Atualizaremos a data de vigência no topo desta página;
            </li>
            <li>
              Para mudanças significativas que afetem os direitos dos titulares, enviaremos
              notificação por e-mail com antecedência mínima de 15 dias antes da nova versão
              entrar em vigor;
            </li>
            <li>
              O uso continuado da plataforma após a data de vigência da nova versão implica
              ciência e concordância com as alterações.
            </li>
          </ul>
          <p>
            Recomendamos revisar esta política periodicamente. Versões anteriores podem ser
            solicitadas ao DPO.
          </p>
        </LegalSection>

        <LegalSection id="legislacao" title="15. Legislação aplicável e foro">
          <p>
            Esta Política de Privacidade é regida pela{" "}
            <strong className="text-zinc-300">
              Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018)
            </strong>{" "}
            e demais normas aplicáveis do ordenamento jurídico brasileiro.
          </p>
          <p>
            Quaisquer disputas relacionadas a esta política serão submetidas à jurisdição dos
            tribunais brasileiros competentes, ficando eleito o foro da comarca de{" "}
            <strong className="text-zinc-300">São Paulo/SP</strong>, com renúncia a qualquer
            outro, por mais privilegiado que seja.
          </p>
          <p>
            Para questões relacionadas ao tratamento de dados pessoais, você pode também
            acionar a <strong className="text-zinc-300">Autoridade Nacional de Proteção de Dados (ANPD)</strong>{" "}
            em{" "}
            <a
              href="https://www.gov.br/anpd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              gov.br/anpd
            </a>
            .
          </p>
        </LegalSection>

        <div className="border-t border-zinc-800 pt-6 text-center">
          <p className="text-xs text-zinc-600">
            Esta política está em vigor desde junho de 2026 · pix.tips Tecnologia Ltda. ·{" "}
            <a href="mailto:privacidade@pix.tips" className="text-cyan-400 hover:underline">
              privacidade@pix.tips
            </a>
          </p>
          <p className="mt-2 text-xs text-zinc-600">
            Consulte também:{" "}
            <Link href="/termos" className="text-cyan-400 hover:underline">
              Termos de Uso
            </Link>{" "}
            ·{" "}
            <Link href="/cookies" className="text-cyan-400 hover:underline">
              Política de Cookies
            </Link>
          </p>
        </div>
      </article>
    </PublicPageLayout>
  );
}
