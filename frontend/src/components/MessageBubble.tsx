import { Copy, Check } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { LoadingIndicator } from './LoadingIndicator';
import type { NormalizedMessage } from '@/api/message';
import { BrandMark } from './BrandMark';

interface MessageBubbleProps {
  message: NormalizedMessage | { role: 'assistant'; content: ''; loading?: boolean };
  isLast?: boolean;
  className?: string;
  isTyping?: boolean;
  onTypingProgress?: () => void;
}

export function MessageBubble({
  message,
  className,
  isTyping = false,
  onTypingProgress,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const typingProgressCallback = useRef(onTypingProgress);
  typingProgressCallback.current = onTypingProgress;
  const [typingProgress, setTypingProgress] = useState<{
    messageId: string;
    visibleCharacters: number;
  } | null>(null);
  const characters = useMemo(() => Array.from(message.content), [message.content]);

  const isUser = message.role === 'user';
  const isLoading = 'loading' in message && message.loading;
  const messageId = 'id' in message ? message.id : 'loading';
  const visibleCharacters =
    isTyping && typingProgress && typingProgress.messageId === messageId
      ? typingProgress.visibleCharacters
      : isTyping
        ? 0
        : characters.length;
  const visibleContent = characters.slice(0, visibleCharacters).join('');

  useEffect(() => {
    if (!isTyping) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTypingProgress({
        messageId,
        visibleCharacters: characters.length,
      });
      return;
    }

    let visible = 0;
    const duration = Math.min(1800, Math.max(360, characters.length * 2.2));
    const steps = Math.min(75, Math.max(15, Math.ceil(duration / 24)));
    const step = Math.max(1, Math.ceil(characters.length / steps));
    const intervalId = window.setInterval(() => {
      visible = Math.min(visible + step, characters.length);
      setTypingProgress({ messageId, visibleCharacters: visible });
      typingProgressCallback.current?.();
      if (visible >= characters.length) {
        window.clearInterval(intervalId);
      }
    }, duration / steps);

    return () => window.clearInterval(intervalId);
  }, [characters.length, isTyping, messageId]);

  const handleCopy = () => {
    if (!message.content) return;

    navigator.clipboard.writeText(message.content).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      },
      () => setCopied(false),
    );
  };

  if (isLoading) {
    return (
      <div className="conversation-message px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-3 flex items-center gap-2">
            <BrandMark className="h-6 w-6 rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/10" />
            <span className="text-xs font-semibold tracking-wide text-gray-700 dark:text-gray-200">
              Sova
            </span>
          </div>
          <LoadingIndicator />
        </div>
      </div>
    );
  }

  return (
    <div className={`conversation-message group px-4 py-4 sm:px-6 ${className || ''}`}>
      <div className="mx-auto max-w-4xl">
        {isUser ? (
          <div className="flex justify-end">
            <div className="user-message max-w-[88%] rounded-[22px] rounded-br-[8px] border border-gray-200/90 bg-gradient-to-br from-white to-gray-100 px-5 py-3 text-[15px] leading-7 text-gray-800 shadow-[0_3px_12px_rgba(15,23,42,0.055),inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-white/[0.08] dark:from-[#303238] dark:to-[#27292e] dark:text-gray-100 dark:shadow-[0_3px_12px_rgba(0,0,0,0.12)] sm:max-w-[78%]">
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-2.5 flex items-center gap-2">
              <BrandMark className="h-6 w-6 rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/10" />
              <span className="text-xs font-semibold tracking-wide text-gray-700 dark:text-gray-200">
                Sova
              </span>
            </div>
            <div className="assistant-message-content min-w-0 text-[15px] leading-[1.8] text-gray-800 dark:text-gray-200">
              {visibleContent && <MarkdownRenderer content={visibleContent} />}
              {isTyping && visibleCharacters < characters.length && (
                <span className="typing-caret" aria-hidden="true" />
              )}
            </div>
            {message.content && (
              <button
                type="button"
                onClick={handleCopy}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus-visible:opacity-100 dark:text-gray-400 dark:hover:bg-white/[0.06] dark:hover:text-gray-200 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Copy message"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-success-500" />
                    <span className="text-success-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}