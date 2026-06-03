export function WidgetError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent p-6">
      <div className="max-w-sm rounded-xl border border-red-500/30 bg-black/80 px-6 py-5 text-center backdrop-blur">
        <p className="text-2xl">⚠️</p>
        <h1 className="mt-2 font-semibold text-white">Widget inválido</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Verifique o link e o token do criador nas configurações de alertas.
        </p>
      </div>
    </div>
  );
}
