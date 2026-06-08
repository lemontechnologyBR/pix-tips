import type { TipPageFormTheme } from "@/lib/tip-page-theme";
import { resolveTipPageFormTheme } from "@/lib/tip-page-theme";

interface SubmitButtonProps {
  themeColor: string;
  amountLabel: string;
  loading?: boolean;
  disabled?: boolean;
  formTheme?: TipPageFormTheme;
}

export function SubmitButton({
  themeColor,
  amountLabel,
  loading,
  disabled,
  formTheme,
}: SubmitButtonProps) {
  const t = formTheme ?? resolveTipPageFormTheme();
  const label = loading ? "Gerando pagamento..." : t.mode === "retro" ? `► DOAR ${amountLabel}` : t.mode === "matrix" ? `[ EXEC ] DOAR ${amountLabel}` : t.mode === "neon" ? `▸ DOAR ${amountLabel}` : `Doar ${amountLabel}`;

  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={t.submit}
      style={{
        backgroundColor: t.mode === "matrix" ? undefined : themeColor,
        borderColor: t.mode === "retro" || t.mode === "matrix" ? themeColor : undefined,
        boxShadow: t.mode === "retro" ? `4px 4px 0 ${themeColor}` : t.mode === "neon" ? `0 0 20px ${themeColor}60` : undefined,
        color: t.mode === "vip" ? "#1c1004" : undefined,
      }}
    >
      {label}
    </button>
  );
}
