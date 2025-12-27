'use client';

import { useCallback, useState } from 'react';

import axios, { endpoints } from 'src/lib/axios';

// ============================================================================
// Types
// ============================================================================

export interface EdgeRelationship {
  type: 'dependency' | 'sequence' | 'reference' | 'grouping' | 'contrast' | 'derivation';
  direction: 'forward' | 'backward' | 'bidirectional';
  strength?: number; // 0-1 (default: 1)
  label?: string;
}

export interface EdgeStyling {
  strokeColor?: string;
  strokeWidth?: number;
  animated?: boolean;
}

export interface ConnectNodesRequest {
  sourceNodeId: string;
  targetNodeId: string;
  edgeType?: 'animated' | 'default' | 'smartPulseButton';
  sourceHandle?: string;
  targetHandle?: string;
  relationship?: EdgeRelationship;
  styling?: EdgeStyling;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  data?: Record<string, unknown>;
}

export interface ConnectNodesResponse {
  success: boolean;
  data?: {
    edge: FlowEdge;
    focusId: string;
  };
  error?: string;
}

// ============================================================================
// Hook
// ============================================================================

export function useConnectNodes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Connect two nodes by creating an edge between them
   * @param focusId - The ID of the focus containing the nodes
   * @param data - Connection data including source and target node IDs
   * @returns The created edge or null on error
   */
  const connectNodes = useCallback(async (
    focusId: string,
    data: ConnectNodesRequest
  ): Promise<FlowEdge | null> => {
    if (!focusId) {
      setError('Focus ID is required');
      return null;
    }

    if (!data.sourceNodeId || !data.targetNodeId) {
      setError('Source and target node IDs are required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[useConnectNodes] Connecting nodes:', focusId, data);

      const response = await axios.post<ConnectNodesResponse>(
        endpoints.focus.connectNodes(focusId),
        data
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to connect nodes');
      }

      console.log('[useConnectNodes] Nodes connected:', response.data.data.edge);

      return response.data.data.edge;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect nodes';
      console.error('[useConnectNodes] Error:', message);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    connectNodes,
    clearError,
    loading,
    error,
  };
}

