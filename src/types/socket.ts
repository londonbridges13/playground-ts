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
// Focus Request Types (Task 3: Make request to Focus AI)
// ============================================================================

export type FocusRequestType =
  | 'AI_GENERATION'
  | 'ENTITY_CREATE'
  | 'ENTITY_UPDATE'
  | 'ENTITY_DELETE'
  | 'ANALYSIS'
  | 'CUSTOM';

export type FocusRequestStage =
  | 'STARTED'
  | 'CLASSIFYING'
  | 'RESEARCHING'
  | 'ROUTING'
  | 'EXECUTING'
  | 'FINALIZING'
  | 'COMPLETE'
  | 'ERROR';

// Client → Server: Submit a focus request
export interface FocusRequestData {
  focusId: string;
  input: string;
  researchEnabled: boolean;
  referencedBasisIds?: string[];
  requestType?: FocusRequestType;
}

// Server acknowledgment for focus:request
export interface FocusRequestAck {
  success: boolean;
  requestId?: string;
  workflowId?: string;
  error?: string;
}

// Server → Client: Request processing has begun
export interface FocusRequestStartedData {
  requestId: string;
  focusId: string;
  workflowId: string;
  timestamp: string;
}

// Server → Client: Progress update during processing
export interface FocusRequestProgressData {
  requestId: string;
  focusId: string;
  stage: FocusRequestStage;
  message: string;
  progress?: number; // 0-100
  timestamp: string;
}

// Server → Client: Request completed successfully
export interface FocusRequestCompleteData {
  requestId: string;
  focusId: string;
  workflowId: string;
  response: string;
  batchId?: string; // If changes proposed (use for approval)
  researchContext?: Record<string, unknown>;
  duration: number; // Processing time in ms
  timestamp: string;
}

// Server → Client: Request failed
export interface FocusRequestErrorData {
  requestId: string;
  focusId: string;
  error: string;
  recoverable: boolean;
  timestamp: string;
}

// Proposed change from AI
export interface ProposedChange {
  id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  proposedData: {
    title: string;
    description?: string;
    entityType?: string;
    metadata?: Record<string, unknown>;
  };
}

// Server → Client: AI proposed changes that need approval
export interface ChangeBatchPendingData {
  batchId: string;
  messageId?: string;
  conversationId?: string;
  focusId: string;
  changes: ProposedChange[];
  timestamp: string;
}

// Client → Server: Approve batch
export interface ApproveBatchData {
  batchId: string;
}

// Server acknowledgment for approve-batch
export interface ApproveBatchAck {
  success: boolean;
  appliedChanges?: number;
  error?: string;
}

// Client → Server: Reject batch
export interface RejectBatchData {
  batchId: string;
  reason?: string;
}

// Server acknowledgment for reject-batch
export interface RejectBatchAck {
  success: boolean;
  error?: string;
}

// Server → Client: Batch was approved
export interface ChangeBatchApprovedData {
  batchId: string;
  focusId: string;
  appliedChanges: number;
  timestamp: string;
}

// Server → Client: New Basis was created
export interface BasisCreatedData {
  basis: {
    id: string;
    title: string;
    description?: string;
    entityType: string;
    metadata: Record<string, unknown>;
  };
  focusId?: string;
  timestamp: string;
}

// ============================================================================
// Focus Voice Types (Task 9: Voice request)
// ============================================================================

export type FocusVoiceRequestType =
  | 'AI_GENERATION'
  | 'ENTITY_CREATE'
  | 'ENTITY_UPDATE'
  | 'ANALYSIS';

// Voice session configuration
export interface FocusVoiceConfig {
  language?: string; // Default: 'en'
  enableChunking?: boolean; // Enable semantic chunking (default: false)
  autoSubmit?: boolean; // Auto-submit to CRW3 on end (default: true)
}

// Client → Server: Start voice session
export interface FocusVoiceStartData {
  focusId: string;
  researchEnabled: boolean;
  referencedBasisIds?: string[];
  requestType?: FocusVoiceRequestType;
  config?: FocusVoiceConfig;
}

// Client → Server: Stream audio chunk
export interface FocusVoiceAudioData {
  sessionId: string;
  audioChunk: ArrayBuffer | Buffer;
}

// Client → Server: End voice session
export interface FocusVoiceEndData {
  sessionId: string;
  submitToCRW3?: boolean; // Override autoSubmit (default: true)
}

// Server acknowledgment for focus:voice-start
export interface FocusVoiceAck {
  success: boolean;
  sessionId?: string;
  error?: string;
}

// Server → Client: Session started confirmation
export interface FocusVoiceStartedData {
  sessionId: string;
  focusId: string;
  timestamp: string;
}

// Server → Client: Real-time partial transcript (as user speaks)
export interface FocusVoicePartialData {
  sessionId: string;
  focusId: string;
  transcript: string; // Current partial text
  timestamp: string;
}

// Server → Client: Final transcript segment (confirmed words)
export interface FocusVoiceTranscriptData {
  sessionId: string;
  focusId: string;
  transcript: string;
  results: Array<{
    type: 'word' | 'punctuation';
    content: string;
    start_time: number;
    end_time: number;
    confidence?: number;
  }>;
  timestamp: string;
}

