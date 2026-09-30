import { redirect } from "next/navigation";

/** Plano Pro desativado — redireciona para o dashboard admin. */
export default function AdminSubscriptionsPage() {
  redirect("/admin");
}
