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
          Lista contas ativas. Coluna &quot;Saldo legado&quot; = dinheiro antigo na pix.tips.
          Quem já migrou pra Woovi aparece R$ 0,00. Saldo &gt; 0 sem Pix ainda não foi pago.
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
