'use client';

import { useCallback, useState } from 'react';
import type { AIStreamStartData, AIStreamChunkData, AIStreamCompleteData } from 'src/types/socket';

// ============================================================================
// Types
// ============================================================================

export interface StreamingMessage {
  messageId: string;
  content: string;
  isStreaming: boolean;
}

// ============================================================================
// Hook
// ============================================================================

export function useAIStreaming() {
  const [streamingMessages, setStreamingMessages] = useState<Map<string, StreamingMessage>>(new Map());
  const [currentStreamingId, setCurrentStreamingId] = useState<string | null>(null);

  /**
   * Handle stream start event
   * Creates a placeholder message for the streaming content
   */
  const handleStreamStart = useCallback((data: AIStreamStartData) => {
    console.log('[useAIStreaming] Stream started for message:', data.messageId);
    setCurrentStreamingId(data.messageId);
    setStreamingMessages((prev) => {
      const updated = new Map(prev);
      updated.set(data.messageId, {
        messageId: data.messageId,
        content: '',
        isStreaming: true,
      });
      return updated;
    });
  }, []);

  /**
   * Handle stream chunk event
   * Appends chunk to the streaming message content
   */
  const handleStreamChunk = useCallback((data: AIStreamChunkData) => {
    console.log('[useAIStreaming] Stream chunk received:', data.chunk);
    setStreamingMessages((prev) => {
      const updated = new Map(prev);
      const existing = updated.get(data.messageId);
      if (existing) {
        updated.set(data.messageId, {
          ...existing,
          content: existing.content + data.chunk,
        });
      }
      return updated;
    });
  }, []);

  /**
   * Handle stream complete event
   * Finalizes the streaming message
   */
  const handleStreamComplete = useCallback((data: AIStreamCompleteData) => {
    console.log('[useAIStreaming] Stream completed for message:', data.messageId);
    setCurrentStreamingId(null);
    setStreamingMessages((prev) => {
      const updated = new Map(prev);
      const existing = updated.get(data.messageId);
      if (existing) {
        updated.set(data.messageId, {
          ...existing,
          content: data.fullContent,
          isStreaming: false,
        });
      }
      return updated;
    });
  }, []);

  /**
   * Get streaming message by ID
   */
  const getStreamingMessage = useCallback(
    (messageId: string): StreamingMessage | undefined => {
      return streamingMessages.get(messageId);
    },
    [streamingMessages]
  );

  /**
   * Check if a message is currently streaming
   */
  const isMessageStreaming = useCallback(
    (messageId: string): boolean => {
      const msg = streamingMessages.get(messageId);
      return msg?.isStreaming ?? false;
    },
    [streamingMessages]
  );

  /**
   * Clear streaming state for a message
   */
  const clearStreamingMessage = useCallback((messageId: string) => {
    setStreamingMessages((prev) => {
      const updated = new Map(prev);
      updated.delete(messageId);
      return updated;
    });
    if (currentStreamingId === messageId) {
      setCurrentStreamingId(null);
    }
  }, [currentStreamingId]);

  /**
   * Clear all streaming messages
   */
  const clearAllStreamingMessages = useCallback(() => {
    setStreamingMessages(new Map());
    setCurrentStreamingId(null);
  }, []);

  return {
    streamingMessages,
    currentStreamingId,
    handleStreamStart,
    handleStreamChunk,
    handleStreamComplete,
    getStreamingMessage,
    isMessageStreaming,
    clearStreamingMessage,
    clearAllStreamingMessages,
  };
}

