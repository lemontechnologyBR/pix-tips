interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  donorName?: string;
  onDonorNameChange?: (value: string) => void;
  showDonorName?: boolean;
}

export function MessageInput({
  value,
  onChange,
  donorName = "",
  onDonorNameChange,
  showDonorName = true,
}: MessageInputProps) {
  return (
    <>
      {showDonorName && onDonorNameChange && (
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Seu nome
          </label>
          <input
            type="text"
            value={donorName}
            onChange={(e) => onDonorNameChange(e.target.value)}
            maxLength={50}
            placeholder="Como aparecerá no alerta"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      )}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Mensagem (opcional)
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, 200))}
          rows={3}
          placeholder="Deixe uma mensagem para o criador..."
          className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-cyan-500 focus:outline-none"
        />
        <p className="mt-1 text-right text-xs text-zinc-500">{value.length}/200</p>
      </div>
    </>
  );
}
