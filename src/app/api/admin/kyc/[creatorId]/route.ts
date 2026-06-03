import { NextResponse } from "next/server";
import {
  isAdminSessionError,
  requireAdminSession,
} from "@/lib/auth/require-admin";
import { reviewKyc } from "@/lib/repositories/kyc-repository";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ creatorId: string }> },
) {
  const session = await requireAdminSession();
  if (isAdminSessionError(session)) return session;

  const { creatorId } = await params;
  const body = (await request.json()) as {
    decision?: "approved" | "rejected";
    rejectionReason?: string;
  };

  if (body.decision !== "approved" && body.decision !== "rejected") {
    return NextResponse.json({ error: "Decisão inválida." }, { status: 400 });
  }

  const result = await reviewKyc(
    creatorId,
    session.userId,
    body.decision,
    body.rejectionReason,
  );

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result.row);
}
