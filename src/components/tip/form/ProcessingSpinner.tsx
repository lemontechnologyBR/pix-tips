export function ProcessingSpinner() {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-cyan-500" />
      <p className="text-sm text-zinc-400">Gerando pagamento...</p>
    </div>
  );
}
