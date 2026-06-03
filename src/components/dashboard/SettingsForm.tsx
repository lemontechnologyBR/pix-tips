"use client";

import Link from "next/link";
import { Suspense, useCallback, useState } from "react";
import { kycStatusLabel } from "@/lib/kyc";
import { ApiKeySection } from "@/components/dashboard/ApiKeySection";
import { SettingsOAuthFeedback } from "@/components/dashboard/SettingsOAuthFeedback";
import { TwoFactorSettings } from "@/components/dashboard/TwoFactorSettings";
import { PwaInstallButton } from "@/components/shared/PwaInstall";
import type { UserProfile } from "@/types";

interface SettingsFormProps {
  profile: UserProfile;
}

type NotifyKey =
  | "notifyEmailDonation"
  | "notifyEmailWeekly"
  | "notifyPanelDonation";

const NOTIFY_OPTIONS: {
  key: NotifyKey;
  label: string;
  description: string;
}[] = [
  {
    key: "notifyEmailDonation",
    label: "E-mail a cada doação",
    description: "Receba um e-mail quando alguém apoiar sua live.",
  },
  {
    key: "notifyEmailWeekly",
    label: "Resumo semanal",
    description: "Relatório semanal com totais e destaques.",
  },
  {
    key: "notifyPanelDonation",
    label: "Notificação no painel",
    description: "Alertas dentro do dashboard pix.tips.",
  },
];


