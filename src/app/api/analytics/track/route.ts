import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ALLOWED_TYPES = new Set(["tip_page_view", "widget_view"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      type?: string;
      creatorId?: string;
      path?: string;
      widget?: string;
    };

    const type = String(body.type ?? "").trim();
    if (!ALLOWED_TYPES.has(type)) {
      return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
    }

    await prisma.analyticsEvent.create({
      data: {
        type,
        creatorId: body.creatorId?.trim() || null,
        path: body.path?.trim()?.slice(0, 200) || null,
        widget: body.widget?.trim()?.slice(0, 40) || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 204 });
  }
}
