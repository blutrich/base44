'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useBrowserMemory } from '@/hooks/useBrowserMemory';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

const QUICK_ACTIONS = [
  { label: 'אינטגרציות ו-API', icon: '🔌' },
  { label: 'סליקה ותשלומים', icon: '💳' },
  { label: 'Backend Functions', icon: '⚙️' },
  { label: 'עיצוב למובייל', icon: '📱' },
];

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Parse follow-up suggestions from response
// Format: [המשך: שאלה1? | שאלה2? | שאלה3?]
const parseFollowUps = (content: string): { cleanContent: string; followUps: string[] } => {
  const followUpPattern = /\[המשך:\s*([^\]]+)\]/;
  const match = content.match(followUpPattern);

  if (match) {
    const followUps = match[1]
      .split('|')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    const cleanContent = content.replace(followUpPattern, '').trim();
    return { cleanContent, followUps };
  }

  return { cleanContent: content, followUps: [] };
};

export default function ChatWindow() {
  const { resourceId, threadId, newThread } = useBrowserMemory();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomeStep, setWelcomeStep] = useState(0);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Animated welcome message
  useEffect(() => {
    if (showWelcome && messages.length === 0) {
      const welcomeMessages = [
        'שלום! 👋',
        'אני העוזר הקהילתי של Base44.',
        'יש לי ידע מ-349 שאלות ותשובות מהקהילה - אינטגרציות, סליקה, Backend, עיצוב ועוד.',
        'מה תרצה לדעת?'
      ];

      if (welcomeStep < welcomeMessages.length) {
        const timer = setTimeout(() => {
          setWelcomeStep(prev => prev + 1);
        }, welcomeStep === 0 ? 500 : 800);
        return () => clearTimeout(timer);
      } else {
        setMessages([{
          role: 'assistant',
          content: welcomeMessages.join('\n\n'),
          id: generateId()
        }]);
        setShowWelcome(false);
      }
    }
  }, [showWelcome, welcomeStep, messages.length]);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, isTyping, followUpSuggestions, scrollToBottom]);

  const handleSend = async (content: string) => {
    if (!resourceId || !threadId) return;

    // Clear follow-ups when user sends a message
    setFollowUpSuggestions([]);

    // Hide welcome if still showing
    if (showWelcome) {
      setShowWelcome(false);
      setMessages([{
        role: 'assistant',
        content: 'שלום! 👋\n\nאני העוזר הקהילתי של Base44.\n\nיש לי ידע מ-349 שאלות ותשובות מהקהילה - אינטגרציות, סליקה, Backend, עיצוב ועוד.\n\nמה תרצה לדעת?',
        id: generateId()
      }]);
    }

    const userMessage: Message = { role: 'user', content, id: generateId() };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);
    setStreamingContent('');

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Brief "thinking" delay for natural feel
    await new Promise(resolve => setTimeout(resolve, 400));

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

      setIsTyping(false);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          // Show streaming without follow-ups for cleaner experience
          const { cleanContent } = parseFollowUps(fullContent);
          setStreamingContent(cleanContent);
        }
      }

      // Parse final response for follow-ups
      const { cleanContent, followUps } = parseFollowUps(fullContent);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: cleanContent || 'לא קיבלתי תשובה. נסה שוב.', id: generateId() },
      ]);
      setStreamingContent('');

      // Set follow-ups if found
      if (followUps.length > 0) {
        setFollowUpSuggestions(followUps);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Error:', error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'מצטער, קרתה שגיאה. אנא נסה שוב.',
          id: generateId()
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      setStreamingContent('');
    }
  };

  const handleNewChat = () => {
    newThread();
    setMessages([]);
    setShowWelcome(true);
    setWelcomeStep(0);
    setStreamingContent('');
    setIsTyping(false);
    setFollowUpSuggestions([]);
  };

  const welcomeMessages = [
    'שלום! 👋',
    'אני העוזר הקהילתי של Base44.',
    'יש לי ידע מ-349 שאלות ותשובות מהקהילה - אינטגרציות, סליקה, Backend, עיצוב ועוד.',
    'מה תרצה לדעת?'
  ];

  // Show follow-ups only when we have them and not loading
  const showFollowUps = followUpSuggestions.length > 0 && !isLoading && !streamingContent;

  return (
    <div className="flex flex-col h-full glass-card-elevated rounded-2xl sm:rounded-3xl overflow-hidden">
      {/* Glass Header */}
      <div className="relative px-3 py-3 sm:px-5 sm:py-4 border-b border-white/20 flex-shrink-0 bg-white/60 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src="/logo.png"
                alt="Community Knowledge"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-semibold text-[#1A1A2E] text-sm sm:text-base leading-tight truncate">
                עוזר קהילתי
              </h1>
              <p className="text-[10px] sm:text-xs text-[#6B7280] flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isTyping ? 'bg-yellow-500' : 'bg-green-500'} ${isTyping ? 'animate-pulse' : ''}`} />
                {isTyping ? 'מקליד...' : 'מחובר'}
              </p>
            </div>
          </div>
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

      {/* Quick Actions - Show until user sends first message */}
      {(messages.length <= 1) && (
        <div className="px-2 py-2 sm:px-4 sm:py-2.5 border-b border-black/[0.04] bg-[#FAFAFA]/80 flex-shrink-0 animate-fade-in">
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 scrollbar-hide -mx-0.5 px-0.5">
            {QUICK_ACTIONS.map((action, index) => (
              <button
                key={action.label}
                onClick={() => handleSend(action.label)}
                disabled={isLoading}
                className="action-pill flex-shrink-0 min-h-[36px] sm:min-h-[40px] animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-sm sm:text-base leading-none">{action.icon}</span>
                <span className="text-[11px] sm:text-[13px]">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4 overscroll-contain scroll-smooth"
      >
        {/* Animated Welcome */}
        {showWelcome && messages.length === 0 && (
          <div className="flex justify-end">
            <div className="flex items-start gap-2">
              <div className="message-assistant px-4 py-3 space-y-2">
                {welcomeMessages.slice(0, welcomeStep).map((msg, idx) => (
                  <p
                    key={idx}
                    className="animate-fade-in-up text-sm sm:text-[15px] text-[#374151]"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {msg}
                  </p>
                ))}
                {welcomeStep < welcomeMessages.length && (
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 mt-1">
                <img src="/logo.png" alt="" className="w-7 h-7 object-contain" />
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            isNew={index === messages.length - 1}
          />
        ))}

        {/* Typing Indicator */}
        {isTyping && !streamingContent && (
          <div className="flex justify-end animate-fade-in">
            <div className="flex items-start gap-2">
              <div className="message-assistant px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#FF6B35] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[#FF6B35] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[#FF6B35] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-[#6B7280]">חושב...</span>
                </div>
              </div>
              <div className="flex-shrink-0 mt-1">
                <img src="/logo.png" alt="" className="w-7 h-7 object-contain opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Streaming Message */}
        {streamingContent && (
          <ChatMessage role="assistant" content={streamingContent} isNew />
        )}

        {/* Dynamic Follow-up Suggestions */}
        {showFollowUps && (
          <div className="flex justify-end animate-fade-in-up pt-2">
            <div className="flex flex-wrap gap-1.5 justify-end max-w-[90%]">
              {followUpSuggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion}-${index}`}
                  onClick={() => handleSend(suggestion)}
                  className="text-[11px] sm:text-xs px-3 py-1.5 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] hover:bg-[#FF6B35]/20 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  {suggestion}
                </button>
              ))}
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
