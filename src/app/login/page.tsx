import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <AuthLayout title="Entrar" subtitle="Acesse seu painel de criador">
      <Suspense fallback={<p className="text-center text-sm text-zinc-500">Carregando...</p>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
