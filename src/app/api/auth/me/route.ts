import { NextResponse } from "next/server";
import { listOAuthAccounts } from "@/lib/auth/oauth";
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
        avatar: true,
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            onboardingCompleted: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const accounts = await listOAuthAccounts(user.id);

    let lastCreator: { username: string; displayName: string; avatar: string } | null =
      null;
    const lastTip = await db.transaction.findFirst({
      where: { donorUserId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        creator: { select: { username: true, displayName: true, avatar: true } },
      },
    });
    if (lastTip?.creator) {
      lastCreator = {
        username: lastTip.creator.username,
        displayName: lastTip.creator.displayName,
        avatar: lastTip.creator.avatar || "",
      };
    }

    return NextResponse.json({
      user,
      providers: accounts.map((a) => a.provider),
      lastCreator,
    });
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
