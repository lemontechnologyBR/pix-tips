import { ExamplesGallery } from "@/components/examples/ExamplesGallery";
import { PageHeader, PublicPageLayout } from "@/components/public/PublicPageLayout";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Exemplos de páginas",
  description:
    "Galeria de páginas de doação de criadores: gaming, música, arte, podcast e educação.",
};

export default function ExamplesPage() {
  return (
    <PublicPageLayout>
      <PageHeader
        title="Exemplos"
        description="Inspire-se em páginas reais (demos). Filtre por categoria e abra a página demo."
      />

      <ExamplesGallery />

      <p className="mt-14 text-center text-sm text-zinc-500">
        Quer a sua?{" "}
        <Link href="/dashboard" className="font-medium text-cyan-400 hover:underline">
          Criar minha página grátis
        </Link>
      </p>
    </PublicPageLayout>
  );
}
