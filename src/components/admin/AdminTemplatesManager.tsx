"use client";

import { useState } from "react";
import { TEMPLATE_CATEGORY_LABELS } from "@/lib/alert-catalog";
import type { PlanType } from "@/types";

export interface AdminTemplateItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  catalogPlan: PlanType;
  effectivePlan: PlanType;
  hasOverride: boolean;
}

interface AdminTemplatesManagerProps {
  initialTemplates: AdminTemplateItem[];
}

export function AdminTemplatesManager({
  initialTemplates,
}: AdminTemplatesManagerProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | PlanType>("all");

  const filtered = templates.filter((t) => {
    if (filter === "all") return true;
    return t.effectivePlan === filter;
  });

  async function togglePlan(template: AdminTemplateItem) {
    const nextPlan: PlanType = template.effectivePlan === "pro" ? "free" : "pro";
    setLoadingId(template.id);
    try {
      const res = await fetch("/api/admin/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id, plan: nextPlan }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { templates: AdminTemplateItem[] };
      setTemplates(data.templates);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["all", "free", "pro"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filter === f
                ? "bg-red-600 text-white"
                : "border border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
          >
            {f === "all" ? "Todos" : f === "pro" ? "Pro" : "Free"}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{t.icon}</span>
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-zinc-500">
                    {TEMPLATE_CATEGORY_LABELS[
                      t.category as keyof typeof TEMPLATE_CATEGORY_LABELS
                    ] ?? t.category}
                  </p>
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                  t.effectivePlan === "pro"
                    ? "bg-cyan-500/15 text-cyan-400"
                    : "bg-zinc-700/50 text-zinc-400"
                }`}
              >
                {t.effectivePlan === "pro" ? "Pro" : "Free"}
              </span>
            </div>
            <p className="mt-2 text-sm text-zinc-400">{t.description}</p>
            {t.hasOverride && (
              <p className="mt-1 text-xs text-amber-500">
                Override (catálogo: {t.catalogPlan})
              </p>
            )}
            <button
              type="button"
              disabled={loadingId === t.id}
              onClick={() => togglePlan(t)}
              className="mt-4 w-full rounded-lg border border-zinc-700 py-2 text-sm hover:border-zinc-500 disabled:opacity-50"
            >
              {loadingId === t.id
                ? "Salvando..."
                : t.effectivePlan === "pro"
                  ? "Tornar Free"
                  : "Tornar Pro"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
