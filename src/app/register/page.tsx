import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function RegisterPage() {
  return (
    <AuthLayout title="Criar conta" subtitle="Comece a receber doações em minutos">
      <RegisterForm />
    </AuthLayout>
  );
}
