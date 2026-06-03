#!/bin/sh
set -e

# Set default SQLite URL if DATABASE_URL is not provided
if [ -z "${DATABASE_URL:-}" ]; then
  DATABASE_URL="file:./prisma/dev.db"
  export DATABASE_URL
  echo "==> DATABASE_URL not set — using default SQLite: $DATABASE_URL"
fi

# Detect provider from URL and patch schema.prisma accordingly
if echo "$DATABASE_URL" | grep -qE "^postgres(ql)?://"; then
  echo "==> PostgreSQL detected"
  # Patch schema provider so prisma CLI uses correct SQL dialect
  sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
  echo "==> Schema provider patched to postgresql"
else
  echo "==> SQLite detected"
fi

echo "==> Running database push..."
npx prisma db push --accept-data-loss

echo "==> Database setup complete. Starting application..."
exec npx tsx server.ts
