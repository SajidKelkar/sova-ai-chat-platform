import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  ArrowUp,
  Square,
  ChevronDown,
  Sparkles,
  Check,
} from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
  isSending: boolean;
  initialValue?: string;
}

const MODELS = [
  {
    id: 'openrouter/free',
    name: 'Sova Lite',
    desc: 'Fast, free AI model via OpenRouter',
  },
];

export function MessageInput({
  onSend,
  disabled,
  isSending,
  initialValue,
}: MessageInputProps) {
  const [text, setText] = useState(initialValue || '');
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialValue !== undefined) {
      setText(initialValue);
    }
  }, [initialValue]);

  const adjustHeight = () => {
    const element = textareaRef.current;

    if (!element) return;

    element.style.height = 'auto';
    element.style.height = Math.min(element.scrollHeight, 200) + 'px';
  };

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
    <div className="bg-gradient-to-t from-white via-white/95 to-transparent px-4 pb-4 pt-3 dark:from-[#0f1422] dark:via-[#0f1422]/95 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Model selector */}
        <div className="mb-2.5 flex items-center justify-center">
          <div className="relative">
            <button
              onClick={() => setModelOpen(!modelOpen)}
              className="flex items-center gap-1.5 rounded-full border border-gray-200/70 bg-white/80 px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-gray-300 hover:bg-white hover:text-gray-700 dark:border-white/[0.07] dark:bg-white/[0.035] dark:text-gray-400 dark:hover:border-white/[0.12] dark:hover:bg-white/[0.06] dark:hover:text-gray-200"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary-500" />

              {selectedModel.name}

              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  modelOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {modelOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setModelOpen(false)}
                />

                <div className="absolute bottom-[calc(100%+10px)] left-1/2 z-40 w-64 -translate-x-1/2 overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.14)] dark:border-white/[0.08] dark:bg-[#171c2b] dark:shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
                  {MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model);
                        setModelOpen(false);
                      }}
                      className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {model.name}
                        </p>

                        <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
                          {model.desc}
                        </p>
                      </div>

                      {model.id === selectedModel.id && (
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="relative flex items-end gap-2 rounded-[26px] border border-gray-200/80 bg-white/95 p-2 shadow-[0_8px_30px_rgba(15,23,42,0.07)] backdrop-blur-xl transition-all duration-200 focus-within:border-primary-300/80 focus-within:shadow-[0_10px_34px_rgba(37,99,235,0.12)] dark:border-white/[0.09] dark:bg-[#191f2e]/95 dark:shadow-[0_8px_30px_rgba(0,0,0,0.18)] dark:focus-within:border-primary-500/50 dark:focus-within:shadow-[0_10px_34px_rgba(37,99,235,0.08)]">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              requestAnimationFrame(adjustHeight);
            }}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            rows={1}
            placeholder="Ask Sova anything…"
            className="max-h-[200px] flex-1 resize-none bg-transparent px-2.5 py-2 text-[15px] leading-relaxed text-gray-900 placeholder-gray-400 outline-none dark:text-gray-100 dark:placeholder-gray-500"
            aria-label="Message input"
          />

          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
              canSend
                ? 'bg-gray-900 text-white shadow-sm hover:bg-primary-600 hover:shadow-md hover:shadow-primary-500/20 active:scale-90 dark:bg-white dark:text-gray-900 dark:hover:bg-primary-200'
                : 'bg-gray-100 text-gray-400 dark:bg-white/[0.07] dark:text-gray-500'
            }`}
            aria-label="Send message"
          >
            {isSending ? (
              <Square className="h-4 w-4 fill-current" />
            ) : (
              <ArrowUp className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Footer hint */}
        <div className="mt-2.5 flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
          <span>Sova AI can make mistakes.</span>
          <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700" />
          <span>Enter to send</span>
        </div>
      </div>
    </div>
  );
}