// Server → Client: Semantic chunk (when enableChunking: true)
export interface FocusVoiceChunkData {
  sessionId: string;
  focusId: string;
  chunk: {
    id: string;
    text: string;
    wordCount: number;
    confidence: number;
    reason: string; // Why chunk was created (e.g., 'topic_shift', 'pause')
  };
  timestamp: string;
}

// Server → Client: CRW3 processing started
export interface FocusVoiceProcessingData {
  sessionId: string;
  focusId: string;
  fullTranscript: string;
  workflowId: string;
  timestamp: string;
}

// Server → Client: Error occurred
export interface FocusVoiceErrorData {
  sessionId: string;
  focusId: string;
  error: string;
  code?: string;
  timestamp: string;
}

// Server → Client: Session ended with full transcript
export interface FocusVoiceEndedData {
  sessionId: string;
  focusId: string;
  fullTranscript: string;
  chunks: Array<{
    id: string;
    text: string;
    wordCount: number;
    confidence: number;
    reason: string;
  }>;
  timestamp: string;
}

// ============================================================================
// Semantic Search Types (Task 2.51: Semantic Search for Focuses and Bases)
// ============================================================================

export type SemanticSearchMode = 'content' | 'contextual' | 'structural' | 'hybrid';

// Client → Server: Semantic search request
export interface SemanticSearchData {
  query: string;                    // Natural language search query
  types?: Array<'focus' | 'basis'>; // Filter by type (default: both)
  mode?: SemanticSearchMode;        // Search mode (default: 'content')
  limit?: number;                   // Max results (default: 20)
  threshold?: number;               // Similarity threshold 0-1 (default: 0.5)
  entityTypes?: string[];           // Filter bases by entity type
  focusId?: string;                 // Search within a specific Focus
}

// Semantic search result for Focus
export interface SemanticSearchFocusResult {
  id: string;
  title: string;
  description: string | null;
  similarity: number;               // Semantic similarity score (0-1)
  matchedOn: 'content' | 'contextual' | 'structural';
  type: 'focus';
}

// Semantic search result for Basis
export interface SemanticSearchBasisResult {
  id: string;
  title: string;
  description: string | null;
  entityType: string;
  similarity: number;               // Semantic similarity score (0-1)
  matchedOn: 'content' | 'contextual' | 'structural';
  type: 'basis';
}

// Server acknowledgment for user:semantic-search
export interface SemanticSearchAck {
  success: boolean;
  results?: {
    focuses: SemanticSearchFocusResult[];
    bases: SemanticSearchBasisResult[];
  };
  totalResults?: number;
  error?: string;
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
  // Focus events (legacy - kept for backwards compatibility)
  'join-focus': (focusId: string) => void;
  'leave-focus': (focusId: string) => void;
  // Focus subscription events (new format)
  'focus:subscribe': (data: { focusId: string }) => void;
  'focus:unsubscribe': (data: { focusId: string }) => void;
  // Focus request events (Task 3)
  'focus:request': (
    data: FocusRequestData,
    callback: (ack: FocusRequestAck) => void
  ) => void;
  'approve-batch': (
    data: ApproveBatchData,
    callback: (ack: ApproveBatchAck) => void
  ) => void;
  'reject-batch': (
    data: RejectBatchData,
    callback: (ack: RejectBatchAck) => void
  ) => void;
  // Focus voice events (Task 9)
  'focus:voice-start': (
    data: FocusVoiceStartData,
    callback: (ack: FocusVoiceAck) => void
  ) => void;
  'focus:voice-audio': (data: FocusVoiceAudioData) => void;
  'focus:voice-end': (data: FocusVoiceEndData) => void;
  // Semantic search events (Task 2.51)
  'user:semantic-search': (
    data: SemanticSearchData,
    callback: (ack: SemanticSearchAck) => void
  ) => void;
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
  // Focus request events (Task 3)
  'focus:request-started': (data: FocusRequestStartedData) => void;
  'focus:request-progress': (data: FocusRequestProgressData) => void;
  'focus:request-complete': (data: FocusRequestCompleteData) => void;
  'focus:request-error': (data: FocusRequestErrorData) => void;
  'change-batch-pending': (data: ChangeBatchPendingData) => void;
  'change-batch-approved': (data: ChangeBatchApprovedData) => void;
  'basis-created': (data: BasisCreatedData) => void;
  // Focus voice events (Task 9)
  'focus:voice-started': (data: FocusVoiceStartedData) => void;
  'focus:voice-partial': (data: FocusVoicePartialData) => void;
  'focus:voice-transcript': (data: FocusVoiceTranscriptData) => void;
  'focus:voice-chunk': (data: FocusVoiceChunkData) => void;
  'focus:voice-processing': (data: FocusVoiceProcessingData) => void;
  'focus:voice-error': (data: FocusVoiceErrorData) => void;
  'focus:voice-ended': (data: FocusVoiceEndedData) => void;
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

