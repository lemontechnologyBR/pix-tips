export type HelpSection = {
  id: string;
  title: string;
  faqs: { question: string; answer: string }[];
};

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: "primeiros-passos",
    title: "Primeiros passos",
    faqs: [
      {
        question: "Como criar minha conta na pix.tips?",
        answer:
          "Acesse o painel em /dashboard, clique em Criar conta e preencha e-mail, nome de usuário e senha. Em seguida, complete o perfil da sua página.",
      },
      {
        question: "Preciso de CNPJ para receber doações?",
        answer:
          "Não. Pessoas físicas podem receber via Pix vinculado à conta verificada. Para volumes altos, recomendamos consultar um contador sobre MEI ou PJ.",
      },
      {
        question: "Quanto tempo leva para ativar minha página?",
        answer:
          "A página pública fica disponível assim que você salvar as configurações iniciais. Para o primeiro saque, é necessário concluir a verificação de identidade (KYC), que leva até 2 dias úteis.",
      },
      {
        question: "O que é a verificação KYC?",
        answer:
          "KYC (Know Your Customer) confirma sua identidade com CPF, data de nascimento e fotos do documento. É obrigatória para saques e exigida por regulamentação de pagamentos no Brasil.",
      },
    ],
  },
  {
    id: "tip-page",
    title: "Minha página",
    faqs: [
      {
        question: "Como personalizo minha página de doações?",
        answer:
          "No painel, vá em Minha página para editar foto, cores, mensagem de boas-vindas, valores sugeridos e meta de arrecadação.",
      },
      {
        question: "Qual é o link da minha página?",
        answer:
          "Seu link público é pix.tips/seu-usuario (substitua pelo seu username). Você pode copiá-lo no painel e colar na bio das redes.",
      },
      {
        question: "Posso usar domínio próprio?",
        answer:
          "Domínios personalizados estão no roadmap dos planos Pro. Por enquanto, use o link padrão da plataforma.",
      },
    ],
  },
  {
    id: "alertas",
    title: "Alertas",
    faqs: [
      {
        question: "Como adiciono o widget no OBS?",
        answer:
          "Copie a URL do widget em Widgets → Alertas no painel. No OBS, adicione uma fonte Navegador (Browser Source) com essa URL e dimensões recomendadas de 800×600.",
      },
      {
        question: "Os alertas funcionam sem OBS?",
        answer:
          "Sim. Você pode abrir a URL do widget em uma segunda tela ou no navegador durante a live. O OBS é recomendado para overlay transparente.",
      },
      {
        question: "Posso usar sons e GIFs personalizados?",
        answer:
          "Sim, nos planos que incluem biblioteca de mídia. Faça upload de áudio ou imagem nas configurações de alertas, respeitando os limites de tamanho.",
      },
    ],
  },
  {
    id: "pagamentos",
    title: "Pagamentos",
    faqs: [
      {
        question: "Quais métodos de pagamento são aceitos?",
        answer:
          "Pix é o método principal no Brasil. Cartão de crédito pode estar disponível conforme seu plano e região. Consulte o painel de cobrança para detalhes.",
      },
      {
        question: "Quando o valor cai na minha conta?",
        answer:
          "Doações via Pix são creditadas após confirmação do pagamento, geralmente em segundos. Saques para sua conta bancária seguem o cronograma do painel Financeiro.",
      },
      {
        question: "Existe taxa por transação?",
        answer:
          "Sim. A taxa varia conforme o plano (gratuito, Criador ou Pro). Veja a seção Preços na landing ou em Planos no painel para percentuais atualizados.",
      },
    ],
  },
  {
    id: "planos",
    title: "Planos",
    faqs: [
      {
        question: "Posso começar de graça?",
        answer:
          "Sim. O plano gratuito inclui página de doações, Pix e alertas básicos, com limite de transações mensais conforme descrito na landing.",
      },
      {
        question: "Como faço upgrade ou downgrade?",
        answer:
          "Em Dashboard → Cobrança, escolha o plano desejado. Upgrades são imediatos; downgrades vigoram no próximo ciclo de faturamento.",
      },
      {
        question: "Há contrato de fidelidade?",
        answer:
          "Não. Você pode cancelar a assinatura a qualquer momento; o acesso Pro permanece até o fim do período já pago.",
      },
    ],
  },
  {
    id: "solucao-problemas",
    title: "Solução de problemas",
    faqs: [
      {
        question: "O alerta não aparece na live",
        answer:
          "Verifique se o widget está carregado no OBS, se a URL está correta e se o navegador da fonte não está em cache. Teste com o botão Simular doação no painel.",
      },
      {
        question: "Uma doação não foi confirmada",
        answer:
          "Peça ao apoiador o comprovante Pix. Confira em Transações se o status está pendente. Se persistir, abra um ticket com data, valor e ID da transação.",
      },
      {
        question: "Não consigo entrar no painel",
        answer:
          "Use recuperação de senha no login. Limpe cookies do site ou tente outro navegador. Confira o status em /status se houver instabilidade.",
      },
    ],
  },
];
