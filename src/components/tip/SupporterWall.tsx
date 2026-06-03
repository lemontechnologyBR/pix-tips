import { formatCurrency } from "@/lib/format";

interface DonationItem {
  id: string;
  donorName: string | null;
  amount: number;
  message: string;
  createdAt: string;
}

interface SupporterWallProps {
  donations: DonationItem[];
}

export function SupporterWall({ donations }: SupporterWallProps) {
  if (donations.length === 0) {
    return (
      <section className="w-full max-w-lg">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Apoiadores recentes
        </h2>
        <p className="rounded-xl border border-dashed border-zinc-800 py-8 text-center text-sm text-zinc-600">
          Seja o primeiro a apoiar!
        </p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-lg">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Apoiadores recentes
      </h2>
      <ul className="space-y-2">
        {donations.map((d) => (
          <li
            key={d.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium text-white">
                {d.donorName ?? "Anônimo"}
              </span>
              <span className="text-sm font-semibold text-emerald-400">
                {formatCurrency(d.amount)}
              </span>
            </div>
            {d.message && (
              <p className="mt-1 text-sm text-zinc-400">&ldquo;{d.message}&rdquo;</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
