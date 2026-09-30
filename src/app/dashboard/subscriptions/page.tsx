import { SubscriptionsManager } from "@/components/dashboard/SubscriptionsManager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apoio mensal",
};

export default function SubscriptionsPage() {
  return <SubscriptionsManager />;
}
