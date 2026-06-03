import { PageHeader, PublicPageLayout } from "@/components/public/PublicPageLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Status dos Serviços",
  description: "Status operacional da pix.tips: API, pagamentos, widget e painel.",
};

type ServiceStatus = "operational" | "degraded" | "outage";

const SERVICES: {
  name: string;
  description: string;
  status: ServiceStatus;
  latency?: string;
}[] = [
  {
    name: "API e autenticação",
    description: "Login, dashboard e endpoints públicos",
    status: "operational",
    latency: "42 ms",
  },
  {
    name: "Processamento Pix",
    description: "Criação e confirmação de cobranças",
    status: "operational",
    latency: "—",
  },
  {
    name: "Widget de alertas",
    description: "WebSocket e overlay OBS",
    status: "operational",
    latency: "18 ms",
  },
  {
    name: "Páginas públicas",
    description: "Páginas de doação por username (ex.: /seu-usuario)",
    status: "operational",
  },
  {
    name: "Webhooks de pagamento",
    description: "Notificações de parceiros",
    status: "degraded",
  },
  {
    name: "Upload de mídia",
    description: "Sons e imagens nos alertas",
    status: "operational",
  },
];

const STATUS_LABEL: Record<ServiceStatus, { label: string; className: string }> = {
  operational: {
    label: "Operacional",
    className: "bg-emerald-950/50 text-emerald-400 ring-emerald-800",
  },
  degraded: {
    label: "Degradado",
    className: "bg-amber-950/50 text-amber-400 ring-amber-800",
  },
  outage: {
    label: "Indisponível",
    className: "bg-red-950/50 text-red-400 ring-red-800",
  },
};

export default function StatusPage() {
  const allOperational = SERVICES.every((s) => s.status === "operational");

  return (
    <PublicPageLayout narrow>
      <PageHeader
        title="Status dos Serviços"
        description="Monitoramento em tempo quase real (dados de demonstração)."
        updatedAt="28 de maio de 2026, 14:00 BRT"
      />

      <div
        className={`mb-10 flex items-center gap-3 rounded-xl border px-5 py-4 ${
          allOperational
            ? "border-emerald-900/50 bg-emerald-950/30"
            : "border-amber-900/50 bg-amber-950/30"
        }`}
      >
        <span className="text-2xl" aria-hidden>
          {allOperational ? "✅" : "⚠️"}
        </span>
        <div>
          <p className="font-semibold text-white">
            {allOperational
              ? "Todos os sistemas operacionais"
              : "Alguns sistemas com desempenho reduzido"}
          </p>
          <p className="text-sm text-zinc-500">
            Últimos 90 dias: 99,9% de uptime (mock)
          </p>
        </div>
      </div>

      <ul className="space-y-4">
        {SERVICES.map((service) => {
          const badge = STATUS_LABEL[service.status];
          return (
            <li
              key={service.name}
              className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h2 className="font-medium text-white">{service.name}</h2>
                <p className="mt-1 text-sm text-zinc-500">{service.description}</p>
              </div>
              <div className="flex items-center gap-3">
                {service.latency && (
                  <span className="text-xs text-zinc-600">{service.latency}</span>
                )}
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${badge.className}`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      service.status === "operational"
                        ? "bg-emerald-500"
                        : service.status === "degraded"
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                  />
                  {badge.label}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-10 text-center text-xs text-zinc-600">
        Página de status ilustrativa. Em produção, integre com seu provedor de monitoramento.
      </p>
    </PublicPageLayout>
  );
}
