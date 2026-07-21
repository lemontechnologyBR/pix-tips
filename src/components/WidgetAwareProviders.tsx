"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { SiteVisitTracker } from "@/components/analytics/SiteVisitTracker";
import { PwaBoot } from "@/components/shared/PwaBoot";
import { PwaInstallProvider } from "@/components/shared/PwaInstallProvider";

export function WidgetAwareProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/widget")) return children;
  return (
    <PwaInstallProvider>
      <PwaBoot />
      <Suspense fallback={null}>
        <SiteVisitTracker />
      </Suspense>
      {children}
    </PwaInstallProvider>
  );
}
