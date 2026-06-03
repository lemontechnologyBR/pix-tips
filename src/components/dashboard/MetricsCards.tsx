import { formatCurrency } from "@/lib/format";
import { OverviewIcon, type OverviewIconName } from "@/components/dashboard/OverviewIcon";
import type { DashboardOverview } from "@/types";

interface MetricsCardsProps {
  overview: DashboardOverview;
  goal: number;
  raised: number;
}

function ChangeBadge({ value }: { value: number }) {
  const positive = value >= 0;
  const flat = value === 0;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        flat
          ? "bg-zinc-800 text-zinc-500"
          : positive
            ? "bg-emerald-500/15 text-emerald-400"
            : "bg-red-500/15 text-red-400"
      }`}
    >
      {!flat && (
        <OverviewIcon
          name={positive ? "trend-up" : "trend-down"}
          className="h-3 w-3"
        />
      )}
      {flat ? "—" : `${Math.abs(value).toFixed(0)}% vs mês anterior`}
    </span>
  );
}

function MetricCard({
  icon,
  label,
  accent,
  children,
  footer,
}: {
  icon: OverviewIconName;
  label: string;
  accent: "emerald" | "violet" | "amber" | "pink";
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const accents = {
    emerald: {
      box: "border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-zinc-900/40",
      icon: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    },
    violet: {
      box: "border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-zinc-900/40",
      icon: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
    },
    amber: {
      box: "border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-zinc-900/40",
      icon: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    },
    pink: {
      box: "border-pink-500/20 bg-gradient-to-br from-pink-600/10 to-zinc-900/40",
      icon: "border-pink-500/30 bg-pink-500/10 text-pink-400",
    },
  };

  const style = accents[accent];

  return (
    <div className={`web3-card rounded-2xl border p-5 ${style.box}`}>
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${style.icon}`}
        >
          <OverviewIcon name={icon} className="h-5 w-5" />
        </div>
        {footer}
      </div>
      <p className="mt-4 text-sm text-zinc-400">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export function MetricsCards({ overview, goal, raised }: MetricsCardsProps) {
  const last = overview.lastDonation;
  const progress = Math.min(overview.goalProgress, 100);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon="wallet"
        label="Total arrecadado (mês)"
        accent="emerald"
        footer={<ChangeBadge value={overview.totalMonthChange} />}
      >
        <p className="text-2xl font-bold tracking-tight text-emerald-400">
          {formatCurrency(overview.totalMonth)}
        </p>
      </MetricCard>

      <MetricCard
        icon="users"
        label="Apoiadores (mês)"
        accent="violet"
        footer={<ChangeBadge value={overview.supportersChange} />}
      >
        <p className="text-2xl font-bold tracking-tight text-white">
          {overview.supportersMonth}
        </p>
      </MetricCard>

      <MetricCard icon="target" label="Progresso da meta" accent="amber">
        <p className="text-lg font-bold text-white">
          {formatCurrency(raised)}{" "}
          <span className="text-sm font-normal text-zinc-500">
            / {formatCurrency(goal)}
          </span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-cyan-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500">{progress.toFixed(0)}% concluído</p>
      </MetricCard>

      <MetricCard icon="heart" label="Última doação" accent="pink">
        {last ? (
          <>
            <p className="truncate text-lg font-bold text-white">
              {last.anonymous ? "Anônimo" : last.donorName}
            </p>
            <p className="mt-0.5 text-emerald-400">{formatCurrency(last.amount)}</p>
            {last.message && (
              <p className="mt-2 line-clamp-2 text-xs text-zinc-500">
                &ldquo;{last.message}&rdquo;
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-zinc-500">Nenhuma doação ainda</p>
        )}
      </MetricCard>
    </div>
  );
}
