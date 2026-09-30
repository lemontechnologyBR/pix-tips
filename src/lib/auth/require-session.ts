import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import * as creatorRepo from "@/lib/repositories/creator-repository";
import { getPrisma } from "@/lib/db";
import type { Creator } from "@/types";

async function assertSessionNotRevoked(session: {
  userId: string;
  issuedAt?: number;
}): Promise<NextResponse | null> {
  if (session.issuedAt === undefined) return null;

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

  return null;
}

export async function requireSession(): Promise<
  { creator: Creator; userId: string } | NextResponse
> {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const revoked = await assertSessionNotRevoked(session);
  if (revoked) return revoked;

  const creator = session.creatorId
    ? await creatorRepo.getById(session.creatorId)
    : await creatorRepo.getByUserId(session.userId);
  if (!creator) {
    return NextResponse.json(
      { error: "Conta de criador necessária. Complete o onboarding." },
      { status: 403 },
    );
  }

  if (creator.isSuspended) {
    return NextResponse.json({ error: "Conta suspensa" }, { status: 403 });
  }

  return { creator, userId: session.userId };
}

/** Sessão de fã ou criador — só exige userId (sem Creator). */
export async function requireUserSession(): Promise<
  { userId: string; email: string; creatorId: string | null } | NextResponse
> {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const revoked = await assertSessionNotRevoked(session);
  if (revoked) return revoked;

  return {
    userId: session.userId,
    email: session.email,
    creatorId: session.creatorId,
  };
}

export function isSessionError(
  result: { creator: Creator; userId: string } | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}

export function isUserSessionError(
  result: { userId: string; email: string; creatorId: string | null } | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
