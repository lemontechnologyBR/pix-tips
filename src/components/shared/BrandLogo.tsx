import {
  BRAND_LOGO_ICON_SRC,
  BRAND_LOGO_LIGHT_SRC,
  BRAND_LOGO_SRC,
  BRAND_NAME,
} from "@/lib/brand";

interface BrandLogoProps {
  className?: string;
  /** Altura do logo em px */
  height?: number;
  /** dark = fundo escuro (texto claro). light = fundo claro */
  variant?: "dark" | "light";
  /** @deprecated Use height */
  iconClassName?: string;
  /** @deprecated Use height */
  textClassName?: string;
  /** @deprecated Sempre exibe o wordmark SVG */
  showText?: boolean;
}

export function BrandLogo({
  className = "",
  height = 32,
  variant = "dark",
}: BrandLogoProps) {
  const src =
    variant === "light" ? BRAND_LOGO_LIGHT_SRC : BRAND_LOGO_SRC;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={BRAND_NAME}
      className={`block w-auto ${className}`}
      height={height}
      style={{ height }}
    />
  );
}

interface BrandWordmarkProps {
  className?: string;
  height?: number;
  variant?: "dark" | "light";
}

export function BrandWordmark({
  className = "",
  height = 32,
  variant = "dark",
}: BrandWordmarkProps) {
  return (
    <BrandLogo className={className} height={height} variant={variant} />
  );
}

export function BrandIcon({
  className = "",
  height = 32,
}: {
  className?: string;
  height?: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={BRAND_LOGO_ICON_SRC}
      alt={BRAND_NAME}
      className={`block w-auto ${className}`}
      height={height}
      style={{ height }}
    />
  );
}
