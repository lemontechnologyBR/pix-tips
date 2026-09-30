import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { getPrisma } from "@/lib/db";
import { listCreatorMissions } from "@/lib/fan-missions";

export async function GET() {
  const session = await requireSession();
  if (isSessionError(session)) return session;
  const missions = await listCreatorMissions(session.creator.id);
  return NextResponse.json({ missions });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const body = (await request.json().catch(() => ({}))) as {
    title?: unknown;
    description?: unknown;
    type?: unknown;
    targetValue?: unknown;
    periodDays?: unknown;
    rewardBadge?: unknown;
    rewardDiscordRoleId?: unknown;
    active?: unknown;
  };

  const title = typeof body.title === "string" ? body.title.trim().slice(0, 80) : "";
  const targetValue = Number(body.targetValue);
  if (!title || !Number.isFinite(targetValue) || targetValue < 1) {
    return NextResponse.json(
      { error: "Informe título e meta (mín. 1)." },
      { status: 400 },
    );
  }

  const type = body.type === "tip_total" ? "tip_total" : "tip_count";
  const description =
    typeof body.description === "string" ? body.description.trim().slice(0, 300) : "";
  const rewardBadge =
    typeof body.rewardBadge === "string" && body.rewardBadge.trim()
      ? body.rewardBadge.trim().slice(0, 24)
      : "Fã";
  const periodDays =
    body.periodDays == null || body.periodDays === ""
      ? null
      : Math.max(1, Math.min(365, Math.floor(Number(body.periodDays)) || 0)) || null;
  const rewardDiscordRoleId =
    typeof body.rewardDiscordRoleId === "string" && body.rewardDiscordRoleId.trim()
      ? body.rewardDiscordRoleId.trim()
      : null;

  const prisma = getPrisma();
  const count = await prisma.creatorFanMission.count({
    where: { creatorId: session.creator.id },
  });
  if (count >= 10) {
    return NextResponse.json({ error: "Limite de 10 missões." }, { status: 400 });
  }

  const row = await prisma.creatorFanMission.create({
    data: {
      creatorId: session.creator.id,
      title,
      description,
      type,
      targetValue,
      periodDays,
      rewardBadge,
      rewardDiscordRoleId,
      active: body.active !== false,
      sortOrder: count,
    },
  });

  const missions = await listCreatorMissions(session.creator.id);
  return NextResponse.json({
    mission: missions.find((m) => m.id === row.id),
    missions,
  });
}

export async function PUT(request: Request) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const body = (await request.json().catch(() => ({}))) as {
    id?: unknown;
    title?: unknown;
    description?: unknown;
    type?: unknown;
    targetValue?: unknown;
    periodDays?: unknown;
    rewardBadge?: unknown;
    rewardDiscordRoleId?: unknown;
    active?: unknown;
  };

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  }

  const prisma = getPrisma();
  const existing = await prisma.creatorFanMission.findFirst({
    where: { id, creatorId: session.creator.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Missão não encontrada" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim()) {
    data.title = body.title.trim().slice(0, 80);
  }
  if (typeof body.description === "string") {
    data.description = body.description.trim().slice(0, 300);
  }
  if (body.type === "tip_count" || body.type === "tip_total") data.type = body.type;
  if (body.targetValue !== undefined) {
    const v = Number(body.targetValue);
    if (!Number.isFinite(v) || v < 1) {
      return NextResponse.json({ error: "Meta inválida" }, { status: 400 });
    }
    data.targetValue = v;
  }
  if (body.periodDays !== undefined) {
    data.periodDays =
      body.periodDays == null || body.periodDays === ""
        ? null
        : Math.max(1, Math.min(365, Math.floor(Number(body.periodDays)) || 0)) || null;
  }
  if (typeof body.rewardBadge === "string" && body.rewardBadge.trim()) {
    data.rewardBadge = body.rewardBadge.trim().slice(0, 24);
  }
  if (body.rewardDiscordRoleId !== undefined) {
    data.rewardDiscordRoleId =
      typeof body.rewardDiscordRoleId === "string" && body.rewardDiscordRoleId.trim()
        ? body.rewardDiscordRoleId.trim()
        : null;
  }
  if (typeof body.active === "boolean") data.active = body.active;

  await prisma.creatorFanMission.update({ where: { id }, data });
  const missions = await listCreatorMissions(session.creator.id);
  return NextResponse.json({ missions });
}

export async function DELETE(request: Request) {
  const session = await requireSession();
  if (isSessionError(session)) return session;
  const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
  if (!id) {
    return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  }

  const prisma = getPrisma();
  const existing = await prisma.creatorFanMission.findFirst({
    where: { id, creatorId: session.creator.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Missão não encontrada" }, { status: 404 });
  }

  await prisma.creatorFanMission.update({
    where: { id },
    data: { active: false },
  });

  return NextResponse.json({ ok: true });
}
