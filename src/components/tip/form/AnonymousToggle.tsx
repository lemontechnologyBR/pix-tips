import type { TipPageFormTheme } from "@/lib/tip-page-theme";
import { resolveTipPageFormTheme } from "@/lib/tip-page-theme";

interface AnonymousToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  formTheme?: TipPageFormTheme;
}

export function AnonymousToggle({ checked, onChange, formTheme }: AnonymousToggleProps) {
  const t = formTheme ?? resolveTipPageFormTheme();
  const labelClass = t.mode === "light" || t.mode === "news" || t.mode === "comic"
    ? "flex cursor-pointer items-center gap-2 text-sm text-gray-500"
    : "flex cursor-pointer items-center gap-2 text-sm text-zinc-400";

  return (
    <label className={labelClass}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-zinc-600"
      />
      Doar como anônimo
    </label>
  );
}
