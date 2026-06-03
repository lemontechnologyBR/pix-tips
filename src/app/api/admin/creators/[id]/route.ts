import { NextResponse } from "next/server";
import {
  isAdminSessionError,
  requireAdminSession,
} from "@/lib/auth/require-admin";
import { setCreatorSuspended } from "@/lib/repositories/admin-repository";
import { getPrisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminSession();
  if (isAdminSessionError(session)) return session;

  const { id } = await params;
  const body = (await request.json()) as { isSuspended?: boolean };

  if (typeof body.isSuspended !== "boolean") {
    return NextResponse.json({ error: "isSuspended inválido" }, { status: 400 });
  }

  const ok = await setCreatorSuspended(id, body.isSuspended);
  if (!ok) {
    return NextResponse.json({ error: "Criador não encontrado" }, { status: 404 });
  }

  const row = await getPrisma().creator.findUnique({
    where: { id },
    include: {
      user: { select: { email: true } },
      _count: { select: { transactions: true } },
    },
  });

  if (!row) {
    return NextResponse.json({ error: "Criador não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    id: row.id,
    username: row.username,
    displayName: row.displayName,
    email: row.user.email,
    plan: row.plan,
    isSuspended: row.isSuspended,
    raised: row.raised,
    createdAt: row.createdAt.toISOString(),
    transactionCount: row._count.transactions,
  });
}
