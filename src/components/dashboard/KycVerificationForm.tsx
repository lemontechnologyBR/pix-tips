"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KycFormIcon } from "@/components/dashboard/KycFormIcon";
import { formatCpf, isValidCpf, kycStatusLabel, normalizeCpf } from "@/lib/kyc";
import type { KycDocumentType, KycProfile } from "@/types";

interface KycVerificationFormProps {
  initialProfile: KycProfile;
}

type CpfCheckState =
  | { phase: "idle" }
  | { phase: "checking" }
  | { phase: "ok"; message: string; provider: string }
  | { phase: "warn"; message: string }
  | { phase: "error"; message: string };

function statusConfig(status: KycProfile["status"]) {
  switch (status) {
    case "approved":
      return {
        icon: "status-approved" as const,
        box: "border-emerald-500/30 bg-gradient-to-r from-emerald-600/10 to-emerald-900/5",
        iconBox: "border-emerald-500/40 bg-emerald-600/15 text-emerald-300",
        title: "text-emerald-100",
        body: "text-emerald-200/80",
      };
    case "pending":
      return {
        icon: "status-pending" as const,
        box: "border-amber-500/30 bg-gradient-to-r from-amber-600/10 to-amber-900/5",
        iconBox: "border-amber-500/40 bg-amber-600/15 text-amber-300",
        title: "text-amber-100",
        body: "text-amber-200/80",
      };
    case "rejected":
      return {
        icon: "status-rejected" as const,
        box: "border-red-500/30 bg-gradient-to-r from-red-600/10 to-red-900/5",
        iconBox: "border-red-500/40 bg-red-600/15 text-red-300",
        title: "text-red-100",
        body: "text-red-200/80",
      };
    default:
      return {
        icon: "status-none" as const,
        box: "border-zinc-700/80 bg-gradient-to-r from-zinc-800/40 to-zinc-900/20",
        iconBox: "border-zinc-600/60 bg-zinc-800/80 text-zinc-400",
        title: "text-zinc-100",
        body: "text-zinc-400",
      };
  }
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: React.ComponentProps<typeof KycFormIcon>["name"];
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
        <KycFormIcon name={icon} className="h-5 w-5" />
      </div>
      <div>
        <h2 className="font-semibold text-white">{title}</h2>
        <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
      </div>
    </div>
  );
}

function FileField({
  label,
  hint,
  icon,
  onChange,
  preview,
  filled,
}: {
  label: string;
  hint: string;
  icon: React.ComponentProps<typeof KycFormIcon>["name"];
  onChange: (file: File | null) => void;
  preview: string | null;
  filled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`group relative rounded-xl border border-dashed p-4 transition ${
        filled
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-zinc-700/80 bg-zinc-950/30 hover:border-cyan-500/40 hover:brightness-110/[0.03]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
              filled
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-zinc-700 bg-zinc-900 text-zinc-500 group-hover:text-cyan-300"
            }`}
          >
            {filled ? (
              <KycFormIcon name="check" className="h-4 w-4" />
            ) : (
              <KycFormIcon name={icon} className="h-4 w-4" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">{label}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{hint}</p>
          </div>
        </div>
        {filled && (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            OK
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`mt-4 flex w-full flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 transition ${
          preview
            ? "border-zinc-700/60 bg-zinc-950/50"
            : "border-zinc-700/50 bg-zinc-950/40 group-hover:border-cyan-500/30"
        }`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={label}
            className="max-h-36 w-full rounded-md object-contain"
          />
        ) : (
          <>
            <KycFormIcon name="upload" className="h-6 w-6 text-zinc-600 group-hover:text-cyan-400" />
            <span className="mt-2 text-xs text-zinc-500 group-hover:text-zinc-300">
              Clique para selecionar
            </span>
            <span className="mt-0.5 text-[10px] text-zinc-600">JPG, PNG ou WebP · máx. 5 MB</span>
          </>
        )}
      </button>

      {preview && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 w-full text-center text-xs text-zinc-500 hover:text-cyan-300"
        >
          Trocar arquivo
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          onChange(file);
        }}
      />
    </div>
  );
}

