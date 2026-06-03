"use client";

import { DEFAULT_BACKGROUND_MEDIA } from "@/types";
import { formatCurrency } from "@/lib/format";
import {
  BackgroundMediaLayer,
  CharacterMedia,
} from "@/components/widget/BackgroundMediaLayer";
import type { AlertTemplateProps } from "./types";
import { textStyle } from "./types";
import { useTemplateLifecycle } from "./useTemplateLifecycle";

function hasBackground(p: AlertTemplateProps) {
  return Boolean(p.backgroundMedia?.useBackgroundMedia && p.backgroundMedia?.url);
}

function AlertCard({
  p,
  className = "",
  style,
  children,
}: {
  p: AlertTemplateProps;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const withBg = hasBackground(p);
  return (
    <div
      className={`relative overflow-hidden rounded-2xl px-6 py-4 shadow-2xl ${withBg ? "bg-zinc-950/80" : ""} ${className}`}
      style={style}
    >
      {withBg && p.backgroundMedia && <BackgroundMediaLayer config={p.backgroundMedia} />}
      {withBg && <div className="absolute inset-0 z-[1] bg-black/25" aria-hidden />}
      <div className="relative z-10">
        <p style={textStyle(p.textConfig)}>{p.headline}</p>
        {p.message && (
          <p className="mt-2 text-base opacity-80" style={{ textAlign: p.textConfig.alignment }}>
            &ldquo;{p.message}&rdquo;
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

function ScreenBackground({
  p,
  children,
  className = "",
  overlay = "bg-black/40",
}: {
  p: AlertTemplateProps;
  children: React.ReactNode;
  className?: string;
  overlay?: string;
}) {
  const withBg = hasBackground(p);
  return (
    <div className={`alert-layer pointer-events-none fixed inset-0 ${className}`}>
      {withBg && p.backgroundMedia && (
        <BackgroundMediaLayer config={p.backgroundMedia} rounded={false} />
      )}
      {withBg && overlay && <div className={`absolute inset-0 ${overlay}`} aria-hidden />}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

type SlideDir = "up" | "down" | "left" | "right";

function SlideTemplate(p: AlertTemplateProps & { dir: SlideDir }) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  const pos =
    p.dir === "up"
      ? "inset-x-0 bottom-[15%] flex justify-center"
      : p.dir === "down"
        ? "inset-x-0 top-[15%] flex justify-center"
        : "inset-0 flex items-center justify-center";

  return (
    <div className={`alert-layer pointer-events-none fixed ${pos} px-4`}>
      <div className={`tpl-slide-${p.dir}-${phase}`}>
        <AlertCard
          p={p}
          className="max-w-lg border border-violet-400/30 bg-gradient-to-r from-violet-900/95 to-purple-800/95"
        />
      </div>
    </div>
  );
}

export function TemplateSlideUp(p: AlertTemplateProps) {
  return <SlideTemplate {...p} dir="up" />;
}
export function TemplateSlideDown(p: AlertTemplateProps) {
  return <SlideTemplate {...p} dir="down" />;
}
export function TemplateSlideLeft(p: AlertTemplateProps) {
  return <SlideTemplate {...p} dir="left" />;
}
export function TemplateSlideRight(p: AlertTemplateProps) {
  return <SlideTemplate {...p} dir="right" />;
}

export function TemplateFadeIn(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  return (
    <div className="alert-layer pointer-events-none fixed inset-0 flex items-center justify-center px-4">
      <div className={`tpl-fade-${phase}`}>
        <AlertCard p={p} className="max-w-lg bg-zinc-900/90" />
      </div>
    </div>
  );
}

export function TemplateZoomBounce(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  return (
    <div className="alert-layer pointer-events-none fixed inset-0 flex items-center justify-center px-4">
      <div className={`tpl-zoom-${phase}`}>
        <AlertCard p={p} className="max-w-lg bg-violet-700/90 text-center" />
      </div>
    </div>
  );
}

export function TemplateDefault(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  return (
    <div className="alert-layer pointer-events-none fixed inset-x-0 top-8 flex justify-center px-4">
      <div className={`tpl-fade-${phase}`}>
        <AlertCard p={p} className="bg-zinc-900/95" />
      </div>
    </div>
  );
}

export function TemplateConfetti(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  return (
    <div className="alert-layer pointer-events-none fixed inset-0">
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            className="animate-confetti absolute h-2 w-1.5 rounded-sm"
            style={{
              left: `${(i * 2.5) % 100}%`,
              backgroundColor: ["#f59e0b", "#ef4444", "#8b5cf6", "#10b981"][i % 4],
              animationDelay: `${(i % 10) * 0.08}s`,
            }}
          />
        ))}
      </div>
      <div className="flex h-full items-center justify-center">
        <div className={`tpl-fade-${phase}`}>
          <AlertCard p={p} className="bg-black/80 text-center backdrop-blur">
            <p className="mt-2 text-3xl font-black text-amber-400">
              {formatCurrency(p.amount)}
            </p>
          </AlertCard>
        </div>
      </div>
    </div>
  );
}

export function TemplateEmojiRain(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  const emojis = ["💰", "💎", "🔥", "❤️", "🎉", "✨", "💸", "⭐"];
  return (
    <div className="alert-layer pointer-events-none fixed inset-0">
      {emojis.flatMap((e, ei) =>
        Array.from({ length: 4 }).map((_, i) => (
          <span
            key={`${ei}-${i}`}
            className="animate-confetti absolute text-xl"
            style={{ left: `${(ei * 12 + i * 3) % 100}%`, animationDelay: `${i * 0.2}s` }}
          >
            {e}
          </span>
        )),
      )}
      <div className="flex h-full items-center justify-center">
        <div className={`tpl-fade-${phase}`}>
          <AlertCard p={p} className="bg-black/75 text-center" />
        </div>
      </div>
    </div>
  );
}

export function TemplateCoins(p: AlertTemplateProps) {
  return <TemplateEmojiRain {...p} />;
}

export function TemplateStars(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  return (
    <div className="alert-layer pointer-events-none fixed inset-0 flex items-center justify-center">
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="absolute animate-pulse-soft text-2xl text-yellow-300"
          style={{
            transform: `rotate(${i * 30}deg) translateY(-${80 + i * 8}px)`,
          }}
        >
          ★
        </span>
      ))}
      <div className={`tpl-fade-${phase}`}>
        <AlertCard p={p} className="bg-indigo-950/90 text-center" />
      </div>
    </div>
  );
}

