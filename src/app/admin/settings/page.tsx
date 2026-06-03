import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";
import { getAdminSettings } from "@/lib/repositories/admin-settings-repository";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Configurações globais</h2>
        <p className="text-sm text-zinc-400">
          Parâmetros da plataforma aplicados a todos os criadores.
        </p>
      </div>
      <AdminSettingsForm initialSettings={settings} />
    </div>
  );
}
