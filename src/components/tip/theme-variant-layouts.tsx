import type { Creator } from "@/types";
import { DonationForm } from "./DonationForm";
import { TipPageFooter } from "./TipPageFooter";
import { formatCurrency } from "@/lib/format";
import {
  hasCustomBackground,
  resolveTipPageBackground,
  resolveTipPageFontFamily,
} from "@/lib/tip-page-background";

interface DonationItem {
  id: string;
  donorName: string | null;
  amount: number;
  message: string;
  createdAt: string;
}

export interface VariantLayoutProps {
  creator: Creator;
  recentDonations: DonationItem[];
  variant: keyof typeof THEME_VARIANTS;
}

export const THEME_VARIANTS = {
  studio: {
    label: "AO VIVO",
    bg: "#0f172a",
    bgImage: "radial-gradient(circle at 20% 0%, rgba(239,68,68,.24), transparent 35%), linear-gradient(135deg, #0f172a, #020617)",
    accent: "#ef4444",
    card: "rgba(15,23,42,.84)",
    border: "rgba(248,113,113,.28)",
    text: "#f8fafc",
    muted: "#94a3b8",
  },
  ocean: {
    label: "ONDA DE APOIO",
    bg: "#082f49",
    bgImage: "radial-gradient(circle at 80% 0%, rgba(56,189,248,.35), transparent 38%), linear-gradient(180deg, #082f49, #020617)",
    accent: "#38bdf8",
    card: "rgba(8,47,73,.72)",
    border: "rgba(125,211,252,.25)",
    text: "#e0f2fe",
    muted: "#7dd3fc",
  },
  sakura: {
    label: "SWEET SUPPORT",
    bg: "#fff1f2",
    bgImage: "radial-gradient(circle at 20% 0%, rgba(251,113,133,.25), transparent 38%), linear-gradient(180deg, #fff1f2, #ffffff)",
    accent: "#fb7185",
    card: "rgba(255,255,255,.92)",
    border: "rgba(251,113,133,.28)",
    text: "#881337",
    muted: "#be123c",
  },
  matrix: {
    label: "SYSTEM TIP",
    bg: "#020617",
    bgImage: "linear-gradient(180deg, rgba(34,197,94,.12), transparent), repeating-linear-gradient(90deg, rgba(34,197,94,.08) 0 1px, transparent 1px 48px)",
    accent: "#22c55e",
    card: "rgba(3,19,10,.88)",
    border: "rgba(34,197,94,.32)",
    text: "#bbf7d0",
    muted: "#4ade80",
  },
  news: {
    label: "EDIÇÃO ESPECIAL",
    bg: "#f5f5f0",
    bgImage: "linear-gradient(180deg, #f5f5f0, #e7e5e4)",
    accent: "#111827",
    card: "rgba(255,255,255,.94)",
    border: "rgba(17,24,39,.24)",
    text: "#111827",
    muted: "#57534e",
  },
  comic: {
    label: "POW!",
    bg: "#fef3c7",
    bgImage: "radial-gradient(circle at 20% 20%, rgba(239,68,68,.22), transparent 20%), radial-gradient(circle at 80% 0%, rgba(59,130,246,.18), transparent 24%), #fef3c7",
    accent: "#ef4444",
    card: "#ffffff",
    border: "rgba(17,24,39,.85)",
    text: "#111827",
    muted: "#7c2d12",
  },
  forest: {
    label: "RAÍZES",
    bg: "#052e16",
    bgImage: "radial-gradient(circle at 25% 0%, rgba(132,204,22,.25), transparent 35%), linear-gradient(180deg, #052e16, #020617)",
    accent: "#84cc16",
    card: "rgba(20,83,45,.76)",
    border: "rgba(132,204,22,.28)",
    text: "#ecfccb",
    muted: "#bef264",
  },
  sunset: {
    label: "SUNSET LIVE",
    bg: "#431407",
    bgImage: "radial-gradient(circle at 50% 0%, rgba(251,146,60,.42), transparent 38%), linear-gradient(180deg, #7c2d12, #09090b)",
    accent: "#fb923c",
    card: "rgba(67,20,7,.82)",
    border: "rgba(251,146,60,.3)",
    text: "#ffedd5",
    muted: "#fdba74",
  },
  space: {
    label: "COSMIC TIP",
    bg: "#020617",
    bgImage: "radial-gradient(circle at 20% 15%, rgba(167,139,250,.35), transparent 28%), radial-gradient(circle at 80% 30%, rgba(34,211,238,.22), transparent 30%), #020617",
    accent: "#a78bfa",
    card: "rgba(17,24,39,.82)",
    border: "rgba(167,139,250,.28)",
    text: "#ede9fe",
    muted: "#c4b5fd",
  },
  street: {
    label: "STREET SUPPORT",
    bg: "#111827",
    bgImage: "linear-gradient(135deg, rgba(250,204,21,.18), transparent 35%), repeating-linear-gradient(-10deg, transparent 0 18px, rgba(255,255,255,.035) 18px 20px), #111827",
    accent: "#facc15",
    card: "rgba(31,41,55,.9)",
    border: "rgba(250,204,21,.32)",
    text: "#f9fafb",
    muted: "#fde68a",
  },
} as const;

