import type { Creator } from "@/types";
import {
  resolveTipPageBackground,
  resolveTipPageFontFamily,
} from "@/lib/tip-page-background";

interface PublicTipPageLayoutProps {
  creator: Creator;
  children: React.ReactNode;
}

export function PublicTipPageLayout({
  creator,
  children,
}: PublicTipPageLayoutProps) {
  const darkMode = creator.tipPageSettings.darkMode !== false;
  const bg = resolveTipPageBackground(
    creator.tipPageSettings,
    creator.themeColor,
    darkMode,
  );
  const font = resolveTipPageFontFamily(creator.tipPageSettings.fontFamily);

  return (
    <main
      className={`min-h-screen px-4 py-10${darkMode ? "" : " tip-light"}`}
      style={{ ...bg, fontFamily: font }}
    >
      <div className="mx-auto flex max-w-lg flex-col items-center gap-8">
        {children}
      </div>
    </main>
  );
}
