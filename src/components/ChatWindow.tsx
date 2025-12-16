'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useBrowserMemory } from '@/hooks/useBrowserMemory';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_ACTIONS = [
  { label: 'איך מחברים API?', icon: '🔌' },
  { label: 'סליקה עם Stripe', icon: '💳' },
  { label: 'בעיות אותנטיקציה', icon: '🔐' },
  { label: 'עיצוב RTL', icon: '◀' },
];

export default function ChatWindow() {
  const { resourceId, threadId, newThread } = useBrowserMemory();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'שלום! אני העוזר הקהילתי של Base44.\n\nאני יכול לעזור לך עם שאלות על הפלטפורמה, אינטגרציות, סליקה, עיצוב ועוד.\n\nמה תרצה לדעת?',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const handleSend = async (content: string) => {
    if (!resourceId || !threadId) return;

    const userMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setStreamingContent('');

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          threadId,
          resourceId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          setStreamingContent(fullContent);
        }
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: fullContent || 'לא קיבלתי תשובה. נסה שוב.' },
      ]);
      setStreamingContent('');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'מצטער, קרתה שגיאה. אנא נסה שוב.',
        },
      ]);
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  const handleNewChat = () => {
    newThread();
    setMessages([
      {
        role: 'assistant',
        content: 'שלום! אני העוזר הקהילתי של Base44.\n\nאני יכול לעזור לך עם שאלות על הפלטפורמה, אינטגרציות, סליקה, עיצוב ועוד.\n\nמה תרצה לדעת?',
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full glass-card-elevated rounded-2xl sm:rounded-3xl overflow-hidden">
      {/* Glass Header - Compact on mobile */}
      <div className="relative px-3 py-3 sm:px-5 sm:py-4 border-b border-white/20 flex-shrink-0 bg-white/60 backdrop-blur-md">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Community Knowledge Logo */}
            <div className="relative flex-shrink-0">
              <img
                src="/logo.png"
                alt="Community Knowledge"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
              />
              {/* Online Indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
            </div>

            {/* Title + Subtitle */}
            <div className="min-w-0">
              <h1 className="font-display font-semibold text-[#1A1A2E] text-sm sm:text-base leading-tight truncate">
                עוזר קהילתי
              </h1>
              <p className="text-[10px] sm:text-xs text-[#6B7280] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                מחובר
              </p>
            </div>
          </div>

          {/* Right: New Chat Button */}
          <button
            onClick={handleNewChat}
            className="group p-2 sm:p-2.5 text-[#6B7280] hover:text-[#FF6B35] active:text-[#FF6B35] hover:bg-[#FF6B35]/10 active:bg-[#FF6B35]/20 rounded-xl transition-all duration-200 touch-manipulation flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="שיחה חדשה"
            aria-label="שיחה חדשה"
          >
            <svg
              className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90 group-active:rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Actions - Horizontal scroll */}
      <div className="px-2 py-2 sm:px-4 sm:py-2.5 border-b border-black/[0.04] bg-[#FAFAFA]/80 flex-shrink-0">
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 scrollbar-hide -mx-0.5 px-0.5">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => handleSend(action.label)}
              disabled={isLoading}
              className="action-pill flex-shrink-0 min-h-[36px] sm:min-h-[40px]"
            >
              <span className="text-sm sm:text-base leading-none">{action.icon}</span>
              <span className="text-[11px] sm:text-[13px]">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4 overscroll-contain scroll-smooth"
      >
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            role={message.role}
            content={message.content}
            isNew={index === messages.length - 1}
          />
        ))}

        {/* Streaming Message */}
        {streamingContent && (
          <ChatMessage role="assistant" content={streamingContent} isNew />
        )}

        {/* Loading Indicator */}
        {isLoading && !streamingContent && (
          <div className="flex justify-end animate-fade-in-up">
            <div className="message-assistant px-3 py-2.5 sm:px-4 sm:py-3">
              <div className="flex gap-1.5">
                <div className="loading-dot" />
                <div className="loading-dot" />
                <div className="loading-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Area */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
