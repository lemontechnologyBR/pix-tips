# Migração OAuthAccount

O modelo `OAuthAccount` já está definido em `prisma/schema.prisma`. Se o banco ainda não foi atualizado, aplique:

```bash
npx prisma db push
npx prisma generate
```

Ou, com migrations:

```bash
npx prisma migrate dev --name add_oauth_account
npx prisma generate
```

## Variáveis de ambiente

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
OAUTH_REDIRECT_BASE=http://localhost:3000
```

Em produção, defina `OAUTH_REDIRECT_BASE` para a URL pública do app.

## Redirect URIs nos consoles OAuth

- Google: `{OAUTH_REDIRECT_BASE}/api/auth/oauth/google/callback`
- YouTube (Google OAuth): `{OAUTH_REDIRECT_BASE}/api/auth/oauth/youtube/callback`
- Twitch: `{OAUTH_REDIRECT_BASE}/api/auth/oauth/twitch/callback`
