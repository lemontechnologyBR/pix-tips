"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GOAL_OVERLAY_LAYOUTS } from "@/lib/goal-overlay-layout";
import { getDragPositionStyle, pointerToDragPoint, resolveDragPoint } from "@/lib/overlay-drag-position";
import { TICKER_LAYOUTS } from "@/lib/widget-settings";
import { VIEWERS_OVERLAY_LAYOUTS } from "@/lib/viewers-overlay-layout";
import { ViewersPlatformPicker } from "./ViewersPlatformPicker";
import type {
  AlertSettings,
  Creator,
  GoalOverlayPosition,
  OverlayDragPoint,
  OverlayWidgetDragKey,
  OverlayWidgetSettings,
} from "@/types";
import { UnifiedOverlayWidget } from "@/components/widget/UnifiedOverlayWidget";
import { PREVIEW_DONATIONS } from "@/lib/widget-items";

type PositionField =
  | "goalOverlayPosition"
  | "tickerPosition"
  | "statsPosition"
  | "lastDonationPosition"
  | "supportersPosition"
  | "leaderboardPosition"
  | "viewersPosition";

interface DraggableWidgetDef {
  dragKey: OverlayWidgetDragKey;
  overlayKey: keyof OverlayWidgetSettings;
  label: string;
  field: PositionField;
  handleClass: string;
}

const DRAGGABLE_WIDGETS: DraggableWidgetDef[] = [
  {
    dragKey: "goal",
    overlayKey: "goal",
    label: "Meta",
    field: "goalOverlayPosition",
    handleClass: "border-cyan-400/70 bg-cyan-500/25 text-cyan-100",
  },
  {
    dragKey: "ticker",
    overlayKey: "ticker",
    label: "Ticker",
    field: "tickerPosition",
    handleClass: "border-sky-400/70 bg-sky-600/25 text-sky-100",
  },
  {
    dragKey: "stats",
    overlayKey: "stats",
    label: "Contador",
    field: "statsPosition",
    handleClass: "border-emerald-400/70 bg-emerald-600/25 text-emerald-100",
  },
  {
    dragKey: "lastDonation",
    overlayKey: "lastDonation",
    label: "Última doação",
    field: "lastDonationPosition",
    handleClass: "border-amber-400/70 bg-amber-600/25 text-amber-100",
  },
  {
    dragKey: "supporters",
    overlayKey: "supporters",
    label: "Apoiadores",
    field: "supportersPosition",
    handleClass: "border-pink-400/70 bg-pink-600/25 text-pink-100",
  },
  {
    dragKey: "leaderboard",
    overlayKey: "leaderboard",
    label: "Ranking",
    field: "leaderboardPosition",
    handleClass: "border-cyan-400/70 bg-cyan-600/25 text-cyan-100",
  },
  {
    dragKey: "viewers",
    overlayKey: "viewers",
    label: "Espectadores",
    field: "viewersPosition",
    handleClass: "border-red-400/70 bg-red-600/25 text-red-100",
  },
];

interface OverlayPositionEditorProps {
  creator: Creator;
  settings: AlertSettings;
  onChange: (patch: Partial<AlertSettings>) => void;
}

