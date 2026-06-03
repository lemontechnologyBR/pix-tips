"use client";

type PaymentStatusVariant = "awaiting" | "confirmed" | "failed" | "expired";

interface PaymentStatusProps {
  variant: PaymentStatusVariant;
  message?: string;
}

const config: Record<
  PaymentStatusVariant,
  { title: string; description: string; color: string }
> = {
  awaiting: {
    title: "Aguardando pagamento",
    description: "Assim que o Pix for confirmado, o alerta dispara na live.",
    color: "text-amber-400",
  },
  confirmed: {
    title: "Pagamento confirmado!",
    description: "Obrigado pelo apoio. O criador recebeu sua doação.",
    color: "text-emerald-400",
  },
  failed: {
    title: "Pagamento falhou",
    description: "Não foi possível processar. Tente novamente.",
    color: "text-red-400",
  },
  expired: {
    title: "Pix expirado",
    description: "Gere um novo pagamento para continuar.",
    color: "text-zinc-400",
  },
};

export function PaymentStatus({ variant, message }: PaymentStatusProps) {
  const { title, description, color } = config[variant];

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-6 text-center">
      {variant === "confirmed" && (
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-2xl">
          ✓
        </div>
      )}
      <h3 className={`text-lg font-semibold ${color}`}>{title}</h3>
      <p className="mt-2 text-sm text-zinc-400">{message ?? description}</p>
    </div>
  );
}
