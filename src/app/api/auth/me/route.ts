import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { getPrisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const db = getPrisma();
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            onboardingCompleted: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Prisma")) {
      return NextResponse.json(
        { error: "Banco de dados indisponível." },
        { status: 503 },
      );
    }
    console.error("[auth/me]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
