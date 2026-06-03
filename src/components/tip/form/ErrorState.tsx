interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="text-2xl">✕</p>
        <h3 className="mt-2 text-lg font-semibold text-red-400">Pagamento falhou</h3>
        <p className="mt-2 text-sm text-zinc-400">
          {message ?? "Não foi possível processar. Tente novamente."}
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="w-full rounded-xl bg-zinc-800 py-3 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
