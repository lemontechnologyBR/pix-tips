import { BRAND_NAME, SITE_URL } from "@/lib/brand";
import { resolveTipPageFooterClass } from "@/lib/tip-page-theme";

export function TipPageFooter({
  className = "",
  layoutId,
  darkMode = true,
}: {
  className?: string;
  layoutId?: string;
  darkMode?: boolean;
}) {
  const year = new Date().getFullYear();
  const linkClass = resolveTipPageFooterClass(layoutId, darkMode);

  return (
    <footer className={`text-center text-xs ${className}`.trim()}>
      <a
        href={SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`transition ${linkClass}`}
      >
        © {year} {BRAND_NAME}
      </a>
    </footer>
  );
}
