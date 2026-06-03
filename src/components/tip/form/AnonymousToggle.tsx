interface AnonymousToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function AnonymousToggle({ checked, onChange }: AnonymousToggleProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
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
