import { AdminSettingsPanel } from "@/components/admin/AdminSettingsPanel";
import { getAdminPlatformStatus } from "@/lib/repositories/admin-platform-status";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const status = getAdminPlatformStatus();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Configurações</h2>
        <p className="text-sm text-zinc-400">
          Status operacional da plataforma: taxas, e-mail e integrações.
        </p>
      </div>
      <AdminSettingsPanel status={status} />
    </div>
  );
}
