import { BRAND_NAME } from "@/lib/brand";
import type { Creator } from "@/types";
import { DonationForm } from "./DonationForm";
import { GoalProgressBar } from "./GoalProgressBar";
import { SupporterWall } from "./SupporterWall";
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
  const bg = resolveTipPageBackground(s, creator.themeColor, s.darkMode !== false);
  const font = resolveTipPageFontFamily(s.fontFamily);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10" style={{ ...bg, fontFamily: font }}>
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-8">
        <header className="flex flex-col items-center gap-4 text-center">
          <Avatar src={creator.avatar} alt={creator.displayName} themeColor={creator.themeColor} />
          <div>
            <h1 className="text-2xl font-bold text-white">{creator.displayName}</h1>
            <p className="mt-1 max-w-md text-sm text-zinc-400">{creator.bio}</p>
          </div>
        </header>

        <GoalProgressBar raised={creator.raised} goal={creator.goal} themeColor={creator.themeColor} goalTitle={s.goalTitle} />

        <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur">
          <DonationForm creator={creator} />
        </div>

        {s.showSupporterWall && <SupporterWall donations={recentDonations} />}
        <TipPageFooter />
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
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10" style={bgStyle}>
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6">
        {/* Header glass card */}
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl">
          <Avatar src={creator.avatar} alt={creator.displayName} size="lg" themeColor={tc} className="mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-white drop-shadow">{creator.displayName}</h1>
          <p className="mt-1 text-sm text-white/60">{creator.bio}</p>
        </div>

        {creator.goal > 0 && (
          <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-white/60">{s.goalTitle}</span>
              <span className="font-semibold text-white">{formatCurrency(creator.raised)} / {formatCurrency(creator.goal)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((creator.raised / creator.goal) * 100, 100)}%`, background: `linear-gradient(90deg, ${tc}, #a78bfa)` }} />
            </div>
          </div>
        )}

        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
          <DonationForm creator={creator} />
        </div>

        {s.showSupporterWall && recentDonations.length > 0 && (
          <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
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
        <TipPageFooter />
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
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10" style={{ ...(customBg ?? { backgroundColor: "#050505" }), fontFamily: font }}>
      <style>{`
        .neon-glow { box-shadow: 0 0 12px ${tc}80, 0 0 40px ${tc}30; }
        .neon-text { text-shadow: 0 0 10px ${tc}cc, 0 0 30px ${tc}80; }
        .neon-border { border-color: ${tc}60; box-shadow: 0 0 8px ${tc}40, inset 0 0 8px ${tc}10; }
        .neon-progress { background: linear-gradient(90deg, ${tc}, #a855f7); box-shadow: 0 0 8px ${tc}80; }
      `}</style>

      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6">
        {/* Decorative top line */}
        <div className="h-px w-32 neon-glow" style={{ background: `linear-gradient(90deg, transparent, ${tc}, transparent)` }} />

        <header className="flex flex-col items-center gap-3 text-center">
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
          <DonationForm creator={creator} />
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

        <div className="h-px w-32 neon-glow" style={{ background: `linear-gradient(90deg, transparent, ${tc}, transparent)` }} />
        <TipPageFooter />
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
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16" style={{ ...(customBg ?? { backgroundColor: bgColor }), fontFamily: font }}>
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-10">
        <header className="flex flex-col items-center gap-5 text-center">
          <div className="overflow-hidden rounded-full h-20 w-20" style={{ outline: `2px solid ${tc}`, outlineOffset: 4 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={creator.avatar} alt={creator.displayName} className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: textPrimary }}>{creator.displayName}</h1>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: textSecondary }}>{creator.bio}</p>
          </div>
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
          <DonationForm creator={creator} />
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
        <TipPageFooter />
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
        {/* Top decorative bar */}
        <div className="w-full text-center">
          <div className="inline-flex items-center gap-2 text-xs" style={{ color: tc }}>
            <span>▓▒░</span>
            <span className="font-bold uppercase tracking-widest">{BRAND_NAME}</span>
            <span>░▒▓</span>
          </div>
        </div>

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
          <DonationForm creator={creator} />
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

        <TipPageFooter className="text-center" />
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
      <div className="mx-auto max-w-5xl min-h-screen grid grid-cols-1 lg:grid-cols-[380px_1fr]">
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
            <TipPageFooter />
          </div>
        </aside>

        {/* Right form area */}
        <div className="flex flex-col items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white">Fazer uma doação</h2>
              <p className="mt-1 text-sm text-zinc-400">Apoie o trabalho de {creator.displayName}</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/4 p-6 backdrop-blur">
              <DonationForm creator={creator} />
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

  return (
    <main className="min-h-screen" style={{ ...bg, fontFamily: font }}>
      {/* Hero banner */}
      <div className="relative h-48 w-full overflow-hidden" style={{ background: `linear-gradient(135deg, ${tc}dd, ${tc}44 50%, transparent)` }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 50%, white 1px, transparent 1px)`, backgroundSize: "30px 30px" }} />
      </div>

      {/* Avatar overlapping banner */}
      <div className="mx-auto max-w-lg px-4">
        <div className="relative -mt-14 flex items-end gap-5 pb-4">
          <div className="shrink-0 rounded-full border-4 border-zinc-900 overflow-hidden h-28 w-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={creator.avatar} alt={creator.displayName} className="h-full w-full object-cover" />
          </div>
          <div className="pb-2">
            <h1 className="text-2xl font-bold text-white">{creator.displayName}</h1>
            <p className="text-sm text-zinc-400">{creator.bio}</p>
          </div>
        </div>

        <div className="flex flex-col gap-5 pb-10">
          {creator.goal > 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
              <GoalProgressBar raised={creator.raised} goal={creator.goal} themeColor={tc} goalTitle={s.goalTitle} />
            </div>
          )}

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur">
            <DonationForm creator={creator} />
          </div>

          {s.showSupporterWall && <SupporterWall donations={recentDonations} />}
          <TipPageFooter />
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12" style={{ ...(customBg ?? { backgroundColor: "#0a0500", backgroundImage: `radial-gradient(ellipse at top, #2a1200, #0a0500 60%)` }), fontFamily: font }}>
      <style>{`
        .vip-card { background: linear-gradient(135deg, #1c1004, #120a00); border: 1px solid ${gold}40; box-shadow: 0 0 30px ${gold}10, inset 0 1px 0 ${gold}20; }
        .vip-divider { background: linear-gradient(90deg, transparent, ${gold}60, transparent); height: 1px; }
        .vip-text-gold { color: ${goldLight}; }
        .vip-progress { background: linear-gradient(90deg, ${gold}, ${goldLight}); box-shadow: 0 0 8px ${gold}80; }
      `}</style>

      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6">
        {/* Crown icon */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-3xl">👑</div>
          <div className="vip-divider w-40" />
        </div>

        {/* Header VIP card */}
        <div className="vip-card w-full rounded-3xl p-6 text-center">
          <div className="mx-auto h-24 w-24 overflow-hidden rounded-full" style={{ border: `2px solid ${gold}`, boxShadow: `0 0 20px ${gold}40` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={creator.avatar} alt={creator.displayName} className="h-full w-full object-cover" />
          </div>
          <h1 className="mt-4 text-2xl font-bold vip-text-gold">{creator.displayName}</h1>
          <div className="vip-divider mx-auto mt-3 mb-3 w-24" />
          <p className="text-sm text-amber-900/80 text-amber-200/50">{creator.bio}</p>
        </div>

        {creator.goal > 0 && (
          <div className="vip-card w-full rounded-2xl px-5 py-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-amber-700/70">{s.goalTitle}</span>
              <span className="vip-text-gold font-semibold">{formatCurrency(creator.raised)} / {formatCurrency(creator.goal)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-amber-950/60">
              <div className="vip-progress h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((creator.raised / creator.goal) * 100, 100)}%` }} />
            </div>
          </div>
        )}

        <div className="vip-card w-full rounded-3xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="vip-divider flex-1" />
            <span className="text-xs font-semibold uppercase tracking-widest vip-text-gold">Apoie</span>
            <div className="vip-divider flex-1" />
          </div>
          <DonationForm creator={creator} />
        </div>

        {s.showSupporterWall && recentDonations.length > 0 && (
          <div className="vip-card w-full rounded-2xl p-5">
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

        <div className="vip-divider w-32" />
        <TipPageFooter />
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

      <div className="relative mx-auto flex w-full max-w-lg flex-col items-center gap-6">
        <header className="aurora-card flex flex-col items-center gap-4 rounded-3xl p-6 text-center">
          <Avatar src={creator.avatar} alt={creator.displayName} size="lg" themeColor={tc} />
          <div>
            <h1 className="text-2xl font-bold text-white">{creator.displayName}</h1>
            <p className="mt-1 text-sm text-white/50">{creator.bio}</p>
          </div>
        </header>

        {creator.goal > 0 && (
          <div className="aurora-card w-full rounded-2xl px-5 py-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-white/50">{s.goalTitle}</span>
              <span className="font-medium text-white">{formatCurrency(creator.raised)} / {formatCurrency(creator.goal)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((creator.raised / creator.goal) * 100, 100)}%`, background: `linear-gradient(90deg, ${tc}, #818cf8, #34d399)` }} />
            </div>
          </div>
        )}

        <div className="aurora-card w-full rounded-3xl p-6 shadow-2xl">
          <DonationForm creator={creator} />
        </div>

        {s.showSupporterWall && recentDonations.length > 0 && (
          <div className="aurora-card w-full rounded-2xl p-5">
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
        <TipPageFooter />
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
      {/* Single floating mega-card */}
      <div className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}`, boxShadow: `0 25px 80px rgba(0,0,0,0.4), 0 0 0 1px ${tc}20` }}>
        {/* Card header with theme color accent */}
        <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${tc}, ${tc}80)` }} />

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

          <DonationForm creator={creator} />

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
            <TipPageFooter />
          </div>
        </div>
      </div>
    </main>
  );
}

const THEME_VARIANTS = {
  studio: {
    label: "AO VIVO",
    bg: "#0f172a",
    bgImage: "radial-gradient(circle at 20% 0%, rgba(239,68,68,.24), transparent 35%), linear-gradient(135deg, #0f172a, #020617)",
    accent: "#ef4444",
    card: "rgba(15,23,42,.84)",
    border: "rgba(248,113,113,.28)",
    text: "#f8fafc",
    muted: "#94a3b8",
    shape: "rounded-2xl",
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
    shape: "rounded-[2rem]",
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
    shape: "rounded-[2rem]",
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
    shape: "rounded-lg",
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
    shape: "rounded-none",
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
    shape: "rounded-3xl",
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
    shape: "rounded-3xl",
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
    shape: "rounded-[2rem]",
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
    shape: "rounded-[2rem]",
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
    shape: "rounded-xl",
  },
} as const;

function VariantLayout({
  creator,
  recentDonations,
  variant,
}: TipPageRendererProps & { variant: keyof typeof THEME_VARIANTS }) {
  const cfg = THEME_VARIANTS[variant];
  const s = creator.tipPageSettings;
  const accent = creator.themeColor || cfg.accent;
  const font = variant === "matrix" ? '"Courier New", monospace' : resolveTipPageFontFamily(s.fontFamily);
  const percent = creator.goal > 0 ? Math.min((creator.raised / creator.goal) * 100, 100) : 0;
  const customBg = hasCustomBackground(s)
    ? resolveTipPageBackground(s, accent, s.darkMode !== false)
    : null;

  return (
    <main
      className="flex min-h-screen flex-col justify-center px-4 py-10"
      style={{ ...(customBg ?? { backgroundColor: cfg.bg, backgroundImage: cfg.bgImage }), fontFamily: font }}
    >
      <div className="mx-auto grid w-full max-w-4xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section
          className={`${cfg.shape} border p-6 shadow-2xl`}
          style={{ background: cfg.card, borderColor: cfg.border }}
        >
          <p className="mb-4 text-xs font-black uppercase tracking-[0.3em]" style={{ color: accent }}>
            {cfg.label}
          </p>
          <div className="flex items-center gap-4">
            <div
              className={`${variant === "news" ? "rounded-none" : "rounded-2xl"} h-20 w-20 shrink-0 overflow-hidden border-2`}
              style={{ borderColor: accent }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={creator.avatar} alt={creator.displayName} className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{ color: cfg.text }}>
                {creator.displayName}
              </h1>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: cfg.muted }}>
                {creator.bio}
              </p>
            </div>
          </div>

          {creator.goal > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs" style={{ color: cfg.muted }}>
                <span>{s.goalTitle}</span>
                <span>{formatCurrency(creator.raised)} / {formatCurrency(creator.goal)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/25">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${percent}%`, backgroundColor: accent }}
                />
              </div>
            </div>
          )}

          {s.showSupporterWall && recentDonations.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: cfg.muted }}>
                Apoiadores recentes
              </h2>
              <ul className="space-y-2">
                {recentDonations.slice(0, 4).map((d) => (
                  <li key={d.id} className="flex items-baseline justify-between border-b border-white/10 pb-2">
                    <span className="text-sm" style={{ color: cfg.text }}>{d.donorName ?? "Anônimo"}</span>
                    <span className="text-sm font-bold" style={{ color: accent }}>{formatCurrency(d.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section
          className={`${cfg.shape} border p-6 shadow-2xl`}
          style={{ background: cfg.card, borderColor: cfg.border }}
        >
          <DonationForm creator={creator} />
        </section>

        <div className="lg:col-span-2">
          <TipPageFooter />
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
  studio:  (p) => <VariantLayout  {...p} variant="studio" />,
  ocean:   (p) => <VariantLayout  {...p} variant="ocean" />,
  sakura:  (p) => <VariantLayout  {...p} variant="sakura" />,
  matrix:  (p) => <VariantLayout  {...p} variant="matrix" />,
  news:    (p) => <VariantLayout  {...p} variant="news" />,
  comic:   (p) => <VariantLayout  {...p} variant="comic" />,
  forest:  (p) => <VariantLayout  {...p} variant="forest" />,
  sunset:  (p) => <VariantLayout  {...p} variant="sunset" />,
  space:   (p) => <VariantLayout  {...p} variant="space" />,
  street:  (p) => <VariantLayout  {...p} variant="street" />,
};

export function TipPageRenderer(props: TipPageRendererProps) {
  const layoutId = props.creator.tipPageSettings.layoutId ?? "default";
  const render = LAYOUT_MAP[layoutId] ?? LAYOUT_MAP["default"];
  return <>{render(props)}</>;
}
