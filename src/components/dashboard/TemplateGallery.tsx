"use client";

import { useMemo, useState } from "react";
import {
  TEMPLATE_CATALOG,
  TEMPLATE_CATEGORY_LABELS,
  type TemplateCategory,
} from "@/lib/alert-catalog";
import type { AlertSettings } from "@/types";

interface TemplateGalleryProps {
  settings: AlertSettings;
  onSelect: (templateId: AlertSettings["templateId"]) => void;
}

const CATEGORY_TABS: Array<TemplateCategory | "all"> = [
  "all",
  "classic",
  "particles",
  "creative",
  "character",
  "thematic",
  "minimal",
  "interactive",
];

export function TemplateGallery({ settings, onSelect }: TemplateGalleryProps) {
  const [category, setCategory] = useState<TemplateCategory | "all">("all");
  const [query, setQuery] = useState("");

  const selected = TEMPLATE_CATALOG.find((t) => t.id === settings.templateId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TEMPLATE_CATALOG.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    });
  }, [category, query]);

  const counts = useMemo(() => {
    const map: Partial<Record<TemplateCategory | "all", number>> = { all: TEMPLATE_CATALOG.length };
    for (const t of TEMPLATE_CATALOG) {
      map[t.category] = (map[t.category] ?? 0) + 1;
    }
    return map;
  }, []);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Template de alerta</h2>
          {selected && (
            <p className="mt-0.5 text-xs text-zinc-500">
              Selecionado:{" "}
              <span className="text-zinc-300">
                {selected.icon} {selected.name}
              </span>
            </p>
          )}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar template..."
          className="w-full max-w-[200px] rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none"
        />
      </div>

      <div className="scrollbar-thin flex gap-1 overflow-x-auto px-4 py-2">
        {CATEGORY_TABS.map((tab) => {
          const active = category === tab;
          const count = counts[tab] ?? 0;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setCategory(tab)}
              className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                active
                  ? "bg-cyan-500 text-white"
                  : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              {tab === "all" ? "Todos" : TEMPLATE_CATEGORY_LABELS[tab]}
              <span className={`ml-1 ${active ? "text-cyan-200" : "text-zinc-600"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="px-4 py-8 text-center text-xs text-zinc-500">
          Nenhum template encontrado.
        </p>
      ) : (
        <div className="grid max-h-[min(220px,32vh)] grid-cols-[repeat(auto-fill,minmax(68px,1fr))] gap-1.5 overflow-y-auto p-3 sm:gap-2">
          {filtered.map((t) => {
            const locked = false;
            const isSelected = settings.templateId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                disabled={locked}
                title={locked ? `${t.name} — Pro` : `${t.name}: ${t.description}`}
                onClick={() => onSelect(t.id)}
                className={`group relative flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-lg border px-1 py-1.5 text-center transition ${
                  isSelected
                    ? "border-cyan-500 bg-cyan-500/15 ring-1 ring-cyan-500/50"
                    : "border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-600 hover:bg-zinc-900"
                } ${locked ? "cursor-not-allowed opacity-40" : ""}`}
              >
                {isSelected && (
                  <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan-500 text-[8px] text-white">
                    ✓
                  </span>
                )}
                <span className="text-lg leading-none">{t.icon}</span>
                <span className="line-clamp-2 w-full text-[10px] font-medium leading-tight text-zinc-300 group-hover:text-white">
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <p className="border-t border-zinc-800 px-4 py-2 text-[11px] text-zinc-500">
          {selected.description}
        </p>
      )}
    </section>
  );
}
