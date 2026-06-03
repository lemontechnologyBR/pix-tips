import * as creatorRepo from "@/lib/repositories/creator-repository";
import {
  getSessionFromCookies,
  setSessionCookie,
} from "./session";

export {
  SESSION_COOKIE,
  buildSessionCookie,
  createSession,
  getSessionFromCookies,
  getSessionFromRequest,
  setSessionCookie,
  verifySession,
} from "./session";
export type { SessionPayload } from "./session";
export { sendWelcomeEmail, sendPasswordResetEmail } from "./emails";

export interface SessionUser {
  userId: string;
  email: string;
  onboardingCompleted: boolean;
}

export async function getSession(): Promise<SessionUser | null> {
  const session = await getSessionFromCookies();
  if (!session) return null;
  return {
    userId: session.userId,
    email: session.email,
    onboardingCompleted: session.onboardingCompleted,
  };
}

export async function getCurrentCreator() {
  const session = await getSessionFromCookies();
  if (session?.creatorId) {
    const creator = await creatorRepo.getById(session.creatorId);
    if (creator) return creator;
  }
  return creatorRepo.getDemoOrSeed();
}

export async function refreshSessionForCreator(creatorId: string): Promise<void> {
  const creator = await creatorRepo.getById(creatorId);
  if (!creator) return;

  const row = await import("@/lib/db").then((m) =>
    m.getPrisma().creator.findUnique({
      where: { id: creatorId },
      select: { userId: true, user: { select: { role: true } } },
    }),
  );
  if (!row) return;

  await setSessionCookie({
    userId: row.userId,
    creatorId: creator.id,
    email: creator.email,
    role: row.user.role,
    onboardingCompleted: creator.onboardingCompleted,
  });
}

export async function getSessionFromToken(
  token: string | undefined,
): Promise<SessionUser | null> {
  if (!token) return null;
  const { verifySession } = await import("./session");
  const session = await verifySession(token);
  if (!session) return null;
  return {
    userId: session.userId,
    email: session.email,
    onboardingCompleted: session.onboardingCompleted,
  };
}
