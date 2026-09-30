import { NextResponse } from "next/server";
import { refreshSessionCookieForCreator } from "@/lib/auth/refresh-session-cookie";
import { getSessionFromCookies } from "@/lib/auth/session";
import * as creatorRepo from "@/lib/repositories/creator-repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.redirect(new URL("/login?redirect=/onboarding", request.url));
  }

  const creator =
    (session.creatorId ? await creatorRepo.getById(session.creatorId) : null) ??
    (await creatorRepo.getByUserId(session.userId));

  if (!creator?.onboardingCompleted) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  await refreshSessionCookieForCreator(creator.id);

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
