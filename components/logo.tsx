import { cn } from '@/lib/utils';

/** Inline clapperboard + star mark, inheriting `currentColor` for the fill. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={cn('size-7', className)}
      role="img"
      aria-label="Reel logo"
      fill="currentColor"
    >
      <rect x="112" y="192" width="288" height="208" rx="22" />
      <clipPath id="reel-bar">
        <rect x="104" y="118" width="304" height="60" rx="14" />
      </clipPath>
      <g clipPath="url(#reel-bar)">
        <rect x="104" y="118" width="304" height="60" />
        <polygon points="40,178 72,178 106,118 74,118" className="fill-bg" />
        <polygon points="104,178 136,178 170,118 138,118" className="fill-bg" />
        <polygon points="168,178 200,178 234,118 202,118" className="fill-bg" />
        <polygon points="232,178 264,178 298,118 266,118" className="fill-bg" />
        <polygon points="296,178 328,178 362,118 330,118" className="fill-bg" />
        <polygon points="360,178 392,178 426,118 394,118" className="fill-bg" />
      </g>
      <path
        d="M346,304 L356,332.25 L385.95,333.02 L362.17,351.25 L370.69,379.98 L346,363 L321.31,379.98 L329.83,351.25 L306.05,333.02 L336,332.25 Z"
        className="fill-bg"
      />
    </svg>
  );
}

/** Mark + wordmark used in the top bar and marketing hero. */
export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark className="size-7 text-accent" />
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight text-text">
          Reel
        </span>
      )}
    </span>
  );
}
