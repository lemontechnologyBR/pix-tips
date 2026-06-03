import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Widget OBS",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="widget-root min-h-screen bg-transparent">{children}</div>
  );
}
