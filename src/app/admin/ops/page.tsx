import { AdminOpsPanel } from "@/components/admin/AdminOpsPanel";
import { getAdminOpsSnapshot } from "@/lib/repositories/admin-ops-repository";

export const dynamic = "force-dynamic";

export default async function AdminOpsPage() {
  const snapshot = await getAdminOpsSnapshot();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Operações</h2>
        <p className="text-sm text-zinc-400">
          Woovi, KYC/CPF, carteiras dos criadores e tracks de tip page / widgets.
        </p>
      </div>
      <AdminOpsPanel initial={structuredClone(snapshot)} />
    </div>
  );
}
