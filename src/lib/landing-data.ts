export const NAV_LINKS = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#recursos", label: "Recursos" },
  { href: "#precos", label: "Preços" },
  { href: "#exemplos", label: "Exemplos" },
] as const;

export const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Crie sua página",
    description:
      "Cadastre-se, escolha seu nome de perfil e personalize com foto, meta e cores em menos de 2 minutos.",
    icon: "link",
  },
  {
    step: "2",
    title: "Divulgue seu link",
    description:
      "Coloque o link na bio das redes sociais, no painel da Twitch, no YouTube. Seus fãs doam via Pix em segundos, sem cadastro.",
    icon: "share",
  },
  {
    step: "3",
    title: "Veja na live",
    description:
      "Cada doação dispara um alerta personalizado na sua transmissão ao vivo. Seu fã é reconhecido na hora.",
    icon: "star",
  },
] as const;

export const FEATURES = [
  {
    title: "Pagamento instantâneo via Pix",
    description:
      "Seus fãs pagam com Pix e o valor cai no seu saldo na hora — sem espera, sem intermediário.",
    icon: "qr",
  },
  {
    title: "Widget OBS/Streamlabs",
    description:
      "Alerta animado com nome, valor e mensagem aparece na tela durante a transmissão.",
    icon: "monitor",
  },
  {
    title: "Barra de progresso",
    description:
      "Defina uma meta financeira e motive seus fãs com progresso em tempo real.",
    icon: "chart",
  },
  {
    title: "Reconhecimento público",
    description:
      "Exiba as doações recentes na sua página com nome e mensagem (ou anônimo).",
    icon: "heart",
  },
  {
    title: "Relatórios detalhados",
    description: "Acompanhe recebimentos, filtre por período, exporte CSV.",
    icon: "list",
  },
  {
    title: "Sua identidade visual",
    description:
      "Customize cores, fontes, foto, mensagem de agradecimento e sons de alerta.",
    icon: "palette",
  },
  {
    title: "Agradecimento automático",
    description:
      'O bot posta no chat da live: "Fulano doou R$10! Obrigado!".',
    icon: "bot",
  },
  {
    title: "Link personalizado",
    description:
      "Seu link próprio no formato pix.tips/seuusuario, pronto para compartilhar em qualquer rede.",
    icon: "domain",
  },
  {
    title: "Grátis para começar",
    description:
      "Você só paga uma pequena comissão sobre o que receber.",
    icon: "check",
  },
] as const;

