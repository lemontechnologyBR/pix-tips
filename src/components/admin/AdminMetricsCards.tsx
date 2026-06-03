import { formatCurrency } from "@/lib/format";
import type { AdminOverview } from "@/lib/repositories/admin-repository";

interface AdminMetricsCardsProps {
  overview: AdminOverview;
}

function ChangeBadge({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={`text-xs font-medium ${positive ? "text-emerald-400" : "text-red-400"}`}
    >
      {positive ? "↑" : "↓"} {Math.abs(value).toFixed(0)}%
    </span>
  );
}

export function AdminMetricsCards({ overview }: AdminMetricsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <p className="text-sm text-zinc-400">Total de criadores</p>
        <p className="mt-1 text-2xl font-bold">{overview.totalCreators}</p>
        <ChangeBadge value={overview.creatorsGrowth} />
        <p className="mt-1 text-xs text-zinc-500">vs. mês anterior</p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <p className="text-sm text-zinc-400">Volume de transações</p>
        <p className="mt-1 text-2xl font-bold text-emerald-400">
          {formatCurrency(overview.totalVolume)}
        </p>
        <p className="mt-1 text-xs text-zinc-500">Todas confirmadas</p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <p className="text-sm text-zinc-400">Assinantes Pro</p>
        <p className="mt-1 text-2xl font-bold text-cyan-400">
          {overview.proSubscribers}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {overview.totalCreators > 0
            ? `${((overview.proSubscribers / overview.totalCreators) * 100).toFixed(0)}% da base`
            : "Sem criadores ainda"}
        </p>
      </div>
    </div>
  );
}
