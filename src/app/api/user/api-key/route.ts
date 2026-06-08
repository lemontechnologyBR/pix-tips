import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { generateApiKey } from "@/lib/affiliate";
import { getPrisma } from "@/lib/db";

function maskApiKey(key: string): string {
  return `${key.slice(0, 8)}...`;
}

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const db = getPrisma();
  const creator = await db.creator.findUnique({
    where: { userId: session.userId },
    select: { apiKey: true, apiKeyCreatedAt: true },
  });

  if (!creator) {
    return NextResponse.json({ error: "Criador não encontrado." }, { status: 404 });
  }

  if (!creator.apiKey) {
    return NextResponse.json({ apiKey: null, lastRotatedAt: null });
  }

  return NextResponse.json({
    apiKey: maskApiKey(creator.apiKey),
    lastRotatedAt: creator.apiKeyCreatedAt,
  });
}

export async function POST() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const db = getPrisma();
  const creator = await db.creator.findUnique({
    where: { userId: session.userId },
    select: { id: true },
  });

  if (!creator) {
    return NextResponse.json({ error: "Criador não encontrado." }, { status: 404 });
  }

  const apiKey = generateApiKey();
  const now = new Date();

  await db.creator.update({
    where: { id: creator.id },
    data: { apiKey, apiKeyCreatedAt: now },
  });

  return NextResponse.json({ apiKey, lastRotatedAt: now });
}
