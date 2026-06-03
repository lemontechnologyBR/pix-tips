import { NextResponse } from "next/server";
import { refreshSessionCookieForCreator } from "@/lib/auth/refresh-session-cookie";
import { getSessionFromCookies } from "@/lib/auth/session";
import * as creatorRepo from "@/lib/repositories/creator-repository";
import { completeOnboarding } from "@/lib/store";
import type { OnboardingPayload } from "@/types";

export const dynamic = "force-dynamic";

async function resolveCreatorId(session: {
  creatorId: string;
  userId: string;
}): Promise<string | null> {
  const byId = await creatorRepo.getById(session.creatorId);
  if (byId) return byId.id;

  const byUser = await creatorRepo.getByUserId(session.userId);
  return byUser?.id ?? null;
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = (await request.json()) as OnboardingPayload;

    if (!body.displayName?.trim() || !body.templateId || !body.soundId) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const creatorId = await resolveCreatorId(session);
    if (!creatorId) {
      return NextResponse.json({ error: "Criador não encontrado" }, { status: 404 });
    }

    const goal =
      typeof body.goal === "number" && Number.isFinite(body.goal) && body.goal > 0
        ? body.goal
        : undefined;

    const creator = await completeOnboarding(creatorId, {
      avatar:
        body.avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(body.displayName.trim())}`,
      displayName: body.displayName.trim(),
      bio: body.bio ?? "",
      goal,
      templateId: body.templateId,
      soundId: body.soundId,
    });

    if (!creator) {
      return NextResponse.json({ error: "Criador não encontrado" }, { status: 404 });
    }

    try {
      await refreshSessionCookieForCreator(creator.id);
    } catch (cookieError) {
      console.error("[onboarding/complete] cookie refresh", cookieError);
    }

    return NextResponse.json({
      ok: true,
      username: creator.username,
      creatorId: creator.id,
      widgetToken: creator.widgetToken,
    });
  } catch (error) {
    console.error("[onboarding/complete]", error);
    const message =
      error instanceof Error && /database|sqlite|locked|busy/i.test(error.message)
        ? "Banco ocupado. Feche outras instâncias do app e tente de novo."
        : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
