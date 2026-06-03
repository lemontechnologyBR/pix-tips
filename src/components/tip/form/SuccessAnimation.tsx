"use client";

import Link from "next/link";
import { tipThanksPath } from "@/lib/brand";

interface SuccessAnimationProps {
  username: string;
  amount?: number;
  donorName?: string;
  onDonateAgain?: () => void;
}

export function SuccessAnimation({
  username,
  amount,
  donorName,
  onDonateAgain,
}: SuccessAnimationProps) {
  const params = new URLSearchParams();
  if (amount != null) params.set("amount", String(amount));
  if (donorName) params.set("name", donorName);
  const query = params.toString();
  const thanksHref = query
    ? `${tipThanksPath(username)}?${query}`
    : tipThanksPath(username);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
        <div className="animate-pop-in mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl">
          ✓
        </div>
        <h3 className="mt-4 text-xl font-bold text-emerald-400">
          Pagamento confirmado!
        </h3>
        <p className="mt-2 text-sm text-zinc-400">
          Obrigado pelo apoio. O criador recebeu sua doação.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        {onDonateAgain && (
          <button
            type="button"
            onClick={onDonateAgain}
            className="flex-1 rounded-xl border border-zinc-700 py-3 text-sm font-medium text-zinc-300 hover:border-zinc-500"
          >
            Fazer outra doação
          </button>
        )}
        <Link
          href={thanksHref}
          className="flex-1 rounded-xl bg-zinc-800 py-3 text-center text-sm font-medium text-white hover:bg-zinc-700"
        >
          Ver página de agradecimento
        </Link>
      </div>
    </div>
  );
}
