'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';
import { CONFIG } from 'src/global-config';
import type {
  TypedSocket,
  SocketMessage,
  MessageEventData,
  TypingEventData,
  SocketErrorData,
  AIStreamStartData,
  AIStreamChunkData,
  AIStreamCompleteData,
} from 'src/types/socket';

// ============================================================================
// Hook
// ============================================================================

interface UseSocketOptions {
  token: string;
  onMessage?: (message: SocketMessage) => void;
  onTyping?: (data: TypingEventData) => void;
  onStoppedTyping?: (data: { userId: string; conversationId: string }) => void;
  onError?: (error: SocketErrorData) => void;
  onConnected?: (data: { userId: string; socketId: string }) => void;
  onStreamStart?: (data: AIStreamStartData) => void;
  onStreamChunk?: (data: AIStreamChunkData) => void;
  onStreamComplete?: (data: AIStreamCompleteData) => void;
  onConversationMessages?: (messages: SocketMessage[]) => void;
}

export function useSocket({
  token,
  onMessage,
  onTyping,
  onStoppedTyping,
  onError,
  onConnected,
  onStreamStart,
  onStreamChunk,
  onStreamComplete,
  onConversationMessages,
}: UseSocketOptions) {
  const socketRef = useRef<TypedSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<SocketMessage[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Store callbacks in refs to avoid infinite loop
  const onMessageRef = useRef(onMessage);
  const onTypingRef = useRef(onTyping);
  const onStoppedTypingRef = useRef(onStoppedTyping);
  const onErrorRef = useRef(onError);
  const onConnectedRef = useRef(onConnected);
  const onStreamStartRef = useRef(onStreamStart);
  const onStreamChunkRef = useRef(onStreamChunk);
  const onStreamCompleteRef = useRef(onStreamComplete);
  const onConversationMessagesRef = useRef(onConversationMessages);

  // Update refs when callbacks change
  useEffect(() => {
    onMessageRef.current = onMessage;
    onTypingRef.current = onTyping;
    onStoppedTypingRef.current = onStoppedTyping;
    onErrorRef.current = onError;
    onConnectedRef.current = onConnected;
    onStreamStartRef.current = onStreamStart;
    onStreamChunkRef.current = onStreamChunk;
    onStreamCompleteRef.current = onStreamComplete;
    onConversationMessagesRef.current = onConversationMessages;
  }, [onMessage, onTyping, onStoppedTyping, onError, onConnected, onStreamStart, onStreamChunk, onStreamComplete, onConversationMessages]);

  // Initialize socket connection - only depends on token
  useEffect(() => {
    console.log('[useSocket] Init effect - token:', !!token, 'socketRef.current:', !!socketRef.current);
    if (!token || socketRef.current) {
      console.log('[useSocket] Skipping socket init - token:', !!token, 'already connected:', !!socketRef.current);
      return;
    }

    // Use HTTP URL directly - Socket.IO handles WebSocket upgrade
    console.log('[useSocket] Creating socket connection to:', CONFIG.serverUrl);

    socketRef.current = io(CONFIG.serverUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    console.log('[useSocket] Socket instance created:', socketRef.current?.id);

    // Connection events
    socketRef.current.on('connect', () => {
      console.log('[useSocket] Connected! Socket ID:', socketRef.current?.id);
      setConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('[useSocket] Disconnected');
      setConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('[useSocket] Connection error:', error);
    });

    // Connected event
    socketRef.current.on('connected', (data) => {
      console.log('[useSocket] Received connected event:', data);
      onConnectedRef.current?.(data);
    });

    // Conversation messages (history) - replaces all messages
    socketRef.current.on('conversation-messages', (data: { messages: SocketMessage[] }) => {
      console.log('[useSocket] Conversation messages received:', data.messages.length, 'messages');
      setMessages(data.messages);
      onConversationMessagesRef.current?.(data.messages);
    });

    // Message events
    socketRef.current.on('new-message', (data: MessageEventData) => {
      console.log('[useSocket] New message received:', data);
      // Clear optimistic messages (temp- IDs) when real message arrives
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.id.startsWith('temp-'));
        return [...filtered, data.message];
      });
      onMessageRef.current?.(data.message);
    });

    socketRef.current.on('message-updated', (data: MessageEventData) => {
      console.log('[useSocket] Message updated:', data);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === data.message.id ? data.message : msg))
      );
      onMessageRef.current?.(data.message);
    });

    socketRef.current.on('message-deleted', (data) => {
      console.log('[useSocket] Message deleted:', data);
      setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
    });

    // Typing events
    socketRef.current.on('user-typing', (data: TypingEventData) => {
      console.log('[useSocket] User typing:', data);
      onTypingRef.current?.(data);
    });

    socketRef.current.on('user-stopped-typing', (data) => {
      console.log('[useSocket] User stopped typing:', data);
      onStoppedTypingRef.current?.(data);
    });

    // AI Streaming events
    socketRef.current.on('ai-stream-start', (data: AIStreamStartData) => {
      console.log('[useSocket] AI stream started:', data);
      onStreamStartRef.current?.(data);
    });

    socketRef.current.on('ai-stream-chunk', (data: AIStreamChunkData) => {
      console.log('[useSocket] AI stream chunk received:', data.chunk);
      onStreamChunkRef.current?.(data);
    });

    socketRef.current.on('ai-stream-complete', (data: AIStreamCompleteData) => {
      console.log('[useSocket] AI stream completed:', data);
      onStreamCompleteRef.current?.(data);
    });

    // Error event
    socketRef.current.on('error', (data: SocketErrorData) => {
      console.error('[useSocket] Socket error:', data);
      onErrorRef.current?.(data);
    });

    return () => {
      console.log('[useSocket] Cleaning up socket connection');
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  // Helper functions
  const joinConversation = useCallback((conversationId: string) => {
    console.log('[useSocket] Emitting join-conversation:', conversationId);
    socketRef.current?.emit('join-conversation', conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    console.log('[useSocket] Emitting leave-conversation:', conversationId);
    socketRef.current?.emit('leave-conversation', conversationId);
  }, []);

  const sendMessage = useCallback(
    (
      conversationId: string,
      content: string,
      options?: {
        generateAIResponse?: boolean;
        parentMessageId?: string;
        onSuccess?: () => void;
        onError?: (error: string) => void;
      }
    ) => {
      console.log('[useSocket] Emitting send-message:', { conversationId, content, ...options });
      socketRef.current?.emit(
        'send-message',
        {
          conversationId,
          content,
          generateAIResponse: options?.generateAIResponse ?? true,
          parentMessageId: options?.parentMessageId,
        },
        (ack: { success: boolean; error?: string }) => {
          if (ack.success) {
            console.log('[useSocket] Message sent successfully');
            options?.onSuccess?.();
          } else {
            console.error('[useSocket] Message send failed:', ack.error);
            options?.onError?.(ack.error || 'Unknown error');
          }
        }
      );
    },
    []
  );

  const sendTyping = useCallback((conversationId: string) => {
    console.log('[useSocket] Emitting typing-start:', conversationId);
    socketRef.current?.emit('typing-start', conversationId);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      console.log('[useSocket] Auto-stopping typing:', conversationId);
      socketRef.current?.emit('typing-stop', conversationId);
    }, 3000);
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    console.log('[useSocket] Emitting typing-stop:', conversationId);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketRef.current?.emit('typing-stop', conversationId);
  }, []);

  return {
    socket: socketRef.current,
    connected,
    messages,
    setMessages,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTyping,
    stopTyping,
  };
}

