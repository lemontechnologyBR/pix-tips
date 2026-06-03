interface SubmitButtonProps {
  themeColor: string;
  amountLabel: string;
  loading?: boolean;
  disabled?: boolean;
}

export function SubmitButton({
  themeColor,
  amountLabel,
  loading,
  disabled,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="w-full rounded-xl py-3.5 text-base font-bold text-white transition hover:opacity-90 disabled:opacity-50"
      style={{ backgroundColor: themeColor }}
    >
      {loading ? "Gerando pagamento..." : `Doar ${amountLabel}`}
    </button>
  );
}
