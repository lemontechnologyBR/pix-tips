"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { DiditKycVerification } from "@/components/dashboard/DiditKycVerification";
import { KycVerificationForm } from "@/components/dashboard/KycVerificationForm";
import { computeFee, computeNetAmount, computeWooviWithdrawFees, formatCommissionLabel, MIN_WITHDRAW_AMOUNT } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import type {
  FinanceOverview,
  KycProfile,
  Payout,
  PixKeyType,
  Transaction,
  TransactionStatus,
} from "@/types";

type TabId = "resumo" | "verificacao" | "extrato";
type ExtratoView = "doacoes" | "saques";

const TABS: { id: TabId; label: string }[] = [
  { id: "resumo", label: "Resumo" },
  { id: "verificacao", label: "Verificação" },
  { id: "extrato", label: "Extrato" },
];

const STATUS_STYLES: Record<TransactionStatus, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-amber-500/15 text-amber-400",
  failed: "bg-red-500/15 text-red-400",
  expired: "bg-zinc-500/15 text-zinc-400",
};

const PIX_KEY_TYPES: { value: PixKeyType; label: string }[] = [
  { value: "email", label: "E-mail" },
  { value: "cpf", label: "CPF" },
  { value: "phone", label: "Telefone" },
  { value: "random", label: "Chave aleatória" },
];

const STATUS_LABELS: Record<TransactionStatus, string> = {
  confirmed: "Confirmado",
  pending: "Pendente",
  failed: "Falhou",
  expired: "Expirado",
};

const PAYOUT_STATUS_LABELS: Record<Payout["status"], string> = {
  completed: "Concluído",
  pending: "Pendente",
  processing: "Processando",
  failed: "Falhou",
};

const PAYOUT_STATUS_STYLES: Record<Payout["status"], string> = {
  completed: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-amber-500/15 text-amber-400",
  processing: "bg-sky-500/15 text-sky-400",
  failed: "bg-red-500/15 text-red-400",
};

function parseWithdrawAmount(value: string): number | null {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : null;
}

interface FinanceDashboardProps {
  initialOverview: FinanceOverview;
  diditEnabled?: boolean;
}

