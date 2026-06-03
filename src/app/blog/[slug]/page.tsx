import { PageHeader, PublicPageLayout } from "@/components/public/PublicPageLayout";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Artigo não encontrado" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <PublicPageLayout narrow>
      <Link
        href="/blog"
        className="mb-6 inline-flex text-sm text-cyan-400 hover:text-cyan-300"
      >
        ← Voltar ao blog
      </Link>

      <PageHeader title={post.title} description={post.excerpt} />

      <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
        <span className="text-2xl" aria-hidden>
          {post.thumbnail}
        </span>
        <span className="rounded-full border border-zinc-700 px-2.5 py-0.5 text-zinc-400">
          {post.category}
        </span>
        <span>{formatDate(post.date)}</span>
      </div>

      <article className="prose-blog space-y-4 text-zinc-300">
        <ReactMarkdown
          components={{
            h2: ({ children }) => (
              <h2 className="mt-8 text-xl font-semibold text-white">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="mt-6 text-lg font-semibold text-white">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="leading-relaxed text-zinc-400">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-inside list-disc space-y-2 text-zinc-400">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-inside list-decimal space-y-2 text-zinc-400">{children}</ol>
            ),
            li: ({ children }) => <li className="text-zinc-400">{children}</li>,
            strong: ({ children }) => (
              <strong className="font-semibold text-zinc-200">{children}</strong>
            ),
            code: ({ children }) => (
              <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-sm text-cyan-300">
                {children}
              </code>
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </article>

      <section className="mt-14 rounded-xl border border-cyan-600/30 bg-cyan-500/10 p-8 text-center">
        <h2 className="text-xl font-semibold text-white">Pronto para receber doações?</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Crie sua página grátis, conecte o Pix e configure alertas para OBS em minutos.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className="rounded-lg web3-btn-primary px-6 py-2.5 text-sm font-medium hover:brightness-110"
          >
            Criar conta grátis
          </Link>
          <Link
            href="/help"
            className="rounded-lg border border-zinc-700 px-6 py-2.5 text-sm text-zinc-300 hover:border-zinc-500"
          >
            Central de Ajuda
          </Link>
        </div>
      </section>
    </PublicPageLayout>
  );
}
