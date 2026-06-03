import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

function defaultSqliteUrl(): string {
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  return `file:${dbPath}`;
}

export function getDatabaseUrl(): string {
  return process.env.DATABASE_URL ?? defaultSqliteUrl();
}

function isPostgresUrl(url: string): boolean {
  return url.startsWith("postgresql://") || url.startsWith("postgres://");
}

export function createPrismaClient(): PrismaClient {
  const url = getDatabaseUrl();

  const adapter = isPostgresUrl(url)
    ? new PrismaPg(new Pool({ connectionString: url }))
    : new PrismaBetterSqlite3({
        url: url.startsWith("file:") ? url : `file:${url}`,
      });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function isPrismaClientReady(client: PrismaClient): boolean {
  const delegate = client as PrismaClient & {
    payout?: { findMany?: unknown };
    kycVerification?: { findUnique?: unknown };
    _runtimeDataModel?: {
      models?: Record<string, { fields?: Array<{ name: string }> }>;
    };
  };

  const creatorFields = delegate._runtimeDataModel?.models?.Creator?.fields;
  const transactionFields =
    delegate._runtimeDataModel?.models?.Transaction?.fields;
  const kycFields = delegate._runtimeDataModel?.models?.KycVerification?.fields;
  const hasField = (
    fields: Array<{ name: string }> | undefined,
    name: string,
  ) => fields?.some((field) => field.name === name) === true;

  return (
    typeof delegate.payout?.findMany === "function" &&
    typeof delegate.creatorWooviPixKey?.findMany === "function" &&
    typeof delegate.kycVerification?.findUnique === "function" &&
    typeof delegate.securityChallenge?.create === "function" &&
    hasField(creatorFields, "chatBotSettings") &&
    hasField(creatorFields, "wooviPixKey") &&
    hasField(transactionFields, "wooviPaymentId") &&
    hasField(kycFields, "diditSessionId") &&
    hasField(delegate._runtimeDataModel?.models?.User?.fields, "totpEnabled")
  );
}

function getOrCreatePrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (cached && isPrismaClientReady(cached)) {
    return cached;
  }

  const client = createPrismaClient();
  if (!isPrismaClientReady(client)) {
    console.error(
      "[db] Prisma client desatualizado. Execute: npx prisma generate && reinicie o servidor.",
    );
  }
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export function getPrisma(): PrismaClient {
  return getOrCreatePrismaClient();
}

/** Sempre resolve o client atual (evita cache stale após prisma generate). */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getOrCreatePrismaClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
