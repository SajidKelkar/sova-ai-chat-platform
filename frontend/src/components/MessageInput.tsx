import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowUp, Square } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
  isSending: boolean;
  initialValue?: string;
}

export function MessageInput({
  onSend,
  disabled,
  isSending,
  initialValue,
}: MessageInputProps) {
  const [text, setText] = useState(initialValue || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, []);

  useEffect(() => {
    if (initialValue !== undefined) {
      setText(initialValue);
    }
  }, [initialValue]);

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight, text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setText('');
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div className="w-full shrink-0 bg-gradient-to-t from-[#f7f7f7] via-[#f7f7f7] to-transparent px-4 pb-4 pt-3 dark:from-[#191a1d] dark:via-[#191a1d] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="chat-composer flex items-end gap-2 rounded-[30px] border border-gray-200/90 bg-white px-3 py-2 transition-colors duration-150 focus-within:border-gray-400 focus-within:ring-4 focus-within:ring-gray-500/[0.06] dark:border-white/[0.1] dark:bg-[#26282c] dark:focus-within:border-white/[0.18] dark:focus-within:ring-white/[0.03] sm:px-4">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
            }}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            maxLength={20000}
            rows={1}
            placeholder="Message Sova"
            className="max-h-[200px] min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] leading-6 text-gray-900 outline-none placeholder:text-gray-400 disabled:opacity-70 dark:text-gray-100 dark:placeholder:text-gray-500"
            aria-label="Message input"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="mb-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700 shadow-sm transition-colors duration-150 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:disabled:bg-white/[0.12] dark:disabled:text-gray-500"
            aria-label={isSending ? 'Sending message' : 'Send message'}
          >
            {isSending ? (
              <Square className="h-3.5 w-3.5 fill-current" />
            ) : (
              <ArrowUp className="h-5 w-5" />
            )}
          </button>
        </div>
        <p className="mt-2.5 text-center text-[11px] text-gray-400 dark:text-gray-500">
          AI-generated content may be incorrect. <span className="hidden sm:inline">Enter to send · Shift + Enter for a new line</span>
        </p>
      </div>
    </div>
  );
}
