import { SignJWT, jwtVerify } from "jose";
import type { SessionPayload } from "@/lib/auth/session";

export const MFA_PENDING_COOKIE = "tip_mfa_pending";
const MFA_MAX_AGE = 5 * 60;

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET environment variable is required in production",
      );
    }
    console.warn(
      "[auth/mfa-token] AVISO: AUTH_SECRET não definido. Usando segredo temporário apenas para desenvolvimento. Defina AUTH_SECRET antes de ir para produção.",
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

export async function createMfaPendingToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    creatorId: payload.creatorId,
    email: payload.email,
    role: payload.role,
    onboardingCompleted: payload.onboardingCompleted,
    purpose: "mfa_pending",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(getSecret());
}

export async function verifyMfaPendingToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.purpose !== "mfa_pending") {
      return null;
    }
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
    };
  } catch {
    return null;
  }
}

export function buildMfaPendingCookie(token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const secure =
    process.env.NODE_ENV === "production" || appUrl.startsWith("https://");

  return {
    name: MFA_PENDING_COOKIE,
    value: token,
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: MFA_MAX_AGE,
  };
}

export function clearMfaPendingCookie() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const secure =
    process.env.NODE_ENV === "production" || appUrl.startsWith("https://");

  return {
    name: MFA_PENDING_COOKIE,
    value: "",
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
