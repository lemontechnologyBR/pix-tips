import { AdminKycTable } from "@/components/admin/AdminKycTable";
import { listAdminKyc } from "@/lib/repositories/kyc-repository";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verificações KYC",
};

export default async function AdminKycPage() {
  const items = await listAdminKyc();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Verificações KYC</h2>
        <p className="text-sm text-zinc-500">
          Analise documentos enviados pelos criadores antes de liberar saques.
        </p>
      </div>
      <AdminKycTable initialItems={structuredClone(items)} />
    </div>
  );
}