export const TESTIMONIALS = [
  {
    name: "Ana Streamer",
    handle: "@anastreamer",
    platform: "Twitch",
    quote:
      "Aumentei minhas doações em 30% depois que coloquei o Pix. Os alertas são lindos!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana",
    rating: 5,
  },
  {
    name: "Pedro Games",
    handle: "@pedrogames",
    platform: "YouTube",
    quote:
      "Configurei em 5 minutos. Meus fãs adoram ver o nome deles na live na hora.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pedro",
    rating: 5,
  },
  {
    name: "Lua Art",
    handle: "@luaart",
    platform: "Twitch",
    quote:
      "Finalmente uma plataforma 100% em português com Pix integrado. Recomendo demais!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lua",
    rating: 5,
  },
  {
    name: "DJ Marcos",
    handle: "@djmarcos",
    platform: "Kick",
    quote: "O mural de apoiadores virou prova social na minha página. Funciona muito bem.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcos",
    rating: 5,
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "Quanto custa usar a plataforma?",
    answer:
      "Criar sua página é 100% grátis, sem mensalidade nem plano pago. Cobramos 2,5% + R$ 0,50 por doação recebida. Nada mais.",
  },
  {
    question: "Como funciona a taxa de 2,5% + R$ 0,50?",
    answer:
      "A taxa é descontada automaticamente de cada doação no momento em que ela é confirmada: 2,5% do valor + R$ 0,50 fixos. Se um fã enviar R$ 10,00, você recebe R$ 9,25 no seu saldo (R$ 0,25 + R$ 0,50 = R$ 0,75 de taxa). Não há mensalidade ou taxa de adesão.",
  },
  {
    question: "Quanto tempo leva para receber o Pix?",
    answer:
      "O Pix é instantâneo. Assim que seu fã confirma o pagamento, o valor já aparece no seu saldo dentro do painel. Em geral leva menos de 10 segundos para ser processado.",
  },
  {
    question: "Como funciona o saque?",
    answer:
      'No painel, clique em "Sacar", informe a chave Pix de destino e o valor. O dinheiro cai na sua conta em minutos via Pix Out. Há uma taxa fixa de R$ 2,50 por saque para cobrir os custos de transferência e ajudar a manter a plataforma gratuita para todos.',
  },
  {
    question: "Preciso ter conta bancária específica?",
    answer:
      "Não. Qualquer conta que tenha uma chave Pix ativa funciona — banco tradicional, banco digital, conta de pessoa física ou MEI. Basta cadastrar sua chave Pix no painel.",
  },
  {
    question: "Funciona em qualquer plataforma de streaming?",
    answer:
      "Sim! A pix.tips funciona com Twitch, YouTube, Kick, TikTok Live, Instagram Live e qualquer outra plataforma. Você compartilha o link da sua página de doações onde quiser — não há integração exclusiva com nenhuma plataforma específica.",
  },
  {
    question: "Como integrar com o OBS?",
    answer:
      'No painel, vá em "Widgets" e copie o link do seu alerta. No OBS ou Streamlabs, adicione uma "Fonte de Navegador" (Browser Source), cole o link e salve. Pronto — toda doação vai aparecer automaticamente na sua transmissão sem precisar reiniciar o OBS.',
  },
  {
    question: "O que são os alertas em tempo real?",
    answer:
      "São notificações animadas que aparecem na sua tela de transmissão a cada doação recebida, exibindo o nome do doador, o valor e a mensagem. Você pode personalizar o visual, o som e até a voz que lê a mensagem em voz alta.",
  },
  {
    question: "Posso usar vozes de IA nos alertas?",
    answer:
      "Sim! A pix.tips oferece text-to-speech com vozes de IA para ler as mensagens das doações em voz alta durante a live. Seus fãs adoram ouvir o nome deles ser chamado na transmissão.",
  },
  {
    question: "Posso personalizar minha página de doações?",
    answer:
      "Com certeza. Você pode definir foto de perfil, cores, mensagem de boas-vindas, meta de arrecadação e mensagem de agradecimento. Os alertas também são totalmente customizáveis: animação, som, fonte e cor.",
  },
  {
    question: "Existe limite mínimo ou máximo de doação?",
    answer:
      "O valor mínimo de doação é R$ 1,00. Não há limite máximo — seu fã pode enviar o quanto quiser. Você pode definir um valor mínimo maior na sua página se preferir.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Sim. Os pagamentos são processados via Pix pelo sistema do Banco Central do Brasil, com criptografia de ponta a ponta. Não armazenamos dados bancários dos doadores. A plataforma utiliza infraestrutura segura e comunicação criptografada em todas as etapas.",
  },
  {
    question: "Como funciona a verificação de identidade (KYC)?",
    answer:
      "Para realizar saques, pedimos uma verificação de identidade simples (KYC) conforme exigência regulatória. Basta enviar um documento com foto (RG ou CNH) e uma selfie. O processo é rápido e feito diretamente no painel, sem burocracia.",
  },
  {
    question: "Posso usar em mobile?",
    answer:
      "Sim. O painel da pix.tips é responsivo e funciona bem no celular. Você pode acompanhar suas doações, verificar o saldo e gerenciar sua conta pelo smartphone. A página de doações dos seus fãs também é totalmente otimizada para mobile.",
  },
  {
    question: "Existe suporte disponível?",
    answer:
      "Sim! Temos uma central de ajuda com artigos e tutoriais passo a passo. Se precisar de atendimento direto, pode entrar em contato via chat ou e-mail. Nossa equipe responde em português e está aqui para ajudar você a configurar tudo.",
  },
  {
    question: "Existe algum plano pago ou assinatura?",
    answer:
      "Não. A pix.tips não tem plano Pro, assinatura mensal nem cobrança recorrente. Todas as funcionalidades estão disponíveis gratuitamente para todos os criadores.",
  },
] as const;

export const PLATFORM_FEATURES = [
  "2,5% + R$ 0,50 por doação recebida (sem mensalidade)",
  "Saques imediatos via Pix Out com taxa fixa de R$ 2,50",
  "30+ templates de alerta + sons exclusivos",
  "Widgets OBS completos (alerta, meta, QR, leaderboard, stats, viewers)",
  "50 uploads de mídia de alerta (até 20 MB)",
  "20 sons personalizados (até 2 MB)",
  "ChatBot para Twitch",
  "Exportação CSV do extrato",
  "API key para integrações",
  "Suporte via central de ajuda",
] as const;