export function FinanceDashboard({
  initialOverview,
  diditEnabled = false,
}: FinanceDashboardProps) {
  const [overview, setOverview] = useState(initialOverview);
  const [tab, setTab] = useState<TabId>("resumo");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wooviPixKey, setWooviPixKey] = useState("");
  const [wooviPixKeyType, setWooviPixKeyType] = useState<PixKeyType>("email");
  const [connectingWoovi, setConnectingWoovi] = useState(false);
  const [withdrawingWoovi, setWithdrawingWoovi] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawOtpOpen, setWithdrawOtpOpen] = useState(false);
  const [withdrawOtp, setWithdrawOtp] = useState("");
  const [withdrawTotpCode, setWithdrawTotpCode] = useState("");
  const [withdrawTotpEnabled, setWithdrawTotpEnabled] = useState(false);
  const [withdrawOtpSending, setWithdrawOtpSending] = useState(false);
  const [pendingWithdraw, setPendingWithdraw] = useState<{
    amount: number;
    pixKeyId: string;
  } | null>(null);
  const [showAddKeyForm, setShowAddKeyForm] = useState(false);
  const [removingKeyId, setRemovingKeyId] = useState<string | null>(null);
  const [settingPrimaryKeyId, setSettingPrimaryKeyId] = useState<string | null>(null);
  const [selectedWithdrawKeyId, setSelectedWithdrawKeyId] = useState<string | null>(
    () =>
      initialOverview.woovi.pixKeys.find((k) => k.isPrimary)?.id ??
      initialOverview.woovi.pixKeys[0]?.id ??
      null,
  );

  const [extratoItems, setExtratoItems] = useState<Transaction[]>(
    initialOverview.recentTransactions,
  );
  const [saqueItems, setSaqueItems] = useState<Payout[]>(initialOverview.recentPayouts);
  const [extratoView, setExtratoView] = useState<ExtratoView>("doacoes");
  const [extratoLoading, setExtratoLoading] = useState(false);
  const [period, setPeriod] = useState("30");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam === "resumo" || tabParam === "verificacao" || tabParam === "extrato") {
      setTab(tabParam);
    } else if (params.get("didit") === "1") {
      setTab("verificacao");
    }
  }, []);

  const handleKycProfileUpdate = useCallback((profile: KycProfile) => {
    setOverview((current) => ({ ...current, kyc: profile }));
  }, []);

  const refreshOverview = useCallback(async () => {
    const res = await fetch("/api/user/finance");
    if (res.ok) {
      const data = (await res.json()) as FinanceOverview;
      setOverview(data);
      setSaqueItems(data.recentPayouts);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("woovi_connected") === "1") {
      setToast("Chave Pix cadastrada! Suas doações já aparecem aqui para saque.");
      setTimeout(() => setToast(null), 5000);
      window.history.replaceState({}, "", window.location.pathname);
      void refreshOverview();
    }
    const wooviError = params.get("woovi_error");
    if (wooviError) {
      const wooviMessages: Record<string, string> = {
        not_configured: "Recebimentos Pix ainda não disponíveis na plataforma.",
      };
      setError(wooviMessages[wooviError] ?? "Erro ao cadastrar chave Pix.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [refreshOverview]);

  const loadExtrato = useCallback(async () => {
    setExtratoLoading(true);
    try {
      const params = new URLSearchParams({
        period,
        limit: "50",
      });

      if (extratoView === "doacoes") {
        params.set("status", statusFilter);
        params.set("search", search);
        const res = await fetch(`/api/user/transactions?${params}`);
        if (res.ok) {
          const data = (await res.json()) as { items: Transaction[] };
          setExtratoItems(data.items);
        }
      } else {
        const res = await fetch(`/api/user/finance/payouts?${params}`);
        if (res.ok) {
          const data = (await res.json()) as { items: Payout[] };
          setSaqueItems(data.items);
        }
      }
    } finally {
      setExtratoLoading(false);
    }
  }, [period, statusFilter, search, extratoView]);

  useEffect(() => {
    if (tab === "extrato") void loadExtrato();
  }, [tab, loadExtrato]);

  const extratoWithFees = useMemo(
    () =>
      extratoItems.map((tx) => {
        const fee =
          tx.status === "confirmed"
            ? tx.splitPayment
              ? tx.applicationFee != null && tx.applicationFee > 0
                ? tx.applicationFee
                : computeFee(tx.amount, overview.commissionRate)
              : computeFee(tx.amount, overview.commissionRate)
            : 0;
        const net =
          tx.status === "confirmed"
            ? tx.splitPayment
              ? tx.applicationFee != null && tx.applicationFee > 0
                ? tx.amount - tx.applicationFee
                : computeNetAmount(tx.amount, overview.commissionRate)
              : computeNetAmount(tx.amount, overview.commissionRate)
            : 0;
        return { ...tx, fee, net };
      }),
    [extratoItems, overview.commissionRate],
  );

  const withdrawPreview = useMemo(() => {
    const parsed = parseWithdrawAmount(withdrawAmount);
    if (parsed == null || parsed <= 0) return null;
    return computeWooviWithdrawFees(parsed);
  }, [withdrawAmount]);

  async function handleConnectWoovi(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!wooviPixKey.trim()) {
      setError("Informe sua chave Pix para cadastrar.");
      return;
    }

    setConnectingWoovi(true);
    try {
      const res = await fetch("/api/user/woovi/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pixKey: wooviPixKey,
          pixKeyType: wooviPixKeyType,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erro ao cadastrar chave Pix.");
        return;
      }
      setWooviPixKey("");
      setShowAddKeyForm(false);
      setToast("Chave Pix cadastrada! Suas doações já aparecem aqui para saque.");
      setTimeout(() => setToast(null), 5000);
      await refreshOverview();
    } finally {
      setConnectingWoovi(false);
    }
  }

  async function handleWithdrawWoovi() {
    setError(null);
    const parsed = parseWithdrawAmount(withdrawAmount);
    if (parsed == null || parsed <= 0) {
      setError("Informe um valor válido para saque.");
      return;
    }
    if (parsed < MIN_WITHDRAW_AMOUNT) {
      setError(`Valor mínimo para saque: R$ ${MIN_WITHDRAW_AMOUNT.toFixed(2).replace(".", ",")}`);
      return;
    }
    const fees = computeWooviWithdrawFees(parsed);
    if (fees.grossAmount > selectedKeyBalance) {
      setError(
        `Saldo insuficiente. Para receber ${formatCurrency(fees.netAmount)}, é necessário ter ${formatCurrency(fees.grossAmount)} incluindo a taxa.`,
      );
      return;
    }
    if (!selectedKey) {
      setError("Selecione uma chave Pix para sacar.");
      return;
    }

    setWithdrawOtpSending(true);
    try {
      const res = await fetch("/api/user/woovi/withdraw/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsed, pixKeyId: selectedKey.id }),
      });
      const data = (await res.json()) as {
        error?: string;
        totpEnabled?: boolean;
        devCode?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar código de verificação.");
        return;
      }

      setPendingWithdraw({ amount: parsed, pixKeyId: selectedKey.id });
      setWithdrawTotpEnabled(Boolean(data.totpEnabled));
      setWithdrawOtp("");
      setWithdrawTotpCode("");
      setWithdrawOtpOpen(true);

      if (data.devCode) {
        setToast(`[dev] Código de saque: ${data.devCode}`);
        setTimeout(() => setToast(null), 15000);
      }
    } finally {
      setWithdrawOtpSending(false);
    }
  }

  async function handleConfirmWithdraw() {
    if (!pendingWithdraw) return;

    setError(null);
    setWithdrawingWoovi(true);
    try {
      const res = await fetch("/api/user/woovi/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: pendingWithdraw.amount,
          pixKeyId: pendingWithdraw.pixKeyId,
          otp: withdrawOtp || undefined,
          totpCode: withdrawTotpCode || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string; value?: number };
      if (!res.ok) {
        setError(data.error ?? "Erro ao sacar saldo.");
        return;
      }
      setWithdrawOtpOpen(false);
      setPendingWithdraw(null);
      setWithdrawOtp("");
      setWithdrawTotpCode("");
      setToast(
        data.value != null
          ? `R$ ${data.value.toFixed(2).replace(".", ",")} enviados para sua chave Pix!`
          : "Saque solicitado com sucesso!",
      );
      setTimeout(() => setToast(null), 5000);
      setWithdrawAmount("");
      await refreshOverview();
      if (tab === "extrato" && extratoView === "saques") {
        await loadExtrato();
      }
    } finally {
      setWithdrawingWoovi(false);
    }
  }

  async function handleRemovePixKey(keyId: string) {
    setError(null);
    setRemovingKeyId(keyId);
    try {
      const res = await fetch(`/api/user/woovi/keys/${keyId}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erro ao remover chave Pix.");
        return;
      }
      setToast("Chave Pix removida.");
      setTimeout(() => setToast(null), 3000);
      await refreshOverview();
    } finally {
      setRemovingKeyId(null);
    }
  }

  async function handleSetPrimaryPixKey(keyId: string) {
    setError(null);
    setSettingPrimaryKeyId(keyId);
    try {
      const res = await fetch(`/api/user/woovi/keys/${keyId}/primary`, {
        method: "PATCH",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erro ao definir chave principal.");
        return;
      }
      setToast("Chave principal atualizada — doações passam a cair nela.");
      setTimeout(() => setToast(null), 4000);
      await refreshOverview();
    } finally {
      setSettingPrimaryKeyId(null);
    }
  }

  function renderAddPixKeyForm(submitLabel: string) {
    return (
      <form
        onSubmit={handleConnectWoovi}
        className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
      >
        <div>
          <label htmlFor="pix-key-type" className="mb-1 block text-xs font-medium text-zinc-400">
            Tipo de chave
          </label>
          <select
            id="pix-key-type"
            value={wooviPixKeyType}
            onChange={(e) => setWooviPixKeyType(e.target.value as PixKeyType)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          >
            {PIX_KEY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pix-key" className="mb-1 block text-xs font-medium text-zinc-400">
            Chave Pix
          </label>
          <input
            id="pix-key"
            type="text"
            value={wooviPixKey}
            onChange={(e) => setWooviPixKey(e.target.value)}
            placeholder="ex.: seu@email.com"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={connectingWoovi || !wooviPixKey.trim()}
          className="web3-btn-primary w-full rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {connectingWoovi ? "Cadastrando…" : submitLabel}
        </button>
      </form>
    );
  }

  function exportCsv() {
    const header = "Data,Doador,Bruto,Taxa,Líquido,Método,Status\n";
    const rows = extratoWithFees
      .map(
        (t) =>
          `${t.createdAt},${t.donorName},${t.amount},${t.fee},${t.net},${t.method},${t.status}`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extrato-pix-tips.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const wooviConnected = overview.woovi.connected;
  const wooviConfigured = overview.woovi.splitEnabled;
  const kycApproved = overview.kyc.canWithdraw;
  const pixKeys = overview.woovi.pixKeys;
  const maxPixKeys = overview.woovi.maxPixKeys;

  const selectedKey = useMemo(() => {
    if (pixKeys.length === 0) return null;
    return (
      pixKeys.find((k) => k.id === selectedWithdrawKeyId) ??
      pixKeys.find((k) => k.isPrimary) ??
      pixKeys[0]
    );
  }, [pixKeys, selectedWithdrawKeyId]);

  const selectedKeyBalance = selectedKey?.balance ?? 0;
  const maxWithdrawNetAmount = Math.max(
    0,
    Math.round(
      (selectedKeyBalance - overview.woovi.payoutFee) * 100,
    ) / 100,
  );

  useEffect(() => {
    if (pixKeys.length === 0) {
      setSelectedWithdrawKeyId(null);
      return;
    }
    if (!selectedWithdrawKeyId || !pixKeys.some((k) => k.id === selectedWithdrawKeyId)) {
      setSelectedWithdrawKeyId(pixKeys.find((k) => k.isPrimary)?.id ?? pixKeys[0].id);
    }
  }, [pixKeys, selectedWithdrawKeyId]);

  const payoutSubtitle = wooviConfigured
    ? "Receba doações Pix direto na sua chave cadastrada."
    : "Configure os recebimentos Pix para habilitar doações.";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Financeiro</h1>
          <p className="mt-1 text-sm text-zinc-400">{payoutSubtitle}</p>
        </div>
        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
          Taxa {formatCommissionLabel(overview.commissionRate, overview.commissionFixedFee)}
        </span>
      </div>

      {wooviConfigured && (
        <section
          className={`rounded-2xl border p-6 ${
            wooviConnected
              ? "border-zinc-800 bg-zinc-900/50"
              : "border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-zinc-900/50"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-white">Recebimentos Pix</h2>
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-amber-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M8 21h8" />
                    <path d="M12 17v4" />
                    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
                    <path d="M5 5H3v2a4 4 0 0 0 4 4" />
                    <path d="M19 5h2v2a4 4 0 0 1-4 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-amber-300">
                    Taxa de saque
                  </p>
                  <p className="mt-1 text-sm text-zinc-200">
                    Taxa fixa de{" "}
                    <span className="font-semibold text-amber-200">
                      {formatCurrency(overview.woovi.payoutFee)}
                    </span>{" "}
                    por saque
                  </p>
                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                    Essa taxa cobre os custos de transferência Pix e ajuda a manter a plataforma gratuita para todos os criadores.
                  </p>
                </div>
              </div>
              {wooviConnected ? (
                <>
                  <p className="mt-1 flex items-center gap-2 text-sm text-emerald-300">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                    {pixKeys.length === 1
                      ? "1 chave cadastrada"
                      : `${pixKeys.length} chaves cadastradas`}{" "}
                    · até {maxPixKeys}
                  </p>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
                    <div className="space-y-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Suas chaves Pix
                      </p>
                      {pixKeys.map((key) => (
                        <div
                          key={key.id}
                          className={`rounded-xl border px-4 py-3 ${
                            key.id === selectedKey?.id
                              ? "border-cyan-500/40 bg-cyan-500/5"
                              : "border-zinc-800 bg-zinc-950/60"
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium text-zinc-100">{key.pixKeyMasked}</p>
                              <p className="mt-0.5 text-xs text-zinc-500">
                                {PIX_KEY_TYPES.find((t) => t.value === key.pixKeyType)?.label ??
                                  key.pixKeyType}
                                {key.isPrimary && (
                                  <span className="ml-2 rounded-full bg-cyan-500/20 px-2 py-0.5 text-cyan-300">
                                    Principal · recebe doações
                                  </span>
                                )}
                              </p>
                              <p className="mt-1 text-sm font-semibold text-emerald-400">
                                Saldo: {formatCurrency(key.balance)}
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-wrap gap-2">
                              {!key.isPrimary && (
                                <button
                                  type="button"
                                  onClick={() => void handleSetPrimaryPixKey(key.id)}
                                  disabled={settingPrimaryKeyId === key.id}
                                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:border-cyan-500/40 hover:text-cyan-200 disabled:opacity-50"
                                >
                                  {settingPrimaryKeyId === key.id ? "…" : "Tornar principal"}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => void handleRemovePixKey(key.id)}
                                disabled={removingKeyId === key.id}
                                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:border-red-500/40 hover:text-red-300 disabled:opacity-50"
                              >
                                {removingKeyId === key.id ? "…" : "Remover"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {pixKeys.length < maxPixKeys && (
                        <div className="pt-1">
                          {!showAddKeyForm ? (
                            <button
                              type="button"
                              onClick={() => setShowAddKeyForm(true)}
                              className="rounded-lg border border-dashed border-zinc-700 px-4 py-2.5 text-sm text-zinc-400 hover:border-cyan-500/40 hover:text-cyan-200"
                            >
                              + Adicionar chave ({pixKeys.length}/{maxPixKeys})
                            </button>
                          ) : (
                            <div className="space-y-2">
                              {renderAddPixKeyForm("Adicionar chave Pix")}
                              <button
                                type="button"
                                onClick={() => setShowAddKeyForm(false)}
                                className="text-xs text-zinc-500 hover:text-zinc-300"
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-5 py-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Saldo total
                      </p>
                      <p className="mt-1 text-3xl font-bold text-emerald-400">
                        {formatCurrency(overview.woovi.subaccountBalance)}
                      </p>

                      {!overview.woovi.withdrawBlocked && selectedKey && (
                        <div className="mt-4 border-t border-zinc-800 pt-4">
                          {pixKeys.length > 1 && (
                            <div className="mb-3">
                              <label
                                htmlFor="withdraw-key"
                                className="mb-1 block text-xs font-medium text-zinc-400"
                              >
                                Sacar da chave
                              </label>
                              <select
                                id="withdraw-key"
                                value={selectedKey.id}
                                onChange={(e) => {
                                  setSelectedWithdrawKeyId(e.target.value);
                                  setWithdrawAmount("");
                                }}
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                              >
                                {pixKeys.map((key) => (
                                  <option key={key.id} value={key.id}>
                                    {key.pixKeyMasked} ({formatCurrency(key.balance)})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          <label
                            htmlFor="withdraw-amount"
                            className="mb-1 block text-xs font-medium text-zinc-400"
                          >
                            Valor do saque
                          </label>
                          <div className="flex gap-2">
                            <div className="relative min-w-0 flex-1">
                              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                                R$
                              </span>
                              <input
                                id="withdraw-amount"
                                type="text"
                                inputMode="decimal"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                placeholder="0,00"
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pl-9 pr-3 text-sm text-white"
                              />
                            </div>
                            {maxWithdrawNetAmount > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setWithdrawAmount(
                                    maxWithdrawNetAmount.toFixed(2).replace(".", ","),
                                  )
                                }
                                className="shrink-0 rounded-lg border border-zinc-700 px-3 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                              >
                                Máx.
                              </button>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-zinc-500">
                            Mínimo de R$ {MIN_WITHDRAW_AMOUNT.toFixed(2).replace(".", ",")} · taxa de {formatCurrency(overview.woovi.payoutFee)} somada ao valor
                          </p>
                          <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
                            A taxa cobre os custos de transferência e ajuda a manter a plataforma gratuita.
                          </p>
                          {withdrawPreview && withdrawPreview.netAmount > 0 && (
                            <p className="mt-2 text-xs text-zinc-400">
                              Você recebe{" "}
                              <span className="font-medium text-emerald-300">
                                {formatCurrency(withdrawPreview.netAmount)}
                              </span>
                              <span className="text-zinc-500">
                                {" "}
                                (debita {formatCurrency(withdrawPreview.grossAmount)} da chave,
                                incluindo {formatCurrency(withdrawPreview.payoutFee)} de taxa)
                              </span>
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={handleWithdrawWoovi}
                            disabled={
                              withdrawOtpSending ||
                              withdrawingWoovi ||
                              selectedKeyBalance <= 0 ||
                              !withdrawAmount.trim() ||
                              selectedKey.withdrawBlocked
                            }
                            className="web3-btn-primary mt-3 w-full rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            {withdrawOtpSending
                              ? "Enviando código…"
                              : withdrawingWoovi
                                ? "Sacando…"
                                : "Sacar para minha chave Pix"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="mt-4 max-w-2xl text-sm text-zinc-500">
                    Doações caem na chave <strong className="text-zinc-300">principal</strong>.
                    Comissão pix.tips (
                    {formatCommissionLabel(overview.commissionRate, overview.commissionFixedFee)}) já
                    descontada na doação. A taxa de saque é cobrada no momento do Saque.
                  </p>
                  {overview.woovi.withdrawBlocked && (
                    <p className="mt-2 text-sm text-amber-400">
                      Saque temporariamente bloqueado — verifique se suas chaves Pix são válidas.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="mt-1 text-sm text-amber-300">
                    Cadastre sua chave Pix para começar a receber doações
                  </p>

                  {!kycApproved ? (
                    <div className="mt-4 max-w-lg rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-sm text-amber-100">
                      <p>
                        Antes de cadastrar a chave Pix, você precisa{" "}
                        <strong>validar sua conta</strong> com verificação de identidade.
                      </p>
                      <button
                        type="button"
                        onClick={() => setTab("verificacao")}
                        className="web3-btn-primary mt-3 inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-white"
                      >
                        Ir para verificação
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="mt-3 max-w-lg text-sm text-zinc-400">
                        Cadastre até {maxPixKeys} chaves Pix. A primeira será a principal para
                        receber doações.
                      </p>
                      <div className="mt-4 max-w-md">
                        {renderAddPixKeyForm("Cadastrar chave Pix")}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {!wooviConnected && (
              <div className="flex shrink-0 flex-col gap-2">
                <p className="max-w-xs rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-xs text-zinc-400">
                  Sua chave será validada antes de ativar os recebimentos.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {!wooviConnected && wooviConfigured && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {kycApproved
            ? "Suas doações Pix ficam indisponíveis até você verificar e cadastrar sua chave Pix."
            : "Valide sua conta na aba Verificação antes de cadastrar a chave Pix."}
        </div>
      )}

      <div className="flex flex-wrap gap-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-sm"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            {t.label}
            {t.id === "verificacao" && !kycApproved && (
              <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {tab === "resumo" && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className="text-sm text-zinc-400">Recebido este mês</p>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                {formatCurrency(overview.monthNet)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Bruto {formatCurrency(overview.monthGross)} · Taxas{" "}
                {formatCurrency(overview.monthFees)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className="text-sm text-zinc-400">Total recebido</p>
              <p className="mt-1 text-2xl font-bold">
                {formatCurrency(overview.totalNet)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Bruto {formatCurrency(overview.totalGross)} · Taxas{" "}
                {formatCurrency(overview.totalFees)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className="text-sm text-zinc-400">Aguardando pagamento</p>
              <p className="mt-1 text-2xl font-bold text-amber-400">
                {formatCurrency(overview.pendingBalance)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">Doações Pix pendentes</p>
            </div>
          </div>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h2 className="font-semibold">Últimas doações</h2>
            <ul className="mt-4 space-y-3">
              {overview.recentTransactions.length === 0 ? (
                <li className="text-sm text-zinc-500">Nenhuma doação ainda.</li>
              ) : (
                overview.recentTransactions.map((tx) => (
                  <li
                    key={tx.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {tx.anonymous ? "Anônimo" : tx.donorName}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(tx.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-emerald-400">
                        {formatCurrency(tx.amount)}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] ${STATUS_STYLES[tx.status]}`}
                      >
                        {STATUS_LABELS[tx.status]}
                      </span>
                    </div>
                  </li>
                ))
              )}
            </ul>
            <button
              type="button"
              onClick={() => setTab("extrato")}
              className="mt-4 text-sm text-cyan-400 hover:underline"
            >
              Ver extrato completo →
            </button>
          </section>
        </>
      )}

      {tab === "verificacao" && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          {diditEnabled ? (
            <DiditKycVerification
              initialProfile={overview.kyc}
              embedded
              onProfileUpdate={handleKycProfileUpdate}
            />
          ) : (
            <KycVerificationForm initialProfile={overview.kyc} />
          )}
        </section>
      )}

      {tab === "extrato" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setExtratoView("doacoes")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                extratoView === "doacoes"
                  ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white"
                  : "border border-zinc-700 text-zinc-400 hover:text-white"
              }`}
            >
              Doações
            </button>
            <button
              type="button"
              onClick={() => setExtratoView("saques")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                extratoView === "saques"
                  ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white"
                  : "border border-zinc-700 text-zinc-400 hover:text-white"
              }`}
            >
              Saques
            </button>
          </div>

          <div className="flex flex-wrap gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            >
              <option value="7">7 dias</option>
              <option value="30">30 dias</option>
              <option value="90">90 dias</option>
              <option value="year">Ano</option>
            </select>
            {extratoView === "doacoes" && (
              <>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="pending">Pendente</option>
                  <option value="failed">Falhou</option>
                </select>
                <input
                  type="search"
                  placeholder="Buscar doador…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="min-w-[160px] flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={exportCsv}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500"
                >
                  Exportar CSV
                </button>
              </>
            )}
          </div>

          {extratoLoading ? (
            <div className="py-12 text-center text-sm text-zinc-500">Carregando…</div>
          ) : extratoView === "doacoes" ? (
            extratoWithFees.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center text-sm text-zinc-500">
                Nenhuma doação no período.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full text-sm">
                  <thead className="border-b border-zinc-800 bg-zinc-900/80 text-left text-zinc-400">
                    <tr>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3">Doador</th>
                      <th className="px-4 py-3">Bruto</th>
                      <th className="px-4 py-3">Taxa</th>
                      <th className="px-4 py-3">Líquido</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extratoWithFees.map((tx) => (
                      <tr key={tx.id} className="border-b border-zinc-800/50">
                        <td className="px-4 py-3 text-zinc-400">
                          {new Date(tx.createdAt).toLocaleString("pt-BR")}
                        </td>
                        <td className="px-4 py-3">
                          {tx.anonymous ? "Anônimo" : tx.donorName}
                        </td>
                        <td className="px-4 py-3">{formatCurrency(tx.amount)}</td>
                        <td className="px-4 py-3 text-red-400/80">
                          {tx.status === "confirmed" ? formatCurrency(tx.fee) : "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-400">
                          {tx.status === "confirmed" ? formatCurrency(tx.net) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[tx.status]}`}
                          >
                            {STATUS_LABELS[tx.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : saqueItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center text-sm text-zinc-500">
              Nenhum saque no período.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/80 text-left text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Chave Pix</th>
                    <th className="px-4 py-3">Sacado do saldo</th>
                    <th className="px-4 py-3">Taxa saque</th>
                    <th className="px-4 py-3">Recebido</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {saqueItems.map((payout) => (
                    <tr key={payout.id} className="border-b border-zinc-800/50">
                      <td className="px-4 py-3 text-zinc-400">
                        {new Date(payout.createdAt).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">{payout.pixKeyMasked}</td>
                      <td className="px-4 py-3">{formatCurrency(payout.amount)}</td>
                      <td className="px-4 py-3 text-red-400/80">
                        {payout.fee != null ? formatCurrency(payout.fee) : "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-400">
                        {formatCurrency(payout.netAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${PAYOUT_STATUS_STYLES[payout.status]}`}
                        >
                          {PAYOUT_STATUS_LABELS[payout.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {withdrawOtpOpen && pendingWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-zinc-100">Confirmar saque</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Enviamos um código para seu e-mail. Informe-o para sacar{" "}
              <strong className="text-zinc-200">
                {formatCurrency(pendingWithdraw.amount)}
              </strong>
              .
            </p>

            {withdrawTotpEnabled && (
              <p className="mt-2 text-xs text-cyan-300">
                Com 2FA ativo, você também pode usar o código do autenticador.
              </p>
            )}

            <label className="mt-4 block text-sm">
              <span className="text-zinc-400">Código do e-mail</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={withdrawOtp}
                onChange={(e) => setWithdrawOtp(e.target.value.replace(/\D/g, ""))}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-center tracking-widest outline-none focus:border-cyan-400"
              />
            </label>

            {withdrawTotpEnabled && (
              <label className="mt-3 block text-sm">
                <span className="text-zinc-400">Ou código do autenticador</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={withdrawTotpCode}
                  onChange={(e) => setWithdrawTotpCode(e.target.value.replace(/\D/g, ""))}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-center tracking-widest outline-none focus:border-cyan-400"
                />
              </label>
            )}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setWithdrawOtpOpen(false);
                  setPendingWithdraw(null);
                }}
                className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={
                  withdrawingWoovi ||
                  (withdrawOtp.length !== 6 && withdrawTotpCode.length !== 6)
                }
                onClick={handleConfirmWithdraw}
                className="web3-btn-primary flex-1 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                {withdrawingWoovi ? "Sacando…" : "Confirmar saque"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
