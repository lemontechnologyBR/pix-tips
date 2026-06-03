import { formatCurrency } from "@/lib/format";
import {
  getGoalOverlayShellClass,
  getGoalOverlaySurfaceClass,
  normalizeGoalOverlayLayout,
} from "@/lib/goal-overlay-layout";
import { normalizeGoalOverlayPosition } from "@/lib/goal-overlay-position";
import type { GoalOverlayLayout, GoalOverlayPosition, OverlayDragPoint } from "@/types";
import { OverlayPositionShell } from "./OverlayPositionShell";

interface GoalOverlayProps {
  raised: number;
  goal: number;
  goalTitle: string;
  themeColor: string;
  position?: GoalOverlayPosition;
  dragPosition?: OverlayDragPoint | null;
  layout?: GoalOverlayLayout;
  embedded?: boolean;
  show?: boolean;
  compact?: boolean;
  barColor?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  showPercentage?: boolean;
  showValues?: boolean;
  fontSize?: number;
}

interface GoalMetrics {
  hasGoal: boolean;
  percent: number;
  raised: number;
  goal: number;
  goalTitle: string;
  themeColor: string;
  compact: boolean;
  barColor: string;
  textColor: string | null;
  showPercentage: boolean;
  showValues: boolean;
  fontSize: number;
}

function GoalLayoutClassic({ m }: { m: GoalMetrics }) {
  const textStyle = m.textColor ? { color: m.textColor } : undefined;
  return (
    <>
      <p
        className={`truncate text-center font-medium ${m.compact ? "text-[10px]" : "text-xs"}`}
        style={textStyle ?? { color: "rgba(255,255,255,0.8)" }}
      >
        {m.goalTitle}
      </p>
      <div
        className={`overflow-hidden rounded-full bg-white/15 ${m.compact ? "mt-1.5 h-1.5" : "mt-2 h-2"}`}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: m.hasGoal ? `${m.percent}%` : "0%",
            backgroundColor: m.barColor,
          }}
        />
      </div>
      <div className="mt-1.5 flex items-baseline justify-between gap-2">
        {m.showValues && (
          <span
            className={`font-semibold ${m.compact ? "text-[10px]" : "text-sm"}`}
            style={textStyle ?? { color: "white" }}
          >
            {formatCurrency(m.raised)}
            {m.hasGoal ? (
              <span
                className={`font-normal ${m.compact ? "text-[10px]" : "text-xs"}`}
                style={m.textColor ? { color: m.textColor + "99" } : { color: "rgba(255,255,255,0.5)" }}
              >
                {" "}
                / {formatCurrency(m.goal)}
              </span>
            ) : (
              <span
                className={`font-normal text-amber-300/90 ${m.compact ? "text-[10px]" : "text-xs"}`}
              >
                {" "}
                · defina a meta
              </span>
            )}
          </span>
        )}
        {m.hasGoal && m.showPercentage && (
          <span
            className={`font-medium ${m.compact ? "text-[10px]" : "text-xs"}`}
            style={m.textColor ? { color: m.textColor + "99" } : { color: "rgba(255,255,255,0.6)" }}
          >
            {m.percent.toFixed(0)}%
          </span>
        )}
      </div>
    </>
  );
}

function GoalLayoutMinimal({ m }: { m: GoalMetrics }) {
  const textStyle = m.textColor ? { color: m.textColor } : undefined;
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span
          className={`truncate font-medium ${m.compact ? "text-[9px]" : "text-[10px]"}`}
          style={textStyle ?? { color: "rgba(255,255,255,0.7)" }}
        >
          {m.goalTitle}
        </span>
        {m.hasGoal && m.showPercentage && (
          <span
            className={`shrink-0 font-semibold ${m.compact ? "text-[9px]" : "text-[10px]"}`}
            style={textStyle ?? { color: "rgba(255,255,255,0.8)" }}
          >
            {m.percent.toFixed(0)}%
          </span>
        )}
      </div>
      <div
        className={`overflow-hidden rounded-full bg-white/10 ${m.compact ? "mt-1 h-1" : "mt-1.5 h-1.5"}`}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: m.hasGoal ? `${m.percent}%` : "0%",
            backgroundColor: m.barColor,
          }}
        />
      </div>
    </>
  );
}

function GoalLayoutPill({ m }: { m: GoalMetrics }) {
  const textStyle = m.textColor ? { color: m.textColor } : undefined;
  return (
    <div className="flex items-center gap-2">
      <span
        className={`shrink-0 font-medium ${m.compact ? "text-[9px]" : "text-[10px]"}`}
        style={textStyle ?? { color: "rgba(255,255,255,0.8)" }}
      >
        {m.goalTitle}
      </span>
      <div
        className={`min-w-[3rem] flex-1 overflow-hidden rounded-full bg-white/15 ${m.compact ? "h-1" : "h-1.5"}`}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: m.hasGoal ? `${m.percent}%` : "0%",
            backgroundColor: m.barColor,
          }}
        />
      </div>
      {m.showPercentage && (
        <span
          className={`shrink-0 font-bold ${m.compact ? "text-[9px]" : "text-[10px]"}`}
          style={textStyle ?? { color: "white" }}
        >
          {m.hasGoal ? `${m.percent.toFixed(0)}%` : "—"}
        </span>
      )}
    </div>
  );
}

