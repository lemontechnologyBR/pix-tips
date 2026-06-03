"use client";

import { tipPagePath } from "@/lib/brand";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TEMPLATE_CATALOG, SOUND_CATALOG } from "@/lib/alert-catalog";
import { playCatalogSound } from "@/lib/sounds";
import { avatarUrlFromSeed } from "@/lib/avatar-presets";
import { AvatarPicker } from "@/components/shared/AvatarPicker";
import type { AlertTemplateId, OnboardingPayload } from "@/types";

const STEPS = ["welcome", "profile", "goal", "alerts", "finish"] as const;
type Step = (typeof STEPS)[number];

interface OnboardingWizardProps {
  initialUsername?: string;
  initialDisplayName?: string;
}

export function OnboardingWizard({
  initialUsername = "",
  initialDisplayName = "",
}: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [finishLinks, setFinishLinks] = useState({ tip: "", widget: "" });

  const [form, setForm] = useState({
    avatar: avatarUrlFromSeed(initialUsername || initialDisplayName || "tip"),
    displayName: initialDisplayName,
    bio: "",
    goal: "",
    templateId: "slide-up" as AlertTemplateId,
    soundId: "ncs-correct",
  });

  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const freeTemplates = useMemo(
    () => TEMPLATE_CATALOG.filter((t) => t.plan === "free").slice(0, 12),
    [],
  );
  const onboardingSounds = useMemo(
    () => SOUND_CATALOG.filter((s) => s.category === "ncs" && s.plan === "free"),
    [],
  );

  function next() {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }

  function back() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  async function finish() {
    setLoading(true);
    setError("");

    const payload: OnboardingPayload = {
      avatar:
        form.avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(form.displayName || "tip")}`,
      displayName: form.displayName,
      bio: form.bio,
      goal: form.goal ? Number(form.goal) : undefined,
      templateId: form.templateId,
      soundId: form.soundId,
    };

    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar");
        return;
      }

      const username = data.username ?? initialUsername;
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setFinishLinks({
        tip: `${origin}${tipPagePath(username)}`,
        widget: `${origin}/widget/alert/${data.creatorId}?token=${data.widgetToken ?? ""}`,
      });
      setStep("finish");
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs text-zinc-500">
          <span>Passo {stepIndex + 1} de {STEPS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl shadow-cyan-950/20">
        {step === "welcome" && (
          <>
            <h1 className="text-2xl font-bold text-white">Bem-vindo ao pix.tips 💜</h1>
            <p className="mt-3 text-zinc-400 leading-relaxed">
              Em poucos passos você configura sua página de doações, escolhe o alerta da live
              e recebe os links para compartilhar.
            </p>
            <button
              type="button"
              onClick={next}
              className="mt-8 w-full rounded-xl web3-btn-primary py-3 font-semibold hover:brightness-110"
            >
              Começar
            </button>
          </>
        )}

        {step === "profile" && (
          <>
            <h2 className="text-xl font-bold">Seu perfil</h2>
            <div className="mt-5 space-y-4">
              <AvatarPicker
                value={form.avatar}
                onChange={(avatar) => setForm({ ...form, avatar })}
                username={initialUsername}
              />
              <label className="block text-sm">
                <span className="text-zinc-400">Nome de exibição</span>
                <input
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-400">Bio</span>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                />
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={back} className="flex-1 rounded-xl border border-zinc-700 py-3">
                Voltar
              </button>
              <button
                type="button"
                onClick={next}
                disabled={!form.displayName.trim()}
                className="flex-1 rounded-xl web3-btn-primary py-3 font-semibold disabled:opacity-40"
              >
                Continuar
              </button>
            </div>
          </>
        )}

        {step === "goal" && (
          <>
            <h2 className="text-xl font-bold">Meta de arrecadação</h2>
            <p className="mt-2 text-sm text-zinc-400">Opcional — você pode pular e definir depois.</p>
            <label className="mt-5 block text-sm">
              <span className="text-zinc-400">Meta (R$)</span>
              <input
                type="number"
                min={0}
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                placeholder="500"
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
              />
            </label>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={back} className="flex-1 rounded-xl border border-zinc-700 py-3">
                Voltar
              </button>
              <button type="button" onClick={next} className="flex-1 rounded-xl border border-zinc-600 py-3 text-zinc-300">
                Pular
              </button>
              <button type="button" onClick={next} className="flex-1 rounded-xl web3-btn-primary py-3 font-semibold">
                Continuar
              </button>
            </div>
          </>
        )}

        {step === "alerts" && (
          <>
            <h2 className="text-xl font-bold">Alerta na live</h2>
            <p className="mt-2 text-sm text-zinc-400">Escolha template e som para suas doações.</p>

            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Template</p>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {freeTemplates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm({ ...form, templateId: t.id })}
                    className={`rounded-lg border px-2 py-2 text-left text-xs transition ${
                      form.templateId === t.id
                        ? "border-cyan-500 bg-cyan-500/20 text-cyan-200"
                        : "border-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    <span className="mr-1">{t.icon}</span>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Som — sem copyright
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto">
                {onboardingSounds.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, soundId: s.id });
                      void playCatalogSound(s.id);
                    }}
                    className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                      form.soundId === s.id
                        ? "border-cyan-500 bg-cyan-500/20 text-cyan-200"
                        : "border-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={back} className="flex-1 rounded-xl border border-zinc-700 py-3">
                Voltar
              </button>
              <button
                type="button"
                onClick={finish}
                disabled={loading}
                className="flex-1 rounded-xl web3-btn-primary py-3 font-semibold disabled:opacity-40"
              >
                {loading ? "Salvando..." : "Finalizar"}
              </button>
            </div>
          </>
        )}

        {step === "finish" && (
          <>
            <h2 className="text-xl font-bold">Tudo pronto! 🎉</h2>
            <p className="mt-2 text-sm text-zinc-400">Copie os links abaixo e adicione o widget no OBS.</p>

            <div className="mt-5 space-y-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <p className="text-xs text-zinc-500">Página de doações</p>
                <p className="mt-1 break-all text-sm text-cyan-300">{finishLinks.tip}</p>
                <button
                  type="button"
                  onClick={() => copy(finishLinks.tip, "tip")}
                  className="mt-2 text-xs text-cyan-400 hover:underline"
                >
                  {copied === "tip" ? "Copiado!" : "Copiar link"}
                </button>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <p className="text-xs text-zinc-500">Widget OBS (Browser Source)</p>
                <p className="mt-1 break-all text-sm text-cyan-300">{finishLinks.widget}</p>
                <button
                  type="button"
                  onClick={() => copy(finishLinks.widget, "widget")}
                  className="mt-2 text-xs text-cyan-400 hover:underline"
                >
                  {copied === "widget" ? "Copiado!" : "Copiar URL"}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="mt-8 w-full rounded-xl web3-btn-primary py-3 font-semibold hover:brightness-110"
            >
              Ir para o painel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
