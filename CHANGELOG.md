# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto segue [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.1.0] — 2026-06-08

### LGPD e privacidade
- Política de privacidade reescrita (Arts. 5, 7, 9, 11, 15, 18)
- Banner de cookies granular (aceitar/rejeitar/gerenciar + revogação)
- Consentimento obrigatório para dados sensíveis no fluxo KYC
- Aviso de privacidade no formulário de doação
- Endpoint `GET /api/user/export` para portabilidade de dados (Art. 18)
- Exclusão de conta apaga arquivos KYC, avatar, mídia e sons no storage

### Segurança
- Confirmação atômica de pagamentos (corrige race condition / double-spend)
- Bloqueio de conta suspensa em todas as requisições autenticadas
- OAuth: removido auto-link por e-mail (previne takeover de conta)
- API key mascarada no GET; exibida integralmente só na criação/rotação
- Token de verificação de e-mail armazenado como SHA-256
- Validação de magic bytes em uploads KYC, alert-media e tip-page-background
- Rate limit em polling de status, TOTP enable e check-username
- Seed demo bloqueado em produção; role `user` e senha aleatória
- HSTS adicionado; CSP `unsafe-eval` apenas em dev; CORS localhost só em dev

### Produção
- Migration Prisma inicial (`prisma/migrations/0001_init`)
- Prisma singleton corrigido para produção
- Handlers globais `uncaughtException` / `unhandledRejection` no servidor
- `RESEND_API_KEY` obrigatória no boot em produção
- Billing Pro bloqueado em modo mock sem Woovi configurado
- `.env.production.example` alinhado aos nomes reais das variáveis
- Docker Compose integrado ao Traefik (SSL via proxy existente)
- `robots.ts`, `sitemap.ts` e `opengraph-image.tsx` para SEO
- Simulador de taxa na landing corrigido (2% em vez de 5%)

---

## [1.0.0] — 2026-06-03

### Lançamento inicial

#### Plataforma
- Tip page pública personalizável com 10+ layouts (Default, Glass, Neon, Minimal, Retro, Split, VIP, Aurora, Card, Variant, Banner)
- Formulário de doação via Pix com QR Code em tempo real
- Alertas OBS em tempo real via Socket.IO
- Página de agradecimento personalizada

#### Dashboard
- Overview com métricas, gráfico de recebimentos e doações recentes
- Editor de tip page (aparência, layout, doações, TTS)
- Widgets OBS: Alerta, Meta, QR Code, Leaderboard, Stats, Ticker, Supporters, Viewers
- Gerenciamento financeiro: saldo, saques via Pix Out, histórico de transações
- Configurações: perfil, segurança (2FA/TOTP), integrações, ChatBot Twitch

#### Pagamentos
- Integração Woovi para recebimento Pix
- Taxa de 2% sobre doações recebidas
- Saque mínimo de R$ 20,00 com taxa fixa de R$ 2,50
- Valor mínimo de doação: R$ 10,00

#### Voz IA
- Integração ElevenLabs com 9 vozes (Helena, Rafael, Aurora, Bruno, Nina, Theo, River, Alice, Eric)
- Fallback automático para voz do navegador se API não configurada

#### Segurança
- Autenticação JWT com sessões seguras
- 2FA/TOTP com backup codes
- Rate limiting em todas as rotas sensíveis
- Verificação HMAC em webhooks Woovi e Didit
- KYC via Didit para saques
- Tokens de reset de senha hasheados (SHA-256)

#### Infraestrutura
- Next.js 16 + Socket.IO em servidor customizado
- Suporte a SQLite (dev) e PostgreSQL (prod)
- Docker-ready com Dockerfile multi-stage e docker-compose
- Headers de segurança HTTP (CSP, X-Frame-Options, etc.)

---

## Como versionar

```
MAJOR.MINOR.PATCH

MAJOR — mudanças incompatíveis (ex: quebra de API, nova estrutura de banco)
MINOR — novas funcionalidades sem quebrar compatibilidade
PATCH — correções de bugs e melhorias pequenas
```

### Próximas versões planejadas

- **v1.2.0** — Página de status, melhorias no onboarding, notificações push
- **v1.3.0** — App mobile PWA melhorado
- **v2.0.0** — Multi-idioma, marketplace de templates