function GoalLayoutBanner({ m }: { m: GoalMetrics }) {
  const textStyle = m.textColor ? { color: m.textColor } : undefined;
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <p
          className={`truncate font-semibold ${m.compact ? "text-[10px]" : "text-xs"}`}
          style={textStyle ?? { color: "white" }}
        >
          {m.goalTitle}
        </p>
        {m.hasGoal && m.showPercentage && (
          <span
            className={`shrink-0 font-bold ${m.compact ? "text-[10px]" : "text-xs"}`}
            style={textStyle ?? { color: "white" }}
          >
            {m.percent.toFixed(0)}%
          </span>
        )}
      </div>
      <div
        className={`overflow-hidden rounded-full bg-white/10 ${m.compact ? "mt-1.5 h-2" : "mt-2 h-2.5"}`}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: m.hasGoal ? `${m.percent}%` : "0%",
            backgroundColor: m.barColor,
            boxShadow: `0 0 12px ${m.barColor}66`,
          }}
        />
      </div>
      {m.showValues && (
        <p
          className={`mt-1.5 text-center ${m.compact ? "text-[9px]" : "text-[10px]"}`}
          style={m.textColor ? { color: m.textColor + "99" } : { color: "rgba(255,255,255,0.6)" }}
        >
          {formatCurrency(m.raised)}
          {m.hasGoal ? ` / ${formatCurrency(m.goal)}` : " · meta não definida"}
        </p>
      )}
    </>
  );
}

function GoalLayoutRing({ m }: { m: GoalMetrics }) {
  const size = m.compact ? 56 : 68;
  const stroke = m.compact ? 4 : 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (m.hasGoal ? m.percent / 100 : 0) * circumference;
  const textStyle = m.textColor ? { color: m.textColor } : undefined;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={m.barColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {m.showPercentage && (
          <span
            className={`font-bold leading-none ${m.compact ? "text-xs" : "text-sm"}`}
            style={textStyle ?? { color: "white" }}
          >
            {m.hasGoal ? `${m.percent.toFixed(0)}%` : "—"}
          </span>
        )}
        {!m.compact && (
          <span
            className="mt-0.5 max-w-[90%] truncate text-[8px]"
            style={m.textColor ? { color: m.textColor + "80" } : { color: "rgba(255,255,255,0.5)" }}
          >
            {m.goalTitle}
          </span>
        )}
      </div>
    </div>
  );
}

function GoalLayoutNeon({ m }: { m: GoalMetrics }) {
  const textStyle = m.textColor ? { color: m.textColor } : undefined;
  return (
    <>
      <p
        className={`truncate text-center font-semibold tracking-wide ${m.compact ? "text-[10px]" : "text-xs"}`}
        style={{ ...(textStyle ?? { color: "white" }), textShadow: `0 0 8px ${m.barColor}` }}
      >
        {m.goalTitle}
      </p>
      <div
        className={`overflow-hidden rounded-full bg-white/10 ${m.compact ? "mt-1.5 h-2" : "mt-2 h-2.5"}`}
        style={{ boxShadow: `inset 0 0 8px ${m.barColor}44` }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: m.hasGoal ? `${m.percent}%` : "0%",
            backgroundColor: m.barColor,
            boxShadow: `0 0 10px ${m.barColor}`,
          }}
        />
      </div>
      <div className="mt-1.5 flex justify-between gap-2">
        {m.showValues && (
          <span
            className={`font-medium ${m.compact ? "text-[9px]" : "text-[10px]"}`}
            style={textStyle ?? { color: "rgba(255,255,255,0.8)" }}
          >
            {formatCurrency(m.raised)}
          </span>
        )}
        {m.hasGoal && m.showPercentage && (
          <span
            className={`font-bold ${m.compact ? "text-[10px]" : "text-xs"}`}
            style={textStyle ?? { color: m.barColor }}
          >
            {m.percent.toFixed(0)}%
          </span>
        )}
      </div>
    </>
  );
}

function GoalLayoutBold({ m }: { m: GoalMetrics }) {
  const textStyle = m.textColor ? { color: m.textColor } : undefined;
  return (
    <>
      <p
        className={`truncate text-center ${m.compact ? "text-[9px]" : "text-[10px]"}`}
        style={m.textColor ? { color: m.textColor + "b3" } : { color: "rgba(255,255,255,0.7)" }}
      >
        {m.goalTitle}
      </p>
      {m.showPercentage && (
        <p
          className={`mt-1 text-center font-black leading-none ${m.compact ? "text-2xl" : "text-3xl"}`}
          style={{ ...(textStyle ?? { color: "white" }), textShadow: `0 0 16px ${m.barColor}88` }}
        >
          {m.hasGoal ? `${m.percent.toFixed(0)}%` : "—"}
        </p>
      )}
      <div
        className={`overflow-hidden rounded-full bg-white/10 ${m.compact ? "mt-2 h-2.5" : "mt-2.5 h-3"}`}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: m.hasGoal ? `${m.percent}%` : "0%",
            backgroundColor: m.barColor,
          }}
        />
      </div>
      {m.showValues && (
        <p
          className={`mt-1.5 text-center font-semibold ${m.compact ? "text-[10px]" : "text-xs"}`}
          style={m.textColor ? { color: m.textColor + "e6" } : { color: "rgba(255,255,255,0.9)" }}
        >
          {formatCurrency(m.raised)}
          {m.hasGoal && (
            <span style={m.textColor ? { color: m.textColor + "80" } : { color: "rgba(255,255,255,0.5)" }}>
              {" "}/ {formatCurrency(m.goal)}
            </span>
          )}
        </p>
      )}
    </>
  );
}

