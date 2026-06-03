import { NextResponse } from "next/server";
import {
  isAdminSessionError,
  requireAdminSession,
} from "@/lib/auth/require-admin";
import { updateUser } from "@/lib/repositories/admin-repository";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminSession();
  if (isAdminSessionError(session)) return session;

  const { id } = await params;
  const body = (await request.json()) as {
    isSuspended?: boolean;
    role?: "admin" | "user";
    plan?: "free" | "pro";
  };

  const patch: { isSuspended?: boolean; role?: string; plan?: string } = {};

  if (body.isSuspended != null) {
    if (typeof body.isSuspended !== "boolean") {
      return NextResponse.json({ error: "isSuspended inválido" }, { status: 400 });
    }
    patch.isSuspended = body.isSuspended;
  }

  if (body.role != null) {
    if (body.role !== "admin" && body.role !== "user") {
      return NextResponse.json({ error: "role deve ser 'admin' ou 'user'" }, { status: 400 });
    }
    patch.role = body.role;
  }

  if (body.plan != null) {
    if (body.plan !== "free" && body.plan !== "pro") {
      return NextResponse.json({ error: "plan deve ser 'free' ou 'pro'" }, { status: 400 });
    }
    patch.plan = body.plan;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 });
  }

  const updated = await updateUser(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
