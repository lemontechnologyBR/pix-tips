import { NextResponse } from "next/server";
import {
  isAdminSessionError,
  requireAdminSession,
} from "@/lib/auth/require-admin";
import { updateAdminPayout } from "@/lib/repositories/admin-repository";
import { syncCreatorBalance } from "@/lib/repositories/finance-repository";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminSession();
  if (isAdminSessionError(session)) return session;

  const { id } = await params;
  const body = (await request.json()) as {
    status?: "completed" | "failed";
    failedReason?: string;
  };

  if (body.status !== "completed" && body.status !== "failed") {
    return NextResponse.json(
      { error: "status deve ser 'completed' ou 'failed'" },
      { status: 400 },
    );
  }

  const updated = await updateAdminPayout(id, { status: body.status });
  if (!updated) {
    return NextResponse.json({ error: "Saque não encontrado" }, { status: 404 });
  }

  await syncCreatorBalance(updated.creatorId);

  return NextResponse.json(updated);
}
