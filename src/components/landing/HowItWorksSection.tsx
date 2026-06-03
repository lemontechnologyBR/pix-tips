import { HOW_IT_WORKS } from "@/lib/landing-data";

const STEP_NUMBERS = ["01", "02", "03"];
const STEP_TIMES = ["~1 min", "~1 min", "Instantâneo"];

function LinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

function MegaphoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M3 11l19-9-9 19-2-8-8-2z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

const STEP_ICONS: Record<string, React.ReactNode> = {
  link: <LinkIcon />,
  share: <MegaphoneIcon />,
  star: <StarIcon />,
};

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="border-t border-cyan-500/10 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center animate-fade-in-up">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Como funciona?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-zinc-400">
            Configure em menos de 5 minutos
          </p>
        </div>

        {/* Steps grid with connector */}
        <div className="relative mt-16">
          {/* Desktop connector line — sits at the center of the icon circles */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[16.5%] top-[52px] hidden lg:block"
          >
            <div className="border-t border-dashed border-cyan-500/30" />
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {HOW_IT_WORKS.map((item, i) => (
              <div
                key={item.step}
                className="web3-glass rounded-2xl p-6 text-center transition-all duration-300 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10"
              >
                {/* Icon circle */}
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                  {STEP_ICONS[item.icon]}
                </div>

                {/* Step number */}
                <p className="mt-5 text-5xl font-black leading-none web3-text-gradient">
                  {STEP_NUMBERS[i]}
                </p>

                {/* Content */}
                <h3 className="mt-3 text-lg font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {item.description}
                </p>

                {/* Time badge */}
                <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  {STEP_TIMES[i]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