function StepIndicator({
  personalDone,
  documentsDone,
  submitted,
}: {
  personalDone: boolean;
  documentsDone: boolean;
  submitted: boolean;
}) {
  const steps = [
    { label: "Dados", done: personalDone },
    { label: "Documentos", done: documentsDone },
    { label: "Análise", done: submitted },
  ];

  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {steps.map((step, index) => {
        const active =
          (index === 0 && !personalDone) ||
          (index === 1 && personalDone && !documentsDone) ||
          (index === 2 && personalDone && documentsDone && !submitted);
        return (
          <li key={step.label} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                step.done
                  ? "bg-cyan-500 text-white"
                  : active
                    ? "border border-cyan-500/60 bg-cyan-500/20 text-cyan-200"
                    : "border border-zinc-700 bg-zinc-900 text-zinc-500"
              }`}
            >
              {step.done ? <KycFormIcon name="check" className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span
              className={`truncate text-xs sm:text-sm ${
                step.done ? "text-zinc-200" : active ? "text-cyan-200" : "text-zinc-500"
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <span
                className={`ml-auto hidden h-px flex-1 sm:block ${
                  step.done ? "bg-cyan-500/50" : "bg-zinc-800"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-700/80 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30";

export function KycVerificationForm({ initialProfile }: KycVerificationFormProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [legalName, setLegalName] = useState(profile.legalName ?? "");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState(profile.birthDate ?? "");
  const [documentType, setDocumentType] = useState<KycDocumentType>(
    profile.documentType ?? "rg",
  );
  const [documentFront, setDocumentFront] = useState<File | null>(null);
  const [documentBack, setDocumentBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cpfCheck, setCpfCheck] = useState<CpfCheckState>({ phase: "idle" });
  const cpfCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const status = statusConfig(profile.status);

  const personalDone = useMemo(() => {
    return (
      legalName.trim().length >= 3 &&
      isValidCpf(normalizeCpf(cpf)) &&
      Boolean(birthDate) &&
      Boolean(documentType)
    );
  }, [legalName, cpf, birthDate, documentType]);

  const documentsDone = Boolean(documentFront && documentBack && selfie);
  const submitted = profile.status === "pending" || profile.status === "approved";

  const setPreview = useCallback((file: File | null, setter: (v: string | null) => void) => {
    if (!file) {
      setter(null);
      return;
    }
    setter(URL.createObjectURL(file));
  }, []);

  function handleCpfChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    setCpf(formatCpf(digits));
    setCpfCheck({ phase: "idle" });
  }

  useEffect(() => {
    if (cpfCheckTimer.current) clearTimeout(cpfCheckTimer.current);

    const cpfDigits = normalizeCpf(cpf);
    if (
      cpfDigits.length !== 11 ||
      !isValidCpf(cpfDigits) ||
      legalName.trim().length < 3 ||
      !birthDate
    ) {
      setCpfCheck({ phase: "idle" });
      return;
    }

    cpfCheckTimer.current = setTimeout(async () => {
      setCpfCheck({ phase: "checking" });
      try {
        const res = await fetch("/api/user/kyc/validate-cpf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ legalName, cpf, birthDate, documentType }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          message?: string;
          provider?: string;
          status?: string;
        };

        if (!res.ok) {
          setCpfCheck({ phase: "error", message: data.error ?? "CPF não conferido." });
          return;
        }

        if (data.status === "skipped") {
          setCpfCheck({
            phase: "warn",
            message: data.message ?? "Consulta externa desativada — validação local apenas.",
          });
          return;
        }

        setCpfCheck({
          phase: "ok",
          message: data.message ?? "Dados conferidos.",
          provider: data.provider ?? "api",
        });
      } catch {
        setCpfCheck({ phase: "warn", message: "Não foi possível validar o CPF agora." });
      }
    }, 700);

    return () => {
      if (cpfCheckTimer.current) clearTimeout(cpfCheckTimer.current);
    };
  }, [cpf, legalName, birthDate, documentType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!documentFront || !documentBack || !selfie) {
      setError("Envie os três arquivos: frente, verso e selfie.");
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("legalName", legalName);
      form.append("cpf", cpf);
      form.append("birthDate", birthDate);
      form.append("documentType", documentType);
      form.append("documentFront", documentFront);
      form.append("documentBack", documentBack);
      form.append("selfie", selfie);

      const res = await fetch("/api/user/kyc", { method: "POST", body: form });
      const data = (await res.json()) as KycProfile & { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar verificação.");
        return;
      }

      setProfile(data);
      setSuccess("Documentos enviados! Analisaremos em até 2 dias úteis.");
      setDocumentFront(null);
      setDocumentBack(null);
      setSelfie(null);
      setFrontPreview(null);
      setBackPreview(null);
      setSelfiePreview(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            <KycFormIcon name="shield" className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Verificação de identidade</h1>
            <p className="mt-1 max-w-xl text-sm text-zinc-400">
              Exigida por lei para saques e prevenção à fraude. Documentos com acesso restrito.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/finance"
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
        >
          Voltar ao financeiro
        </Link>
      </div>

      <div className={`flex items-start gap-4 rounded-2xl border px-5 py-4 ${status.box}`}>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${status.iconBox}`}
        >
          <KycFormIcon name={status.icon} className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${status.title}`}>
            {kycStatusLabel(profile.status)}
          </p>
          {profile.status === "pending" && (
            <p className={`mt-1 text-sm ${status.body}`}>
              Recebemos seus documentos em{" "}
              {profile.submittedAt
                ? new Date(profile.submittedAt).toLocaleString("pt-BR")
                : "—"}
              . Você será notificado por e-mail quando a análise terminar.
            </p>
          )}
          {profile.status === "approved" && (
            <p className={`mt-1 text-sm ${status.body}`}>
              Identidade verificada. Saques liberados.
              {profile.reviewedAt && (
                <> Aprovado em {new Date(profile.reviewedAt).toLocaleString("pt-BR")}.</>
              )}
            </p>
          )}
          {profile.status === "rejected" && (
            <p className={`mt-1 text-sm ${status.body}`}>
              {profile.rejectionReason ?? "Documentos não aprovados."} Envie novamente abaixo.
            </p>
          )}
          {profile.status === "none" && (
            <p className={`mt-1 text-sm ${status.body}`}>
              Complete os passos abaixo para liberar saques do seu saldo.
            </p>
          )}
        </div>
      </div>

      {profile.canSubmit && (
        <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/30">
          <div className="border-b border-zinc-800/80 px-5 py-4 sm:px-6">
            <StepIndicator
              personalDone={personalDone}
              documentsDone={documentsDone}
              submitted={submitted}
            />
          </div>

          <form onSubmit={handleSubmit} className="divide-y divide-zinc-800/80">
            <section className="space-y-5 p-5 sm:p-6">
              <SectionHeading
                icon="user"
                title="Dados pessoais"
                description="Devem coincidir com o documento e a chave Pix de saque."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 flex items-center gap-1.5 text-sm text-zinc-400">
                    <KycFormIcon name="user" className="h-3.5 w-3.5" />
                    Nome completo
                  </span>
                  <input
                    required
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className={inputClass}
                    placeholder="Como no RG ou CNH"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-sm text-zinc-400">
                    <KycFormIcon name="id-card" className="h-3.5 w-3.5" />
                    CPF
                  </span>
                  <input
                    required
                    value={cpf}
                    onChange={(e) => handleCpfChange(e.target.value)}
                    className={`${inputClass} ${
                      cpfCheck.phase === "error"
                        ? "border-red-500/50"
                        : cpfCheck.phase === "ok"
                          ? "border-emerald-500/40"
                          : ""
                    }`}
                    placeholder="000.000.000-00"
                  />
                  {cpfCheck.phase === "checking" && (
                    <p className="mt-1.5 text-xs text-zinc-500">Consultando CPF…</p>
                  )}
                  {cpfCheck.phase === "ok" && (
                    <p className="mt-1.5 text-xs text-emerald-400">
                      {cpfCheck.message}
                      {cpfCheck.provider !== "none" && (
                        <span className="text-zinc-500"> · via {cpfCheck.provider}</span>
                      )}
                    </p>
                  )}
                  {cpfCheck.phase === "warn" && (
                    <p className="mt-1.5 text-xs text-amber-400">{cpfCheck.message}</p>
                  )}
                  {cpfCheck.phase === "error" && (
                    <p className="mt-1.5 text-xs text-red-400">{cpfCheck.message}</p>
                  )}
                </label>

                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-sm text-zinc-400">
                    <KycFormIcon name="calendar" className="h-3.5 w-3.5" />
                    Data de nascimento
                  </span>
                  <input
                    required
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className={inputClass}
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 flex items-center gap-1.5 text-sm text-zinc-400">
                    <KycFormIcon name="id-card" className="h-3.5 w-3.5" />
                    Tipo de documento
                  </span>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as KycDocumentType)}
                    className={inputClass}
                  >
                    <option value="rg">RG (identidade)</option>
                    <option value="cnh">CNH (carteira de motorista)</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="space-y-5 p-5 sm:p-6">
              <SectionHeading
                icon="camera"
                title="Documentos"
                description="Fotos nítidas, sem cortes ou reflexos. Máximo 5 MB por arquivo."
              />

              <div className="grid gap-4 lg:grid-cols-2">
                <FileField
                  label="Frente do documento"
                  hint="Foto legível da frente do RG ou CNH."
                  icon="doc-front"
                  preview={frontPreview}
                  filled={Boolean(documentFront)}
                  onChange={(file) => {
                    setDocumentFront(file);
                    setPreview(file, setFrontPreview);
                  }}
                />
                <FileField
                  label="Verso do documento"
                  hint="Foto legível do verso."
                  icon="doc-back"
                  preview={backPreview}
                  filled={Boolean(documentBack)}
                  onChange={(file) => {
                    setDocumentBack(file);
                    setPreview(file, setBackPreview);
                  }}
                />
                <div className="lg:col-span-2">
                  <FileField
                    label="Selfie com documento"
                    hint="Segure o documento ao lado do rosto, em ambiente iluminado."
                    icon="camera"
                    preview={selfiePreview}
                    filled={Boolean(selfie)}
                    onChange={(file) => {
                      setSelfie(file);
                      setPreview(file, setSelfiePreview);
                    }}
                  />
                </div>
              </div>
            </section>

            <div className="space-y-4 bg-zinc-950/30 p-5 sm:p-6">
              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </p>
              )}
              {success && (
                <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  {success}
                </p>
              )}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-xs text-zinc-500">
                  <KycFormIcon name="lock" className="h-3.5 w-3.5 shrink-0" />
                  Seus dados são criptografados e acessados somente pela equipe de compliance.
                </p>
                <button
                  type="submit"
                  disabled={submitting || !personalDone || !documentsDone}
                  className="shrink-0 rounded-xl web3-btn-primary px-6 py-2.5 text-sm font-semibold hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? "Enviando…" : "Enviar para análise"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {profile.status === "approved" && profile.cpfMasked && (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <KycFormIcon name="check" className="h-5 w-5" />
            </div>
            <div className="text-sm text-zinc-300">
              <p>
                <span className="text-zinc-500">Titular:</span> {profile.legalName}
              </p>
              <p className="mt-1">
                <span className="text-zinc-500">CPF:</span> {profile.cpfMasked}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
