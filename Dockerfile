# ─── Stage 1: builder ─────────────────────────────────────────────────────────
# Full install + Prisma client generation + Next.js production build
FROM node:20-alpine AS builder
WORKDIR /app

# Install native build deps needed by better-sqlite3 and sharp
RUN apk add --no-cache python3 make g++ libc6-compat

COPY package*.json ./
# Skip postinstall (prisma generate + pwa icons) — we run them explicitly below
RUN npm ci --ignore-scripts

COPY . .

# Generate Prisma client for the target platform
RUN npx prisma generate

# Build Next.js — NEXT_PUBLIC vars são placeholders em build time;
# valores reais vêm das env vars em runtime via docker-compose
ARG NEXT_PUBLIC_APP_URL=https://pix.tips
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx next build

# ─── Stage 2: runner ──────────────────────────────────────────────────────────
# Lean runtime image — no build tools
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install runtime-only native libs (better-sqlite3 needs libstdc++)
RUN apk add --no-cache libc6-compat

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# node_modules must include devDeps because tsx (runtime TS compiler) lives there
COPY --from=builder --chown=nextjs:nodejs /app/node_modules    ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json    ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json   ./tsconfig.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts  ./next.config.ts

# Next.js compiled output
COPY --from=builder --chown=nextjs:nodejs /app/.next  ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma schema + generated client
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Custom server entry-point (TypeScript, compiled at startup by tsx)
COPY --from=builder --chown=nextjs:nodejs /app/server.ts ./server.ts

# Source files imported transitively by server.ts at runtime
# (socket-server, store, db, chat-bot, …)
COPY --from=builder --chown=nextjs:nodejs /app/src ./src

# Entrypoint: runs Prisma migrations then starts the app
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
