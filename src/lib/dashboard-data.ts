import { TEMPLATE_CATALOG } from "@/lib/alert-catalog";

export { DEFAULT_TIP_PAGE_SETTINGS } from "@/lib/tip-page-defaults";

export type DashboardNavIconId =
  | "overview"
  | "profile"
  | "tip-page"
  | "widgets"
  | "chat-bot"
  | "finance"
  | "verification"
  | "transactions"
  | "settings"
  | "billing"
  | "integrations";

export const DASHBOARD_NAV: {
  href: string;
  label: string;
  icon: DashboardNavIconId;
  exact?: boolean;
}[] = [
  { href: "/dashboard", label: "Visão Geral", icon: "overview", exact: true },
  { href: "/dashboard/profile", label: "Perfil", icon: "profile" },
  { href: "/dashboard/tip-page", label: "Minha página", icon: "tip-page" },
  { href: "/dashboard/widgets", label: "Widgets", icon: "widgets" },
  { href: "/dashboard/chat-bot", label: "ChatBot", icon: "chat-bot" },
  { href: "/dashboard/finance", label: "Financeiro", icon: "finance" },
  { href: "/dashboard/billing", label: "Plano e taxas", icon: "billing" },
  { href: "/dashboard/settings", label: "Configurações", icon: "settings" },
  { href: "/dashboard/integrations", label: "Integrações", icon: "integrations" },
];

export const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Visão Geral",
  "/dashboard/profile": "Perfil",
  "/dashboard/tip-page": "Minha página",
  "/dashboard/widgets": "Widgets",
  "/dashboard/chat-bot": "ChatBot",
  "/dashboard/finance": "Financeiro",
  "/dashboard/billing": "Plano e taxas",
  "/dashboard/transactions": "Transações",
  "/dashboard/settings": "Configurações",
  "/dashboard/integrations": "Integrações",
};

export const ALERT_TEMPLATES = TEMPLATE_CATALOG.map((t) => ({
  id: t.id,
  name: t.name,
  pro: t.plan === "pro",
}));
