import { ApiDocsContent } from "@/components/developers/ApiDocsContent";
import { PageHeader, PublicPageLayout } from "@/components/public/PublicPageLayout";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API para Desenvolvedores",
  description:
    "Documentação da API pix.tips: autenticação, webhooks de doação e endpoints REST.",
};

export default function DevelopersPage() {
  return (
    <PublicPageLayout>
      <PageHeader
        title="API para Desenvolvedores"
        description="Integre doações, webhooks e automações na sua stack. Autenticação por chave de API."
      />

      <ApiDocsContent />

      <p className="mt-14 text-center text-sm text-zinc-500">
        Gere sua chave em{" "}
        <Link href="/dashboard/settings" className="text-cyan-400 hover:underline">
          Configurações
        </Link>{" "}
        ou via{" "}
        <code className="text-cyan-300">GET /api/user/api-key</code> autenticado.
      </p>
    </PublicPageLayout>
  );
}
