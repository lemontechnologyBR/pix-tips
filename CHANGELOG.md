# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto segue [Versionamento Semântico](https://semver.org/lang/pt-BR/).

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

- **v1.1.0** — Página de status, melhorias no onboarding
- **v1.2.0** — Notificações push, app mobile PWA melhorado
- **v2.0.0** — Multi-idioma, marketplace de templates
