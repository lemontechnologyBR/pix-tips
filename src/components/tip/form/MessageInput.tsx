import type { TipPageFormTheme } from "@/lib/tip-page-theme";
import { resolveTipPageFormTheme } from "@/lib/tip-page-theme";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  donorName?: string;
  onDonorNameChange?: (value: string) => void;
  showDonorName?: boolean;
  formTheme?: TipPageFormTheme;
}

export function MessageInput({
  value,
  onChange,
  donorName = "",
  onDonorNameChange,
  showDonorName = true,
  formTheme,
}: MessageInputProps) {
  const t = formTheme ?? resolveTipPageFormTheme();

  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = t.focusColor;
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = "";
    },
  };

  return (
    <>
      {showDonorName && onDonorNameChange && (
        <div>
          <label className={t.label}>Seu nome</label>
          <input
            type="text"
            value={donorName}
            onChange={(e) => onDonorNameChange(e.target.value)}
            maxLength={50}
            placeholder="Como aparecerá no alerta"
            className={t.input}
            {...focusHandlers}
          />
        </div>
      )}
      <div>
        <label className={t.label}>Mensagem (opcional)</label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, 200))}
          rows={3}
          placeholder="Deixe uma mensagem para o criador..."
          className={t.textarea}
          {...focusHandlers}
        />
        <p className={`mt-1 text-right text-xs ${t.muted.replace("text-center ", "")}`}>{value.length}/200</p>
      </div>
    </>
  );
}
