import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  const isDashboard = pathname.startsWith("/dashboard");
  const isOnboarding = pathname.startsWith("/onboarding");
  const isAdmin = pathname.startsWith("/admin");
  const isConta = pathname === "/conta" || pathname.startsWith("/conta/");

  if (isAdmin) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (isConta) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", "/conta");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (isDashboard || isOnboarding) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Fã sem tip page: dashboard bloqueado até virar criador no onboarding
    if (isDashboard && !session.creatorId) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    if (isDashboard && !session.onboardingCompleted) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    if (isOnboarding && session.onboardingCompleted && session.creatorId) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/admin/:path*", "/conta", "/conta/:path*"],
};
