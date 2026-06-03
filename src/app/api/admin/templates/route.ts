import { NextResponse } from "next/server";
import { TEMPLATE_CATALOG } from "@/lib/alert-catalog";
import {
  isAdminSessionError,
  requireAdminSession,
} from "@/lib/auth/require-admin";
import { resolveTemplatePlan } from "@/lib/repositories/admin-repository";
import {
  getAdminSettings,
  setTemplatePlanOverride,
} from "@/lib/repositories/admin-settings-repository";
import type { PlanType } from "@/types";

function buildTemplateList(overrides: Record<string, PlanType>) {
  return TEMPLATE_CATALOG.map((t) => {
    const effectivePlan = resolveTemplatePlan(t.id, t.plan, overrides);
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      icon: t.icon,
      catalogPlan: t.plan,
      effectivePlan,
      hasOverride: t.id in overrides,
    };
  });
}

export async function GET() {
  const session = await requireAdminSession();
  if (isAdminSessionError(session)) return session;

  const settings = await getAdminSettings();
  return NextResponse.json({
    templates: buildTemplateList(settings.templateOverrides),
  });
}

export async function PATCH(request: Request) {
  const session = await requireAdminSession();
  if (isAdminSessionError(session)) return session;

  const body = (await request.json()) as {
    templateId?: string;
    plan?: PlanType;
  };

  if (!body.templateId || (body.plan !== "free" && body.plan !== "pro")) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const catalogItem = TEMPLATE_CATALOG.find((t) => t.id === body.templateId);
  if (!catalogItem) {
    return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
  }

  const settings = await setTemplatePlanOverride(body.templateId, body.plan!);

  return NextResponse.json({
    templates: buildTemplateList(settings.templateOverrides),
  });
}
