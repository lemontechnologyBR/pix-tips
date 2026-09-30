"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { io, type Socket } from "socket.io-client";
import type { Creator, DonationFormState } from "@/types";
import { computeDonorServiceFee, computePixChargeAmount } from "@/lib/finance";
import { PixPayment } from "./PixPayment";
import { AmountSelector } from "./form/AmountSelector";
import { MessageInput } from "./form/MessageInput";
import { AnonymousToggle } from "./form/AnonymousToggle";
import { SubmitButton } from "./form/SubmitButton";
import { ProcessingSpinner } from "./form/ProcessingSpinner";
import { PaymentWaiting } from "./form/PaymentWaiting";
import { SuccessAnimation } from "./form/SuccessAnimation";
import { ErrorState } from "./form/ErrorState";
import { TTS_VOICES, resolveTtsVoiceId, type TtsVoiceConfig } from "@/lib/tts-config";
import { speakText } from "@/lib/tts";
import { resolveTipPageFormTheme } from "@/lib/tip-page-theme";

// ─── ícone SVG único por voz ────────────────────────────────────────────────
function VoiceIcon({ voiceId, color }: { voiceId: string; color: string }) {
  const c = color;
  switch (voiceId) {
    case "francisca":
      return (
        <svg viewBox="0 0 40 40" className="h-full w-full">
          <circle cx="20" cy="20" r="20" fill={c + "30"} />
          <rect x="16" y="8" width="8" height="14" rx="4" fill={c} />
          <path d="M11 20a9 9 0 0 0 18 0" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" />
          <line x1="20" y1="29" x2="20" y2="33" stroke={c} strokeWidth="2" strokeLinecap="round" />
          <line x1="15" y1="33" x2="25" y2="33" stroke={c} strokeWidth="2" strokeLinecap="round" />
          <circle cx="26" cy="13" r="3" fill="#f472b6" opacity="0.8" />
        </svg>
      );
    case "antonio":
      return (
        <svg viewBox="0 0 40 40" className="h-full w-full">
          <circle cx="20" cy="20" r="20" fill={c + "30"} />
          <rect x="16" y="8" width="8" height="14" rx="4" fill={c} />
          <path d="M11 20a9 9 0 0 0 18 0" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <line x1="20" y1="29" x2="20" y2="33" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="14" y1="33" x2="26" y2="33" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case "thalita":
      return (
        <svg viewBox="0 0 40 40" className="h-full w-full">
          <circle cx="20" cy="20" r="20" fill={c + "30"} />
          <polygon points="20,6 22.5,14 31,14 24.5,19 27,27 20,22 13,27 15.5,19 9,14 17.5,14" fill={c} opacity="0.9" />
          <circle cx="20" cy="20" r="3" fill="white" opacity="0.3" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 40 40" className="h-full w-full">
          <circle cx="20" cy="20" r="20" fill={c + "30"} />
          <rect x="16" y="9" width="8" height="13" rx="4" fill={c} />
          <path d="M12 20a8 8 0 0 0 16 0" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" />
          <line x1="20" y1="28" x2="20" y2="32" stroke={c} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}

interface VoiceSelectorProps {
  voices: TtsVoiceConfig[];
  selected: string;
  onSelect: (id: string) => void;
}

function VoiceSelector({ voices, selected, onSelect }: VoiceSelectorProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const currentVoice = voices.find((v) => v.id === selected) ?? voices[0];

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* ── Trigger (estilo do screenshot) ── */}
      <label className="mb-1 block text-xs font-medium text-zinc-400">Voz</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-xl border border-zinc-700/70 bg-zinc-900 px-3 py-2.5 text-left transition hover:border-zinc-600"
      >
        {/* Avatar miniatura */}
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full" style={{ background: currentVoice?.avatarColor + "30" }}>
          {currentVoice && (
            <VoiceIcon voiceId={currentVoice.id} color={currentVoice.avatarColor} />
          )}
        </div>
        <span className="flex-1 text-sm font-medium text-white">
          {currentVoice?.name ?? "Voz padrão"}
        </span>
        {currentVoice?.isMicrosoft && (
          <span className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-sky-500/20 text-sky-300">
            Microsoft
          </span>
        )}
        {/* Chevron */}
        <svg
          className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* ── Painel (modal sobre o formulário) ── */}
      {open && (
        <div className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900 shadow-2xl"
          style={{ maxHeight: "340px" }}>
          {/* Cabeçalho */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <span className="text-sm font-semibold text-white">Escolha uma voz</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Grade de vozes */}
          <div className="overflow-y-auto p-3" style={{ maxHeight: "280px" }}>
            <div className="grid grid-cols-3 gap-2">
              {voices.map((voice) => {
                const active = selected === voice.id;
                return (
                  <button
                    key={voice.id}
                    type="button"
                    onClick={() => {
                      onSelect(voice.id);
                      setOpen(false);
                    }}
                    className="relative flex flex-col items-center gap-2 rounded-xl p-2.5 transition-all hover:bg-zinc-800/60"
                  >
                    {/* Avatar circular grande */}
                    <div
                      className="h-16 w-16 overflow-hidden rounded-full transition-all"
                      style={{
                        background: voice.avatarColor + "22",
                        boxShadow: active
                          ? `0 0 0 3px ${voice.avatarColor}, 0 0 0 5px ${voice.avatarColor}40`
                          : `0 0 0 2px ${voice.avatarColor}30`,
                      }}
                    >
                      <VoiceIcon voiceId={voice.id} color={voice.avatarColor} />
                    </div>

                    {/* Nome */}
                    <span
                      className="text-center text-xs font-semibold leading-tight"
                      style={{ color: active ? voice.avatarColor : "#e4e4e7" }}
                    >
                      {voice.name}
                    </span>

                    {/* Check ativo */}
                    {active && (
                      <span
                        className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full"
                        style={{ backgroundColor: voice.avatarColor }}
                      >
                        <svg viewBox="0 0 12 12" className="h-3 w-3">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" fill="none"
                            strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface DonationFormProps {
  creator: Creator;
  layoutId?: string;
  suggestedDonorName?: string;
}

interface PaymentData {
  transactionId: string;
  pixCode?: string;
  expiresIn: number;
  amount: number;
  serviceFee?: number;
  chargeAmount?: number;
  mock?: boolean;
  paymentProvider?: "woovi";
}

export function DonationForm({
  creator,
  layoutId,
  suggestedDonorName,
}: DonationFormProps) {
  const resolvedLayoutId = layoutId ?? creator.tipPageSettings.layoutId ?? "default";
  const formTheme = resolveTipPageFormTheme(resolvedLayoutId);
  const presets = creator.tipPageSettings.presetAmounts;
  const tipTtsEnabled = creator.tipPageSettings.tipTtsEnabled ?? false;
  const tipTtsVoices = new Set(
    (creator.tipPageSettings.tipTtsVoices ?? []).map((v) => resolveTtsVoiceId(v)),
  );
  const availableVoices = TTS_VOICES.filter(
    (v) => v.id !== "off" && tipTtsVoices.has(v.id),
  );

  const [state, setState] = useState<DonationFormState>("idle");
  const [amount, setAmount] = useState<number>(presets[1] ?? 10);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [donorName, setDonorName] = useState(suggestedDonorName ?? "");
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>(
    availableVoices[0]?.id ?? "off",
  );

  useEffect(() => {
    if (suggestedDonorName && !donorName.trim()) {
      setDonorName(suggestedDonorName);
    }
  }, [suggestedDonorName, donorName]);

  useEffect(() => {
    if (availableVoices.length > 0 && !availableVoices.find(v => v.id === selectedVoice)) {
      setSelectedVoice(availableVoices[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableVoices.map(v => v.id).join(",")]);

  const effectiveAmount =
    customAmount !== ""
      ? parseFloat(customAmount.replace(",", "."))
      : amount;

  const serviceFee = computeDonorServiceFee(effectiveAmount);
  const chargeAmount = computePixChargeAmount(effectiveAmount);
  const amountLabel = `R$ ${effectiveAmount?.toFixed(2).replace(".", ",") ?? "0,00"}`;
  const chargeLabel = `R$ ${chargeAmount.toFixed(2).replace(".", ",")}`;
  const serviceLabel = `R$ ${serviceFee.toFixed(2).replace(".", ",")}`;

  useEffect(() => {
    if (state !== "awaiting_payment" || !paymentData) return;

    const socket: Socket = io("/alerts", {
      path: "/api/socket",
      auth: { transactionId: paymentData.transactionId },
    });

    socket.on("payment-confirmed", () => {
      setState("confirmed");
    });

    return () => {
      socket.disconnect();
    };
  }, [state, paymentData]);

  useEffect(() => {
    if (state !== "awaiting_payment" || !paymentData || paymentData.mock) return;

    let cancelled = false;

    async function pollStatus() {
      try {
        const res = await fetch(`/api/donate/${paymentData!.transactionId}/status`);
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { status?: string };
        if (data.status === "confirmed") {
          setState("confirmed");
        } else if (data.status === "expired") {
          setState("failed");
          setError("O pagamento expirou. Tente novamente.");
        }
      } catch {
        // próxima tentativa no intervalo de polling do pagamento
      }
    }

    void pollStatus();
    const interval = setInterval(pollStatus, 4000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [state, paymentData]);

  function selectPreset(value: number) {
    setCustomAmount("");
    setAmount(value);
  }

  async function handleDonate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const min = creator.tipPageSettings.minDonation;
    if (!effectiveAmount || effectiveAmount < min) {
      setError(`Informe um valor mínimo de R$ ${min.toFixed(2).replace(".", ",")}`);
      return;
    }

    if (!anonymous && !donorName.trim()) {
      setError("Informe seu nome ou marque doação anônima");
      return;
    }

    setState("validating");
    setState("creating_payment");

    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: creator.id,
          amount: effectiveAmount,
          message,
          anonymous,
          donorName: donorName.trim() || "Apoiador",
          method: "pix",
          ...(tipTtsEnabled && selectedVoice !== "off" ? { ttsVoiceId: selectedVoice } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState("failed");
        setError(data.error ?? "Erro ao criar pagamento");
        return;
      }

      setPaymentData({
        transactionId: data.transactionId,
        pixCode: data.pixCode,
        expiresIn: data.expiresIn,
        amount: data.amount,
        serviceFee: data.serviceFee,
        chargeAmount: data.chargeAmount,
        mock: Boolean(data.mock),
        paymentProvider: data.paymentProvider,
      });
      setState("awaiting_payment");
    } catch {
      setState("failed");
      setError("Falha de conexão. Tente novamente.");
    }
  }

  async function simulatePayment() {
    if (!paymentData) return;
    setIsSimulating(true);
    try {
      const res = await fetch(
        `/api/simulate-payment/${paymentData.transactionId}`,
        { method: "POST" },
      );
      if (res.ok) setState("confirmed");
    } finally {
      setIsSimulating(false);
    }
  }

  function resetForm() {
    setState("idle");
    setPaymentData(null);
    setError(null);
    setMessage("");
  }

  if (state === "confirmed") {
    return (
      <SuccessAnimation
        username={creator.username}
        amount={effectiveAmount}
        donorName={anonymous ? undefined : donorName.trim() || undefined}
        onDonateAgain={resetForm}
      />
    );
  }

  if (state === "failed") {
    return <ErrorState message={error ?? undefined} onRetry={resetForm} />;
  }

  if (state === "creating_payment" || state === "validating") {
    return <ProcessingSpinner />;
  }

  if (state === "awaiting_payment" && paymentData) {
    return (
      <div className="space-y-4">
        <PaymentWaiting />
        {paymentData.pixCode && (
          <PixPayment
            pixCode={paymentData.pixCode}
            amount={paymentData.chargeAmount ?? paymentData.amount}
            tipAmount={paymentData.amount}
            serviceFee={paymentData.serviceFee}
            expiresIn={paymentData.expiresIn}
            mock={paymentData.mock}
            onSimulatePay={paymentData.mock ? simulatePayment : undefined}
            isSimulating={isSimulating}
          />
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleDonate} className="space-y-5">
      <AmountSelector
        presets={presets}
        amount={amount}
        customAmount={customAmount}
        themeColor={creator.themeColor}
        formTheme={formTheme}
        onSelectPreset={selectPreset}
        onCustomChange={setCustomAmount}
      />

      <MessageInput
        value={message}
        onChange={setMessage}
        donorName={donorName}
        onDonorNameChange={setDonorName}
        showDonorName={!anonymous}
        formTheme={formTheme}
      />

      {creator.tipPageSettings.allowAnonymous && (
        <AnonymousToggle checked={anonymous} onChange={setAnonymous} formTheme={formTheme} />
      )}

      {tipTtsEnabled && availableVoices.length > 0 && (
        <VoiceSelector
          voices={availableVoices}
          selected={selectedVoice}
          onSelect={(id) => {
            setSelectedVoice(id);
            void speakText(`Olá! Eu sou ${TTS_VOICES.find(v => v.id === id)?.name ?? "sua voz"}.`, id);
          }}
        />
      )}

      {creator.discordSettings?.guildId &&
        (creator.discordSettings.roleMappings?.length ?? 0) > 0 && (
        <p className={formTheme.muted}>
          Cargo Discord: conecte Discord no menu da conta (acima) antes de doar —
          o cargo é aplicado pelo valor do tip.
        </p>
      )}

      {serviceFee > 0 && Number.isFinite(effectiveAmount) && effectiveAmount > 0 && (
        <p className={formTheme.muted}>
          {amountLabel} para o criador + {serviceLabel} de taxa de serviço. O Pix sai {chargeLabel}.
        </p>
      )}

      {error && <p className={formTheme.error}>{error}</p>}

      <SubmitButton themeColor={creator.themeColor} amountLabel={chargeLabel} formTheme={formTheme} />

      <p className={formTheme.muted}>
        Ao enviar, você concorda que seu nome escolhido e mensagem serão exibidos
        publicamente durante o alerta do criador. Os dados são tratados conforme
        nossa{" "}
        <Link href="/privacidade" className="text-zinc-400 underline hover:text-zinc-200">
          Política de Privacidade
        </Link>
        .
      </p>
    </form>
  );
}
