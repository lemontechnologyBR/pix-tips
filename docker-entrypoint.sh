#!/bin/sh
set -e

# ── Detecta provider e corrige o schema Prisma ───────────────────────────────
if [ -z "${DATABASE_URL:-}" ]; then
  DATABASE_URL="file:./prisma/dev.db"
  export DATABASE_URL
  echo "==> DATABASE_URL não definido — usando SQLite padrão: $DATABASE_URL"
fi

if echo "$DATABASE_URL" | grep -qE "^postgres(ql)?://"; then
  echo "==> PostgreSQL detectado"
  sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
  echo "==> Schema patched para postgresql"
else
  echo "==> SQLite detectado"
fi

echo "==> Sincronizando schema com o banco..."
npx prisma db push

echo "==> Banco pronto. Iniciando aplicação..."
exec npx tsx server.ts
