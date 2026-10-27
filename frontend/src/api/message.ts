import { apiRequest } from './client';
import { DEFAULT_MODEL } from './config';

export interface RawMessage {
  _id?: string;
  id?: string;
  role?: string;
  sender?: string;
  content?: string;
  text?: string;
  response?: string;
  createdAt?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface NormalizedMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
}

function normalizeRole(
  raw: RawMessage,
): 'user' | 'assistant' | 'system' {
  const role = (
    raw.role ||
    raw.sender ||
    ''
  ).toLowerCase();

  if (role === 'user' || role === 'human') {
    return 'user';
  }

  if (
    role === 'assistant' ||
    role === 'ai' ||
    role === 'bot' ||
    role === 'model'
  ) {
    return 'assistant';
  }

  if (role === 'system') {
    return 'system';
  }

  if (raw.response && !raw.content) {
    return 'assistant';
  }

  return 'user';
}

function normalizeContent(raw: RawMessage): string {
  if (raw.content) {
    return String(raw.content);
  }

  if (raw.text) {
    return String(raw.text);
  }

  if (raw.response) {
    return String(raw.response);
  }

  return '';
}

function cleanAssistantContent(content: string): string {
  return content
    .split(/\r?\n/)
    .filter(
      (line) =>
        !/^\s*User Safety:\s*(?:safe|unsafe|unknown)\s*$/i.test(line),
    )
    .join('\n')
    .trim();
}

function normalizeMessage(
  raw: RawMessage,
): NormalizedMessage {
  const role = normalizeRole(raw);
  const content = normalizeContent(raw);

  return {
    id: String(
      raw._id ||
      raw.id ||
      crypto.randomUUID(),
    ),
    role,
    content: role === 'assistant' ? cleanAssistantContent(content) : content,
    createdAt:
      raw.createdAt ||
      raw.timestamp,
  };
}

function normalizeAssistantMessage(raw: RawMessage): NormalizedMessage {
  const message = normalizeMessage(raw);
  if (!message.content.trim()) {
    throw new Error('The assistant returned no usable reply. Please try again.');
  }
  return message;
}

function extractMessageArray(
  data: unknown,
): RawMessage[] {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data as RawMessage[];
  }

  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;

    // Backend getMessage returns:
    // {
    //   message: "...",
    //   msg: [...]
    // }

    if (Array.isArray(obj.msg)) {
      return obj.msg as RawMessage[];
    }

    if (Array.isArray(obj.messages)) {
      return obj.messages as RawMessage[];
    }

    if (Array.isArray(obj.data)) {
      return obj.data as RawMessage[];
    }

    if (Array.isArray(obj.result)) {
      return obj.result as RawMessage[];
    }
  }

  return [];
}

export function getMessages(chatId: string) {
  return apiRequest<unknown>(
    `/api/message/${chatId}`,
  ).then((data) =>
    extractMessageArray(data).map(
      normalizeMessage,
    ).filter(
      (message) =>
        message.role !== 'assistant' || message.content.trim().length > 0,
    ),
  );
}

export function sendMessageToChat(
  chatId: string,
  content: string,
) {
  return apiRequest<unknown>(
    `/api/message/${chatId}`,
    {
      method: 'POST',
      body: {
        content,
      },
    },
  ).then((data) => {
    if (
      data &&
      typeof data === 'object' &&
      !Array.isArray(data)
    ) {
      const obj =
        data as Record<string, unknown>;

      /*
       * Backend returns:
       *
       * {
       *   message: "Message sent successfully",
       *   chatId: "...",
       *   reply: "AI response",
       *   usage: {...},
       *   tokenUsed: ...,
       *   tokenLimit: ...,
       *   userMessage: {...},
       *   assistantMessage: {...}
       * }
       */

      if (
        obj.assistantMessage &&
        typeof obj.assistantMessage === 'object'
      ) {
        return [normalizeAssistantMessage(obj.assistantMessage as RawMessage)];
      }

      // Fallback if backend returns a direct reply
      if (obj.reply) {
        return [
          normalizeAssistantMessage({
            id: crypto.randomUUID(),
            role: 'assistant',
            content: String(obj.reply),
          }),
        ];
      }

      // Fallback for array-based responses
      const arr =
        extractMessageArray(data);

      if (arr.length > 0) {
        const assistantMessages = arr
          .map(normalizeMessage)
          .filter(
            (message) =>
              message.role === 'assistant' && message.content.trim().length > 0,
          );
        if (assistantMessages.length > 0) {
          return assistantMessages;
        }
      }
    }

    throw new Error('The server returned no assistant reply.');
  });
}

export function sendMessageNew(
  content: string,
  model = DEFAULT_MODEL,
) {
  return apiRequest<unknown>(
    '/api/message/',
    {
      method: 'POST',
      body: {
        model,
        content,
      },
    },
  ).then((data) => {
    if (
      data &&
      typeof data === 'object' &&
      !Array.isArray(data)
    ) {
      const obj =
        data as Record<string, unknown>;

      let chatId = '';

      if (obj.chatId) {
        chatId = String(obj.chatId);
      } else if (obj.chat) {
        const chat =
          obj.chat as Record<
            string,
            unknown
          >;

        chatId = String(
          chat.chatId ||
          chat._id ||
          chat.id ||
          '',
        );
      }

      const messages: NormalizedMessage[] = [];

      if (
        obj.userMessage &&
        typeof obj.userMessage === 'object'
      ) {
        messages.push(
          normalizeMessage(
            obj.userMessage as RawMessage,
          ),
        );
      }

      if (
        obj.assistantMessage &&
        typeof obj.assistantMessage === 'object'
      ) {
        messages.push(normalizeAssistantMessage(obj.assistantMessage as RawMessage));
      }

      if (
        messages.length === 0 &&
        obj.reply
      ) {
        messages.push(
          normalizeAssistantMessage({
            id: crypto.randomUUID(),
            role: 'assistant',
            content: String(obj.reply),
          }),
        );
      }

      return {
        chatId,
        messages,
      };
    }

    return {
      chatId: '',
      messages: [],
    };
  });
}