import Link from "next/link";
import { BrandLogo } from "@/components/shared/BrandLogo";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="inline-flex">
            <BrandLogo height={36} />
          </Link>
        </div>

        <div className="web3-glass-strong rounded-2xl border border-cyan-500/15 p-6 shadow-xl shadow-cyan-500/5 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
