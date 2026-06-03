import { NextResponse } from "next/server";
import { isUsernameAvailableSlug, slugifyUsername } from "@/lib/auth/validators";
import { getPrisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username") ?? "";
    const slug = slugifyUsername(username);

    if (!isUsernameAvailableSlug(slug)) {
      return NextResponse.json({ available: false });
    }

    const db = getPrisma();
    const existing = await db.creator.findUnique({ where: { username: slug } });

    return NextResponse.json({ available: !existing });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Prisma")) {
      return NextResponse.json(
        { error: "Banco de dados indisponível." },
        { status: 503 },
      );
    }
    console.error("[auth/check-username]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
