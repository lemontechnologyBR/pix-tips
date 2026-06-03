import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { generateApiKey } from "@/lib/affiliate";
import { getPrisma } from "@/lib/db";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const db = getPrisma();
  const creator = await db.creator.findUnique({
    where: { userId: session.userId },
    select: { id: true, apiKey: true },
  });

  if (!creator) {
    return NextResponse.json({ error: "Criador não encontrado." }, { status: 404 });
  }

  if (creator.apiKey) {
    return NextResponse.json({ apiKey: creator.apiKey, created: false });
  }

  const apiKey = generateApiKey();
  await db.creator.update({
    where: { id: creator.id },
    data: { apiKey },
  });

  return NextResponse.json({ apiKey, created: true });
}
