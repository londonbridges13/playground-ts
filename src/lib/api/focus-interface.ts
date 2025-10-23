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
};

