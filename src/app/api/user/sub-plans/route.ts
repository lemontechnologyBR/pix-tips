import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { getPrisma } from "@/lib/db";
import {
  listCreatorSubPlans,
  listFanSubscriptions,
  mapSubPlan,
} from "@/lib/fan-subscriptions";

export async function GET() {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const [plans, subscribers] = await Promise.all([
    listCreatorSubPlans(session.creator.id),
    listFanSubscriptions(session.creator.id),
  ]);

  return NextResponse.json({ plans, subscribers });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const body = (await request.json().catch(() => ({}))) as {
    name?: unknown;
    description?: unknown;
    price?: unknown;
    perks?: unknown;
    active?: unknown;
  };

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 60) : "";
  const description =
    typeof body.description === "string" ? body.description.trim().slice(0, 300) : "";
  const price = Number(body.price);
  if (!name || !Number.isFinite(price) || price < 1) {
    return NextResponse.json(
      { error: "Informe nome e preço mínimo de R$ 1,00." },
      { status: 400 },
    );
  }
  if (price > 5000) {
    return NextResponse.json({ error: "Preço máximo R$ 5.000,00." }, { status: 400 });
  }

  const perks = Array.isArray(body.perks)
    ? body.perks
        .filter((p): p is string => typeof p === "string")
        .map((p) => p.trim().slice(0, 80))
        .filter(Boolean)
        .slice(0, 12)
    : [];

  const prisma = getPrisma();
  const count = await prisma.creatorSubPlan.count({
    where: { creatorId: session.creator.id },
  });
  if (count >= 10) {
    return NextResponse.json(
      { error: "Limite de 10 planos por criador." },
      { status: 400 },
    );
  }

  const row = await prisma.creatorSubPlan.create({
    data: {
      creatorId: session.creator.id,
      name,
      description,
      price,
      perks: JSON.stringify(perks),
      active: body.active !== false,
      sortOrder: count,
    },
  });

  return NextResponse.json({ plan: mapSubPlan(row) });
}

export async function PUT(request: Request) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const body = (await request.json().catch(() => ({}))) as {
    id?: unknown;
    name?: unknown;
    description?: unknown;
    price?: unknown;
    perks?: unknown;
    active?: unknown;
  };

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  }

  const prisma = getPrisma();
  const existing = await prisma.creatorSubPlan.findFirst({
    where: { id, creatorId: session.creator.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
  }

  const data: {
    name?: string;
    description?: string;
    price?: number;
    perks?: string;
    active?: boolean;
  } = {};

  if (typeof body.name === "string" && body.name.trim()) {
    data.name = body.name.trim().slice(0, 60);
  }
  if (typeof body.description === "string") {
    data.description = body.description.trim().slice(0, 300);
  }
  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 1 || price > 5000) {
      return NextResponse.json({ error: "Preço inválido" }, { status: 400 });
    }
    data.price = price;
  }
  if (Array.isArray(body.perks)) {
    data.perks = JSON.stringify(
      body.perks
        .filter((p): p is string => typeof p === "string")
        .map((p) => p.trim().slice(0, 80))
        .filter(Boolean)
        .slice(0, 12),
    );
  }
  if (typeof body.active === "boolean") data.active = body.active;

  const row = await prisma.creatorSubPlan.update({
    where: { id },
    data,
  });

  return NextResponse.json({ plan: mapSubPlan(row) });
}

export async function DELETE(request: Request) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim() ?? "";
  if (!id) {
    return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  }

  const prisma = getPrisma();
  const existing = await prisma.creatorSubPlan.findFirst({
    where: { id, creatorId: session.creator.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
  }

  await prisma.creatorSubPlan.update({
    where: { id },
    data: { active: false },
  });

  return NextResponse.json({ ok: true });
}