export function TemplateFireworks(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  return (
    <div className="alert-layer pointer-events-none fixed inset-0">
      {[20, 50, 80].map((left) => (
        <div
          key={left}
          className="absolute top-8 h-24 w-24 rounded-full opacity-60"
          style={{
            left: `${left}%`,
            background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)",
          }}
        />
      ))}
      <div className="flex h-full items-end justify-center pb-24">
        <div className={`tpl-fade-${phase}`}>
          <AlertCard p={p} className="bg-black/80 text-center" />
        </div>
      </div>
    </div>
  );
}

export function TemplateGlitch(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  return (
    <ScreenBackground p={p} overlay="bg-black/50">
      <div className="flex h-full items-center justify-center">
        <div className={`animate-glitch font-mono ${phase === "exit" ? "opacity-0" : ""}`}>
          <p className="text-3xl font-black text-white">{p.headline}</p>
          <p className="text-cyan-400">{formatCurrency(p.amount)}</p>
        </div>
      </div>
    </ScreenBackground>
  );
}

export function TemplateNeon(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  return (
    <div className="alert-layer pointer-events-none fixed inset-x-0 bottom-10 flex justify-center px-4">
      <div className={`animate-neon-border ${phase === "exit" ? "opacity-0" : ""}`}>
        <AlertCard p={p} className="border-2 border-fuchsia-400/50 bg-black/85 text-center" />
      </div>
    </div>
  );
}

export function TemplateTypewriter(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  const text = phase === "enter" ? p.headline.slice(0, Math.ceil(p.headline.length * 0.6)) : p.headline;
  return (
    <ScreenBackground p={p} overlay="">
      <div className="flex h-full items-start justify-center px-4 pt-[33%]">
        <div className="max-w-xl rounded-lg bg-black/85 px-6 py-4 font-mono">
          <p className="text-xl text-emerald-400">
            {text}
            <span className="animate-pulse">|</span>
          </p>
        </div>
      </div>
    </ScreenBackground>
  );
}

