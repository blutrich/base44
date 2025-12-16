'use client';

import { useState, useEffect } from 'react';

interface BrowserMemory {
  resourceId: string;
  threadId: string;
  newThread: () => void;
}

/**
 * Hook to manage browser-based memory (no auth required)
 * - resourceId: Persistent UUID stored in localStorage (identifies the browser/user)
 * - threadId: Current conversation thread ID
 */
export function useBrowserMemory(): BrowserMemory {
  const [resourceId, setResourceId] = useState<string>('');
  const [threadId, setThreadId] = useState<string>('');

  useEffect(() => {
    // Get or create persistent resource ID (identifies this browser)
    let storedResourceId = localStorage.getItem('base44_resource_id');
    if (!storedResourceId) {
      storedResourceId = `user_${crypto.randomUUID()}`;
      localStorage.setItem('base44_resource_id', storedResourceId);
    }
    setResourceId(storedResourceId);

    // Get or create thread ID for current session
    let storedThreadId = sessionStorage.getItem('base44_thread_id');
    if (!storedThreadId) {
      storedThreadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('base44_thread_id', storedThreadId);
    }
    setThreadId(storedThreadId);
  }, []);

  const newThread = () => {
    const newThreadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('base44_thread_id', newThreadId);
    setThreadId(newThreadId);
  };

  return { resourceId, threadId, newThread };
}

