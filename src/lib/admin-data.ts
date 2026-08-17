export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/ops", label: "Operações", icon: "🛠️" },
  { href: "/admin/users", label: "Usuários", icon: "🧑‍💻" },
  { href: "/admin/channels", label: "Canais", icon: "📺" },
  { href: "/admin/subscriptions", label: "Assinaturas Pro", icon: "⭐" },
  { href: "/admin/kyc", label: "Verificações KYC", icon: "🪪" },
  { href: "/admin/transactions", label: "Transações", icon: "💰" },
  { href: "/admin/payouts", label: "Saques", icon: "💸" },
  { href: "/admin/support", label: "Suporte", icon: "💬" },
  { href: "/admin/settings", label: "Configurações", icon: "⚙️" },
] as const;

export const ADMIN_PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/analytics": "Analytics",
  "/admin/ops": "Operações",
  "/admin/users": "Usuários",
  "/admin/channels": "Canais",
  "/admin/subscriptions": "Assinaturas Pro",
  "/admin/kyc": "Verificações KYC",
  "/admin/transactions": "Transações",
  "/admin/payouts": "Saques",
  "/admin/support": "Suporte",
  "/admin/templates": "Suporte",
  "/admin/settings": "Configurações",
};
