// src/types/focus-interface.ts

/**
 * Focus Interface Types
 * TypeScript definitions for Focus Interface API
 */

// ----------------------------------------------------------------------

export interface FocusInterface {
  goal: {
    id: string;
    name: string;
    description: string;
    icon?: string;
  };
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface FlowNode {
  id: string;
  type: 'hexagon' | 'glass' | 'appstore';
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    opacity?: number;
    backgroundColor?: string;
    actionType?: 'dialog' | 'drawer' | 'link' | 'appstore';
    handleInfo?: NodeHandles; // Renamed from 'handles' to avoid React Flow processing
    // Node-specific data
    importance?: number; // 1-10 for hexagon nodes
    stage?: string; // For glass nodes
    category?: string; // For appstore nodes
    amount?: string; // For appstore nodes
    imageUrl?: string; // For appstore nodes
    [key: string]: any; // Allow additional custom properties
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  style?: {
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  };
  data?: {
    label?: string;
    [key: string]: any;
  };
}

export interface NodeHandles {
  sources?: HandleInfo[];
  targets?: HandleInfo[];
}

export interface HandleInfo {
  id: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  coordinates: {
    x: number;
    y: number;
  };
}

// ----------------------------------------------------------------------
// Input types for generating interfaces

export interface NodeInput {
  id: string;
  type: 'hexagon' | 'glass' | 'appstore';
  data: {
    label: string;
    description?: string;
    opacity?: number;
    backgroundColor?: string;
    actionType?: 'dialog' | 'drawer' | 'link' | 'appstore';
    importance?: number;
    stage?: string;
    category?: string;
    amount?: string;
    imageUrl?: string;
    [key: string]: any;
  };
}

export interface EdgeInput {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: {
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  };
  data?: {
    label?: string;
    [key: string]: any;
  };
}

export interface LayoutConfig {
  rankdir?: 'TB' | 'BT' | 'LR' | 'RL';
  align?: 'UL' | 'UR' | 'DL' | 'DR';
  nodesep?: number;
  edgesep?: number;
  ranksep?: number;
  marginx?: number;
  marginy?: number;
}

export interface GenerateInterfaceOptions {
  layoutConfig?: LayoutConfig;
  goalIcon?: string;
}

// ----------------------------------------------------------------------
// API Response types

export interface FocusInterfaceResponse {
  success: boolean;
  interface?: FocusInterface;
  error?: string;
}

export interface GenerateInterfaceRequest {
  nodes: NodeInput[];
  edges: EdgeInput[];
  layoutConfig?: LayoutConfig;
  goalIcon?: string;
}

