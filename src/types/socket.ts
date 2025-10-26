import type { Socket } from 'socket.io-client';

// ============================================================================
// Message Types
// ============================================================================

export interface SocketMessage {
  id: string;
  content: string;
  conversationId: string;
  senderId: string;
  senderType: 'USER' | 'AI_AGENT';
  senderName?: string;
  sequence: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  isDeleted: boolean;
  parentMessageId?: string | null;
  referencedBasisId?: string | null;
}

export interface MessageEventData {
  message: SocketMessage;
  conversationId: string;
}

export interface TypingEventData {
  userId: string;
  name: string;
  conversationId: string;
}

export interface MessageDeletedEventData {
  messageId: string;
  conversationId: string;
}

export interface SocketErrorData {
  message: string;
  code?: string;
  details?: any;
}

// ============================================================================
// AI Streaming Types
// ============================================================================

export interface AIStreamStartData {
  messageId: string;
  conversationId: string;
}

export interface AIStreamChunkData {
  messageId: string;
  conversationId: string;
  chunk: string;
}

export interface AIStreamCompleteData {
  messageId: string;
  conversationId: string;
  fullContent: string;
}

// ============================================================================
// Socket Event Interfaces
// ============================================================================

export interface ClientToServerEvents {
  'join-conversation': (conversationId: string) => void;
  'leave-conversation': (conversationId: string) => void;
  'typing-start': (conversationId: string) => void;
  'typing-stop': (conversationId: string) => void;
  'send-message': (data: { conversationId: string; content: string }) => void;
}

export interface ServerToClientEvents {
  'connected': (data: { userId: string; socketId: string }) => void;
  'new-message': (data: MessageEventData) => void;
  'message-updated': (data: MessageEventData) => void;
  'message-deleted': (data: MessageDeletedEventData) => void;
  'user-typing': (data: TypingEventData) => void;
  'user-stopped-typing': (data: { userId: string; conversationId: string }) => void;
  'ai-stream-start': (data: AIStreamStartData) => void;
  'ai-stream-chunk': (data: AIStreamChunkData) => void;
  'ai-stream-complete': (data: AIStreamCompleteData) => void;
  'error': (data: SocketErrorData) => void;
}

// ============================================================================
// Typed Socket
// ============================================================================

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// ============================================================================
// Conversation Types
// ============================================================================

export interface ConversationStartResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    id: string;
    title: string;
    type: string;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
    lastActivityAt: string;
    activeAgentId: string;
    focusId: string;
    focus: {
      id: string;
      title: string;
      description: string;
      interface: {
        layout: string;
        viewMode: string;
      };
      bases: any[];
    };
    members: any[];
    activeAgent: {
      id: string;
      name: string;
      displayName: string;
      description: string;
      model: string;
    };
  };
}

