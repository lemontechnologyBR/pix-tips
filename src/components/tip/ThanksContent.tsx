import Link from "next/link";
import { tipPagePath } from "@/lib/brand";
import type { Creator } from "@/types";
import { formatCurrency } from "@/lib/format";

interface ThanksContentProps {
  creator: Creator;
  amount?: number;
  donorName?: string;
}

export function ThanksContent({
  creator,
  amount,
  donorName,
}: ThanksContentProps) {
  const hasPersonalization = donorName || amount != null;

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 text-center backdrop-blur">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-4xl">
        ✓
      </div>

      {hasPersonalization ? (
        <>
          <h1 className="mt-4 text-2xl font-bold text-white">
            {donorName ? `Obrigado, ${donorName}!` : "Obrigado pela doação!"}
          </h1>
          {amount != null && (
            <p className="mt-4 text-3xl font-black text-emerald-400">
              {formatCurrency(amount)}
            </p>
          )}
          <p className="mt-2 text-zinc-400">
            {amount != null
              ? "sua doação foi recebida com sucesso."
              : creator.tipPageSettings.thankYouMessage}
          </p>
        </>
      ) : (
        <>
          <h1 className="mt-4 text-2xl font-bold text-white">
            Obrigado pela doação!
          </h1>
          <p className="mt-2 text-zinc-400">
            {creator.tipPageSettings.thankYouMessage}
          </p>
        </>
      )}

      <Link
        href={tipPagePath(creator.username)}
        className="mt-8 inline-block text-sm text-cyan-400 hover:text-cyan-300"
      >
        ← Voltar para a página
      </Link>
    </div>
  );
}
