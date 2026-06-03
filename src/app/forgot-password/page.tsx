import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Esqueci a senha",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Esqueci a senha" subtitle="Recupere o acesso à sua conta">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
