// src/lib/api/focus-interface.ts

import type {
  FocusInterface,
  NodeInput,
  EdgeInput,
  LayoutConfig,
  FocusInterfaceResponse,
  FlowNode,
} from 'src/types/focus-interface';

import axios, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

/**
 * Add Node Request/Response Types
 */
export interface AddNodeRequest {
  title: string;
  description?: string;
  entityType?: 'custom' | 'milestone' | 'horizon' | 'pathway' | 'atlas' | 'story' | 'insight' | 'step' | 'polarity' | 'path' | 'discovery' | 'archetype';
  metadata?: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface Basis {
  id: string;
  title: string;
  description: string | null;
  entityType: string;
  metadata: Record<string, unknown>;
  sourceEntityId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FocusBasis {
  id: string;
  focusId: string;
  basisId: string;
  position: { x: number; y: number };
}

export interface AddNodeResponse {
  success: boolean;
  data: {
    basis: Basis;
    focusBasis: FocusBasis;
    focus: any; // Updated Focus with regenerated interface
  };
  error?: string;
}

// ----------------------------------------------------------------------

/**
 * Transform API node to React Flow compatible format
 * Moves 'handles' from top level to 'data.handleInfo' to avoid React Flow processing
 * Ensures opacity defaults to 1 for proper node rendering
 */
function transformNodeForReactFlow(apiNode: any): FlowNode {
  const { handles, ...rest } = apiNode;

  return {
    ...rest,
    data: {
      ...rest.data,
      opacity: rest.data.opacity ?? 1, // Ensure opacity defaults to 1
      handleInfo: handles, // Move handles into data as handleInfo
    },
  };
}

/**
 * Transform API response to React Flow compatible format
 */
function transformInterfaceForReactFlow(apiInterface: any): FocusInterface {
  return {
    ...apiInterface,
    nodes: apiInterface.nodes.map(transformNodeForReactFlow),
  };
}

// ----------------------------------------------------------------------

/**
 * Focus Interface API Client
 * Uses axios instance with centralized error handling
 */
export const focusInterfaceAPI = {
  /**
   * Get existing interface for a Focus
   */
  async getInterface(focusId: string): Promise<FocusInterface> {
    try {
      const res = await axios.get<FocusInterfaceResponse>(endpoints.focus.interface(focusId));

      if (!res.data.success) {
        throw new Error(res.data.error || 'Failed to fetch interface');
      }

      // Transform the interface to move handles to data.handleInfo
      return transformInterfaceForReactFlow(res.data.interface!);
    } catch (error) {
      console.error('Error fetching interface:', error);
      throw error;
    }
  },

  /**
   * Generate a new interface for a Focus
   */
  async generateInterface(
    focusId: string,
    nodes: NodeInput[],
    edges: EdgeInput[],
    options?: {
      layoutConfig?: LayoutConfig;
      goalIcon?: string;
    }
  ): Promise<FocusInterface> {
    try {
      const res = await axios.post<FocusInterfaceResponse>(
        endpoints.focus.generateInterface(focusId),
        {
          nodes,
          edges,
          layoutConfig: options?.layoutConfig,
          goalIcon: options?.goalIcon,
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.error || 'Failed to generate interface');
      }

      // Transform the interface to move handles to data.handleInfo
      return transformInterfaceForReactFlow(res.data.interface!);
    } catch (error) {
      console.error('Error generating interface:', error);
      throw error;
    }
  },

  /**
   * Create a new Focus with a blank interface
   */
  async createFocus(data: {
    title: string;
    description?: string;
    userId: string;
    atlasId?: string;
    pathId?: string;
    goalIcon?: string;
  }): Promise<{ focus: any; interface: FocusInterface }> {
    try {
      const res = await axios.post(endpoints.focus.createWithInterface, data);

      if (!res.data.success) {
        throw new Error(res.data.error || 'Failed to create focus');
      }

      return {
        focus: res.data.data,
        interface: res.data.interface
          ? transformInterfaceForReactFlow(res.data.interface)
          : { goal: res.data.data, nodes: [], edges: [] },
      };
    } catch (error) {
      console.error('Error creating focus:', error);
      throw error;
    }
  },

  /**
   * Add a new node to a Focus interface
   * Creates a Basis entity and links it to the Focus with position
   */
  async addNode(focusId: string, data: AddNodeRequest): Promise<AddNodeResponse> {
    try {
      console.log('[focusInterfaceAPI] Adding node to focus:', focusId, data);

      const res = await axios.post<AddNodeResponse>(
        endpoints.focus.addNode(focusId),
        data
      );

      if (!res.data.success) {
        throw new Error(res.data.error || 'Failed to add node');
      }

      console.log('[focusInterfaceAPI] Node added successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error adding node:', error);
      throw error;
    }
  },
};

