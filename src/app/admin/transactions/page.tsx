import { AdminTransactionsTable } from "@/components/admin/AdminTransactionsTable";
import { getAllTransactions } from "@/lib/repositories/admin-repository";

export default async function AdminTransactionsPage() {
  const { items, total, page, totalPages } = await getAllTransactions({
    period: "30",
    page: 1,
    limit: 20,
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Transações</h2>
        <p className="text-sm text-zinc-400">
          Todas as transações da plataforma com filtros e exportação.
        </p>
      </div>
      <AdminTransactionsTable
        initialItems={items}
        initialTotal={total}
        initialPage={page}
        initialTotalPages={totalPages}
      />
    </div>
  );
}