export function OverlayPositionEditor({
  creator,
  settings,
  onChange,
}: OverlayPositionEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedKey, setSelectedKey] = useState<OverlayWidgetDragKey | null>(null);
  const [draggingKey, setDraggingKey] = useState<OverlayWidgetDragKey | null>(null);

  const enabledWidgets = useMemo(
    () => DRAGGABLE_WIDGETS.filter((w) => settings.overlayWidgets[w.overlayKey]),
    [settings.overlayWidgets],
  );

  useEffect(() => {
    if (!selectedKey || !enabledWidgets.some((w) => w.dragKey === selectedKey)) {
      setSelectedKey(enabledWidgets[0]?.dragKey ?? null);
    }
  }, [enabledWidgets, selectedKey]);

  const updateDragPosition = useCallback(
    (key: OverlayWidgetDragKey, point: OverlayDragPoint) => {
      onChange({
        overlayDragPositions: {
          ...settings.overlayDragPositions,
          [key]: point,
        },
      });
    },
    [onChange, settings.overlayDragPositions],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!draggingKey || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      updateDragPosition(draggingKey, pointerToDragPoint(event.clientX, event.clientY, rect));
    },
    [draggingKey, updateDragPosition],
  );

  const handlePointerUp = useCallback(() => {
    setDraggingKey(null);
  }, []);

  useEffect(() => {
    if (!draggingKey) return;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [draggingKey, handlePointerMove, handlePointerUp]);

  function startDrag(key: OverlayWidgetDragKey, event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setSelectedKey(key);
    setDraggingKey(key);
    event.currentTarget.setPointerCapture(event.pointerId);
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    updateDragPosition(key, pointerToDragPoint(event.clientX, event.clientY, rect));
  }

  function resetWidgetPosition(key: OverlayWidgetDragKey) {
    const next = { ...settings.overlayDragPositions };
    delete next[key];
    onChange({ overlayDragPositions: next });
  }

  const activeWidget = enabledWidgets.find((w) => w.dragKey === selectedKey) ?? enabledWidgets[0];

  if (enabledWidgets.length === 0) {
    return (
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h2 className="font-semibold text-white">Posicionamento visual</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Ative pelo menos um widget acima para arrastar na tela.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-white">Posicionamento visual</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Arraste os widgets com o mouse na preview — solte onde quiser na tela.
          </p>
        </div>
        {activeWidget && (
          <button
            type="button"
            onClick={() => resetWidgetPosition(activeWidget.dragKey)}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
          >
            Resetar {activeWidget.label}
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,10rem)_minmax(0,1fr)]">
        <div className="flex flex-row flex-wrap gap-1.5 lg:flex-col">
          {enabledWidgets.map((widget) => {
            const selected = activeWidget?.dragKey === widget.dragKey;
            const point = resolveDragPoint(
              settings.overlayDragPositions,
              widget.dragKey,
              settings[widget.field] as GoalOverlayPosition,
            );
            return (
              <button
                key={widget.dragKey}
                type="button"
                onClick={() => setSelectedKey(widget.dragKey)}
                className={`rounded-lg border px-3 py-2 text-left transition ${
                  selected
                    ? widget.handleClass
                    : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <span className="block text-sm font-medium">{widget.label}</span>
                <span className="mt-0.5 block text-[10px] opacity-80 tabular-nums">
                  {Math.round(point.x)}% · {Math.round(point.y)}%
                </span>
              </button>
            );
          })}
        </div>

        <div
          ref={containerRef}
          className="relative aspect-video overflow-hidden rounded-xl border border-zinc-700/80 bg-black touch-none select-none"
        >
          <div className="pointer-events-none absolute inset-0">
            <UnifiedOverlayWidget
              userId={creator.id}
              token={creator.widgetToken}
              goal={creator.goal || 500}
              raised={creator.raised || 55}
              goalTitle={creator.tipPageSettings.goalTitle}
              themeColor={creator.themeColor}
              alertSettings={settings}
              initialItems={PREVIEW_DONATIONS}
              previewMode
            />
          </div>

          {enabledWidgets.map((widget) => {
            const point = resolveDragPoint(
              settings.overlayDragPositions,
              widget.dragKey,
              settings[widget.field] as GoalOverlayPosition,
            );
            const selected = activeWidget?.dragKey === widget.dragKey;
            const dragging = draggingKey === widget.dragKey;

            return (
              <div
                key={widget.dragKey}
                className={`absolute z-30 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
                style={getDragPositionStyle(point)}
                onPointerDown={(event) => startDrag(widget.dragKey, event)}
              >
                <div
                  className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold shadow-lg backdrop-blur-sm ${
                    selected || dragging
                      ? widget.handleClass
                      : "border-white/25 bg-black/50 text-white/80 hover:border-cyan-400/60"
                  }`}
                >
                  <span className="text-white/50">⋮⋮</span>
                  {widget.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeWidget && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 space-y-3">
          {activeWidget.overlayKey === "goal" && (
            <div>
              <p className="text-xs text-zinc-500">Layout da meta</p>
              <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-8">
                {GOAL_OVERLAY_LAYOUTS.map((layout) => {
                  const active = settings.goalOverlayLayout === layout.id;
                  return (
                    <button
                      key={layout.id}
                      type="button"
                      title={layout.description}
                      onClick={() => onChange({ goalOverlayLayout: layout.id })}
                      className={`rounded-lg border px-1 py-1.5 text-center transition ${
                        active
                          ? "border-cyan-500 bg-cyan-500/15 text-cyan-200"
                          : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
                      }`}
                    >
                      <span className="block text-sm">{layout.icon}</span>
                      <span className="mt-0.5 block text-[9px] leading-tight">{layout.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeWidget.overlayKey === "ticker" && (
            <div>
              <p className="text-xs text-zinc-500">Estilo do ticker</p>
              <div className="mt-2 flex gap-2">
                {TICKER_LAYOUTS.map((layout) => {
                  const active = settings.tickerLayout === layout.id;
                  return (
                    <button
                      key={layout.id}
                      type="button"
                      onClick={() => onChange({ tickerLayout: layout.id })}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs transition ${
                        active
                          ? "border-sky-500/60 bg-sky-600/10 text-sky-200"
                          : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
                      }`}
                    >
                      {layout.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeWidget.overlayKey === "viewers" && (
            <>
              <div>
                <p className="text-xs text-zinc-500">Plataformas ativas</p>
                <div className="mt-1.5">
                  <ViewersPlatformPicker
                    value={settings.viewersPlatforms}
                    onChange={(viewersPlatforms) => onChange({ viewersPlatforms })}
                  />
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Layout de espectadores</p>
                <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-8">
                  {VIEWERS_OVERLAY_LAYOUTS.map((layout) => {
                    const active = settings.viewersLayout === layout.id;
                    return (
                      <button
                        key={layout.id}
                        type="button"
                        title={layout.description}
                        onClick={() => onChange({ viewersLayout: layout.id })}
                        className={`rounded-lg border px-1 py-1.5 text-center transition ${
                          active
                            ? "border-red-500/60 bg-red-600/10 text-red-200"
                            : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
                        }`}
                      >
                        <span className="block text-sm">{layout.icon}</span>
                        <span className="mt-0.5 block text-[9px] leading-tight">{layout.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
