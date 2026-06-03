import { formatCurrency } from "@/lib/format";

interface GoalProgressBarProps {
  raised: number;
  goal: number;
  themeColor: string;
  goalTitle?: string;
}

export function GoalProgressBar({
  raised,
  goal,
  themeColor,
  goalTitle = "Meta da live",
}: GoalProgressBarProps) {
  if (goal <= 0) return null;

  const percent = Math.min((raised / goal) * 100, 100);

  return (
    <div className="w-full max-w-lg">
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-zinc-400">{goalTitle}</span>
        <span className="font-medium text-white">
          {formatCurrency(raised)} / {formatCurrency(goal)}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percent}%`, backgroundColor: themeColor }}
        />
      </div>
      <p className="mt-1 text-right text-xs text-zinc-500">{percent.toFixed(0)}%</p>
    </div>
  );
}