export function TemplateMarquee(p: AlertTemplateProps) {
  useTemplateLifecycle(p.duration, p.onComplete);
  const withBg = hasBackground(p);
  return (
    <div className="alert-layer pointer-events-none fixed inset-x-0 top-0 overflow-hidden py-3">
      <div className={`relative ${withBg ? "" : "bg-violet-700"}`}>
        {withBg && p.backgroundMedia && (
          <BackgroundMediaLayer config={p.backgroundMedia} rounded={false} />
        )}
        {withBg && <div className="absolute inset-0 bg-violet-900/60" aria-hidden />}
        <p className="relative z-10 animate-marquee whitespace-nowrap text-lg font-bold text-white">
          {p.headline} · {formatCurrency(p.amount)} · {p.message ?? ""} · {p.headline}
        </p>
      </div>
    </div>
  );
}

export function TemplateSplitFlap(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  return (
    <div className="alert-layer pointer-events-none fixed inset-0 flex items-center justify-center">
      <div className={`tpl-fade-${phase} flex gap-1 rounded bg-black p-4 font-mono`}>
        {p.headline.split("").map((c, i) => (
          <span key={i} className="inline-block w-6 border border-amber-700 bg-zinc-900 py-2 text-center text-amber-400">
            {c === " " ? "" : c}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TemplateMascotEnter(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  return (
    <div className="alert-layer pointer-events-none fixed inset-x-0 bottom-8 flex items-end justify-center gap-4 px-4">
      <div className={`tpl-slide-left-${phase === "enter" ? "enter" : "display"}`}>
        <CharacterMedia
          config={p.backgroundMedia ?? DEFAULT_BACKGROUND_MEDIA}
          fallback="🤖"
          className="h-16 w-16 text-6xl"
        />
      </div>
      <AlertCard p={p} className="max-w-sm bg-zinc-900/95" />
    </div>
  );
}

export function TemplatePetCompanion(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  return (
    <div className="alert-layer pointer-events-none fixed bottom-4 right-4">
      <div className={`tpl-fade-${phase} text-center`}>
        <CharacterMedia
          config={p.backgroundMedia ?? DEFAULT_BACKGROUND_MEDIA}
          fallback="🐶"
          className="mx-auto block h-14 w-14 text-5xl"
        />
        <AlertCard p={p} className="mt-2 max-w-xs bg-pink-950/90 text-sm" />
      </div>
    </div>
  );
}

export function TemplateGhostReveal(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  return (
    <ScreenBackground p={p}>
      <div className="flex h-full flex-col items-center justify-center">
        {!hasBackground(p) && <span className="text-6xl opacity-70">👻</span>}
        <div className={`tpl-fade-${phase} mt-4`}>
          <AlertCard p={p} className="bg-purple-950/80" />
        </div>
      </div>
    </ScreenBackground>
  );
}

export function TemplateGameAchievement(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  return (
    <div className="alert-layer pointer-events-none fixed inset-x-0 top-4 flex justify-center px-4">
      <div className={`tpl-slide-down-${phase} flex max-w-lg items-center gap-3 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-3`}>
        <span className="text-3xl">🏆</span>
        <div>
          <p className="text-xs text-zinc-400">Achievement Unlocked</p>
          <p style={textStyle({ ...p.textConfig, fontSize: 16 })}>{p.headline}</p>
        </div>
      </div>
    </div>
  );
}

export function TemplateChatBubble(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  return (
    <div className="alert-layer pointer-events-none fixed right-4 top-4 max-w-xs">
      <div className={`tpl-slide-left-${phase} rounded-2xl bg-zinc-900/95 p-3 shadow-xl`}>
        <p className="font-bold text-violet-300">{p.name}</p>
        <p className="text-sm text-zinc-300">{p.message || p.headline}</p>
        <span className="mt-1 inline-block rounded bg-emerald-600 px-2 py-0.5 text-xs font-bold">
          {formatCurrency(p.amount)}
        </span>
      </div>
    </div>
  );
}

export function TemplateSpotlight(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  const withBg = hasBackground(p);
  return (
    <div className="alert-layer pointer-events-none fixed inset-0">
      {withBg && p.backgroundMedia && (
        <BackgroundMediaLayer config={p.backgroundMedia} rounded={false} />
      )}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${phase === "display" ? "bg-black/60" : "bg-black/30"}`}
      />
      <div className="relative z-10 flex h-full items-center justify-center">
        <div
          className={`tpl-fade-${phase} rounded-full p-12`}
          style={
            withBg
              ? undefined
              : { background: "radial-gradient(circle, #ffffff22 0%, transparent 70%)" }
          }
        >
          <AlertCard p={p} className="bg-transparent text-center shadow-none" />
        </div>
      </div>
    </div>
  );
}

export function TemplateStageCurtain(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  const open = phase !== "enter";
  const withBg = hasBackground(p);
  return (
    <div className="alert-layer pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden">
      {withBg && p.backgroundMedia && open && (
        <BackgroundMediaLayer config={p.backgroundMedia} rounded={false} />
      )}
      <div
        className="absolute left-0 top-0 z-20 h-full bg-red-900 transition-all duration-700"
        style={{ width: open ? "0%" : "50%" }}
      />
      <div
        className="absolute right-0 top-0 z-20 h-full bg-red-900 transition-all duration-700"
        style={{ width: open ? "0%" : "50%" }}
      />
      {open && <AlertCard p={p} className="relative z-10 bg-black/80 text-center" />}
    </div>
  );
}

export function TemplatePolaroid(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  const withBg = hasBackground(p);
  return (
    <div className="alert-layer pointer-events-none fixed inset-0 flex items-center justify-center">
      <div
        className={`tpl-zoom-${phase} rotate-2 bg-white p-3 pb-10 shadow-2xl`}
        style={{ width: 260 }}
      >
        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-violet-400 to-purple-600">
          {withBg && p.backgroundMedia && (
            <BackgroundMediaLayer config={p.backgroundMedia} />
          )}
        </div>
        <p className="mt-3 text-center font-handwriting text-sm text-zinc-800">{p.headline}</p>
      </div>
    </div>
  );
}

export function TemplateDot(p: AlertTemplateProps) {
  useTemplateLifecycle(p.duration, p.onComplete);
  return (
    <div className="alert-layer pointer-events-none fixed right-4 top-4">
      <div className="flex h-16 w-16 animate-pulse-soft items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
        {formatCurrency(p.amount).replace("R$", "").trim()}
      </div>
    </div>
  );
}

export function TemplateLine(p: AlertTemplateProps) {
  useTemplateLifecycle(p.duration, p.onComplete);
  return <div className="alert-layer pointer-events-none fixed inset-x-0 top-0 h-1 animate-neon-border bg-violet-500 shadow-[0_0_20px_#8b5cf6]" />;
}

export function TemplateCornerBadge(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  return (
    <div className="alert-layer pointer-events-none fixed bottom-4 right-4">
      <div className={`tpl-fade-${phase} flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg`}>
        <span>💰</span> {formatCurrency(p.amount)}
      </div>
    </div>
  );
}

export function TemplateEarthquake(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  return (
    <ScreenBackground p={p}>
      <div
        className={`flex h-full items-center justify-center ${phase === "enter" ? "animate-glitch" : ""}`}
      >
        <AlertCard p={p} className="bg-red-900/90 text-center text-2xl" />
      </div>
    </ScreenBackground>
  );
}

export function TemplateRoulette(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  return (
    <div className="alert-layer pointer-events-none fixed inset-0 flex flex-col items-center justify-center gap-4">
      <div className={`h-24 w-24 rounded-full border-4 border-amber-400 ${phase === "enter" ? "animate-spin" : ""}`} />
      <AlertCard p={p} className="bg-black/80 text-center" />
    </div>
  );
}

export function TemplateKickAlert(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  return (
    <div className="alert-layer pointer-events-none fixed inset-0 flex items-center justify-center">
      <div className={`tpl-slide-right-${phase}`}>
        <AlertCard p={p} className="bg-orange-900/90 text-center" />
      </div>
    </div>
  );
}

export function TemplatePortal(p: AlertTemplateProps) {
  const phase = useTemplateLifecycle(p.duration, p.onComplete);
  const withBg = hasBackground(p);
  return (
    <div className="alert-layer pointer-events-none fixed inset-0 flex items-center justify-center">
      <div className="relative flex h-48 w-48 items-center justify-center overflow-hidden rounded-full">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent opacity-70" />
        {withBg && p.backgroundMedia && (
          <BackgroundMediaLayer config={p.backgroundMedia} rounded={false} />
        )}
        <div className={`tpl-fade-${phase} relative z-10 px-4 text-center`}>
          <p className="text-xl font-bold text-white drop-shadow-lg">{p.headline}</p>
        </div>
      </div>
    </div>
  );
}
