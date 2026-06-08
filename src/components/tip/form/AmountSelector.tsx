import type { TipPageFormTheme } from "@/lib/tip-page-theme";
import { resolveTipPageFormTheme } from "@/lib/tip-page-theme";

interface AmountSelectorProps {
  presets: number[];
  amount: number;
  customAmount: string;
  themeColor: string;
  formTheme?: TipPageFormTheme;
  onSelectPreset: (value: number) => void;
  onCustomChange: (value: string) => void;
}

export function AmountSelector({
  presets,
  amount,
  customAmount,
  themeColor,
  formTheme,
  onSelectPreset,
  onCustomChange,
}: AmountSelectorProps) {
  const t = formTheme ?? resolveTipPageFormTheme();

  return (
    <div>
      <label className={t.label}>Valor</label>
      <div className="grid grid-cols-4 gap-2">
          {presets.map((value) => {
            const active = amount === value && customAmount === "";
            return (
            <button
              key={value}
              type="button"
              onClick={() => onSelectPreset(value)}
              className={active ? t.presetActive : t.presetInactive}
              style={
                active
                  ? { backgroundColor: themeColor, borderColor: t.mode === "retro" || t.mode === "matrix" ? themeColor : undefined, boxShadow: t.mode === "retro" ? `3px 3px 0 ${themeColor}` : t.mode === "vip" ? `0 0 12px ${themeColor}60` : undefined }
                  : t.mode === "retro" ? { borderColor: "#3f3f46", boxShadow: "3px 3px 0 #3f3f46" }
                  : undefined
              }
            >
              R${value}
            </button>
            );
          })}
      </div>
      <input
        type="text"
        inputMode="decimal"
        placeholder="Outro valor (R$)"
        value={customAmount}
        onChange={(e) => onCustomChange(e.target.value)}
        className={`mt-2 ${t.input}`}
        style={{ borderColor: undefined }}
        onFocus={(e) => { e.currentTarget.style.borderColor = t.focusColor; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = ""; }}
      />
    </div>
  );
}
