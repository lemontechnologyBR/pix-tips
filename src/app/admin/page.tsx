import { AdminGrowthChart } from "@/components/admin/AdminGrowthChart";
import { AdminMetricsCards } from "@/components/admin/AdminMetricsCards";
import { getAdminOverview } from "@/lib/repositories/admin-repository";

export default async function AdminDashboardPage() {
  const overview = await getAdminOverview();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Visão geral da plataforma</h2>
        <p className="text-sm text-zinc-400">
          Métricas consolidadas de criadores e transações.
        </p>
      </div>
      <AdminMetricsCards overview={overview} />
      <AdminGrowthChart data={overview.chartData} />
    </div>
  );
}
