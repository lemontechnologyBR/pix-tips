interface Web3BackgroundProps {
  children: React.ReactNode;
  className?: string;
  orbs?: boolean;
}

export function Web3Background({ children, className = "", orbs = true }: Web3BackgroundProps) {
  return (
    <div className={`relative ${className}`}>
      {orbs && (
        <>
          <div
            aria-hidden
            className="web3-glow-orb animate-web3-pulse-glow -top-32 right-0 h-96 w-96 bg-cyan-500/15"
          />
          <div
            aria-hidden
            className="web3-glow-orb animate-web3-pulse-glow bottom-0 left-0 h-72 w-72 bg-violet-600/12"
            style={{ animationDelay: "1.5s" }}
          />
          <div
            aria-hidden
            className="web3-glow-orb top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-fuchsia-500/8"
          />
        </>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
