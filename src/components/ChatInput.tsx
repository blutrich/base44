'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
    }
  }, [input]);

  // Handle iOS virtual keyboard
  useEffect(() => {
    const handleResize = () => {
      // Scroll input into view when keyboard opens
      if (document.activeElement === textareaRef.current) {
        setTimeout(() => {
          textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    };

    // Use visualViewport API for better keyboard detection
    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport?.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      // Reset height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        // Blur on mobile to close keyboard after sending
        if (window.innerWidth < 640) {
          textareaRef.current.blur();
        }
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFocus = () => {
    // Ensure input is visible when focused on mobile
    setTimeout(() => {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 300);
  };

  return (
    <div
      ref={containerRef}
      className="
        border-t border-black/[0.04]
        bg-white/90 backdrop-blur-sm
        p-2 sm:p-3
        pb-[calc(0.5rem+env(safe-area-inset-bottom))]
        sm:pb-3
        flex-shrink-0
      "
    >
      {/* Input Row */}
      <div className="flex gap-2 items-end">
        {/* Textarea Container */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder="שאל שאלה על Base44..."
            disabled={disabled}
            rows={1}
            enterKeyHint="send"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="
              w-full resize-none
              rounded-xl
              border-[1.5px] border-black/[0.08]
              bg-white
              px-3 py-2.5 sm:px-4 sm:py-3
              text-[16px] sm:text-[15px]
              text-[#1A1A2E]
              placeholder:text-[#9CA3AF]
              transition-all duration-200
              shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]
              focus:border-[#FF6B35]
              focus:outline-none
              focus:ring-[3px]
              focus:ring-[rgba(255,107,53,0.15)]
              disabled:bg-[#F9FAFB]
              disabled:text-[#9CA3AF]
              disabled:cursor-not-allowed
              touch-manipulation
            "
            style={{ minHeight: '44px', maxHeight: '100px' }}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="
            group
            relative
            rounded-xl
            bg-gradient-to-br from-[#FF6B35] to-[#E55A2B]
            p-2.5 sm:p-3
            text-white
            shadow-md
            shadow-[rgba(255,107,53,0.25)]
            transition-all duration-200
            active:scale-[0.95]
            active:shadow-sm
            disabled:from-[#E5E7EB]
            disabled:to-[#D1D5DB]
            disabled:text-[#9CA3AF]
            disabled:shadow-none
            disabled:cursor-not-allowed
            disabled:active:scale-100
            touch-manipulation
            min-w-[44px] min-h-[44px]
            flex items-center justify-center
            flex-shrink-0
          "
          aria-label="שלח הודעה"
        >
          {disabled ? (
            <svg
              className="w-5 h-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 transition-transform duration-150 group-active:scale-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Footer Text - Hidden on small screens */}
      <p className="hidden sm:block text-[10px] text-[#9CA3AF] mt-2 text-center">
        התשובות מבוססות על ידע מקהילת Base44
      </p>
    </div>
  );
}
