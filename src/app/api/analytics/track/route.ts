import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { isUsernameAvailableSlug } from "@/lib/auth/validators";

const ALLOWED_TYPES = new Set(["site_visit", "tip_page_view", "widget_view"]);

function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function pathUsername(path: string | null): string | null {
  if (!path) return null;
  const first = path.split("?")[0].split("/").filter(Boolean)[0]?.toLowerCase();
  if (!first || !isUsernameAvailableSlug(first)) return null;
  return first;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!rateLimit(`analytics:${ip}`, 120, 60_000)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  try {
    const body = (await request.json()) as {
      type?: string;
      creatorId?: string;
      path?: string;
      widget?: string;
      referrer?: string;
      utmSource?: string;
      utmMedium?: string;
      utmCampaign?: string;
      utmTerm?: string;
      utmContent?: string;
    };

    const type = String(body.type ?? "").trim();
    if (!ALLOWED_TYPES.has(type)) {
      return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
    }

    const path = clean(body.path, 400);
    let creatorId = clean(body.creatorId, 64);

    if (!creatorId) {
      const username = pathUsername(path);
      if (username) {
        const creator = await prisma.creator.findUnique({
          where: { username },
          select: { id: true },
        });
        creatorId = creator?.id ?? null;
      }
    }

    await prisma.analyticsEvent.create({
      data: {
        type,
        creatorId,
        path,
        widget: clean(body.widget, 40),
        referrer: clean(body.referrer, 500),
        utmSource: clean(body.utmSource, 120),
        utmMedium: clean(body.utmMedium, 120),
        utmCampaign: clean(body.utmCampaign, 120),
        utmTerm: clean(body.utmTerm, 120),
        utmContent: clean(body.utmContent, 120),
        userAgent: clean(request.headers.get("user-agent"), 300),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 204 });
  }
}
