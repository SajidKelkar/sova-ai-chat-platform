import { Code2, Database, Bug } from 'lucide-react';
import { BrandMark } from './BrandMark';

const EXAMPLES = [
  {
    icon: Code2,
    label: 'Write some code',
    text: 'Create a clean React component',
  },
  {
    icon: Bug,
    label: 'Debug an issue',
    text: 'Help me find a bug in my code',
  },
  {
    icon: Database,
    label: 'Learn something',
    text: 'Explain database indexes simply',
  },
];

interface EmptyStateProps {
  onExampleClick: (text: string) => void;
}

export function EmptyState({ onExampleClick }: EmptyStateProps) {
  return (
    <div className="welcome-scene flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-5 py-8 sm:px-8">
      <div className="mb-7 max-w-2xl text-center">
        <BrandMark className="mx-auto mb-4 h-12 w-12 rounded-[15px] shadow-[0_8px_18px_rgba(15,23,42,0.15)] ring-1 ring-black/5 dark:shadow-[0_8px_18px_rgba(0,0,0,0.3)] dark:ring-white/10" />
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-600 dark:text-primary-300">
          Sova AI
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.045em] text-gray-950 dark:text-white sm:text-[38px] sm:leading-[1.14]">
          What can I help with?
        </h1>
        <p className="mx-auto mt-2.5 max-w-lg text-sm leading-6 text-gray-500 dark:text-gray-400 sm:text-[15px]">
          Ask a question, explore an idea, or get help with a task.
        </p>
      </div>

      <div className="w-full max-w-[720px]">
        <p className="mb-3 text-center text-[11px] font-medium text-gray-400 dark:text-gray-500">
          A few ways to get started
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {EXAMPLES.map(({ icon: Icon, label, text }) => (
            <button
              key={text}
              type="button"
              onClick={() => onExampleClick(text)}
              aria-label={`${label}: ${text}`}
              className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-gray-200/80 bg-white/75 px-3.5 py-2 text-left text-[13px] font-medium text-gray-700 shadow-[0_1px_3px_rgba(15,23,42,0.035)] transition-colors duration-150 hover:border-gray-300 hover:bg-white hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:border-white/[0.09] dark:bg-white/[0.035] dark:text-gray-300 dark:hover:border-white/[0.16] dark:hover:bg-white/[0.07] dark:hover:text-white"
            >
              <Icon
                className="h-4 w-4 text-gray-500 transition-colors group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200"
                strokeWidth={1.8}
              />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
