import { prisma } from "@/lib/db";
import { parseJson } from "@/lib/repositories/json-fields";
import type { PlanType } from "@/types";

export interface GlobalAdminSettings {
  commissionRate: number;
  proPrice: number;
  uploadLimitMb: number;
  templateOverrides: Record<string, PlanType>;
}

const DEFAULTS: GlobalAdminSettings = {
  commissionRate: 3,
  proPrice: 29.9,
  uploadLimitMb: 10,
  templateOverrides: {},
};

export async function getAdminSettings(): Promise<GlobalAdminSettings> {
  const row = await prisma.adminSettings.findUnique({ where: { id: "global" } });
  if (!row) {
    return { ...DEFAULTS };
  }
  return {
    commissionRate: row.commissionRate,
    proPrice: row.proPrice,
    uploadLimitMb: row.uploadLimitMb,
    templateOverrides: parseJson<Record<string, PlanType>>(
      row.templateOverrides,
      {},
    ),
  };
}

export async function updateAdminSettings(
  patch: Partial<GlobalAdminSettings>,
): Promise<GlobalAdminSettings> {
  const current = await getAdminSettings();
  const next: GlobalAdminSettings = {
    commissionRate: patch.commissionRate ?? current.commissionRate,
    proPrice: patch.proPrice ?? current.proPrice,
    uploadLimitMb: patch.uploadLimitMb ?? current.uploadLimitMb,
    templateOverrides: patch.templateOverrides ?? current.templateOverrides,
  };

  await prisma.adminSettings.upsert({
    where: { id: "global" },
    create: {
      id: "global",
      commissionRate: next.commissionRate,
      proPrice: next.proPrice,
      uploadLimitMb: next.uploadLimitMb,
      templateOverrides: JSON.stringify(next.templateOverrides),
    },
    update: {
      commissionRate: next.commissionRate,
      proPrice: next.proPrice,
      uploadLimitMb: next.uploadLimitMb,
      templateOverrides: JSON.stringify(next.templateOverrides),
    },
  });

  return next;
}

export async function setTemplatePlanOverride(
  templateId: string,
  plan: PlanType,
): Promise<GlobalAdminSettings> {
  const settings = await getAdminSettings();
  const overrides = { ...settings.templateOverrides, [templateId]: plan };
  return updateAdminSettings({ templateOverrides: overrides });
}
