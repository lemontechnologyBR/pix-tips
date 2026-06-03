import { AdminCreatorsTable } from "@/components/admin/AdminCreatorsTable";
import { listAllCreators } from "@/lib/repositories/admin-repository";

export default async function AdminCreatorsPage() {
  const creators = await listAllCreators();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Criadores</h2>
        <p className="text-sm text-zinc-400">
          Gerencie todos os criadores cadastrados na plataforma.
        </p>
      </div>
      <AdminCreatorsTable initialCreators={creators} />
    </div>
  );
}
