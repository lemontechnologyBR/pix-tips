import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { updateCreator } from "@/lib/store";
import { getIO } from "@/lib/socket-server";

export async function PUT(request: Request) {
  try {
    const session = await requireSession();
    if (isSessionError(session)) return session;
    const { creator } = session;

    const body = await request.json();

    if (body.tipPageSettings !== undefined) {
      if (
        typeof body.tipPageSettings !== "object" ||
        body.tipPageSettings === null ||
        Array.isArray(body.tipPageSettings)
      ) {
        return NextResponse.json(
          { error: "tipPageSettings deve ser um objeto" },
          { status: 400 },
        );
      }

      const settings = body.tipPageSettings as Record<string, unknown>;

      if (
        typeof settings.backgroundImageUrl === "string" &&
        settings.backgroundImageUrl.length > 500
      ) {
        return NextResponse.json(
          { error: "backgroundImageUrl excede 500 caracteres" },
          { status: 400 },
        );
      }

      if (
        typeof settings.thankYouMessage === "string" &&
        settings.thankYouMessage.length > 2000
      ) {
        return NextResponse.json(
          { error: "thankYouMessage excede 2000 caracteres" },
          { status: 400 },
        );
      }

      if (
        typeof settings.goalTitle === "string" &&
        settings.goalTitle.length > 2000
      ) {
        return NextResponse.json(
          { error: "goalTitle excede 2000 caracteres" },
          { status: 400 },
        );
      }
    }

    await updateCreator(creator.id, {
      displayName: body.displayName,
      bio: body.bio,
      avatar: body.avatar,
      goal: body.goal,
      themeColor: body.themeColor,
      tipPageSettings: body.tipPageSettings,
    });

    // Emite goal-updated para o widget de meta em tempo real
    if (body.goal !== undefined || body.tipPageSettings?.goalTitle !== undefined) {
      try {
        const io = getIO();
        io.of("/alerts").to(creator.id).emit("goal-updated", {
          goal: body.goal ?? creator.goal,
          goalTitle: body.tipPageSettings?.goalTitle,
        });
      } catch {
        // Socket pode não estar disponível em modo de build/SSR
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}

export async function GET() {
  const session = await requireSession();
  if (isSessionError(session)) return session;
  return NextResponse.json(session.creator);
}
