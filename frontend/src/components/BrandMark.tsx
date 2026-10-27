interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className = 'h-10 w-10' }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="Sova AI"
      fill="none"
    >
      <path
        d="M32 11.5c-2.2-1.5-4.8-2.2-7.8-2.2-6.2 0-10.4 3.2-10.4 7.9 0 4.1 3.1 6.2 9 7.8l4.4 1.2c4.4 1.2 6.3 2.8 6.3 5.5 0 3.4-3.4 5.8-8.6 5.8-4 0-7.7-1.4-10.9-4"
        className="stroke-slate-700 dark:stroke-slate-200"
        strokeWidth="3.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="31.5"
        cy="16"
        r="3.5"
        className="fill-slate-500 dark:fill-slate-400"
      />
      <circle
        cx="32.2"
        cy="16"
        r="1.2"
        className="fill-slate-800 dark:fill-slate-200"
      />
    </svg>
  );
}
