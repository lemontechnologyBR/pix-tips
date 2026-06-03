import { BillingContent } from "@/components/dashboard/BillingContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plano e taxas",
};

export default function BillingPage() {
  return <BillingContent />;
}
