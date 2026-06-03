"use client";

import Link from "next/link";
import { tipPagePath } from "@/lib/brand";
import { kycStatusLabel } from "@/lib/kyc";
import type { FinanceOverview, UserProfile } from "@/types";

interface ProfileContentProps {
  profile: UserProfile;
  financeOverview: FinanceOverview;
}

const QUICK_LINKS = [
  { href: "/dashboard/tip-page", label: "Minha página", desc: "Bio, meta e aparência" },
  { href: "/dashboard/finance", label: "Financeiro", desc: "Pix, saques e extrato" },
  { href: "/dashboard/widgets", label: "Widgets", desc: "Alertas para OBS" },
] as const;

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ok" | "warn" | "neutral";
}) {
  const tones = {
    ok: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    warn: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    neutral: "border-zinc-700 bg-zinc-900/60 text-zinc-300",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 ${tones[tone]}`}>
      <p className="text-xs uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function ReadOnlyField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="block text-sm">
      <span className="text-zinc-400">{label}</span>
      <div className="mt-1.5 rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2.5 text-zinc-300">
        {value}
      </div>
      {hint && <p className="mt-1.5 text-xs text-zinc-600">{hint}</p>}
    </div>
  );
}

export function ProfileContent({ profile, financeOverview }: ProfileContentProps) {
  const avatarInitial =
    profile.displayName.trim().charAt(0).toUpperCase() ||
    profile.username.charAt(0).toUpperCase();
  const connectedCount = profile.connectedAccounts.length;
  const kycTone =
    profile.kyc.status === "approved"
      ? "ok"
      : profile.kyc.status === "pending"
        ? "warn"
        : "neutral";
  const pixTone = profile.wooviPixConnected ? "ok" : "warn";
  const payoutFee = financeOverview.woovi.payoutFee;

  return (
    <div className="w-full space-y-8">
      {/* ── Hero ── */}
      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-cyan-500/15 via-zinc-900/80 to-zinc-950 p-6 sm:p-8">
        <div className="flex flex-wrap items-start gap-5">
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar}
              alt=""
              className="h-16 w-16 rounded-2xl border border-zinc-700 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/20 text-2xl font-bold text-cyan-200">
              {avatarInitial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {profile.displayName}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">@{profile.username}</p>
            <p className="mt-0.5 text-sm text-zinc-500">{profile.email}</p>
          </div>
          <Link
            href={tipPagePath(profile.username)}
            target="_blank"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-cyan-500/50 hover:text-white"
          >
            Ver página pública
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatusPill label="Identidade" value={kycStatusLabel(profile.kyc.status)} tone={kycTone} />
          <StatusPill
            label="Chave Pix"
            value={
              profile.wooviPixConnected
                ? profile.wooviPixKeyMasked ?? "Cadastrada"
                : "Não configurada"
            }
            tone={pixTone}
          />
          <StatusPill
            label="Redes conectadas"
            value={`${connectedCount} conectada(s)`}
            tone={connectedCount > 0 ? "ok" : "neutral"}
          />
        </div>
      </section>

      {/* ── Taxas ── */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-500">
          Suas taxas
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Comissão por doação</p>
            <p className="mt-2 text-3xl font-black text-white">
              {financeOverview.commissionRate}%
            </p>
            <p className="mt-1 text-xs text-zinc-500">Descontado de cada doação confirmada</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Taxa de saque</p>
            <p className="mt-2 text-3xl font-black text-white">
              R$ {payoutFee.toFixed(2).replace(".", ",")}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Taxa fixa por saque (cobre custos Pix Out)</p>
          </div>
        </div>
      </section>

      {/* ── Dados do perfil ── */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-500">
          Dados do perfil
        </h2>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
            <h3 className="text-base font-semibold text-white">Conta</h3>
            <p className="mt-1 text-sm text-zinc-400">Dados principais da sua conta de criador.</p>
            <div className="mt-5 space-y-4">
              <ReadOnlyField label="E-mail" value={profile.email} />
              <ReadOnlyField
                label="Nome de usuário"
                value={`@${profile.username}`}
                hint="Não pode ser alterado após o cadastro."
              />
              <ReadOnlyField label="Nome de exibição" value={profile.displayName} />
              <Link
                href="/dashboard/tip-page"
                className="inline-flex rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-cyan-500/50 hover:text-white"
              >
                Editar página pública
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
            <h3 className="text-base font-semibold text-white">Recebimentos</h3>
            <p className="mt-1 text-sm text-zinc-400">Status de KYC e chave Pix para receber e sacar.</p>
            <div className="mt-5 space-y-3">
              <ReadOnlyField label="KYC" value={kycStatusLabel(profile.kyc.status)} />
              <ReadOnlyField
                label="Chave Pix"
                value={profile.wooviPixConnected ? profile.wooviPixKeyMasked ?? "Cadastrada" : "Não configurada"}
              />
              <Link
                href="/dashboard/finance"
                className="web3-btn-primary inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-white"
              >
                Abrir financeiro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Atalhos ── */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-500">
          Atalhos
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-4 transition hover:border-cyan-500/40 hover:bg-cyan-500/5"
            >
              <p className="font-medium text-white group-hover:text-cyan-200">{link.label}</p>
              <p className="mt-1 text-xs text-zinc-500">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
