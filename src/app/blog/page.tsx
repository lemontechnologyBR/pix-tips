import { PageHeader, PublicPageLayout } from "@/components/public/PublicPageLayout";
import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog",
  description: "Tutoriais, dicas e novidades da pix.tips para criadores de conteúdo.",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <PublicPageLayout>
      <PageHeader
        title="Blog"
        description="Tutoriais, dicas e atualizações da plataforma para quem faz live e recebe doações."
      />

      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 transition hover:border-cyan-600/40 hover:bg-zinc-900/70"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-3xl" aria-hidden>
                {post.thumbnail}
              </span>
              <span className="rounded-full border border-zinc-700 px-2.5 py-0.5 text-xs text-zinc-400">
                {post.category}
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-white group-hover:text-cyan-300">
              {post.title}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-400">
              {post.excerpt}
            </p>
            <p className="mt-4 text-xs text-zinc-600">{formatDate(post.date)}</p>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-center text-zinc-500">Nenhum artigo publicado ainda.</p>
      )}
    </PublicPageLayout>
  );
}
