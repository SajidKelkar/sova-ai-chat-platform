import {
  Code2,
  Database,
  Bug,
  ArrowUpRight,
} from 'lucide-react';
import { useState } from 'react';

const EXAMPLES = [
  {
    icon: Code2,
    label: 'Build',
    text: 'Create a clean React component',
  },
  {
    icon: Bug,
    label: 'Debug',
    text: 'Help me find a bug in my code',
  },
  {
    icon: Database,
    label: 'Explain',
    text: 'Explain database indexes simply',
  },
];

interface EmptyStateProps {
  onExampleClick: (text: string) => void;
}

export function EmptyState({ onExampleClick }: EmptyStateProps) {
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-10 sm:px-6">
      {/* Logo */}
      <div className="relative mb-6">
        <div className="absolute -inset-3 rounded-[30px] bg-primary-500/10 blur-xl dark:bg-primary-500/[0.08]" />

        <div className="relative h-20 w-20 overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.12)] ring-1 ring-gray-200/50 dark:border-white/[0.08] dark:bg-white/[0.04] dark:ring-white/[0.05]">
          {!logoError && (
            <img
              src="/logo.png"
              alt="Sova AI"
              className="h-full w-full object-cover object-center"
              onError={() => setLogoError(true)}
            />
          )}
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-center text-[28px] font-semibold tracking-[-0.025em] text-gray-900 dark:text-white sm:text-[34px]">
        How can I help you today?
      </h2>

      <p className="mb-8 mt-2 max-w-md text-center text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        Ask me anything, or try one of the examples below.
      </p>

      {/* Example cards */}
      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {EXAMPLES.map(({ icon: Icon, label, text }) => (
          <button
            key={text}
            onClick={() => onExampleClick(text)}
            className="group rounded-2xl border border-gray-200/80 bg-white p-4 text-left shadow-[0_3px_14px_rgba(15,23,42,0.035)] transition-all duration-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] dark:border-white/[0.07] dark:bg-white/[0.025] dark:shadow-none dark:hover:border-primary-500/25 dark:hover:bg-white/[0.045]"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary-100 bg-primary-50 text-primary-600 transition-all duration-200 group-hover:scale-105 group-hover:bg-primary-100 dark:border-primary-500/10 dark:bg-primary-500/10 dark:text-primary-300 dark:group-hover:bg-primary-500/15">
                <Icon className="h-[18px] w-[18px]" />
              </div>

              <div className="flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10">
                <ArrowUpRight className="h-4 w-4 text-gray-300 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary-500" />
              </div>
            </div>

            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              {label}
            </p>

            <p className="text-sm font-medium leading-relaxed text-gray-700 dark:text-gray-200">
              {text}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}