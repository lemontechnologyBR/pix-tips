"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface PixPaymentProps {
  pixCode: string;
  amount: number;
  expiresIn: number;
  mock?: boolean;
  onSimulatePay?: () => void;
  isSimulating?: boolean;
}

export function PixPayment({
  pixCode,
  amount,
  expiresIn,
  mock = false,
  onSimulatePay,
  isSimulating,
}: PixPaymentProps) {
  const minutes = Math.floor(expiresIn / 60);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setQrDataUrl(null);
    setQrError(false);

    QRCode.toDataURL(pixCode, {
      width: 320,
      margin: 1,
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [pixCode]);

  async function copyCode() {
    await navigator.clipboard.writeText(pixCode);
  }

  return (
    <div className="space-y-4 rounded-xl border border-zinc-700 bg-zinc-900/80 p-5">
      <div className="text-center">
        <p className="text-sm text-zinc-400">Escaneie o QR Code ou copie o Pix</p>
        <p className="mt-1 text-xl font-bold text-white">
          R$ {amount.toFixed(2).replace(".", ",")}
        </p>
      </div>

      <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-lg bg-white p-2">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt="QR Code Pix"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-xs text-zinc-500">
            {qrError ? "Erro ao gerar QR Code" : "Gerando QR Code..."}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs text-zinc-500">Copia e cola</label>
        <div className="flex gap-2">
          <input
            readOnly
            value={pixCode}
            className="flex-1 truncate rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-300"
          />
          <button
            type="button"
            onClick={copyCode}
            className="rounded-lg bg-zinc-700 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-600"
          >
            Copiar
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-zinc-500">
        Expira em {minutes} min
        {mock ? " · Confirmação automática em ~8s (demo)" : " · Aguardando confirmação do pagamento"}
      </p>

      {mock && onSimulatePay && (
        <button
          type="button"
          onClick={onSimulatePay}
          disabled={isSimulating}
          className="w-full rounded-lg border border-dashed border-zinc-600 py-2 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 disabled:opacity-50"
        >
          {isSimulating ? "Confirmando..." : "Simular pagamento agora (demo)"}
        </button>
      )}
    </div>
  );
}
