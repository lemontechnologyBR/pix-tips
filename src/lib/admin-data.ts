export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/creators", label: "Criadores", icon: "👥" },
  { href: "/admin/users", label: "Usuários", icon: "🧑‍💻" },
  { href: "/admin/kyc", label: "Verificações KYC", icon: "🪪" },
  { href: "/admin/transactions", label: "Transações", icon: "💰" },
  { href: "/admin/payouts", label: "Saques", icon: "💸" },
  { href: "/admin/templates", label: "Templates", icon: "🎨" },
  { href: "/admin/settings", label: "Configurações", icon: "⚙️" },
] as const;

export const ADMIN_PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/creators": "Criadores",
  "/admin/users": "Usuários",
  "/admin/kyc": "Verificações KYC",
  "/admin/transactions": "Transações",
  "/admin/payouts": "Saques",
  "/admin/templates": "Templates",
  "/admin/settings": "Configurações",
};
