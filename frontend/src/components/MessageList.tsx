import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import type { NormalizedMessage } from '@/api/message';

interface MessageListProps {
  messages: NormalizedMessage[];
  isLoadingResponse: boolean;
  errorMessage: string | null;
}

export function MessageList({ messages, isLoadingResponse, errorMessage }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const previousMessageIds = useRef(new Set(messages.map((message) => message.id)));
  const [enteringMessageId, setEnteringMessageId] = useState<string | null>(null);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);

  const keepAtBottomWhileTyping = useCallback(() => {
    window.requestAnimationFrame(() => {
      const list = listRef.current;
      if (!list || list.scrollHeight - list.scrollTop - list.clientHeight > 140) return;
      list.scrollTop = list.scrollHeight;
    });
  }, []);

  useLayoutEffect(() => {
    const addedMessages = messages.filter(
      (message) => !previousMessageIds.current.has(message.id),
    );

    const newMessage = addedMessages.length === 1 ? addedMessages[0] : null;
    setEnteringMessageId(newMessage?.id ?? null);
    setTypingMessageId(
      newMessage?.role === 'assistant' ? newMessage.id : null,
    );
    previousMessageIds.current = new Set(messages.map((message) => message.id));
  }, [messages]);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, isLoadingResponse]);

  return (
    <div ref={listRef} className="min-h-0 w-full min-w-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-4xl pb-6 pt-3">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            className={msg.id === enteringMessageId ? 'message-enter' : undefined}
            isTyping={msg.id === typingMessageId}
            onTypingProgress={keepAtBottomWhileTyping}
          />
        ))}
        {isLoadingResponse && (
          <MessageBubble message={{ role: 'assistant', content: '', loading: true }} />
        )}
        {errorMessage && (
          <div className="mx-4 mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400 sm:mx-6" role="alert">
            {errorMessage}
          </div>
        )}
        <div ref={endRef} className="h-1" />
      </div>
    </div>
  );
}
