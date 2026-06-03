import { AdminPayoutsTable } from "@/components/admin/AdminPayoutsTable";
import { listAllPayouts } from "@/lib/repositories/admin-repository";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saques",
};

export default async function AdminPayoutsPage() {
  const { items, total, page, totalPages } = await listAllPayouts({ page: 1, limit: 20 });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Saques</h2>
        <p className="text-sm text-zinc-400">
          Modere saques pendentes e acompanhe o histórico de retiradas dos criadores.
        </p>
      </div>
      <AdminPayoutsTable
        initialItems={items}
        initialTotal={total}
        initialPage={page}
        initialTotalPages={totalPages}
      />
    </div>
  );
}
