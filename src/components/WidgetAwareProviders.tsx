"use client";

import { usePathname } from "next/navigation";
import { PwaBoot } from "@/components/shared/PwaBoot";
import { PwaInstallProvider } from "@/components/shared/PwaInstallProvider";

export function WidgetAwareProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/widget")) return children;
  return (
    <PwaInstallProvider>
      <PwaBoot />
      {children}
    </PwaInstallProvider>
  );
}
