import { AdminSubscriptionsTable } from "@/components/admin/AdminSubscriptionsTable";
import {
  getAdminSubscriptionsSummary,
  listAllSubscriptions,
} from "@/lib/repositories/admin-repository";
import { formatCurrency } from "@/lib/format";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assinaturas Pro",
};

export default async function AdminSubscriptionsPage() {
  const [summary, { items, total, page, totalPages }] = await Promise.all([
    getAdminSubscriptionsSummary(),
    listAllSubscriptions({ page: 1, limit: 20 }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Assinaturas Pro</h2>
        <p className="text-sm text-zinc-400">
          Receita do plano Pro, assinantes ativos e pagamentos de assinatura.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-400">Assinantes Pro ativos</p>
          <p className="mt-1 text-2xl font-bold text-white">{summary.activePro}</p>
          {summary.expiringIn7d > 0 && (
            <p className="mt-1 text-xs text-amber-400">
              {summary.expiringIn7d} expira(m) em até 7 dias
            </p>
          )}
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-400">Receita este mês</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {formatCurrency(summary.monthRevenue)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-400">Receita total (assinaturas)</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {formatCurrency(summary.paidRevenue)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-400">Pagamentos pendentes</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">
            {summary.pendingPayments}
          </p>
        </div>
      </div>

      <AdminSubscriptionsTable
        initialItems={items}
        initialTotal={total}
        initialPage={page}
        initialTotalPages={totalPages}
      />
    </div>
  );
}
