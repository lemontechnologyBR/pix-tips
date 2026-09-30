interface LiveBackgroundProps {
  children: React.ReactNode;
  className?: string;
  vignette?: boolean;
}

/** Studio atmosphere aligned to pix.tips wordmark (sky → lavender). */
export function LiveBackground({
  children,
  className = "",
  vignette = true,
}: LiveBackgroundProps) {
  return (
    <div className={`relative ${className}`}>
      {vignette && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-sky-400/[0.09] to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-64 w-64 bg-gradient-to-bl from-violet-400/[0.07] to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/45 to-transparent"
          />
        </>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
