import {
  Children,
  isValidElement,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { Check, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

interface CodeBlockProps {
  code: string;
  language?: string;
  children: ReactNode;
}

interface CodeElementProps {
  className?: string;
  children?: ReactNode;
}

function getTextContent(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getTextContent).join('');
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getTextContent(node.props.children);
  }

  return '';
}

function CodeBlock({ code, language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-2">
        <span className="font-mono text-xs text-gray-400">
          {language || 'code'}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-white"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <pre className="m-0 overflow-x-auto p-4">
        <code className="hljs font-mono text-sm leading-relaxed text-gray-100">
          {children}
        </code>
      </pre>
    </div>
  );
}

export function MarkdownRenderer({
  content,
}: MarkdownRendererProps) {
  const [highlightPlugin, setHighlightPlugin] = useState<
    typeof import('rehype-highlight').default | null
  >(null);

  useEffect(() => {
    if (!content.includes('```') || highlightPlugin) return;

    let isCurrent = true;
    import('rehype-highlight').then(({ default: plugin }) => {
      if (isCurrent) {
        setHighlightPlugin(() => plugin);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [content, highlightPlugin]);

  return (
    <div className="markdown-body text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={highlightPlugin ? [highlightPlugin] : []}
        components={{
          code({ className, children, ...props }) {
            return (
              <code
                className={`${className || ''} rounded bg-gray-200 px-1.5 py-0.5 font-mono text-sm text-gray-900 dark:bg-gray-700 dark:text-gray-100`}
                {...props}
              >
                {children}
              </code>
            );
          },

          pre({ children }) {
            const codeNode = Children.toArray(children).find((node) =>
              isValidElement<CodeElementProps>(node),
            );
            if (!isValidElement<CodeElementProps>(codeNode)) {
              return <pre>{children}</pre>;
            }

            const language = /language-(\w+)/.exec(
              codeNode.props.className || '',
            )?.[1];
            const code = getTextContent(codeNode.props.children).replace(
              /\n$/,
              '',
            );

            return (
              <CodeBlock code={code} language={language}>
                {codeNode.props.children}
              </CodeBlock>
            );
          },

          p({ children }) {
            return (
              <p className="mb-3 last:mb-0">
                {children}
              </p>
            );
          },

          h1({ children }) {
            return (
              <h1 className="mb-3 mt-5 text-xl font-bold first:mt-0">
                {children}
              </h1>
            );
          },

          h2({ children }) {
            return (
              <h2 className="mb-3 mt-5 text-lg font-bold first:mt-0">
                {children}
              </h2>
            );
          },

          h3({ children }) {
            return (
              <h3 className="mb-2 mt-4 text-base font-bold first:mt-0">
                {children}
              </h3>
            );
          },

          ul({ children }) {
            return (
              <ul className="mb-3 ml-5 list-disc space-y-1">
                {children}
              </ul>
            );
          },

          ol({ children }) {
            return (
              <ol className="mb-3 ml-5 list-decimal space-y-1">
                {children}
              </ol>
            );
          },

          li({ children }) {
            return <li>{children}</li>;
          },

          blockquote({ children }) {
            return (
              <blockquote className="my-3 border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:border-gray-600 dark:text-gray-400">
                {children}
              </blockquote>
            );
          },

          a({ children, href }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 underline hover:text-primary-700 dark:text-primary-400"
              >
                {children}
              </a>
            );
          },

          hr() {
            return (
              <hr className="my-4 border-gray-200 dark:border-gray-700" />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}