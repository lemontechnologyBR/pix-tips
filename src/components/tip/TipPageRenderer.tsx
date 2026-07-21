import type { Creator } from "@/types";
import { DEMO_USERNAME } from "@/lib/demo";
import { DonationForm } from "./DonationForm";
import { GoalProgressBar } from "./GoalProgressBar";
import { SupporterWall } from "./SupporterWall";
import { TipPageFooter } from "./TipPageFooter";
import { ThemeVariantLayout } from "./theme-variant-layouts";
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

interface TipPageRendererProps {
  creator: Creator;
  recentDonations: DonationItem[];
}

// ─────────────────────────────────────────────────────────────
// Shared helper: avatar ring
// ─────────────────────────────────────────────────────────────
function Avatar({
  src,
  alt,
  size = "md",
  themeColor,
  className = "",
}: {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  themeColor: string;
  className?: string;
}) {
  const sizeClass = { sm: "h-16 w-16", md: "h-24 w-24", lg: "h-28 w-28", xl: "h-32 w-32" }[size];
  return (
    <div
      className={`overflow-hidden rounded-full ${sizeClass} ${className}`}
      style={{ boxShadow: `0 0 0 3px ${themeColor}60, 0 0 0 6px ${themeColor}20` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. DEFAULT
// ─────────────────────────────────────────────────────────────
function DefaultLayout({ creator, recentDonations }: TipPageRendererProps) {
  const s = creator.tipPageSettings;
  const tc = creator.themeColor;
  const bg = resolveTipPageBackground(s, tc, s.darkMode !== false);
  const font = resolveTipPageFontFamily(s.fontFamily);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10" style={{ ...bg, fontFamily: font }}>
      <div className="mx-auto w-full max-w-lg">
        <header className="relative flex items-center gap-5 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur">
          <div className="absolute left-0 top-0 h-full w-1.5" style={{ backgroundColor: tc }} />
          <Avatar src={creator.avatar} alt={creator.displayName} size="md" themeColor={tc} className="ml-2 shrink-0" />
          <div className="min-w-0 text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">Criador</p>
            <h1 className="truncate text-xl font-bold text-white">{creator.displayName}</h1>
            <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{creator.bio}</p>
          </div>
        </header>

        <div className="mt-6 flex flex-col gap-6">
          <GoalProgressBar raised={creator.raised} goal={creator.goal} themeColor={tc} goalTitle={s.goalTitle} />

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur" style={{ borderTopColor: tc + "60", borderTopWidth: 2 }}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">Enviar doação</p>
            <DonationForm creator={creator} layoutId="default" />
          </div>

          {s.showSupporterWall && <SupporterWall donations={recentDonations} />}
          <TipPageFooter layoutId="default" />
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. GLASS
// ─────────────────────────────────────────────────────────────
function GlassLayout({ creator, recentDonations }: TipPageRendererProps) {
  const font = resolveTipPageFontFamily(creator.tipPageSettings.fontFamily);
  const tc = creator.themeColor;
  const s = creator.tipPageSettings;

  const customBg = hasCustomBackground(s)
    ? resolveTipPageBackground(s, tc, s.darkMode !== false)
    : null;
  const bgStyle = customBg
    ? { ...customBg, fontFamily: font }
    : {
        backgroundColor: "#0a0015",
        backgroundImage: `radial-gradient(ellipse 80% 60% at 20% 0%, ${tc}55 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, #818cf855 0%, transparent 60%)`,
        fontFamily: font,
      };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10" style={bgStyle}>
      <div className="pointer-events-none absolute -right-20 top-20 h-64 w-64 rounded-full opacity-30 blur-3xl" style={{ background: tc }} />
      <div className="pointer-events-none absolute -left-16 bottom-32 h-48 w-48 rounded-full opacity-20 blur-3xl" style={{ background: "#818cf8" }} />

      <div className="relative mx-auto flex w-full max-w-lg flex-col gap-5">
        {/* Header glass card — offset prism */}
        <div className="relative w-full">
          <div className="absolute -right-2 -top-2 h-full w-full rounded-3xl border border-white/5 bg-white/[0.02]" />
          <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl" style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 0 40px ${tc}15` }}>
            <div className="mx-auto inline-block rounded-full p-1" style={{ background: `linear-gradient(135deg, ${tc}40, #818cf840)` }}>
              <Avatar src={creator.avatar} alt={creator.displayName} size="lg" themeColor={tc} className="mx-auto" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white drop-shadow">{creator.displayName}</h1>
            <p className="mt-1 text-sm text-white/60">{creator.bio}</p>
          </div>
        </div>

        {creator.goal > 0 && (
          <div className="ml-4 w-[calc(100%-1rem)] rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-white/60">{s.goalTitle}</span>
              <span className="font-semibold text-white">{formatCurrency(creator.raised)} / {formatCurrency(creator.goal)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((creator.raised / creator.goal) * 100, 100)}%`, background: `linear-gradient(90deg, ${tc}, #a78bfa)` }} />
            </div>
          </div>
        )}

        <div className="-ml-2 w-[calc(100%+0.5rem)] rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
          <DonationForm creator={creator} layoutId="glass" />
        </div>

        {s.showSupporterWall && recentDonations.length > 0 && (
          <div className="ml-6 w-[calc(100%-1.5rem)] rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Apoiadores recentes</h2>
            <ul className="space-y-2">
              {recentDonations.map((d) => (
                <li key={d.id} className="flex items-baseline justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                  <span className="font-medium text-white">{d.donorName ?? "Anônimo"}</span>
                  <span className="text-sm font-semibold" style={{ color: tc }}>{formatCurrency(d.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <TipPageFooter layoutId="glass" />
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. NEON
// ─────────────────────────────────────────────────────────────
function NeonLayout({ creator, recentDonations }: TipPageRendererProps) {
  const font = resolveTipPageFontFamily(creator.tipPageSettings.fontFamily);
  const tc = creator.themeColor;
  const s = creator.tipPageSettings;
  const customBg = hasCustomBackground(s)
    ? resolveTipPageBackground(s, tc, s.darkMode !== false)
    : null;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10" style={{ ...(customBg ?? { backgroundColor: "#050505", backgroundImage: `linear-gradient(${tc}08 1px, transparent 1px), linear-gradient(90deg, ${tc}08 1px, transparent 1px)`, backgroundSize: "40px 40px" }), fontFamily: font }}>
      <style>{`
        .neon-glow { box-shadow: 0 0 12px ${tc}80, 0 0 40px ${tc}30; }
        .neon-text { text-shadow: 0 0 10px ${tc}cc, 0 0 30px ${tc}80; }
        .neon-border { border-color: ${tc}60; box-shadow: 0 0 8px ${tc}40, inset 0 0 8px ${tc}10; }
        .neon-progress { background: linear-gradient(90deg, ${tc}, #a855f7); box-shadow: 0 0 8px ${tc}80; }
        .neon-scanline { background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.15) 2px, rgba(0,0,0,.15) 4px); }
      `}</style>
      <div className="neon-scanline pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative mx-auto flex w-full max-w-lg flex-col items-center gap-6">
        <header className="relative flex w-full flex-col items-center gap-3 text-center">
          <span className="absolute -left-1 top-1/2 -translate-y-1/2 font-mono text-2xl opacity-30" style={{ color: tc }}>[</span>
          <span className="absolute -right-1 top-1/2 -translate-y-1/2 font-mono text-2xl opacity-30" style={{ color: tc }}>]</span>
          <div className="neon-glow rounded-full" style={{ padding: 3 }}>
            <Avatar src={creator.avatar} alt={creator.displayName} size="lg" themeColor={tc} />
          </div>
          <h1 className="neon-text text-3xl font-black tracking-tight text-white">{creator.displayName}</h1>
          <p className="text-sm text-zinc-500">{creator.bio}</p>
        </header>

        {creator.goal > 0 && (
          <div className="neon-border w-full rounded-2xl border bg-zinc-950 px-5 py-4">
            <div className="mb-2 flex justify-between text-xs font-mono">
              <span style={{ color: tc }}>{s.goalTitle.toUpperCase()}</span>
              <span className="text-white">{formatCurrency(creator.raised)} / {formatCurrency(creator.goal)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
              <div className="neon-progress h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((creator.raised / creator.goal) * 100, 100)}%` }} />
            </div>
          </div>
        )}

        <div className="neon-border w-full rounded-2xl border bg-zinc-950 p-6">
          <DonationForm creator={creator} layoutId="neon" />
        </div>

        {s.showSupporterWall && recentDonations.length > 0 && (
          <div className="w-full">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-widest" style={{ color: tc }}>
              &gt; Apoiadores recentes
            </h2>
            <ul className="space-y-2">
              {recentDonations.map((d) => (
                <li key={d.id} className="neon-border flex items-baseline justify-between rounded-xl border bg-zinc-950 px-4 py-3">
                  <span className="font-mono text-sm text-white">{d.donorName ?? "Anônimo"}</span>
                  <span className="font-mono text-sm font-bold" style={{ color: tc }}>{formatCurrency(d.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <TipPageFooter layoutId="neon" />
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. MINIMAL
// ─────────────────────────────────────────────────────────────
function MinimalLayout({ creator, recentDonations }: TipPageRendererProps) {
  const font = resolveTipPageFontFamily(creator.tipPageSettings.fontFamily);
  const tc = creator.themeColor;
  const s = creator.tipPageSettings;
  const isDark = s.darkMode !== false;

  const textPrimary = isDark ? "#ffffff" : "#111827";
  const textSecondary = isDark ? "#6b7280" : "#9ca3af";
  const bgColor = isDark ? "#09090b" : "#fafafa";
  const dividerColor = isDark ? "#27272a" : "#e5e7eb";
  const customBg = hasCustomBackground(s)
    ? resolveTipPageBackground(s, tc, isDark)
    : null;

  return (
    <main className="flex min-h-screen flex-col justify-center px-6 py-16 sm:px-12" style={{ ...(customBg ?? { backgroundColor: bgColor }), fontFamily: font }}>
      <div className="mx-auto flex w-full max-w-md flex-col gap-10">
        <header className="text-left">
          <div className="mb-6 flex items-center gap-4">
            <div className="overflow-hidden rounded-full h-16 w-16 shrink-0" style={{ outline: `2px solid ${tc}`, outlineOffset: 3 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={creator.avatar} alt={creator.displayName} className="h-full w-full object-cover" />
            </div>
            <p className="text-[10px] font-medium uppercase tracking-[0.35em]" style={{ color: textSecondary }}>Apoie</p>
          </div>
          <h1 className="text-4xl font-light tracking-tight sm:text-5xl" style={{ color: textPrimary }}>{creator.displayName}</h1>
          <p className="mt-4 max-w-sm text-base leading-relaxed" style={{ color: textSecondary }}>{creator.bio}</p>
        </header>

        <div className="h-px w-full" style={{ backgroundColor: dividerColor }} />

        {creator.goal > 0 && (
          <>
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm" style={{ color: textSecondary }}>
                <span>{s.goalTitle}</span>
                <span style={{ color: textPrimary }}>{formatCurrency(creator.raised)} / {formatCurrency(creator.goal)}</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full" style={{ backgroundColor: dividerColor }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((creator.raised / creator.goal) * 100, 100)}%`, backgroundColor: tc }} />
              </div>
            </div>
            <div className="h-px w-full" style={{ backgroundColor: dividerColor }} />
          </>
        )}

        <div className="w-full">
          <DonationForm creator={creator} layoutId="minimal" />
        </div>

        {s.showSupporterWall && recentDonations.length > 0 && (
          <>
            <div className="h-px w-full" style={{ backgroundColor: dividerColor }} />
            <div className="w-full">
              <h2 className="mb-4 text-xs font-medium uppercase tracking-widest" style={{ color: textSecondary }}>Apoiadores recentes</h2>
              <ul className="divide-y" style={{ borderColor: dividerColor }}>
                {recentDonations.map((d) => (
                  <li key={d.id} className="flex items-baseline justify-between py-3">
                    <div>
                      <span className="text-sm font-medium" style={{ color: textPrimary }}>{d.donorName ?? "Anônimo"}</span>
                      {d.message && <p className="mt-0.5 text-xs" style={{ color: textSecondary }}>{d.message}</p>}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: tc }}>{formatCurrency(d.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
        <TipPageFooter layoutId="minimal" darkMode={isDark} />
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. RETRO
// ─────────────────────────────────────────────────────────────
function RetroLayout({ creator, recentDonations }: TipPageRendererProps) {
  const tc = creator.themeColor;
  const s = creator.tipPageSettings;
  const customBg = hasCustomBackground(s)
    ? resolveTipPageBackground(s, tc, s.darkMode !== false)
    : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10" style={{ ...(customBg ?? { backgroundColor: "#0d0d0d" }), fontFamily: '"Courier New", Courier, monospace' }}>
      <style>{`
        .retro-box { border: 2px solid ${tc}; box-shadow: 4px 4px 0 ${tc}; }
        .retro-title { text-shadow: 2px 2px 0 ${tc}60; }
        .retro-avatar { image-rendering: pixelated; }
      `}</style>

      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6">
        {/* Header */}
        <div className="retro-box w-full p-5" style={{ backgroundColor: "#1a1a1a" }}>
          <div className="flex items-center gap-4">
            <div className="retro-box h-20 w-20 shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={creator.avatar} alt={creator.displayName} className="retro-avatar h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: tc }}>{'> PLAYER:'}</p>
              <h1 className="retro-title text-xl font-bold text-white uppercase">{creator.displayName}</h1>
              <p className="mt-1 text-xs text-zinc-500">{creator.bio}</p>
            </div>
          </div>
        </div>

        {/* HP Bar style goal */}
        {creator.goal > 0 && (
          <div className="retro-box w-full px-4 py-3" style={{ backgroundColor: "#1a1a1a" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase" style={{ color: tc }}>{'[META]'} {s.goalTitle}</span>
              <span className="text-xs text-white">{formatCurrency(creator.raised)} / {formatCurrency(creator.goal)}</span>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 20 }).map((_, i) => {
                const filled = i < Math.round((creator.raised / creator.goal) * 20);
                return <div key={i} className="h-4 flex-1" style={{ backgroundColor: filled ? tc : "#27272a" }} />;
              })}
            </div>
          </div>
        )}

        <div className="retro-box w-full p-5" style={{ backgroundColor: "#1a1a1a" }}>
          <div className="mb-3 text-xs font-bold uppercase" style={{ color: tc }}>{'> INSERT COIN'}</div>
          <DonationForm creator={creator} layoutId="retro" />
        </div>

        {s.showSupporterWall && recentDonations.length > 0 && (
          <div className="retro-box w-full p-4" style={{ backgroundColor: "#1a1a1a" }}>
            <h2 className="mb-3 text-xs font-bold uppercase" style={{ color: tc }}>{'// HIGH SCORES //'}</h2>
            <ul className="space-y-1">
              {recentDonations.map((d, i) => (
                <li key={d.id} className="flex items-baseline justify-between py-1 border-b border-dashed border-zinc-800">
                  <span className="text-xs text-zinc-400">{String(i + 1).padStart(2, "0")} &gt; {d.donorName ?? "ANON"}</span>
                  <span className="text-xs font-bold" style={{ color: tc }}>{formatCurrency(d.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <TipPageFooter layoutId="retro" className="text-center" />
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. SPLIT
// ─────────────────────────────────────────────────────────────
function SplitLayout({ creator, recentDonations }: TipPageRendererProps) {
  const font = resolveTipPageFontFamily(creator.tipPageSettings.fontFamily);
  const tc = creator.themeColor;
  const s = creator.tipPageSettings;
  const customBg = hasCustomBackground(s)
    ? resolveTipPageBackground(s, tc, s.darkMode !== false)
    : null;

  return (
    <main className="min-h-screen" style={{ ...(customBg ?? { backgroundColor: "#0f172a" }), fontFamily: font }}>
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-2" style={{ background: `linear-gradient(90deg, ${tc}15, transparent)` }}>
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Perfil</span>
        <span className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase" style={{ backgroundColor: tc + "25", color: tc }}>Doar agora →</span>
      </div>
      <div className="mx-auto max-w-5xl min-h-[calc(100vh-40px)] grid grid-cols-1 lg:grid-cols-[380px_1fr]">
        {/* Left sidebar */}
        <aside className="flex flex-col items-center gap-6 border-r border-white/5 px-8 py-12 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto" style={{ background: `linear-gradient(180deg, ${tc}10, transparent 60%)` }}>
          <Avatar src={creator.avatar} alt={creator.displayName} size="xl" themeColor={tc} />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">{creator.displayName}</h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{creator.bio}</p>
          </div>

          {creator.goal > 0 && (
            <div className="w-full rounded-2xl bg-white/5 p-4">
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-zinc-400">{s.goalTitle}</span>
                <span className="font-medium text-white">{formatCurrency(creator.raised)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((creator.raised / creator.goal) * 100, 100)}%`, backgroundColor: tc }} />
              </div>
              <p className="mt-1.5 text-right text-xs text-zinc-500">Meta: {formatCurrency(creator.goal)}</p>
            </div>
          )}

          {s.showSupporterWall && recentDonations.length > 0 && (
            <div className="w-full">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Apoiadores</h2>
              <ul className="space-y-2">
                {recentDonations.slice(0, 5).map((d) => (
                  <li key={d.id} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: tc + "40" }}>
                      {(d.donorName ?? "?")[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-white">{d.donorName ?? "Anônimo"}</p>
                      <p className="text-xs font-semibold" style={{ color: tc }}>{formatCurrency(d.amount)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-auto">
            <TipPageFooter layoutId="split" />
          </div>
        </aside>

        {/* Right form area */}
        <div className="relative flex flex-col items-center justify-center px-8 py-12">
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: `repeating-linear-gradient(90deg, ${tc}10 0 1px, transparent 1px 60px)` }} />
          <div className="relative w-full max-w-md">
            <div className="mb-8 border-l-4 pl-5" style={{ borderColor: tc }}>
              <h2 className="text-2xl font-bold text-white">Fazer uma doação</h2>
              <p className="mt-1 text-sm text-zinc-400">Apoie o trabalho de {creator.displayName}</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/4 p-6 shadow-2xl backdrop-blur">
              <DonationForm creator={creator} layoutId="split" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. BANNER
// ─────────────────────────────────────────────────────────────
function BannerLayout({ creator, recentDonations }: TipPageRendererProps) {
  const font = resolveTipPageFontFamily(creator.tipPageSettings.fontFamily);
  const tc = creator.themeColor;
  const s = creator.tipPageSettings;
  const bg = resolveTipPageBackground(s, tc, s.darkMode !== false);

  const percent = creator.goal > 0 ? Math.min((creator.raised / creator.goal) * 100, 100) : 0;

  return (
    <main className="min-h-screen" style={{ ...bg, fontFamily: font }}>
      <div className="relative h-56 w-full overflow-hidden sm:h-64" style={{ background: `linear-gradient(135deg, ${tc}ee 0%, ${tc}66 45%, #09090b 100%)` }}>
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `radial-gradient(circle at 30% 50%, white 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-3">
          {creator.goal > 0 && (
            <div className="rounded-full border border-white/20 bg-black/30 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur">
              Meta {Math.round(percent)}%
            </div>
          )}
          <div className="rounded-full border border-white/20 bg-black/30 px-4 py-1.5 text-xs text-white/80 backdrop-blur">
            {recentDonations.length} apoios recentes
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4">
        <div className="relative -mt-16 rounded-2xl border border-zinc-800 bg-zinc-950/90 p-5 shadow-2xl backdrop-blur">
          <div className="flex items-start gap-4">
            <div className="shrink-0 overflow-hidden rounded-2xl border-4 border-zinc-900 h-24 w-24 sm:h-28 sm:w-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={creator.avatar} alt={creator.displayName} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 pt-2">
              <h1 className="text-xl font-bold text-white sm:text-2xl">{creator.displayName}</h1>
              <p className="mt-1 text-sm text-zinc-400">{creator.bio}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-5 pb-10">
          {creator.goal > 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
              <GoalProgressBar raised={creator.raised} goal={creator.goal} themeColor={tc} goalTitle={s.goalTitle} />
            </div>
          )}

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur">
            <DonationForm creator={creator} layoutId="banner" />
          </div>

          {s.showSupporterWall && <SupporterWall donations={recentDonations} />}
          <TipPageFooter layoutId="banner" />
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// 8. VIP
// ─────────────────────────────────────────────────────────────
function VipLayout({ creator, recentDonations }: TipPageRendererProps) {
  const font = resolveTipPageFontFamily(creator.tipPageSettings.fontFamily);
  const s = creator.tipPageSettings;
  const goldLight = creator.themeColor || "#fbbf24";
  const gold = creator.themeColor || "#d97706";
  const customBg = hasCustomBackground(s)
    ? resolveTipPageBackground(s, gold, s.darkMode !== false)
    : null;

  const percent = creator.goal > 0 ? Math.min((creator.raised / creator.goal) * 100, 100) : 0;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12" style={{ ...(customBg ?? { backgroundColor: "#0a0500", backgroundImage: `radial-gradient(ellipse at top, #2a1200, #0a0500 60%)` }), fontFamily: font }}>
      <style>{`
        .vip-ticket { background: linear-gradient(135deg, #1c1004, #120a00); border: 1px solid ${gold}40; box-shadow: 0 0 30px ${gold}10, inset 0 1px 0 ${gold}20; }
        .vip-divider { background: linear-gradient(90deg, transparent, ${gold}60, transparent); height: 1px; }
        .vip-text-gold { color: ${goldLight}; }
        .vip-progress { background: linear-gradient(90deg, ${gold}, ${goldLight}); box-shadow: 0 0 8px ${gold}80; }
        .vip-notch { background: radial-gradient(circle at 0 50%, transparent 8px, ${gold}40 8px); }
      `}</style>

      <div className="mx-auto w-full max-w-2xl">
        <div className="vip-ticket relative overflow-hidden rounded-2xl">
          <div className="absolute left-1/2 top-0 bottom-0 w-px border-l border-dashed opacity-30" style={{ borderColor: gold }} />
          <div className="grid md:grid-cols-2">
            <div className="p-6 text-center md:text-left">
              <div className="mx-auto h-20 w-20 overflow-hidden rounded-full md:mx-0" style={{ border: `2px solid ${gold}`, boxShadow: `0 0 20px ${gold}40` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={creator.avatar} alt={creator.displayName} className="h-full w-full object-cover" />
              </div>
              <h1 className="mt-4 text-2xl font-bold vip-text-gold">{creator.displayName}</h1>
              <p className="mt-2 text-sm text-amber-200/50">{creator.bio}</p>
              {creator.goal > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-amber-700/70">{s.goalTitle}</p>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-amber-950/60">
                    <div className="vip-progress h-full rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-dashed p-6 md:border-t-0 md:border-l" style={{ borderColor: gold + "30" }}>
              <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest vip-text-gold">Apoie</p>
              <DonationForm creator={creator} layoutId="vip" />
            </div>
          </div>
        </div>

        {s.showSupporterWall && recentDonations.length > 0 && (
          <div className="vip-ticket mt-6 rounded-2xl p-5">
            <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-widest vip-text-gold">— Membros VIP —</h2>
            <ul className="space-y-2">
              {recentDonations.map((d) => (
                <li key={d.id} className="flex items-baseline justify-between border-b border-amber-900/20 pb-2">
                  <span className="text-sm text-amber-200/70">{d.donorName ?? "Anônimo"}</span>
                  <span className="text-sm font-bold vip-text-gold">{formatCurrency(d.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <TipPageFooter layoutId="vip" className="mt-8" />
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// 9. AURORA
// ─────────────────────────────────────────────────────────────
function AuroraLayout({ creator, recentDonations }: TipPageRendererProps) {
  const font = resolveTipPageFontFamily(creator.tipPageSettings.fontFamily);
  const tc = creator.themeColor;
  const s = creator.tipPageSettings;
  const customBg = hasCustomBackground(s)
    ? resolveTipPageBackground(s, tc, s.darkMode !== false)
    : null;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12" style={{ ...(customBg ?? { backgroundColor: "#030712" }), fontFamily: font }}>
      <style>{`
        @keyframes aurora1 { 0%,100%{transform:translate(-20%,-20%) scale(1.2);opacity:.5} 50%{transform:translate(10%,10%) scale(0.9);opacity:.7} }
        @keyframes aurora2 { 0%,100%{transform:translate(20%,20%) scale(0.9);opacity:.4} 50%{transform:translate(-15%,-10%) scale(1.3);opacity:.6} }
        @keyframes aurora3 { 0%,100%{transform:translate(0%,30%) scale(1);opacity:.3} 50%{transform:translate(-20%,-5%) scale(1.1);opacity:.5} }
        .aurora1 { animation: aurora1 12s ease-in-out infinite; }
        .aurora2 { animation: aurora2 16s ease-in-out infinite; }
        .aurora3 { animation: aurora3 10s ease-in-out infinite; }
        .aurora-card { background: rgba(3,7,18,0.7); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(20px); }
      `}</style>

      {/* Aurora blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora1 absolute -left-1/4 -top-1/4 h-[60vh] w-[60vw] rounded-full opacity-50" style={{ background: `radial-gradient(circle, ${tc}60, transparent 70%)`, filter: "blur(60px)" }} />
        <div className="aurora2 absolute -right-1/4 top-1/3 h-[50vh] w-[50vw] rounded-full" style={{ background: "radial-gradient(circle, #818cf880, transparent 70%)", filter: "blur(60px)" }} />
        <div className="aurora3 absolute left-1/4 bottom-0 h-[40vh] w-[40vw] rounded-full" style={{ background: "radial-gradient(circle, #34d39970, transparent 70%)", filter: "blur(50px)" }} />
      </div>

      <div className="relative mx-auto flex w-full max-w-lg flex-col gap-0">
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        <header className="aurora-card relative z-10 mx-4 flex flex-col items-center gap-4 rounded-3xl p-6 text-center">
          <Avatar src={creator.avatar} alt={creator.displayName} size="lg" themeColor={tc} />
          <div>
            <h1 className="text-2xl font-bold text-white">{creator.displayName}</h1>
            <p className="mt-1 text-sm text-white/50">{creator.bio}</p>
          </div>
        </header>

        {creator.goal > 0 && (
          <div className="aurora-card relative z-10 mx-8 mt-6 w-[calc(100%-4rem)] rounded-2xl px-5 py-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-white/50">{s.goalTitle}</span>
              <span className="font-medium text-white">{formatCurrency(creator.raised)} / {formatCurrency(creator.goal)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((creator.raised / creator.goal) * 100, 100)}%`, background: `linear-gradient(90deg, ${tc}, #818cf8, #34d399)` }} />
            </div>
          </div>
        )}

        <div className="aurora-card relative z-10 -mx-2 mt-6 w-[calc(100%+1rem)] rounded-3xl p-6 shadow-2xl">
          <DonationForm creator={creator} layoutId="aurora" />
        </div>

        {s.showSupporterWall && recentDonations.length > 0 && (
          <div className="aurora-card relative z-10 mx-6 mt-6 rounded-2xl p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">Apoiadores recentes</h2>
            <ul className="space-y-2">
              {recentDonations.map((d) => (
                <li key={d.id} className="flex items-baseline justify-between rounded-xl bg-white/5 px-4 py-3">
                  <span className="text-sm font-medium text-white">{d.donorName ?? "Anônimo"}</span>
                  <span className="text-sm font-semibold" style={{ color: tc }}>{formatCurrency(d.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <TipPageFooter layoutId="aurora" className="relative z-10 mt-8" />
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// 10. CARD
// ─────────────────────────────────────────────────────────────
function CardLayout({ creator, recentDonations }: TipPageRendererProps) {
  const font = resolveTipPageFontFamily(creator.tipPageSettings.fontFamily);
  const tc = creator.themeColor;
  const s = creator.tipPageSettings;
  const isDark = s.darkMode !== false;

  const outerBg = isDark ? `radial-gradient(ellipse at top, ${tc}18, #0a0a0a)` : `radial-gradient(ellipse at top, ${tc}12, #e2e8f0)`;
  const cardBg = isDark ? "#111111" : "#ffffff";
  const cardBorder = isDark ? "#27272a" : "#e5e7eb";
  const textPrimary = isDark ? "#ffffff" : "#111827";
  const textSec = isDark ? "#71717a" : "#6b7280";
  const customBg = hasCustomBackground(s)
    ? resolveTipPageBackground(s, tc, isDark)
    : null;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ ...(customBg ?? { background: outerBg }), fontFamily: font }}>
      <div className="relative w-full max-w-md">
        <div className="absolute -right-3 -top-3 h-full w-full rounded-3xl opacity-40" style={{ background: `linear-gradient(135deg, ${tc}30, transparent)` }} />
        <div className="relative overflow-hidden rounded-3xl shadow-2xl" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}`, boxShadow: `0 25px 80px rgba(0,0,0,0.4), 0 0 0 1px ${tc}20` }}>
          <div className="relative h-3 w-full" style={{ background: `linear-gradient(90deg, ${tc}, ${tc}80)` }}>
            <div className="absolute left-1/2 top-0 h-4 w-16 -translate-x-1/2 rounded-b-2xl" style={{ backgroundColor: isDark ? "#0a0a0a" : "#e2e8f0" }} />
          </div>
          <div className="absolute right-6 top-8 flex h-8 w-10 items-center justify-center rounded-md border opacity-60" style={{ borderColor: tc + "40", background: isDark ? "#1a1a1a" : "#f1f5f9" }}>
            <div className="h-5 w-7 rounded-sm border" style={{ borderColor: tc + "60", background: `linear-gradient(135deg, ${tc}20, transparent)` }} />
          </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Creator */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl" style={{ border: `2px solid ${tc}40` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={creator.avatar} alt={creator.displayName} className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: textPrimary }}>{creator.displayName}</h1>
              <p className="text-sm leading-snug" style={{ color: textSec }}>{creator.bio}</p>
            </div>
          </div>

          {creator.goal > 0 && (
            <div className="rounded-xl p-3" style={{ backgroundColor: isDark ? "#1a1a1a" : "#f8fafc" }}>
              <div className="mb-1.5 flex justify-between text-xs" style={{ color: textSec }}>
                <span>{s.goalTitle}</span>
                <span style={{ color: textPrimary }}>{formatCurrency(creator.raised)} / {formatCurrency(creator.goal)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: isDark ? "#27272a" : "#e5e7eb" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((creator.raised / creator.goal) * 100, 100)}%`, backgroundColor: tc }} />
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="h-px" style={{ backgroundColor: cardBorder }} />

          <DonationForm creator={creator} layoutId="card" />

          {s.showSupporterWall && recentDonations.length > 0 && (
            <>
              <div className="h-px" style={{ backgroundColor: cardBorder }} />
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: textSec }}>Apoiadores recentes</h2>
                <ul className="space-y-1.5">
                  {recentDonations.slice(0, 5).map((d) => (
                    <li key={d.id} className="flex items-baseline justify-between">
                      <span className="text-sm" style={{ color: textPrimary }}>{d.donorName ?? "Anônimo"}</span>
                      <span className="text-sm font-semibold" style={{ color: tc }}>{formatCurrency(d.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <div className="pt-2">
            <TipPageFooter layoutId="card" darkMode={isDark} />
          </div>
        </div>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// RENDERER — picks the right layout
// ─────────────────────────────────────────────────────────────
const LAYOUT_MAP: Record<string, (props: TipPageRendererProps) => React.ReactNode> = {
  default: (p) => <DefaultLayout {...p} />,
  glass:   (p) => <GlassLayout   {...p} />,
  neon:    (p) => <NeonLayout     {...p} />,
  minimal: (p) => <MinimalLayout  {...p} />,
  retro:   (p) => <RetroLayout    {...p} />,
  split:   (p) => <SplitLayout    {...p} />,
  banner:  (p) => <BannerLayout   {...p} />,
  vip:     (p) => <VipLayout      {...p} />,
  aurora:  (p) => <AuroraLayout   {...p} />,
  card:    (p) => <CardLayout     {...p} />,
  studio:  (p) => <ThemeVariantLayout {...p} variant="studio" />,
  ocean:   (p) => <ThemeVariantLayout {...p} variant="ocean" />,
  sakura:  (p) => <ThemeVariantLayout {...p} variant="sakura" />,
  matrix:  (p) => <ThemeVariantLayout {...p} variant="matrix" />,
  news:    (p) => <ThemeVariantLayout {...p} variant="news" />,
  comic:   (p) => <ThemeVariantLayout {...p} variant="comic" />,
  forest:  (p) => <ThemeVariantLayout {...p} variant="forest" />,
  sunset:  (p) => <ThemeVariantLayout {...p} variant="sunset" />,
  space:   (p) => <ThemeVariantLayout {...p} variant="space" />,
  street:  (p) => <ThemeVariantLayout {...p} variant="street" />,
};

export function TipPageRenderer(props: TipPageRendererProps) {
  const layoutId = props.creator.tipPageSettings.layoutId ?? "default";
  const render = LAYOUT_MAP[layoutId] ?? LAYOUT_MAP["default"];
  const isDemo = props.creator.username === DEMO_USERNAME;

  return (
    <>
      {isDemo && (
        <div className="border-b border-cyan-500/20 bg-cyan-500/10 px-4 py-2.5 text-center text-sm text-cyan-100">
          Página de demonstração — use &quot;Simular pagamento&quot; para testar sem cobrar Pix real.
        </div>
      )}
      {render(props)}
    </>
  );
}
