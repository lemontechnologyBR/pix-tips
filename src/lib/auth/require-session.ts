import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import * as creatorRepo from "@/lib/repositories/creator-repository";
import { getPrisma } from "@/lib/db";
import type { Creator } from "@/types";

export async function requireSession(): Promise<
  { creator: Creator; userId: string } | NextResponse
> {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Detect sessions issued before a password reset.
  // When a password is reset, resetToken is cleared and resetTokenExpiry is set to the
  // change timestamp. Any JWT whose iat predates that timestamp is invalidated.
  if (session.issuedAt !== undefined) {
    const db = getPrisma();
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { resetToken: true, resetTokenExpiry: true },
    });

    if (
      user &&
      user.resetToken === null &&
      user.resetTokenExpiry !== null &&
      user.resetTokenExpiry > new Date(session.issuedAt * 1000)
    ) {
      return NextResponse.json(
        { error: "Sessão inválida. Faça login novamente." },
        { status: 401 },
      );
    }
  }

  const creator = await creatorRepo.getById(session.creatorId);
  if (!creator) {
    return NextResponse.json({ error: "Criador não encontrado" }, { status: 404 });
  }

  return { creator, userId: session.userId };
}

export function isSessionError(
  result: { creator: Creator; userId: string } | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
