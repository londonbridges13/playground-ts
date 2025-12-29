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
// Focus Edge Types (Task 4: Connect and Disconnect nodes)
// ============================================================================

export interface FocusEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  data?: Record<string, unknown>;
}

export interface FocusNodesConnectedData {
  focusId: string;
  edge: FocusEdge;
}

export interface FocusNodesDisconnectedData {
  focusId: string;
  edgeId: string;
  sourceNodeId?: string;
  targetNodeId?: string;
}

export interface FocusEdgeUpdatedData {
  focusId: string;
  edge: FocusEdge;
}

export interface FocusEdgesBatchUpdatedData {
  focusId: string;
  created: FocusEdge[];
  deleted: string[];
  updated: FocusEdge[];
}

// Focus node position types (Task 4.1)
export interface FocusNodePosition {
  nodeId: string;
  position: {
    x: number;
    y: number;
  };
}

export interface FocusNodesPositionsUpdatedData {
  focusId: string;
  positions: FocusNodePosition[];
}

// Deletion event types (Task 4.2)
export interface BasisDeletedData {
  basisId: string;
  severedConnections: {
    commits: number;
    focusBases: number;
    requestBases: number;
    messagesUpdated: number;
  };
}

export interface FocusDeletedData {
  focusId: string;
  deletedBases?: {
    count: number;
    basisIds: string[];
  };
}

export interface FocusBasisRemovedData {
  focusId: string;
  basisId: string;
  removedEdges: number;
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
  // Focus events
  'join-focus': (focusId: string) => void;
  'leave-focus': (focusId: string) => void;
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
  // Focus edge events (Task 4)
  'focus:nodes-connected': (data: FocusNodesConnectedData) => void;
  'focus:nodes-disconnected': (data: FocusNodesDisconnectedData) => void;
  'focus:edge-updated': (data: FocusEdgeUpdatedData) => void;
  'focus:edges-batch-updated': (data: FocusEdgesBatchUpdatedData) => void;
  // Focus node position events (Task 4.1)
  'focus:nodes-positions-updated': (data: FocusNodesPositionsUpdatedData) => void;
  // Deletion events (Task 4.2)
  'basis:deleted': (data: BasisDeletedData) => void;
  'focus:deleted': (data: FocusDeletedData) => void;
  'focus:basis-removed': (data: FocusBasisRemovedData) => void;
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

