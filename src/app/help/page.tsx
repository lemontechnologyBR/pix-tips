import { HelpCenter } from "@/components/help/HelpCenter";
import { PageHeader, PublicPageLayout } from "@/components/public/PublicPageLayout";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Central de Ajuda",
  description:
    "Tutoriais, FAQs e solução de problemas para pix.tips, alertas OBS, Pix e planos.",
};

export default function HelpPage() {
  return (
    <PublicPageLayout>
      <PageHeader
        title="Central de Ajuda"
        description="Encontre respostas sobre sua conta, página de doações, alertas e pagamentos."
      />

      <div className="mb-8 flex flex-wrap gap-4 text-sm">
        {[
          { href: "#primeiros-passos", label: "Primeiros passos" },
          { href: "#tip-page", label: "Minha página" },
          { href: "#alertas", label: "Alertas" },
          { href: "#pagamentos", label: "Pagamentos" },
          { href: "#planos", label: "Planos" },
          { href: "#solucao-problemas", label: "Solução de problemas" },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-lg border border-zinc-800 px-3 py-1.5 text-zinc-400 transition hover:border-cyan-600/50 hover:text-cyan-300"
          >
            {link.label}
          </a>
        ))}
      </div>

      <HelpCenter />

      <p className="mt-14 text-center text-sm text-zinc-500">
        Não encontrou o que precisa?{" "}
        <Link href="/status" className="text-cyan-400 hover:underline">
          Ver status dos serviços
        </Link>{" "}
        ou escreva para{" "}
        <a href="mailto:suporte@pix.tips" className="text-cyan-400 hover:underline">
          suporte@pix.tips
        </a>
        .
      </p>
    </PublicPageLayout>
  );
}
