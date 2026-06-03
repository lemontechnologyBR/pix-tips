"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { kycStatusLabel } from "@/lib/kyc";
import { cpfVerificationStatusLabel } from "@/lib/kyc/cpf-provider";
import type { AdminKycRow } from "@/lib/repositories/kyc-repository";
import type { CpfVerificationStatus, KycStatus } from "@/types";

interface AdminKycTableProps {
  initialItems: AdminKycRow[];
}

const FILTERS: { id: "all" | KycStatus; label: string }[] = [
  { id: "pending", label: "Pendentes" },
  { id: "approved", label: "Aprovados" },
  { id: "rejected", label: "Recusados" },
  { id: "all", label: "Todos" },
];

function docUrl(creatorId: string, kind: "front" | "back" | "selfie") {
  return `/api/admin/kyc/${creatorId}/document?kind=${kind}`;
}

function cpfCheckBadge(status: CpfVerificationStatus | null) {
  if (!status) return "—";
  const label = cpfVerificationStatusLabel(status);
  const styles =
    status === "matched"
      ? "text-emerald-400"
      : status === "mismatch" || status === "cpf_not_found"
        ? "text-red-400"
        : status === "mock" || status === "skipped"
          ? "text-zinc-500"
          : "text-amber-400";
  return <span className={styles}>{label}</span>;
}

export function AdminKycTable({ initialItems }: AdminKycTableProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<"all" | KycStatus>("pending");
  const [selected, setSelected] = useState<AdminKycRow | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => item.status === filter);
  }, [items, filter]);

  async function handleReview(decision: "approved" | "rejected") {
    if (!selected) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kyc/${selected.creatorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, rejectionReason }),
      });
      const data = (await res.json()) as AdminKycRow & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erro ao revisar.");
        return;
      }
      setItems((prev) =>
        prev.map((item) => (item.creatorId === data.creatorId ? data : item)),
      );
      setSelected(null);
      setRejectionReason("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              filter === f.id
                ? "bg-red-600/20 text-red-300"
                : "border border-zinc-700 text-zinc-400 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center text-sm text-zinc-500">
          Nenhuma verificação neste filtro.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 text-left text-zinc-400">
              <tr>
                <th className="px-4 py-3">Criador</th>
                <th className="px-4 py-3">CPF</th>
                <th className="px-4 py-3">Consulta RF</th>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">Enviado em</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.creatorId} className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.displayName}</p>
                    <p className="text-xs text-zinc-500">@{item.username}</p>
                    <p className="text-xs text-zinc-500">{item.email}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-400">{item.cpfMasked ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">
                    {cpfCheckBadge(item.cpfVerificationStatus)}
                  </td>
                  <td className="px-4 py-3 uppercase text-zinc-400">
                    {item.documentType ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {item.submittedAt
                      ? new Date(item.submittedAt).toLocaleString("pt-BR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{kycStatusLabel(item.status)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(item);
                        setRejectionReason("");
                        setError(null);
                      }}
                      className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs hover:border-red-500/50"
                    >
                      Revisar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{selected.displayName}</h3>
                <p className="text-sm text-zinc-400">
                  @{selected.username} · {selected.legalName} · {selected.cpfMasked}
                </p>
                <p className="text-xs text-zinc-500">
                  Nasc.: {selected.birthDate ?? "—"} · Doc: {selected.documentType?.toUpperCase()}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Consulta CPF: {cpfVerificationStatusLabel(selected.cpfVerificationStatus)}
                  {selected.cpfVerificationProvider && (
                    <> · {selected.cpfVerificationProvider}</>
                  )}
                  {selected.cpfVerificationMessage && (
                    <> — {selected.cpfVerificationMessage}</>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {(["front", "back", "selfie"] as const).map((kind) => (
                <div key={kind} className="rounded-lg border border-zinc-800 p-2">
                  <p className="mb-2 text-xs text-zinc-500">
                    {kind === "front"
                      ? "Frente"
                      : kind === "back"
                        ? "Verso"
                        : "Selfie"}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={docUrl(selected.creatorId, kind)}
                    alt={kind}
                    className="max-h-48 w-full rounded object-contain"
                  />
                </div>
              ))}
            </div>

            {selected.status === "pending" ? (
              <div className="mt-4 space-y-3">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Motivo da recusa (obrigatório se recusar)"
                  rows={3}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleReview("approved")}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500 disabled:opacity-50"
                  >
                    Aprovar
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleReview("rejected")}
                    className="rounded-lg bg-red-600/80 px-4 py-2 text-sm font-semibold hover:bg-red-600 disabled:opacity-50"
                  >
                    Recusar
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-400">
                Status: {kycStatusLabel(selected.status)}
                {selected.rejectionReason && ` — ${selected.rejectionReason}`}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
