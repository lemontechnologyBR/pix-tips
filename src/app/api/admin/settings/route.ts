import { NextResponse } from "next/server";
import {
  isAdminSessionError,
  requireAdminSession,
} from "@/lib/auth/require-admin";
import {
  getAdminSettings,
  updateAdminSettings,
} from "@/lib/repositories/admin-settings-repository";

export async function GET() {
  const session = await requireAdminSession();
  if (isAdminSessionError(session)) return session;

  const settings = await getAdminSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const session = await requireAdminSession();
  if (isAdminSessionError(session)) return session;

  const body = (await request.json()) as {
    commissionRate?: number;
    proPrice?: number;
    uploadLimitMb?: number;
  };

  const patch: {
    commissionRate?: number;
    proPrice?: number;
    uploadLimitMb?: number;
  } = {};

  if (body.commissionRate != null) {
    if (body.commissionRate < 0 || body.commissionRate > 100) {
      return NextResponse.json(
        { error: "Taxa de comissão deve estar entre 0 e 100" },
        { status: 400 },
      );
    }
    patch.commissionRate = body.commissionRate;
  }

  if (body.proPrice != null) {
    if (body.proPrice < 0) {
      return NextResponse.json({ error: "Preço inválido" }, { status: 400 });
    }
    patch.proPrice = body.proPrice;
  }

  if (body.uploadLimitMb != null) {
    if (body.uploadLimitMb < 1 || body.uploadLimitMb > 500) {
      return NextResponse.json(
        { error: "Limite de upload deve estar entre 1 e 500 MB" },
        { status: 400 },
      );
    }
    patch.uploadLimitMb = body.uploadLimitMb;
  }

  const settings = await updateAdminSettings(patch);
  return NextResponse.json(settings);
}