function GoalLayoutStream({ m }: { m: GoalMetrics }) {
  const barHeight = m.compact ? 34 : 42;
  const label = m.goalTitle.toUpperCase();
  const values = m.hasGoal && m.showValues
    ? `(${formatCurrency(m.raised)}/${formatCurrency(m.goal)})`
    : m.showValues ? `(${formatCurrency(m.raised)})` : "";
  const pct = m.hasGoal && m.showPercentage ? ` ${m.percent.toFixed(0)}%` : "";

  return (
    <div
      className="relative min-w-0 w-full overflow-hidden border border-black/40 shadow-[0_4px_16px_rgba(0,0,0,0.45)]"
      style={{ height: barHeight }}
    >
      <div className="absolute inset-0 bg-[#3a3a3a]/88 backdrop-blur-[2px]" />
      <div
        className="absolute inset-y-0 left-0 transition-all duration-700 ease-out"
        style={{ width: m.hasGoal ? `${m.percent}%` : "0%", backgroundColor: m.barColor, opacity: 0.75 }}
      />
      <div className="relative z-[1] flex h-full items-center overflow-hidden px-2.5 sm:px-3">
        <p
          className={`truncate font-extrabold uppercase tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${
            m.compact ? "text-[9px] leading-tight" : "text-[11px] sm:text-xs"
          }`}
          style={m.textColor ? { color: m.textColor } : { color: "white" }}
        >
          {label} {values}{pct}
        </p>
      </div>
    </div>
  );
}

function GoalLayoutBody({
  layout,
  metrics,
}: {
  layout: GoalOverlayLayout;
  metrics: GoalMetrics;
}) {
  switch (layout) {
    case "stream":
      return <GoalLayoutStream m={metrics} />;
    case "minimal":
      return <GoalLayoutMinimal m={metrics} />;
    case "pill":
      return <GoalLayoutPill m={metrics} />;
    case "banner":
      return <GoalLayoutBanner m={metrics} />;
    case "ring":
      return <GoalLayoutRing m={metrics} />;
    case "neon":
      return <GoalLayoutNeon m={metrics} />;
    case "bold":
      return <GoalLayoutBold m={metrics} />;
    case "classic":
    default:
      return <GoalLayoutClassic m={metrics} />;
  }
}

export function GoalOverlay({
  raised,
  goal,
  goalTitle,
  themeColor,
  position = "top-center",
  dragPosition,
  layout = "classic",
  embedded = false,
  show = true,
  compact = false,
  barColor = null,
  bgColor = null,
  textColor = null,
  showPercentage = true,
  showValues = true,
  fontSize = 14,
}: GoalOverlayProps) {
  if (!show) return null;

  const normalizedLayout = normalizeGoalOverlayLayout(layout);
  const normalizedPosition = normalizeGoalOverlayPosition(position);
  const hasGoal = goal > 0;
  const percent = hasGoal ? Math.min((raised / goal) * 100, 100) : 0;
  const widthClass = getGoalOverlayShellClass(normalizedLayout, compact);
  const surfaceClass = getGoalOverlaySurfaceClass(normalizedLayout);
  const isStream = normalizedLayout === "stream";

  const resolvedBarColor = barColor ?? themeColor;

  const metrics: GoalMetrics = {
    hasGoal,
    percent,
    raised,
    goal,
    goalTitle,
    themeColor,
    compact,
    barColor: resolvedBarColor,
    textColor,
    showPercentage,
    showValues,
    fontSize,
  };

  const neonBorderStyle =
    normalizedLayout === "neon"
      ? { borderColor: `${resolvedBarColor}99`, boxShadow: `0 0 20px ${resolvedBarColor}44` }
      : undefined;

  const bgStyle = bgColor
    ? { backgroundColor: bgColor }
    : undefined;

  const fontStyle = fontSize !== 14 ? { fontSize: `${fontSize}px` } : undefined;

  return (
    <OverlayPositionShell
      position={normalizedPosition}
      dragPosition={dragPosition}
      embedded={embedded}
      className={`${widthClass} ${isStream ? "" : "shadow-lg"} ${surfaceClass}`}
      style={{ ...neonBorderStyle, ...bgStyle, ...fontStyle }}
    >
      <GoalLayoutBody layout={normalizedLayout} metrics={metrics} />
    </OverlayPositionShell>
  );
}

