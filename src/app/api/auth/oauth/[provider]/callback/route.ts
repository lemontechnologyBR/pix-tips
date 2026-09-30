import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  OAUTH_ACCOUNT_KIND_COOKIE,
  OAUTH_LINK_USER_COOKIE,
  OAUTH_PKCE_COOKIE,
  OAUTH_RETURN_COOKIE,
  OAUTH_STATE_COOKIE,
  exchangeCode,
  findOrCreateOAuthUser,
  getUserInfo,
  isLinkOnlyOAuthProvider,
  isOAuthProvider,
  linkOAuthAccount,
  type OAuthAccountKind,
} from "@/lib/auth/oauth";
import { buildSessionCookie, createSession } from "@/lib/auth/session";
import {
  buildMfaPendingCookie,
  createMfaPendingToken,
} from "@/lib/auth/mfa-token";

interface RouteContext {
  params: Promise<{ provider: string }>;
}

function redirectBase(): string {
  return process.env.OAUTH_REDIRECT_BASE ?? "http://localhost:3000";
}

function safeReturnPath(returnTo: string | undefined): string {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return "/dashboard/settings";
}

function errorRedirect(message: string): NextResponse {
  const url = new URL("/login", redirectBase());
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

function linkResultRedirect(
  returnTo: string,
  params: { connected?: string; error?: string },
): NextResponse {
  const url = new URL(returnTo, redirectBase());
  if (params.connected) {
    url.searchParams.set("connected", params.connected);
  }
  if (params.error) {
    url.searchParams.set("error", params.error);
  }
  return NextResponse.redirect(url);
}

const clearCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 0,
};

export async function GET(request: Request, context: RouteContext) {
  const { provider } = await context.params;

  if (!isOAuthProvider(provider)) {
    return errorRedirect("Provedor OAuth inválido.");
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  const cookieStore = await cookies();
  const linkUserId = cookieStore.get(OAUTH_LINK_USER_COOKIE)?.value;
  const returnTo = safeReturnPath(cookieStore.get(OAUTH_RETURN_COOKIE)?.value);
  const kindRaw = cookieStore.get(OAUTH_ACCOUNT_KIND_COOKIE)?.value;
  const accountKind: OAuthAccountKind =
    kindRaw === "fan" || kindRaw === "creator" ? kindRaw : "creator";

  if (oauthError) {
    if (linkUserId || returnTo !== "/dashboard/settings") {
      return linkResultRedirect(returnTo === "/dashboard/settings" ? "/login" : returnTo, {
        error: "Login social cancelado ou negado.",
      });
    }
    return errorRedirect("Login social cancelado ou negado.");
  }

  if (isLinkOnlyOAuthProvider(provider) && !linkUserId) {
    return errorRedirect("Esta integração só pode ser vinculada a uma conta existente.");
  }

  if (!code || !state) {
    if (linkUserId || returnTo !== "/dashboard/settings") {
      return linkResultRedirect(returnTo === "/dashboard/settings" ? "/login" : returnTo, {
        error: "Resposta OAuth incompleta.",
      });
    }
    return errorRedirect("Resposta OAuth incompleta.");
  }

  const savedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  const pkceVerifier = cookieStore.get(OAUTH_PKCE_COOKIE)?.value;
  cookieStore.set({ name: OAUTH_STATE_COOKIE, value: "", ...clearCookieOptions });
  cookieStore.set({ name: OAUTH_PKCE_COOKIE, value: "", ...clearCookieOptions });
  cookieStore.set({ name: OAUTH_RETURN_COOKIE, value: "", ...clearCookieOptions });
  cookieStore.set({ name: OAUTH_ACCOUNT_KIND_COOKIE, value: "", ...clearCookieOptions });

  if (linkUserId) {
    cookieStore.set({ name: OAUTH_LINK_USER_COOKIE, value: "", ...clearCookieOptions });
  }

  if (!savedState || savedState !== state) {
    if (linkUserId || returnTo !== "/dashboard/settings") {
      return linkResultRedirect(returnTo === "/dashboard/settings" ? "/login" : returnTo, {
        error: "Estado OAuth inválido. Tente novamente.",
      });
    }
    return errorRedirect("Estado OAuth inválido. Tente novamente.");
  }

  try {
    const tokens = await exchangeCode(
      provider,
      code,
      provider === "kick" ? pkceVerifier : undefined,
    );
    const userInfo = await getUserInfo(provider, tokens);

    if (linkUserId) {
      await linkOAuthAccount(linkUserId, provider, userInfo, tokens);
      return linkResultRedirect(returnTo, { connected: provider });
    }

    const session = await findOrCreateOAuthUser(provider, userInfo, tokens, {
      accountKind,
    });

    const sessionPayload = {
      userId: session.userId,
      creatorId: session.creatorId,
      email: session.email,
      role: session.role,
      onboardingCompleted: session.onboardingCompleted,
    };

    // Tip page / fã: volta pra tip page, sem forçar onboarding de streamer
    const preferReturn =
      accountKind === "fan" ||
      (returnTo !== "/dashboard/settings" &&
        !returnTo.startsWith("/dashboard") &&
        !returnTo.startsWith("/onboarding") &&
        !returnTo.startsWith("/login") &&
        !returnTo.startsWith("/admin"));

    const redirectPath = preferReturn
      ? returnTo
      : !session.creatorId
        ? "/onboarding?signup=1"
        : session.onboardingCompleted
          ? "/dashboard"
          : "/onboarding?signup=1";

    if (session.totpEnabled && !preferReturn) {
      const mfaToken = await createMfaPendingToken(sessionPayload);
      cookieStore.set(buildMfaPendingCookie(mfaToken));
      const mfaUrl = new URL("/login", redirectBase());
      mfaUrl.searchParams.set("mfa", "1");
      return NextResponse.redirect(mfaUrl);
    }

    if (session.totpEnabled && preferReturn) {
      const mfaToken = await createMfaPendingToken(sessionPayload);
      cookieStore.set(buildMfaPendingCookie(mfaToken));
      const mfaUrl = new URL("/login", redirectBase());
      mfaUrl.searchParams.set("mfa", "1");
      mfaUrl.searchParams.set("redirect", returnTo);
      return NextResponse.redirect(mfaUrl);
    }

    const token = await createSession(sessionPayload);

    cookieStore.set(buildSessionCookie(token));

    return NextResponse.redirect(new URL(redirectPath, redirectBase()));
  } catch (error) {
    console.error("[auth/oauth/callback]", error);
    const message =
      error instanceof Error ? error.message : "Não foi possível concluir o login social.";

    if (linkUserId || returnTo !== "/dashboard/settings") {
      return linkResultRedirect(returnTo === "/dashboard/settings" ? "/login" : returnTo, {
        error: message,
      });
    }

    return errorRedirect(message);
  }
}
