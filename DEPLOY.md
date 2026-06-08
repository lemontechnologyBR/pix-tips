# Guia de Deploy — pix.tips

Este documento cobre os passos para colocar o projeto em produção, desde variáveis de ambiente até hospedagem em VPS, Railway ou Render.

---

## 1. Variáveis de Ambiente Obrigatórias

Copie `.env.example` para `.env.local` (dev) ou configure no painel da plataforma (produção):

```
# Obrigatórias — sem elas o app não inicia
AUTH_SECRET=<string aleatória de no mínimo 32 chars>
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
```

**Variáveis opcionais por serviço** (o app funciona sem elas, mas com capacidades reduzidas):

| Serviço | Variáveis | Sem elas |
|---|---|---|
| Pagamentos Pix | `WOOVI_APP_ID`, `WOOVI_WEBHOOK_SECRET` | Recebimento Pix desativado (usa mock em dev) |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL` | Plano Pro desativado |
| Resend | `RESEND_API_KEY`, `EMAIL_FROM` | E-mails logados no console |
| S3/R2 | `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` | Uploads em `public/uploads/` |
| Didit KYC | `DIDIT_API_KEY`, `DIDIT_APP_ID`, `DIDIT_WEBHOOK_SECRET` | KYC desativado |
| OAuth Google | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Login Google desativado |
| OAuth Twitch | `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` | Login Twitch desativado |
| OAuth Discord | `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | Vinculação Discord desativada |
| Bot Twitch | `TWITCH_BOT_USERNAME`, `TWITCH_BOT_OAUTH_TOKEN` | Bot de chat desativado |

---

## 2. Migrar de SQLite para PostgreSQL

O projeto usa **SQLite por padrão em desenvolvimento** (`file:./prisma/dev.db`). Em produção, use PostgreSQL.

### 2.1 Altere o provider no `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2.2 Configure `DATABASE_URL`

```
DATABASE_URL=postgresql://tippage:senha@host:5432/tippage
```

Exemplos por provedor:
- **Railway**: gerado automaticamente ao adicionar o plugin PostgreSQL
- **Render**: gerado automaticamente ao criar um PostgreSQL interno
- **Supabase**: `postgresql://postgres:[senha]@db.[projeto].supabase.co:5432/postgres`
- **Neon**: `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`

### 2.3 Aplique o schema

```bash
# Cria as tabelas no banco (não usa migrations — adequado para SQLite→Postgres)
npx prisma db push

# OU se quiser migrations versionadas (recomendado para produção contínua)
npx prisma migrate deploy
```

### 2.4 Gere o Prisma Client antes do build

```bash
npx prisma generate
npm run build
```

> **Dica Railway/Render**: adicione `npx prisma generate && npx prisma db push` no `Build Command` do painel.

---

## 3. Configurar Resend para e-mails reais

1. Crie uma conta em [resend.com](https://resend.com)
2. Adicione e verifique seu domínio (DNS TXT/MX)
3. Crie uma API Key com permissão **Sending access**
4. Configure as variáveis:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=pix.tips <noreply@seu-dominio.com>
```

> O remetente deve usar o domínio verificado no Resend. Em dev sem chave, os e-mails aparecem apenas nos logs do servidor.

---

## 4. Configurar S3 para uploads de imagens

Por padrão, uploads vão para `public/uploads/` (não funciona em ambientes efêmeros como Railway/Render). Configure S3 ou Cloudflare R2:

### AWS S3

```
AWS_S3_BUCKET=seu-bucket
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_CDN_URL=https://seu-bucket.s3.amazonaws.com
```

### Cloudflare R2 (recomendado — egress gratuito)

```
AWS_S3_BUCKET=seu-bucket-r2
AWS_ACCESS_KEY_ID=<R2 Access Key ID>
AWS_SECRET_ACCESS_KEY=<R2 Secret Access Key>
AWS_REGION=auto
AWS_S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
AWS_CDN_URL=https://cdn.seu-dominio.com
```

Configure o bucket como **público** e adicione um CORS policy permitindo seu domínio. Opcionalmente, aponte um subdomínio (ex: `cdn.seu-dominio.com`) para o R2 public bucket.

---

## 5. Deploy no Railway

1. Crie um projeto no [Railway](https://railway.app) e conecte o repositório GitHub
2. Adicione o plugin **PostgreSQL** — Railway injeta `DATABASE_URL` automaticamente
3. Configure variáveis de ambiente no painel (aba *Variables*)
4. No campo **Start Command**, use:

```bash
node server.js
```

5. Configure o **Build Command**:

```bash
npx prisma generate && npx prisma db push && npm run build
```

6. Defina `PORT` e `HOSTNAME`:

```
PORT=3000
HOSTNAME=0.0.0.0
```

O Railway detecta a porta via `PORT` e expõe o serviço automaticamente.

---

## 6. Deploy no Render

1. Crie um **Web Service** apontando para o repositório
2. Adicione um **PostgreSQL** pelo painel (ou use Neon/Supabase)
3. Configure as variáveis de ambiente
4. **Build Command**:

```bash
npm install && npx prisma generate && npx prisma db push && npm run build
```

5. **Start Command**:

```bash
node server.js
```

6. Defina `HOSTNAME=0.0.0.0` para o Render conseguir fazer health checks.

---

## 7. Deploy em VPS (Ubuntu/Debian)

```bash
# 1. Clone e instale dependências
git clone https://github.com/seu-usuario/tip-page.git
cd tip-page
npm install

# 2. Configure variáveis de ambiente
cp .env.example .env.local
nano .env.local  # Preencha todas as variáveis obrigatórias

# 3. Gere o Prisma Client e aplique o schema
npx prisma generate
npx prisma db push  # ou migrate deploy

# 4. Build de produção
npm run build

# 5. Inicie com PM2 (recomendado)
npm install -g pm2
pm2 start server.js --name tip-page --interpreter node
pm2 save
pm2 startup  # configura reinicialização automática

# 6. Proxy reverso com Nginx
# /etc/nginx/sites-available/tip-page
server {
    listen 80;
    server_name seu-dominio.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Habilite HTTPS com Certbot
certbot --nginx -d seu-dominio.com
```

Variáveis recomendadas para VPS:

```
HOSTNAME=127.0.0.1  # Nginx faz o proxy; não expor direto
PORT=3000
NODE_ENV=production
```

---

## 8. Por que não usar Vercel puro

O projeto usa **Socket.IO** (`server.ts`) para alertas de doação em tempo real. A Vercel executa funções serverless stateless — cada requisição pode cair em instâncias diferentes, sem estado compartilhado, o que **quebra completamente o Socket.IO**.

Além disso:
- **Serverless functions têm timeout de 10s** (60s no plano Pro) — incompatível com conexões WebSocket persistentes
- **Sem estado em memória** entre invocações — o `io.of("/alerts")` não sobrevive entre requests
- O `server.ts` é um servidor HTTP/Node.js customizado que a Vercel não suporta

**Alternativas compatíveis com Vercel** (apenas para projetos sem Socket.IO):
- Substitua Socket.IO por **Pusher**, **Ably** ou **Supabase Realtime** — mas isso exige refatorar toda a camada de alertas

**Alternativas recomendadas para este projeto:**
- Railway ✅ (deploy simples, PostgreSQL incluído)
- Render ✅ (free tier disponível)
- Fly.io ✅ (suporte a WebSockets, boa latência na América do Sul)
- VPS própria (DigitalOcean, Hetzner, Contabo) ✅
