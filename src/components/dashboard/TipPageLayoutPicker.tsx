"use client";

import { TIP_PAGE_LAYOUTS, type TipPageLayoutPreset } from "@/lib/tip-page-layout-presets";

interface TipPageLayoutPickerProps {
  value: string;
  onChange: (id: string) => void;
}

const LIGHT_LAYOUTS = new Set(["minimal", "card", "sakura", "news", "comic"]);

/** Mini representação estrutural do layout usando a paleta de preview. */
function MiniMock({ layout }: { layout: TipPageLayoutPreset }) {
  const { bg, accent, card, text } = layout.preview;
  const isLight = LIGHT_LAYOUTS.has(layout.id);
  const lineColor = isLight ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.22)";
  const id = layout.id;

  const shell: React.CSSProperties = {
    background:
      id === "aurora"
        ? `radial-gradient(circle at 20% 15%, ${accent}66, transparent 45%), radial-gradient(circle at 85% 70%, #818cf866, transparent 50%), ${bg}`
        : id === "space"
          ? `radial-gradient(circle at 25% 20%, ${accent}55, transparent 35%), ${bg}`
          : id === "sunset"
            ? "linear-gradient(180deg, #7c2d12, #1a0a04)"
            : id === "neon"
              ? `radial-gradient(circle at 50% 0%, ${accent}40, transparent 55%), ${bg}`
              : id === "vip"
                ? `linear-gradient(135deg, #1c1004, ${bg})`
                : bg,
  };

  const avatar = (
    <div
      className="rounded-full"
      style={{ width: 14, height: 14, background: accent, boxShadow: `0 0 0 2px ${accent}40` }}
    />
  );
  const bar = (w: string, c?: string) => (
    <div style={{ width: w, height: 3, borderRadius: 2, background: c ?? lineColor }} />
  );
  const chip = (
    <div
      style={{ height: 7, borderRadius: 2, background: card, border: `1px solid ${accent}55` }}
    />
  );

  // Split / Studio → duas colunas
  if (id === "split" || id === "studio") {
    return (
      <div className="flex h-full w-full gap-1 p-1.5" style={shell}>
        <div
          className="flex flex-1 flex-col items-center justify-center gap-1 rounded"
          style={{ background: card }}
        >
          {avatar}
          {bar("60%")}
        </div>
        <div className="flex flex-[1.2] flex-col justify-center gap-1 rounded p-1" style={{ background: "rgba(0,0,0,0.2)" }}>
          <div className="grid grid-cols-2 gap-1">
            {chip}
            {chip}
          </div>
          {bar("90%", accent)}
        </div>
      </div>
    );
  }

  // Banner / Sunset → faixa no topo
  if (id === "banner" || id === "sunset") {
    return (
      <div className="h-full w-full" style={shell}>
        <div className="h-1/3 w-full" style={{ background: `linear-gradient(135deg, ${accent}, transparent 75%)` }} />
        <div className="-mt-2 flex flex-col items-center gap-1 px-2">
          {avatar}
          {bar("55%")}
          <div className="mt-0.5 grid w-full grid-cols-4 gap-1">
            {chip}
            {chip}
            {chip}
            {chip}
          </div>
        </div>
      </div>
    );
  }

  // Card → cartão branco elevado
  if (id === "card") {
    return (
      <div className="flex h-full w-full items-center justify-center p-2" style={shell}>
        <div className="flex w-full flex-col items-center gap-1 rounded-md p-1.5 shadow-md" style={{ background: card }}>
          {avatar}
          {bar("50%", text + "99")}
          {bar("80%", accent)}
        </div>
      </div>
    );
  }

  // Minimal / News → só linhas
  if (id === "minimal" || id === "news") {
    return (
      <div className="flex h-full w-full flex-col justify-center gap-1.5 p-2" style={shell}>
        <div style={{ width: "65%", height: 4, borderRadius: 2, background: text + "cc" }} />
        {bar("90%")}
        {bar("80%")}
        <div className="mt-1" style={{ width: "40%", height: 5, borderRadius: 2, background: accent }} />
      </div>
    );
  }

  // Retro / Matrix → moldura/terminal
  if (id === "retro" || id === "matrix") {
    return (
      <div className="h-full w-full p-1.5" style={shell}>
        <div className="flex h-full flex-col gap-1 p-1.5" style={{ border: `1.5px solid ${accent}`, boxShadow: `2px 2px 0 ${accent}66` }}>
          {bar("40%", accent)}
          <div className="flex items-center gap-1">
            <div style={{ width: 12, height: 12, background: accent + "55" }} />
            <div className="flex-1">{bar("80%")}</div>
          </div>
          {bar("90%", accent)}
        </div>
      </div>
    );
  }

  // Padrão centralizado (default, glass, neon, vip, ocean, forest, sakura, comic, space, street, aurora)
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2" style={shell}>
      {avatar}
      {bar("55%", text + "cc")}
      {bar("40%")}
      <div className="mt-0.5 grid w-full grid-cols-4 gap-1 px-1">
        {chip}
        {chip}
        {chip}
        {chip}
      </div>
      <div className="mt-0.5 w-3/4" style={{ height: 6, borderRadius: 3, background: accent }} />
    </div>
  );
}

export function TipPageLayoutPicker({ value, onChange }: TipPageLayoutPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {TIP_PAGE_LAYOUTS.map((layout) => {
        const active = value === layout.id;
        return (
          <button
            key={layout.id}
            type="button"
            onClick={() => onChange(layout.id)}
            className={`group flex flex-col overflow-hidden rounded-xl border text-left transition ${
              active
                ? "border-cyan-500/70 ring-2 ring-cyan-500/40"
                : "border-zinc-700/60 hover:border-zinc-500"
            }`}
          >
            <div className="relative h-20 w-full">
              <MiniMock layout={layout} />
              {active && (
                <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 shadow">
                  <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </div>
            <div className={`border-t px-2.5 py-2 ${active ? "border-cyan-500/30 bg-cyan-500/5" : "border-zinc-800 bg-zinc-950/40"}`}>
              <p className={`text-sm font-semibold ${active ? "text-cyan-200" : "text-zinc-200"}`}>
                {layout.name}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-tight text-zinc-500">
                {layout.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