function goalPercent(raised: number, goal: number) {
  return goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
}

function SupportersList({
  donations,
  accent,
  text,
  muted,
  max = 4,
}: {
  donations: DonationItem[];
  accent: string;
  text: string;
  muted: string;
  max?: number;
}) {
  if (donations.length === 0) return null;
  return (
    <ul className="space-y-2">
      {donations.slice(0, max).map((d) => (
        <li key={d.id} className="flex items-baseline justify-between border-b border-white/10 pb-2">
          <span className="text-sm" style={{ color: text }}>{d.donorName ?? "Anônimo"}</span>
          <span className="text-sm font-bold" style={{ color: accent }}>{formatCurrency(d.amount)}</span>
        </li>
      ))}
    </ul>
  );
}

export function ThemeVariantLayout({ creator, recentDonations, variant }: VariantLayoutProps) {
  const cfg = THEME_VARIANTS[variant];
  const s = creator.tipPageSettings;
  const accent = creator.themeColor || cfg.accent;
  const percent = goalPercent(creator.raised, creator.goal);
  const customBg = hasCustomBackground(s)
    ? resolveTipPageBackground(s, accent, s.darkMode !== false)
    : null;
  const font = variant === "matrix"
    ? '"Courier New", monospace'
    : resolveTipPageFontFamily(s.fontFamily);
  const baseStyle = customBg ?? { backgroundColor: cfg.bg, backgroundImage: cfg.bgImage };

  if (variant === "studio") {
    return (
      <main className="min-h-screen" style={{ ...baseStyle, fontFamily: font }}>
        <div className="flex items-center gap-2 border-b px-4 py-2" style={{ borderColor: cfg.border, background: "rgba(0,0,0,.4)" }}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: accent }} />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
          </span>
          <span className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>REC</span>
        </div>
        <div className="mx-auto grid max-w-5xl gap-0 lg:grid-cols-2">
          <section className="relative border-r p-8" style={{ borderColor: cfg.border }}>
            <div className="absolute inset-4 border-2 pointer-events-none" style={{ borderColor: accent + "40" }} />
            <div className="relative flex flex-col items-center gap-5 pt-6 text-center">
              <div className="rounded-full p-1" style={{ boxShadow: `0 0 0 2px ${accent}, 0 0 30px ${accent}40` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={creator.avatar} alt={creator.displayName} className="h-28 w-28 rounded-full object-cover" />
              </div>
              <h1 className="text-3xl font-black uppercase" style={{ color: cfg.text }}>{creator.displayName}</h1>
              <p className="text-sm" style={{ color: cfg.muted }}>{creator.bio}</p>
              {creator.goal > 0 && (
                <div className="w-full rounded-lg border p-4" style={{ borderColor: cfg.border, background: cfg.card }}>
                  <div className="mb-2 flex justify-between text-xs" style={{ color: cfg.muted }}>
                    <span>{s.goalTitle}</span>
                    <span>{formatCurrency(creator.raised)} / {formatCurrency(creator.goal)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-black/40">
                    <div className="h-full transition-all" style={{ width: `${percent}%`, backgroundColor: accent }} />
                  </div>
                </div>
              )}
              {s.showSupporterWall && <SupportersList donations={recentDonations} accent={accent} text={cfg.text} muted={cfg.muted} />}
            </div>
          </section>
          <section className="flex flex-col justify-center p-8">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.4em]" style={{ color: cfg.muted }}>Transmissão · Doação</p>
            <div className="rounded-xl border p-6" style={{ borderColor: cfg.border, background: cfg.card }}>
              <DonationForm creator={creator} layoutId="studio" />
            </div>
            <TipPageFooter layoutId="studio" className="mt-8" />
          </section>
        </div>
      </main>
    );
  }

  if (variant === "ocean") {
    return (
      <main className="relative min-h-screen overflow-hidden px-4 py-12" style={{ ...baseStyle, fontFamily: font }}>
        <svg className="pointer-events-none absolute bottom-0 left-0 w-full opacity-30" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 C300,120 600,0 900,60 C1050,90 1150,80 1200,60 L1200,120 L0,120 Z" fill={accent} fillOpacity="0.15" />
          <path d="M0,80 C400,40 700,100 1200,70 L1200,120 L0,120 Z" fill={accent} fillOpacity="0.1" />
        </svg>
        <div className="relative mx-auto max-w-lg">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full" style={{ background: `radial-gradient(circle, ${accent}30, transparent 70%)`, border: `2px solid ${accent}40` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={creator.avatar} alt={creator.displayName} className="h-24 w-24 rounded-full object-cover" />
            </div>
            <h1 className="mt-4 text-2xl font-bold" style={{ color: cfg.text }}>{creator.displayName}</h1>
            <p className="mt-2 text-sm" style={{ color: cfg.muted }}>{creator.bio}</p>
          </div>
          {creator.goal > 0 && (
            <div className="mb-6 rounded-[2rem] border p-5 backdrop-blur" style={{ borderColor: cfg.border, background: cfg.card }}>
              <p className="mb-2 text-xs" style={{ color: cfg.muted }}>{s.goalTitle}</p>
              <div className="h-3 overflow-hidden rounded-full" style={{ background: "rgba(0,0,0,.3)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, background: `linear-gradient(90deg, ${accent}, #0ea5e9)` }} />
              </div>
              <p className="mt-2 text-right text-xs font-semibold" style={{ color: cfg.text }}>{formatCurrency(creator.raised)} / {formatCurrency(creator.goal)}</p>
            </div>
          )}
          <div className="rounded-[2rem] border p-6 shadow-2xl backdrop-blur-xl" style={{ borderColor: cfg.border, background: cfg.card }}>
            <DonationForm creator={creator} layoutId="ocean" />
          </div>
          {s.showSupporterWall && recentDonations.length > 0 && (
            <div className="mt-6 rounded-[2rem] border p-5" style={{ borderColor: cfg.border, background: cfg.card }}>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: cfg.muted }}>Apoiadores</h2>
              <SupportersList donations={recentDonations} accent={accent} text={cfg.text} muted={cfg.muted} />
            </div>
          )}
          <TipPageFooter layoutId="ocean" className="mt-8" />
        </div>
      </main>
    );
  }

  if (variant === "sakura") {
    return (
      <main className="min-h-screen px-4 py-14" style={{ ...baseStyle, fontFamily: font }}>
        <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-40">
          {["🌸", "✿", "❀"].map((f, i) => (
            <span key={i} className="absolute text-2xl opacity-60" style={{ top: `${15 + i * 25}%`, left: `${10 + i * 30}%` }}>{f}</span>
          ))}
        </div>
        <div className="relative mx-auto max-w-md text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={creator.avatar} alt={creator.displayName} className="mx-auto h-24 w-24 rounded-full object-cover shadow-lg" style={{ border: `3px solid ${cfg.accent}50` }} />
          <h1 className="mt-5 text-3xl font-light" style={{ color: cfg.text }}>{creator.displayName}</h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: cfg.muted }}>{creator.bio}</p>
          {creator.goal > 0 && (
            <div className="mt-8 rounded-[2rem] p-5 shadow-sm" style={{ background: cfg.card, border: `1px solid ${cfg.border}` }}>
              <p className="text-xs" style={{ color: cfg.muted }}>{s.goalTitle}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ background: "#fecdd3" }}>
                <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: accent }} />
              </div>
            </div>
          )}
          <div className="mt-6 rounded-[2rem] p-6 shadow-md" style={{ background: cfg.card, border: `1px solid ${cfg.border}` }}>
            <DonationForm creator={creator} layoutId="sakura" />
          </div>
          {s.showSupporterWall && recentDonations.length > 0 && (
            <div className="mt-6 text-left">
              <SupportersList donations={recentDonations} accent={accent} text={cfg.text} muted={cfg.muted} />
            </div>
          )}
          <TipPageFooter layoutId="sakura" darkMode={false} className="mt-8" />
        </div>
      </main>
    );
  }

  if (variant === "matrix") {
    return (
      <main className="relative min-h-screen px-4 py-10 font-mono" style={{ ...baseStyle, fontFamily: font }}>
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,197,94,.03) 2px, rgba(34,197,94,.03) 4px)" }} />
        <div className="relative mx-auto max-w-2xl">
          <div className="mb-4 border p-3 text-xs" style={{ borderColor: accent, color: accent }}>
            <p>&gt; user.init(&quot;{creator.username}&quot;)</p>
            <p>&gt; status: ONLINE</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <div className="border p-5" style={{ borderColor: cfg.border, background: cfg.card }}>
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 overflow-hidden border" style={{ borderColor: accent }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={creator.avatar} alt={creator.displayName} className="h-full w-full object-cover grayscale" />
                </div>
                <div>
                  <h1 className="text-lg font-bold uppercase" style={{ color: cfg.text }}>{creator.displayName}</h1>
                  <p className="text-xs" style={{ color: cfg.muted }}>{creator.bio}</p>
                </div>
              </div>
              {creator.goal > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] uppercase" style={{ color: cfg.muted }}>[{s.goalTitle}]</p>
                  <div className="mt-1 h-2 border" style={{ borderColor: accent + "50", background: "#000" }}>
                    <div className="h-full" style={{ width: `${percent}%`, backgroundColor: accent }} />
                  </div>
                </div>
              )}
            </div>
            <div className="border p-5" style={{ borderColor: accent, background: "#000" }}>
              <p className="mb-4 text-[10px] uppercase tracking-widest" style={{ color: accent }}>// donate.execute()</p>
              <DonationForm creator={creator} layoutId="matrix" />
            </div>
          </div>
          {s.showSupporterWall && recentDonations.length > 0 && (
            <div className="mt-4 border p-4 text-xs" style={{ borderColor: cfg.border, color: cfg.muted }}>
              {recentDonations.slice(0, 4).map((d, i) => (
                <p key={d.id}>[{String(i + 1).padStart(2, "0")}] {d.donorName ?? "anon"} :: {formatCurrency(d.amount)}</p>
              ))}
            </div>
          )}
          <TipPageFooter layoutId="matrix" className="mt-6" />
        </div>
      </main>
    );
  }

  if (variant === "news") {
    const today = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
    return (
      <main className="min-h-screen px-4 py-10" style={{ ...baseStyle, fontFamily: font }}>
        <div className="mx-auto max-w-3xl border-4 border-gray-900 bg-white p-6 shadow-lg">
          <div className="border-b-4 border-gray-900 pb-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-500">{today}</p>
            <h1 className="mt-2 font-serif text-4xl font-black uppercase leading-none text-gray-900">{creator.displayName}</h1>
            <p className="mt-2 font-serif text-sm italic text-gray-600">{creator.bio}</p>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-[200px_1fr]">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={creator.avatar} alt={creator.displayName} className="w-full border-2 border-gray-900 object-cover grayscale" />
              {creator.goal > 0 && (
                <div className="mt-4 border-t-2 border-gray-900 pt-3">
                  <p className="text-xs font-bold uppercase">{s.goalTitle}</p>
                  <p className="font-serif text-lg font-bold">{formatCurrency(creator.raised)}</p>
                  <p className="text-xs text-gray-500">de {formatCurrency(creator.goal)}</p>
                </div>
              )}
            </div>
            <div>
              <h2 className="border-b-2 border-gray-900 pb-2 font-serif text-xl font-bold">Apoie esta edição</h2>
              <DonationForm creator={creator} layoutId="news" />
            </div>
          </div>
          {s.showSupporterWall && recentDonations.length > 0 && (
            <div className="mt-6 border-t-2 border-gray-900 pt-4">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Leitores que apoiaram</h3>
              <SupportersList donations={recentDonations} accent={cfg.accent} text={cfg.text} muted={cfg.muted} />
            </div>
          )}
          <TipPageFooter layoutId="news" darkMode={false} className="mt-6" />
        </div>
      </main>
    );
  }

  if (variant === "comic") {
    return (
      <main className="relative min-h-screen px-4 py-10" style={{ ...baseStyle, fontFamily: font }}>
        <div className="pointer-events-none absolute right-8 top-8 rotate-12 text-6xl font-black opacity-20" style={{ color: accent, WebkitTextStroke: "2px #111" }}>POW!</div>
        <div className="mx-auto max-w-lg">
          <div className="relative rounded-3xl border-4 border-gray-900 bg-white p-6 shadow-[8px_8px_0_#111]">
            <div className="flex items-start gap-4">
              <div className="shrink-0 overflow-hidden rounded-2xl border-4 border-gray-900 shadow-[4px_4px_0_#111]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={creator.avatar} alt={creator.displayName} className="h-24 w-24 object-cover" />
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase leading-tight" style={{ color: cfg.text }}>{creator.displayName}</h1>
                <p className="mt-1 text-sm font-bold" style={{ color: cfg.muted }}>{creator.bio}</p>
              </div>
            </div>
            {creator.goal > 0 && (
              <div className="mt-5 rounded-xl border-4 border-gray-900 p-3 shadow-[3px_3px_0_#111]">
                <div className="h-4 overflow-hidden rounded border-2 border-gray-900 bg-yellow-200">
                  <div className="h-full" style={{ width: `${percent}%`, backgroundColor: accent }} />
                </div>
              </div>
            )}
            <div className="mt-5">
              <DonationForm creator={creator} layoutId="comic" />
            </div>
          </div>
          {s.showSupporterWall && recentDonations.length > 0 && (
            <div className="mt-6 rounded-2xl border-4 border-gray-900 bg-white p-4 shadow-[5px_5px_0_#111]">
              <SupportersList donations={recentDonations} accent={accent} text={cfg.text} muted={cfg.muted} />
            </div>
          )}
          <TipPageFooter layoutId="comic" darkMode={false} className="mt-6" />
        </div>
      </main>
    );
  }

  if (variant === "forest") {
    return (
      <main className="min-h-screen px-4 py-12" style={{ ...baseStyle, fontFamily: font }}>
        <div className="mx-auto max-w-lg">
          <div className="text-center">
            <span className="text-2xl">🌿</span>
            <div className="relative mx-auto mt-6 h-32 w-32">
              <div className="absolute inset-0 rounded-full opacity-40" style={{ background: `radial-gradient(circle, ${accent}40, transparent 70%)` }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={creator.avatar} alt={creator.displayName} className="relative h-full w-full rounded-full object-cover" style={{ border: `3px solid ${accent}60` }} />
            </div>
            <h1 className="mt-4 text-2xl font-bold" style={{ color: cfg.text }}>{creator.displayName}</h1>
            <p className="mt-2 text-sm" style={{ color: cfg.muted }}>{creator.bio}</p>
          </div>
          {creator.goal > 0 && (
            <div className="mt-8 rounded-3xl border p-5" style={{ borderColor: cfg.border, background: cfg.card }}>
              <p className="mb-3 text-xs uppercase tracking-widest" style={{ color: cfg.muted }}>🌱 {s.goalTitle}</p>
              <div className="relative h-4 overflow-hidden rounded-full" style={{ background: "rgba(0,0,0,.3)" }}>
                <div className="absolute inset-y-0 left-0 rounded-full transition-all" style={{ width: `${percent}%`, background: `linear-gradient(90deg, #365314, ${accent})` }} />
              </div>
              <p className="mt-2 text-right text-xs" style={{ color: cfg.text }}>{formatCurrency(creator.raised)} / {formatCurrency(creator.goal)}</p>
            </div>
          )}
          <div className="mt-6 rounded-3xl border p-6" style={{ borderColor: cfg.border, background: cfg.card }}>
            <DonationForm creator={creator} layoutId="forest" />
          </div>
          {s.showSupporterWall && recentDonations.length > 0 && (
            <div className="mt-6 rounded-3xl border p-5" style={{ borderColor: cfg.border, background: cfg.card }}>
              <SupportersList donations={recentDonations} accent={accent} text={cfg.text} muted={cfg.muted} />
            </div>
          )}
          <TipPageFooter layoutId="forest" className="mt-8" />
        </div>
      </main>
    );
  }

  if (variant === "sunset") {
    return (
      <main className="relative min-h-screen" style={{ ...baseStyle, fontFamily: font }}>
        <div className="absolute inset-x-0 top-0 h-64" style={{ background: `linear-gradient(180deg, ${accent}60, transparent)` }} />
        <div className="absolute left-1/2 top-16 h-20 w-20 -translate-x-1/2 rounded-full opacity-80" style={{ background: `radial-gradient(circle, #fde68a, ${accent})`, boxShadow: `0 0 60px ${accent}` }} />
        <div className="relative mx-auto max-w-lg px-4 pb-12 pt-36">
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={creator.avatar} alt={creator.displayName} className="mx-auto h-24 w-24 rounded-full object-cover" style={{ boxShadow: `0 0 0 4px ${accent}60` }} />
            <h1 className="mt-4 text-3xl font-bold" style={{ color: cfg.text }}>{creator.displayName}</h1>
            <p className="mt-2 text-sm" style={{ color: cfg.muted }}>{creator.bio}</p>
          </div>
          {creator.goal > 0 && (
            <div className="mt-8 rounded-[2rem] border p-5 backdrop-blur" style={{ borderColor: cfg.border, background: cfg.card }}>
              <div className="relative mx-auto mb-3 h-2 w-full overflow-hidden rounded-full bg-black/30">
                <div className="h-full rounded-full" style={{ width: `${percent}%`, background: `linear-gradient(90deg, #f97316, #fde68a)` }} />
                <div className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-white shadow-lg transition-all" style={{ left: `calc(${percent}% - 8px)`, backgroundColor: accent }} />
              </div>
              <p className="text-center text-xs" style={{ color: cfg.muted }}>{s.goalTitle} · {formatCurrency(creator.raised)} / {formatCurrency(creator.goal)}</p>
            </div>
          )}
          <div className="mt-6 rounded-[2rem] border p-6" style={{ borderColor: cfg.border, background: cfg.card }}>
            <DonationForm creator={creator} layoutId="sunset" />
          </div>
          {s.showSupporterWall && recentDonations.length > 0 && (
            <div className="mt-6"><SupportersList donations={recentDonations} accent={accent} text={cfg.text} muted={cfg.muted} /></div>
          )}
          <TipPageFooter layoutId="sunset" className="mt-8" />
        </div>
      </main>
    );
  }

  if (variant === "space") {
    const stars = Array.from({ length: 40 }, (_, i) => ({
      top: `${(i * 17 + 3) % 100}%`,
      left: `${(i * 23 + 7) % 100}%`,
      size: i % 3 === 0 ? 2 : 1,
    }));
    return (
      <main className="relative min-h-screen overflow-hidden px-4 py-12" style={{ ...baseStyle, fontFamily: font }}>
        {stars.map((s, i) => (
          <div key={i} className="pointer-events-none absolute rounded-full bg-white" style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: 0.4 + (i % 5) * 0.1 }} />
        ))}
        <div className="relative mx-auto max-w-lg text-center">
          <div className="relative mx-auto h-40 w-40">
            <div className="absolute inset-0 animate-spin rounded-full border border-dashed opacity-30" style={{ borderColor: accent, animationDuration: "20s" }} />
            <div className="absolute inset-4 animate-spin rounded-full border opacity-20" style={{ borderColor: "#22d3ee", animationDuration: "12s", animationDirection: "reverse" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={creator.avatar} alt={creator.displayName} className="absolute inset-8 rounded-full object-cover" style={{ boxShadow: `0 0 30px ${accent}60` }} />
          </div>
          <h1 className="mt-6 text-2xl font-bold" style={{ color: cfg.text }}>{creator.displayName}</h1>
          <p className="mt-2 text-sm" style={{ color: cfg.muted }}>{creator.bio}</p>
          {creator.goal > 0 && (
            <div className="mt-8 rounded-[2rem] border p-4 backdrop-blur" style={{ borderColor: cfg.border, background: cfg.card }}>
              <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(0,0,0,.4)" }}>
                <div className="h-full rounded-full" style={{ width: `${percent}%`, background: `linear-gradient(90deg, ${accent}, #22d3ee)` }} />
              </div>
              <p className="mt-2 text-xs" style={{ color: cfg.muted }}>{s.goalTitle}</p>
            </div>
          )}
          <div className="mt-6 rounded-[2rem] border p-6 backdrop-blur-xl" style={{ borderColor: cfg.border, background: cfg.card }}>
            <DonationForm creator={creator} layoutId="space" />
          </div>
          {s.showSupporterWall && recentDonations.length > 0 && (
            <div className="mt-6"><SupportersList donations={recentDonations} accent={accent} text={cfg.text} muted={cfg.muted} /></div>
          )}
          <TipPageFooter layoutId="space" className="mt-8" />
        </div>
      </main>
    );
  }

  // street
  return (
    <main className="min-h-screen px-4 py-10" style={{ ...baseStyle, fontFamily: font }}>
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-0 lg:grid-cols-2">
          <section className="relative border-4 border-gray-900 p-6 lg:border-r-0" style={{ background: cfg.card }}>
            <div className="absolute right-4 top-4 h-16 w-16 rotate-12 border-4 border-dashed opacity-20" style={{ borderColor: accent }} />
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden border-4 border-gray-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={creator.avatar} alt={creator.displayName} className="h-full w-full object-cover" />
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase italic" style={{ color: cfg.text }}>{creator.displayName}</h1>
                <p className="text-sm font-bold" style={{ color: cfg.muted }}>{creator.bio}</p>
              </div>
            </div>
            {creator.goal > 0 && (
              <div className="mt-6 border-t-4 border-dashed pt-4" style={{ borderColor: accent + "50" }}>
                <div className="h-5 overflow-hidden border-2 border-gray-900" style={{ background: "#111" }}>
                  <div className="h-full" style={{ width: `${percent}%`, backgroundColor: accent }} />
                </div>
              </div>
            )}
            {s.showSupporterWall && <div className="mt-6"><SupportersList donations={recentDonations} accent={accent} text={cfg.text} muted={cfg.muted} /></div>}
          </section>
          <section className="border-4 border-gray-900 p-6" style={{ background: "#1f2937" }}>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.3em]" style={{ color: accent }}>Stick it · Donate</p>
            <DonationForm creator={creator} layoutId="street" />
          </section>
        </div>
        <TipPageFooter layoutId="street" className="mt-8" />
      </div>
    </main>
  );
}
