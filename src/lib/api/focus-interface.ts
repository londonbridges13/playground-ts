// src/lib/api/focus-interface.ts

import type {
  FocusInterface,
  NodeInput,
  EdgeInput,
  LayoutConfig,
  FocusInterfaceResponse,
} from 'src/types/focus-interface';

import axios, { endpoints } from 'src/lib/axios';

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

      return res.data.interface!;
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

      return res.data.interface!;
    } catch (error) {
      console.error('Error generating interface:', error);
      throw error;
    }
  },
};

