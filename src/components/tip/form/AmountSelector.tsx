interface AmountSelectorProps {
  presets: number[];
  amount: number;
  customAmount: string;
  themeColor: string;
  onSelectPreset: (value: number) => void;
  onCustomChange: (value: string) => void;
}

export function AmountSelector({
  presets,
  amount,
  customAmount,
  themeColor,
  onSelectPreset,
  onCustomChange,
}: AmountSelectorProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-300">Valor</label>
      <div className="grid grid-cols-4 gap-2">
          {presets.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onSelectPreset(value)}
              className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                amount === value && customAmount === ""
                  ? "text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
              style={
                amount === value && customAmount === ""
                  ? { backgroundColor: themeColor }
                  : undefined
              }
            >
              R${value}
            </button>
          ))}
      </div>
      <input
        type="text"
        inputMode="decimal"
        placeholder="Outro valor (R$)"
        value={customAmount}
        onChange={(e) => onCustomChange(e.target.value)}
        className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-cyan-500 focus:outline-none"
      />
    </div>
  );
}
