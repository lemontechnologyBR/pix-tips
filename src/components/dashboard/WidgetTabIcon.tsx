type WidgetTabIconId =
  | "overlay"
  | "qrcode"
  | "alerts"
  | "goals"
  | "ticker"
  | "stats"
  | "supporters"
  | "last"
  | "leaderboard"
  | "viewers";

interface WidgetTabIconProps {
  name: WidgetTabIconId;
  className?: string;
}

export function WidgetTabIcon({
  name,
  className = "h-5 w-5 shrink-0",
}: WidgetTabIconProps) {
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
    case "overlay":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M8 12h8" />
          <path d="M10 9h4" />
          <path d="M9 15h6" />
          <path d="M12 2v3" />
        </svg>
      );
    case "qrcode":
      return (
        <svg {...props}>
          <rect width="5" height="5" x="3" y="3" rx="1" />
          <rect width="5" height="5" x="16" y="3" rx="1" />
          <rect width="5" height="5" x="3" y="16" rx="1" />
          <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
          <path d="M21 21v.01" />
          <path d="M12 7v3a2 2 0 0 1-2 2H7" />
          <path d="M3 12h.01" />
          <path d="M12 3h.01" />
          <path d="M16 12h1" />
          <path d="M21 12v.01" />
        </svg>
      );
    case "alerts":
      return (
        <svg {...props}>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          <path d="M12 2v2" />
        </svg>
      );
    case "goals":
      return (
        <svg {...props}>
          <path d="M3 3v18h18" />
          <path d="M7 16V9" />
          <path d="M12 16V5" />
          <path d="M17 16v-3" />
        </svg>
      );
    case "ticker":
      return (
        <svg {...props}>
          <path d="M3 7h18" />
          <path d="M3 12h12" />
          <path d="M3 17h16" />
          <path d="M19 10v4" />
          <path d="m17 12 2-2 2 2-2 2z" />
        </svg>
      );
    case "stats":
      return (
        <svg {...props}>
          <path d="M12 20V10" />
          <path d="M18 20V4" />
          <path d="M6 20v-4" />
        </svg>
      );
    case "supporters":
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "last":
      return (
        <svg {...props}>
          <path d="M12 2v4" />
          <path d="M12 18v4" />
          <path d="m4.93 4.93 2.83 2.83" />
          <path d="m16.24 16.24 2.83 2.83" />
          <path d="M2 12h4" />
          <path d="M18 12h4" />
          <path d="m4.93 19.07 2.83-2.83" />
          <path d="m16.24 7.76 2.83-2.83" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "leaderboard":
      return (
        <svg {...props}>
          <path d="M8 21V10" />
          <path d="M12 21V3" />
          <path d="M16 21v-6" />
          <path d="M5 21h14" />
        </svg>
      );
    case "viewers":
      return (
        <svg {...props}>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
  }
}
