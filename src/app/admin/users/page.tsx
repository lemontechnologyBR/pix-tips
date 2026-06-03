import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { listAllUsers } from "@/lib/repositories/admin-repository";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Usuários",
};

export default async function AdminUsersPage() {
  const { items, total, page, totalPages } = await listAllUsers({ page: 1, limit: 20 });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Usuários</h2>
        <p className="text-sm text-zinc-400">
          Gerencie todos os usuários cadastrados na plataforma.
        </p>
      </div>
      <AdminUsersTable
        initialItems={items}
        initialTotal={total}
        initialPage={page}
        initialTotalPages={totalPages}
      />
    </div>
  );
}
