import { Loader2 } from 'lucide-react';
import { BrandMark } from './BrandMark';

export function LoadingIndicator() {
  return (
    <div
      className="flex w-fit items-center gap-1.5 rounded-full border border-gray-200/80 bg-white/80 px-3.5 py-3 shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:border-white/[0.08] dark:bg-white/[0.035] dark:shadow-none"
      role="status"
      aria-label="Sova is thinking"
    >
      <span className="thinking-dots flex items-center gap-1" aria-hidden="true">
        <span className="thinking-dot [animation-delay:0ms]" />
        <span className="thinking-dot [animation-delay:140ms]" />
        <span className="thinking-dot [animation-delay:280ms]" />
      </span>
    </div>
  );
}

export function FullPageLoader({
  label = 'Loading…',
}: {
  label?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#212121]">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="absolute -inset-2 rounded-2xl bg-primary-500/10 blur-lg" />

          <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_8px_25px_rgba(15,23,42,0.10)] dark:border-white/[0.08] dark:bg-white/[0.04]">
            <BrandMark className="h-full w-full" />
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {label}
        </p>
      </div>
    </div>
  );
}

export function InlineLoader({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label && <span>{label}</span>}
    </div>
  );
}