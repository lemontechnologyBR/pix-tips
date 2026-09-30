import Link from "next/link";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { OverviewIcon } from "@/components/dashboard/OverviewIcon";
import type { Transaction } from "@/types";

interface RecentDonationsProps {
  donations: Transaction[];
}

const AVATAR_COLORS = [
  "bg-sky-400/12 text-sky-300 border-sky-400/30",
  "bg-sky-500/20 text-sky-300 border-sky-400/30",
  "bg-amber-600/20 text-amber-300 border-amber-500/30",
  "bg-pink-600/20 text-pink-300 border-pink-500/30",
  "bg-cyan-600/20 text-sky-300 border-sky-400/30",
];

function donorInitial(d: Transaction): string {
  if (d.anonymous) return "?";
  return d.donorName.charAt(0).toUpperCase();
}

export function RecentDonations({ donations }: RecentDonationsProps) {
  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/10 text-sky-300">
            <OverviewIcon name="heart" className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Doações recentes</h2>
            <p className="mt-0.5 text-sm text-zinc-500">Últimos apoios confirmados</p>
          </div>
        </div>
        <Link
          href="/dashboard/finance"
          className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-sky-400 transition hover:border-sky-400/30 hover:text-sky-300"
        >
          Ver todas →
        </Link>
      </div>

      {donations.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 py-12 text-center">
          <OverviewIcon name="heart" className="h-7 w-7 text-zinc-600" />
          <p className="mt-3 text-sm text-zinc-500">Nenhuma doação recebida ainda</p>
          <p className="mt-1 text-xs text-zinc-600">
            Assim que alguém apoiar, aparece aqui em tempo real.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-2">
          {donations.map((d, i) => (
            <li
              key={d.id}
              className="flex items-start gap-3 rounded-xl border border-zinc-800/60 bg-zinc-950/40 px-4 py-3 transition hover:border-zinc-700/80"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
              >
                {donorInitial(d)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-medium text-zinc-200">
                    {d.anonymous ? "Anônimo" : d.donorName}
                  </span>
                  <span className="shrink-0 font-semibold text-sky-400">
                    {formatCurrency(d.amount)}
                  </span>
                </div>
                {d.message ? (
                  <p className="mt-0.5 line-clamp-2 text-sm text-zinc-500">
                    {d.message}
                  </p>
                ) : (
                  <p className="mt-0.5 text-sm italic text-zinc-600">Sem mensagem</p>
                )}
                <p className="mt-1 text-xs text-zinc-600">
                  {formatRelativeTime(d.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
