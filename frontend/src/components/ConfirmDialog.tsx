import { AlertTriangle } from 'lucide-react';
import { type ReactNode, useEffect } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="absolute inset-0 bg-gray-950/45 backdrop-blur-[3px]"
        onClick={() => !loading && onCancel()}
      />
      <div className="relative w-full max-w-md rounded-[26px] border border-gray-200/80 bg-white p-6 shadow-[0_28px_90px_rgba(15,23,42,0.2)] dark:border-white/[0.1] dark:bg-[#25272b] sm:p-7">
        <div className="flex items-start gap-4">
          {variant === 'danger' && (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/10">
              <AlertTriangle className="h-5 w-5 text-error-600 dark:text-error-500" />
            </div>
          )}
          <div className="flex-1">
            <h2 id="confirm-title" className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            <div className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{message}</div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
