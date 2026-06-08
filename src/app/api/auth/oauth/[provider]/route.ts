import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  OAUTH_LINK_USER_COOKIE,
  OAUTH_PKCE_COOKIE,
  OAUTH_RETURN_COOKIE,
  OAUTH_STATE_COOKIE,
  buildAuthUrl,
  generateOAuthState,
  generatePkcePair,
  isOAuthProvider,
} from "@/lib/auth/oauth";
import { isSessionError, requireSession } from "@/lib/auth/require-session";

interface RouteContext {
  params: Promise<{ provider: string }>;
}

function redirectBase(): string {
  return process.env.OAUTH_REDIRECT_BASE ?? "http://localhost:3000";
}

function safeReturnPath(returnTo: string | null): string {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return "/dashboard/settings";
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 600,
};

export async function GET(request: Request, context: RouteContext) {
  const { provider } = await context.params;

  if (!isOAuthProvider(provider)) {
    return NextResponse.json({ error: "Provedor OAuth inválido." }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const returnTo = safeReturnPath(searchParams.get("returnTo"));

  try {
    const state = generateOAuthState();
    const pkce = provider === "kick" ? generatePkcePair() : null;
    const url = buildAuthUrl(provider, state, {
      codeChallenge: pkce?.challenge,
    });

    const cookieStore = await cookies();
    cookieStore.set({
      name: OAUTH_STATE_COOKIE,
      value: state,
      ...cookieOptions,
    });

    if (pkce) {
      cookieStore.set({
        name: OAUTH_PKCE_COOKIE,
        value: pkce.verifier,
        ...cookieOptions,
      });
    }

    if (mode === "link") {
      const session = await requireSession();
      if (isSessionError(session)) return session;

      cookieStore.set({
        name: OAUTH_LINK_USER_COOKIE,
        value: session.userId,
        ...cookieOptions,
      });
      cookieStore.set({
        name: OAUTH_RETURN_COOKIE,
        value: returnTo,
        ...cookieOptions,
      });
    }

    return NextResponse.redirect(url);
  } catch (error) {
    console.error("[auth/oauth]", error);
    const message =
      error instanceof Error ? error.message : "Erro ao iniciar login social.";
    const loginUrl = new URL("/login", redirectBase());
    loginUrl.searchParams.set("error", message);
    return NextResponse.redirect(loginUrl);
  }
}
