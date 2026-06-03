export function PaymentWaiting() {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-6 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-400" />
      </div>
      <h3 className="text-lg font-semibold text-amber-400">Aguardando pagamento</h3>
      <p className="mt-2 text-sm text-zinc-400">
        Assim que confirmar, o alerta dispara na live.
      </p>
    </div>
  );
}
