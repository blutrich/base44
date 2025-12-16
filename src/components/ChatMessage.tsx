'use client';

import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isNew?: boolean;
}

export default function ChatMessage({ role, content, isNew = false }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-start' : 'justify-end'} ${
        isNew ? 'animate-fade-in-up' : ''
      }`}
    >
      {/* Assistant Avatar - Only for assistant messages */}
      {!isUser && (
        <div className="flex-shrink-0 mr-2.5 mt-1">
          <img
            src="/logo.png"
            alt="Community Knowledge"
            className="w-7 h-7 object-contain"
          />
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`max-w-[85%] sm:max-w-[80%] px-4 py-3 ${
          isUser
            ? 'message-user'
            : 'message-assistant'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm sm:text-[15px] leading-relaxed break-words">
            {content}
          </p>
        ) : (
          <div className="prose-base44 text-sm sm:text-[15px] leading-relaxed">
            <ReactMarkdown
              components={{
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FF6B35] hover:text-[#E55A2B] underline underline-offset-2 transition-colors duration-150"
                  >
                    {children}
                  </a>
                ),
                p: ({ children }) => (
                  <p className="my-1.5 first:mt-0 last:mb-0 leading-relaxed text-[#374151]">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside my-2 space-y-1 text-[#374151]">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside my-2 space-y-1 text-[#374151]">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-[#1A1A2E]">{children}</strong>
                ),
                code: ({ children }) => (
                  <code className="bg-black/[0.06] text-[#1A1A2E] px-1.5 py-0.5 rounded text-[13px] font-mono">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-[#1A1A2E] text-gray-100 p-4 rounded-xl overflow-x-auto text-[13px] my-3 shadow-inner">
                    {children}
                  </pre>
                ),
                h1: ({ children }) => (
                  <h1 className="text-lg font-bold text-[#1A1A2E] mt-4 mb-2 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-bold text-[#1A1A2E] mt-3 mb-1.5 first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-bold text-[#1A1A2E] mt-2 mb-1 first:mt-0">
                    {children}
                  </h3>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-r-4 border-[#FF6B35] pr-4 my-3 text-[#6B7280] italic">
                    {children}
                  </blockquote>
                ),
                hr: () => (
                  <hr className="my-4 border-t border-black/10" />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
