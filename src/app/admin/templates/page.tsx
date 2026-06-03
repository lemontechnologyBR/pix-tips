import {
  AdminTemplatesManager,
  type AdminTemplateItem,
} from "@/components/admin/AdminTemplatesManager";
import { TEMPLATE_CATALOG } from "@/lib/alert-catalog";
import { resolveTemplatePlan } from "@/lib/repositories/admin-repository";
import { getAdminSettings } from "@/lib/repositories/admin-settings-repository";

export default async function AdminTemplatesPage() {
  const settings = await getAdminSettings();

  const templates: AdminTemplateItem[] = TEMPLATE_CATALOG.map((t) => {
    const effectivePlan = resolveTemplatePlan(
      t.id,
      t.plan,
      settings.templateOverrides,
    );
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      icon: t.icon,
      catalogPlan: t.plan,
      effectivePlan,
      hasOverride: t.id in settings.templateOverrides,
    };
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Templates de alerta</h2>
        <p className="text-sm text-zinc-400">
          Catálogo global — alterne entre Free e Pro para cada template.
        </p>
      </div>
      <AdminTemplatesManager initialTemplates={templates} />
    </div>
  );
}
