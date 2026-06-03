import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface BlogPostMeta {
  title: string;
  slug: string;
  date: string;
  category: string;
  excerpt: string;
  thumbnail: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function parseFile(filePath: string): BlogPost {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const meta = data as Record<string, string>;

  return {
    title: meta.title ?? "",
    slug: meta.slug ?? path.basename(filePath, ".md"),
    date: meta.date ?? "",
    category: meta.category ?? "Geral",
    excerpt: meta.excerpt ?? "",
    thumbnail: meta.thumbnail ?? "📝",
    content: content.trim(),
  };
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"));

  return files
    .map((file) => {
      const post = parseFile(path.join(BLOG_DIR, file));
      return {
        slug: post.slug,
        title: post.title,
        date: post.date,
        category: post.category,
        excerpt: post.excerpt,
        thumbnail: post.thumbnail,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  if (!fs.existsSync(BLOG_DIR)) return null;

  for (const file of fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"))) {
    const post = parseFile(path.join(BLOG_DIR, file));
    if (post.slug === slug) return post;
  }
  return null;
}
