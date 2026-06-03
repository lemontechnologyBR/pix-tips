import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "tip_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export interface SessionPayload {
  userId: string;
  creatorId: string;
  email: string;
  role: string;
  onboardingCompleted: boolean;
  /** Unix timestamp (seconds) when this JWT was issued — populated by verifySession, not required at creation. */
  issuedAt?: number;
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET environment variable is required in production",
      );
    }
    console.warn(
      "[auth/session] AVISO: AUTH_SECRET não definido. Usando segredo temporário apenas para desenvolvimento. Defina AUTH_SECRET antes de ir para produção.",
    );
    return new TextEncoder().encode("dev-secret-change-in-production-min-32-chars!!");
  }
  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error(
      "AUTH_SECRET must be at least 32 characters in production",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    creatorId: payload.creatorId,
    email: payload.email,
    role: payload.role,
    onboardingCompleted: payload.onboardingCompleted,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.userId !== "string" ||
      typeof payload.creatorId !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      creatorId: payload.creatorId,
      email: payload.email,
      role: typeof payload.role === "string" ? payload.role : "user",
      onboardingCompleted: Boolean(payload.onboardingCompleted),
      issuedAt: payload.iat,
    };
  } catch {
    return null;
  }
}

export function buildSessionCookie(token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const secure =
    process.env.NODE_ENV === "production" || appUrl.startsWith("https://");

  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function getSessionFromRequest(
  request: NextRequest,
): Promise<SessionPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const { cookies } = await import("next/headers");
  const token = await createSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(buildSessionCookie(token));
}
