import { BRAND_NAME, SITE_URL } from "@/lib/brand";

export function TipPageFooter({ className = "" }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer className={`text-center text-xs text-zinc-600 ${className}`.trim()}>
      <a
        href={SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:text-zinc-400"
      >
        © {year} {BRAND_NAME}
      </a>
    </footer>
  );
}
