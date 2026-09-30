import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { listAllUsers } from "@/lib/repositories/admin-repository";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Usuários",
};

export default async function AdminUsersPage() {
  const { items, total, page, totalPages } = await listAllUsers({
    page: 1,
    limit: 20,
    status: "active",
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Usuários</h2>
        <p className="text-sm text-zinc-400">
          Por padrão lista só contas ativas. Contas sem doação foram suspensas na limpeza.
        </p>
      </div>
      <AdminUsersTable
        initialItems={items}
        initialTotal={total}
        initialPage={page}
        initialTotalPages={totalPages}
        initialStatus="active"
      />
    </div>
  );
}
