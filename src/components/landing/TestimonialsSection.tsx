import { TESTIMONIALS } from "@/lib/landing-data";

const PLATFORM_BADGE: Record<string, { label: string; className: string }> = {
  Twitch: {
    label: "Twitch",
    className: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
  },
  YouTube: {
    label: "YouTube",
    className: "bg-red-500/15 text-red-400 border border-red-500/20",
  },
  Kick: {
    label: "Kick",
    className: "bg-green-500/15 text-green-400 border border-green-500/20",
  },
};

export function TestimonialsSection() {
  return (
    <section className="border-t border-white/5 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Heading */}
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-500">
            Depoimentos
          </p>
          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            O que{" "}
            <span className="web3-text-gradient">streamers</span> estão dizendo
          </h2>
        </div>

        {/* 2×2 grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {TESTIMONIALS.map((t) => {
            const badge = PLATFORM_BADGE[t.platform] ?? {
              label: t.platform,
              className:
                "bg-zinc-700/40 text-zinc-400 border border-zinc-600/30",
            };
            return (
              <div
                key={t.handle}
                className="web3-glass group flex flex-col gap-4 rounded-2xl border border-white/5 p-6 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5"
              >
                {/* Quote mark */}
                <span
                  className="-mb-3 select-none font-serif text-5xl leading-none text-cyan-500"
                  aria-hidden="true"
                >
                  &ldquo;
                </span>

                <p className="flex-1 text-sm italic leading-relaxed text-zinc-300">
                  {t.quote}
                </p>

                {/* Stars */}
                <p className="text-base text-amber-400" aria-label={`${t.rating} estrelas`}>
                  {"★".repeat(t.rating)}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="h-11 w-11 rounded-full bg-zinc-800 ring-2 ring-cyan-500/30"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">
                      {t.name}
                    </p>
                    <p className="truncate text-xs text-zinc-500">{t.handle}</p>
                  </div>
                  <span
                    className={`ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
