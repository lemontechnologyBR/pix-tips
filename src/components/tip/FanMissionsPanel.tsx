import type { CreatorFanMissionPublic } from "@/types";
import { formatCurrency } from "@/lib/format";

interface FanMissionsPanelProps {
  missions: CreatorFanMissionPublic[];
  themeColor: string;
  loggedIn?: boolean;
}

export function FanMissionsPanel({
  missions,
  themeColor,
  loggedIn = false,
}: FanMissionsPanelProps) {
  const active = missions.filter((m) => m.active);
  if (active.length === 0) return null;

  const earned = active.filter((m) => m.completed);

  return (
    <section
      id="fan-missions"
      className="scroll-mt-20 rounded-2xl border border-zinc-800/80 bg-zinc-950/50 p-4"
      style={{ borderColor: `${themeColor}33` }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
        Missões do fã
      </p>
      <p className="mt-1 text-xs text-zinc-400">
        {loggedIn
          ? "Progresso salvo na sua conta — tip normalmente e acompanhe as metas."
          : "Entre na conta (opcional) ou tip com o mesmo nome pra acumular progresso."}
      </p>

      {earned.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {earned.map((m) => (
            <span
              key={`badge-${m.id}`}
              className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-950"
              style={{ backgroundColor: themeColor }}
              title={m.title}
            >
              {m.rewardBadge}
            </span>
          ))}
        </div>
      )}

      <ul className="mt-3 space-y-2.5">
        {active.map((m) => {
          const progress = Math.min(m.progressValue ?? 0, m.targetValue);
          const pct = Math.min(100, Math.round((progress / m.targetValue) * 100));
          const goalLabel =
            m.type === "tip_total"
              ? formatCurrency(m.targetValue)
              : `${m.targetValue} tip${m.targetValue === 1 ? "" : "s"}`;
          return (
            <li
              key={m.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{m.title}</p>
                  {m.description ? (
                    <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{m.description}</p>
                  ) : null}
                </div>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-950"
                  style={{ backgroundColor: themeColor }}
                >
                  {m.rewardBadge}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-zinc-400">
                Meta: {goalLabel}
                {m.periodDays ? ` · a cada ${m.periodDays}d` : ""}
                {m.completed ? " · concluída" : ""}
              </p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${m.completed ? 100 : pct}%`,
                    backgroundColor: themeColor,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
