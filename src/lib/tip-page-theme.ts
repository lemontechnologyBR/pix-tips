export type TipPageFormMode =
  | "dark"
  | "light"
  | "glass"
  | "neon"
  | "retro"
  | "vip"
  | "matrix"
  | "comic"
  | "news";

export interface TipPageFormTheme {
  mode: TipPageFormMode;
  label: string;
  input: string;
  textarea: string;
  presetInactive: string;
  presetActive: string;
  submit: string;
  muted: string;
  error: string;
  focusColor: string;
}

const DARK_BASE: TipPageFormTheme = {
  mode: "dark",
  label: "mb-2 block text-sm font-medium text-zinc-300",
  input:
    "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:outline-none",
  textarea:
    "w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:outline-none",
  presetInactive: "rounded-lg bg-zinc-800 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-700",
  presetActive: "rounded-lg py-2.5 text-sm font-semibold text-white",
  submit: "w-full rounded-xl py-3.5 text-base font-bold text-white transition hover:opacity-90 disabled:opacity-50",
  muted: "text-center text-xs text-zinc-500",
  error: "text-sm text-red-400",
  focusColor: "#06b6d4",
};

const THEMES: Record<TipPageFormMode, TipPageFormTheme> = {
  dark: DARK_BASE,
  light: {
    mode: "light",
    label: "mb-2 block text-sm font-medium text-gray-600",
    input:
      "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none",
    textarea:
      "w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none",
    presetInactive:
      "rounded-lg border border-gray-200 bg-gray-50 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100",
    presetActive: "rounded-lg py-2.5 text-sm font-semibold text-white shadow-sm",
    submit: "w-full rounded-xl py-3.5 text-base font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-50",
    muted: "text-center text-xs text-gray-400",
    error: "text-sm text-red-500",
    focusColor: "#6366f1",
  },
  glass: {
    mode: "glass",
    label: "mb-2 block text-sm font-medium text-white/70",
    input:
      "w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-white placeholder:text-white/40 backdrop-blur-sm focus:outline-none",
    textarea:
      "w-full resize-none rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-white placeholder:text-white/40 backdrop-blur-sm focus:outline-none",
    presetInactive:
      "rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10",
    presetActive: "rounded-xl py-2.5 text-sm font-semibold text-white shadow-lg",
    submit: "w-full rounded-2xl py-3.5 text-base font-bold text-white shadow-xl transition hover:opacity-90 disabled:opacity-50",
    muted: "text-center text-xs text-white/40",
    error: "text-sm text-rose-300",
    focusColor: "#a78bfa",
  },
  neon: {
    mode: "neon",
    label: "mb-2 block font-mono text-xs font-bold uppercase tracking-widest text-zinc-400",
    input:
      "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 font-mono text-sm text-white placeholder:text-zinc-600 focus:outline-none",
    textarea:
      "w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 font-mono text-sm text-white placeholder:text-zinc-600 focus:outline-none",
    presetInactive:
      "rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 font-mono text-sm font-bold text-zinc-400 transition hover:border-zinc-600",
    presetActive: "rounded-lg py-2.5 font-mono text-sm font-bold text-white",
    submit: "w-full rounded-lg py-3.5 font-mono text-sm font-black uppercase tracking-wider text-white transition hover:opacity-90 disabled:opacity-50",
    muted: "text-center font-mono text-[10px] uppercase tracking-widest text-zinc-600",
    error: "font-mono text-sm text-red-400",
    focusColor: "#00ffe0",
  },
  retro: {
    mode: "retro",
    label: "mb-2 block font-mono text-xs font-bold uppercase text-zinc-400",
    input:
      "w-full border-2 border-zinc-700 bg-zinc-900 px-4 py-2.5 font-mono text-sm text-white placeholder:text-zinc-600 focus:outline-none",
    textarea:
      "w-full resize-none border-2 border-zinc-700 bg-zinc-900 px-4 py-2.5 font-mono text-sm text-white placeholder:text-zinc-600 focus:outline-none",
    presetInactive:
      "border-2 border-zinc-700 bg-zinc-900 py-2 font-mono text-xs font-bold uppercase text-zinc-400 transition hover:bg-zinc-800",
    presetActive: "border-2 py-2 font-mono text-xs font-bold uppercase text-white",
    submit: "w-full border-2 py-3 font-mono text-sm font-black uppercase tracking-widest text-white transition hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50",
    muted: "text-center font-mono text-[10px] uppercase text-zinc-600",
    error: "font-mono text-sm text-red-400",
    focusColor: "#f59e0b",
  },
  vip: {
    mode: "vip",
    label: "mb-2 block text-sm font-medium text-amber-200/60",
    input:
      "w-full rounded-xl border border-amber-900/40 bg-amber-950/30 px-4 py-2.5 text-amber-50 placeholder:text-amber-700/50 focus:outline-none",
    textarea:
      "w-full resize-none rounded-xl border border-amber-900/40 bg-amber-950/30 px-4 py-2.5 text-amber-50 placeholder:text-amber-700/50 focus:outline-none",
    presetInactive:
      "rounded-xl border border-amber-900/30 bg-amber-950/20 py-2.5 text-sm font-semibold text-amber-200/70 transition hover:border-amber-700/40",
    presetActive: "rounded-xl py-2.5 text-sm font-bold text-amber-950",
    submit: "w-full rounded-xl py-3.5 text-base font-bold text-amber-950 shadow-lg transition hover:opacity-90 disabled:opacity-50",
    muted: "text-center text-xs text-amber-700/60",
    error: "text-sm text-red-300",
    focusColor: "#fbbf24",
  },
  matrix: {
    mode: "matrix",
    label: "mb-2 block font-mono text-xs uppercase tracking-widest text-green-500/70",
    input:
      "w-full rounded border border-green-900/60 bg-black px-4 py-2.5 font-mono text-sm text-green-400 placeholder:text-green-900 focus:outline-none",
    textarea:
      "w-full resize-none rounded border border-green-900/60 bg-black px-4 py-2.5 font-mono text-sm text-green-400 placeholder:text-green-900 focus:outline-none",
    presetInactive:
      "rounded border border-green-900/50 bg-black py-2 font-mono text-xs text-green-600 transition hover:border-green-700",
    presetActive: "rounded py-2 font-mono text-xs font-bold text-black",
    submit: "w-full rounded border-2 border-green-500 bg-green-950 py-3 font-mono text-sm font-bold uppercase text-green-400 transition hover:bg-green-900 disabled:opacity-50",
    muted: "text-center font-mono text-[10px] text-green-800",
    error: "font-mono text-sm text-red-400",
    focusColor: "#22c55e",
  },
  comic: {
    mode: "comic",
    label: "mb-2 block text-sm font-black uppercase text-gray-800",
    input:
      "w-full rounded-lg border-4 border-gray-900 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 shadow-[3px_3px_0_#111] focus:outline-none",
    textarea:
      "w-full resize-none rounded-lg border-4 border-gray-900 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 shadow-[3px_3px_0_#111] focus:outline-none",
    presetInactive:
      "rounded-lg border-4 border-gray-900 bg-white py-2 text-sm font-black text-gray-800 shadow-[3px_3px_0_#111] transition hover:translate-x-0.5 hover:translate-y-0.5",
    presetActive: "rounded-lg border-4 border-gray-900 py-2 text-sm font-black text-white shadow-[3px_3px_0_#111]",
    submit: "w-full rounded-lg border-4 border-gray-900 py-3 text-base font-black uppercase text-white shadow-[4px_4px_0_#111] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50",
    muted: "text-center text-xs font-bold text-gray-500",
    error: "text-sm font-bold text-red-600",
    focusColor: "#ef4444",
  },
  news: {
    mode: "news",
    label: "mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500",
    input:
      "w-full border-b-2 border-gray-900 bg-transparent px-1 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none",
    textarea:
      "w-full resize-none border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none",
    presetInactive:
      "border border-gray-300 bg-white py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50",
    presetActive: "border-2 border-gray-900 py-2 text-sm font-bold text-white",
    submit: "w-full bg-gray-900 py-3.5 text-base font-bold uppercase tracking-wider text-white transition hover:bg-gray-800 disabled:opacity-50",
    muted: "text-center text-xs text-gray-400",
    error: "text-sm text-red-600",
    focusColor: "#111827",
  },
};

const LAYOUT_FORM_MODE: Record<string, TipPageFormMode> = {
  default: "dark",
  glass: "glass",
  neon: "neon",
  minimal: "light",
  retro: "retro",
  split: "dark",
  banner: "dark",
  vip: "vip",
  aurora: "glass",
  card: "light",
  studio: "dark",
  ocean: "glass",
  sakura: "light",
  matrix: "matrix",
  news: "news",
  comic: "comic",
  forest: "dark",
  sunset: "dark",
  space: "glass",
  street: "dark",
};

export function resolveTipPageFormTheme(layoutId?: string): TipPageFormTheme {
  const mode = LAYOUT_FORM_MODE[layoutId ?? "default"] ?? "dark";
  return THEMES[mode];
}

export function resolveTipPageFooterClass(layoutId?: string, darkMode = true): string {
  const lightLayouts = new Set(["minimal", "card", "sakura", "news", "comic"]);
  const isLight = lightLayouts.has(layoutId ?? "") || (!darkMode && (layoutId === "minimal" || layoutId === "card"));
  return isLight ? "text-gray-400 hover:text-gray-600" : "text-zinc-600 hover:text-zinc-400";
}
