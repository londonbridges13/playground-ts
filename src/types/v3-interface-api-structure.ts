/**
 * V3 Interface API Structure
 *
 * TypeScript interfaces for frontend JSON interpretation.
 * Mirrors Prisma models for type-safe API communication.
 */

// ============================================
// Enums
// ============================================

export type RequestType =
  | 'AI_GENERATION'
  | 'DATA_QUERY'
  | 'ENTITY_CREATE'
  | 'ENTITY_UPDATE'
  | 'ENTITY_DELETE'
  | 'ANALYSIS'
  | 'CUSTOM';

export type RequestStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

// ============================================
// Core Interfaces: Focus Context & Request
// ============================================

export interface Context {
  id: string;
  title?: string;
  description?: string;
  activeBases: string[];
  metadata: Record<string, unknown>;
  isActive: boolean;
  focusId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Request {
  id: string;
  input: string;
  type: RequestType;
  status: RequestStatus;
  parameters?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  focusId: string;
  contextId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestBasis {
  id: string;
  requestId: string;
  basisId: string;
  role?: string;
  createdAt: string;
}

export interface Result {
  id: string;
  output: string;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  processingTimeMs?: number;
  tokensUsed?: number;
  estimatedCost?: number;
  wasSuccessful: boolean;
  errorMessage?: string;
  userRating?: number;
  userFeedback?: string;
  requestId: string;
  createdEntityIds?: string[];
  createdEntityType?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Populated/Nested Interfaces
// ============================================

export interface BasisSummary {
  id: string;
  title: string;
  type: string;
}

export interface ContextWithRequests extends Context {
  requests: Request[];
}

export interface RequestWithContext extends Request {
  context: Context;
}

export interface RequestWithResult extends Request {
  result?: Result;
}

export interface RequestWithBases extends Request {
  referencedBases: (RequestBasis & { basis: BasisSummary })[];
}

export interface RequestFull extends Request {
  context: Context;
  result?: Result;
  referencedBases: (RequestBasis & { basis: BasisSummary })[];
}

// ============================================
// Input Types
// ============================================

export interface CreateContextInput {
  title?: string;
  description?: string;
  activeBases?: string[];
  metadata?: Record<string, unknown>;
  focusId: string;
  userId: string;
}

export interface CreateRequestInput {
  input: string;
  type: RequestType;
  parameters?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  focusId: string;
  contextId: string;
  userId: string;
  referencedBasisIds?: string[];
}

export interface CreateResultInput {
  output: string;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  processingTimeMs?: number;
  tokensUsed?: number;
  estimatedCost?: number;
  wasSuccessful?: boolean;
  errorMessage?: string;
  requestId: string;
  createdEntityIds?: string[];
  createdEntityType?: string;
}

export interface RequestResponse {
  success: boolean;
  request?: Request | RequestFull;
  error?: string;
}

export interface ResultResponse {
  success: boolean;
  result?: Result;
  error?: string;
}

// ============================================
// Focus Interface V2 Structure
// ============================================

export const CURRENT_INTERFACE_SCHEMA_VERSION = '2.0';

// Position & Viewport
export interface Position {
  x: number;
  y: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

// Node Types - All supported node shapes in v3-interface
export type NodeType =
  | 'circular'
  | 'hexagon'
  | 'rectangle'
  | 'diamond'
  | 'oval'
  | 'pill'
  | 'triangle'
  | 'pentagon'
  | 'octagon'
  | 'star'
  | 'cloud'
  | 'group';

export interface TipTapContent {
  type: 'doc';
  content: TipTapNode[];
}

export interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  attrs?: Record<string, unknown>;
}

export interface InterfaceNodeData {
  label: string;
  basisId: string | null;
  content: TipTapContent | null;
  index: number;
  backgroundImage: string;
  patternOverlay: string | null;
  grainAmount: number;
  grainBlendMode: 'overlay' | 'multiply' | 'screen';
  borderWidth: number;
  textColor: string;
  showFloatingHandles: boolean;
  handleSize: number;
  handleColor: string;
  handleOffset: number;
  hasCheckbox?: boolean;
  checked?: boolean;
}

export interface InterfaceNode {
  id: string;
  type: NodeType;
  position: Position;
  data: InterfaceNodeData;
  width?: number;
  height?: number;
  zIndex?: number;
  parentId?: string;
}

// Edge Types - All supported edge types in v3-interface
export type EdgeType =
  | 'pulseButton'
  | 'handDrawn'
  | 'smartPulseButton'
  | 'default'
  | 'animated';

export type RelationshipType =
  | 'dependency'
  | 'sequence'
  | 'reference'
  | 'grouping'
  | 'contrast'
  | 'derivation';

export type RelationshipDirection = 'forward' | 'backward' | 'bidirectional';

export interface EdgeRelationship {
  type: RelationshipType;
  direction: RelationshipDirection;
  strength: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface InterfaceEdgeData {
  strokeColor: string;
  strokeWidth: number;
  dashArray: string;
  animated?: boolean;
  buttonIcon?: string;
  buttonSize?: number;
  buttonColor?: string;
  buttonBgColor?: string;
  nodePadding?: number;
  gridRatio?: number;
  handleOffset?: number;
  relationship: EdgeRelationship | null;
}

export interface InterfaceEdge {
  id: string;
  type: EdgeType;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  data: InterfaceEdgeData;
}

export interface FocusInterfaceV2 {
  schemaVersion: string;
  viewport: Viewport;
  nodes: InterfaceNode[];
  edges: InterfaceEdge[];
}

// ============================================
// Focus Interface API Types
// ============================================

export interface SaveInterfaceRequest {
  interface: FocusInterfaceV2;
}

export interface SaveInterfaceResponse {
  success: boolean;
  focusId: string;
  currentHead?: string;
  error?: string;
}

export interface LoadInterfaceResponse {
  success: boolean;
  interface?: FocusInterfaceV2;
  currentHead?: string;
  error?: string;
}
