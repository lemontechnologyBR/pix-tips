type KycFormIconName =
  | "shield"
  | "status-none"
  | "status-pending"
  | "status-approved"
  | "status-rejected"
  | "user"
  | "id-card"
  | "calendar"
  | "upload"
  | "camera"
  | "doc-front"
  | "doc-back"
  | "lock"
  | "check";

interface KycFormIconProps {
  name: KycFormIconName;
  className?: string;
}

export function KycFormIcon({ name, className = "h-5 w-5 shrink-0" }: KycFormIconProps) {
  const props = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "status-none":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      );
    case "status-pending":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case "status-approved":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "status-rejected":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6" />
          <path d="m9 9 6 6" />
        </svg>
      );
    case "user":
      return (
        <svg {...props}>
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "id-card":
      return (
        <svg {...props}>
          <rect width="18" height="13" x="3" y="5" rx="2" />
          <path d="M7 15h4" />
          <path d="M7 11h6" />
          <circle cx="16" cy="11" r="1.5" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...props}>
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M16 2v4" />
          <path d="M8 2v4" />
          <path d="M3 10h18" />
        </svg>
      );
    case "upload":
      return (
        <svg {...props}>
          <path d="M12 3v12" />
          <path d="m7 8 5-5 5 5" />
          <path d="M5 21h14" />
        </svg>
      );
    case "camera":
      return (
        <svg {...props}>
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      );
    case "doc-front":
      return (
        <svg {...props}>
          <rect width="16" height="20" x="4" y="2" rx="2" />
          <path d="M8 10h8" />
          <path d="M8 14h5" />
          <circle cx="15" cy="7" r="2" />
        </svg>
      );
    case "doc-back":
      return (
        <svg {...props}>
          <rect width="16" height="20" x="4" y="2" rx="2" />
          <path d="M8 8h8" />
          <path d="M8 12h8" />
          <path d="M8 16h6" />
        </svg>
      );
    case "lock":
      return (
        <svg {...props}>
          <rect width="18" height="11" x="3" y="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
  }
}