function SettingsCard({
  title,
  description,
  children,
  className = "",
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6 ${className}`}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function SettingsForm({ profile: initialProfile }: SettingsFormProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [savedSnapshot, setSavedSnapshot] = useState({
    notifyEmailDonation: initialProfile.notifyEmailDonation,
    notifyEmailWeekly: initialProfile.notifyEmailWeekly,
    notifyPanelDonation: initialProfile.notifyPanelDonation,
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const isDirty =
    profile.notifyEmailDonation !== savedSnapshot.notifyEmailDonation ||
    profile.notifyEmailWeekly !== savedSnapshot.notifyEmailWeekly ||
    profile.notifyPanelDonation !== savedSnapshot.notifyPanelDonation;

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleAccountsUpdate = useCallback(
    (_accounts: UserProfile["connectedAccounts"]) => {
      // handled by IntegrationsContent now
    },
    [],
  );

  const handleOAuthError = useCallback((message: string) => {
    setError(message);
  }, []);

  async function handleSaveNotifications() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notifyEmailDonation: profile.notifyEmailDonation,
          notifyEmailWeekly: profile.notifyEmailWeekly,
          notifyPanelDonation: profile.notifyPanelDonation,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar preferências.");
        return;
      }
      setSavedSnapshot({
        notifyEmailDonation: profile.notifyEmailDonation,
        notifyEmailWeekly: profile.notifyEmailWeekly,
        notifyPanelDonation: profile.notifyPanelDonation,
      });
      showToast("Preferências salvas!");
    } catch {
      setError("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: deleteConfirm }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível excluir a conta.");
        return;
      }
      window.location.href = data.redirect ?? "/login";
    } catch {
      setError("Erro de conexão.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="w-full space-y-6 pb-24">
      <Suspense fallback={null}>
        <SettingsOAuthFeedback
          onAccountsUpdate={handleAccountsUpdate}
          onError={handleOAuthError}
          onToast={showToast}
        />
      </Suspense>

      {toast && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {toast}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <SettingsCard
        title="Notificações"
        description="Escolha como quer ser avisado sobre doações e atividade."
      >
        <div className="grid gap-3 lg:grid-cols-3">
          {NOTIFY_OPTIONS.map(({ key, label, description }) => (
            <label
              key={key}
              className={`flex cursor-pointer flex-col gap-3 rounded-xl border px-4 py-4 transition ${
                profile[key]
                  ? "border-cyan-500/40 bg-cyan-500/5"
                  : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-start justify-end">
                <input
                  type="checkbox"
                  checked={profile[key]}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, [key]: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-zinc-600 accent-cyan-500"
                />
              </div>
              <span>
                <span className="block text-sm font-medium text-zinc-200">{label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-zinc-500">
                  {description}
                </span>
              </span>
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={handleSaveNotifications}
          disabled={!isDirty || saving}
          className="web3-btn-primary mt-5 rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Salvando..." : "Salvar preferências"}
        </button>
      </SettingsCard>

      <SettingsCard
        title="Integrações"
        description="Gerencie suas plataformas conectadas."
        action={
          <Link
            href="/dashboard/integrations"
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:border-cyan-500/50 hover:text-white"
          >
            Ver integrações →
          </Link>
        }
      >
        <p className="text-sm text-zinc-500">
          Conecte Twitch, YouTube, Discord e mais na página dedicada de Integrações.
        </p>
      </SettingsCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SettingsCard title="Segurança" description="Senha e acesso à conta.">
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-4">
              <p className="text-sm text-zinc-400">Senha de acesso</p>
              <p className="mt-1 font-medium text-zinc-200">
                {profile.hasPassword ? "Senha definida" : "Login apenas via rede social"}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                {profile.hasPassword
                  ? "Recomendamos trocar a senha periodicamente."
                  : "Defina uma senha para também entrar com e-mail."}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-4">
              <p className="text-sm text-zinc-400">Verificação de identidade</p>
              <p className="mt-1 font-medium text-zinc-200">
                {kycStatusLabel(profile.kyc.status)}
              </p>
              {!profile.kyc.canWithdraw && (
                <Link
                  href="/dashboard/finance?tab=verificacao"
                  className="mt-2 inline-block text-xs text-cyan-400 hover:underline"
                >
                  Completar verificação →
                </Link>
              )}
            </div>
            <TwoFactorSettings
              initialEnabled={profile.totpEnabled}
              hasPassword={profile.hasPassword}
            />
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-4">
              <p className="text-sm text-zinc-400">App instalável</p>
              <p className="mt-1 font-medium text-zinc-200">Instalar pix.tips</p>
              <p className="mt-2 text-xs text-zinc-500">
                Adicione o painel à tela inicial do celular ou computador para acesso rápido.
              </p>
              <div className="mt-3">
                <PwaInstallButton />
              </div>
            </div>
            <Link
              href="/forgot-password"
              className="inline-flex rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-cyan-500/50 hover:text-white"
            >
              {profile.hasPassword ? "Alterar senha" : "Definir senha por e-mail"}
            </Link>
          </div>
        </SettingsCard>

        <ApiKeySection />
      </div>

      <SettingsCard
        title="Zona de perigo"
        description="Ações irreversíveis. Use com cuidado."
        className="border-red-500/20 bg-red-500/[0.03]"
      >
        <p className="text-sm text-zinc-400">
          Ao excluir sua conta, todos os dados serão removidos permanentemente.
          Saques pendentes ou saldo disponível impedem a exclusão.
        </p>
        <button
          type="button"
          onClick={() => {
            setDeleteOpen(true);
            setDeleteConfirm("");
          }}
          className="mt-4 rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
        >
          Excluir minha conta
        </button>
      </SettingsCard>

      {isDirty && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-zinc-400">Você tem alterações não salvas.</p>
            <button
              type="button"
              onClick={handleSaveNotifications}
              disabled={saving}
              className="web3-btn-primary rounded-xl px-5 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar preferências"}
            </button>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-red-400">Excluir conta</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Esta ação é permanente. Digite <strong className="text-zinc-200">EXCLUIR</strong>{" "}
              para confirmar.
            </p>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="EXCLUIR"
              className="mt-4 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm"
            />
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-sm text-zinc-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleteConfirm !== "EXCLUIR" || deleting}
                onClick={handleDeleteAccount}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                {deleting ? "Excluindo..." : "Confirmar exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
