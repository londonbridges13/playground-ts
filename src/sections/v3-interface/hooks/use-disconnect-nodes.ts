'use client';

import { useCallback, useState } from 'react';

import axios, { endpoints } from 'src/lib/axios';

// ============================================================================
// Types
// ============================================================================

export interface DisconnectNodesRequest {
  edgeId?: string;           // Option 1: Delete by edge ID
  sourceNodeId?: string;     // Option 2: Delete by source + target
  targetNodeId?: string;     // (both required if using this option)
}

export interface DisconnectNodesResponse {
  success: boolean;
  data?: {
    deletedEdgeId: string;
    focusId: string;
    sourceNodeId?: string;
    targetNodeId?: string;
  };
  error?: string;
}

// ============================================================================
// Hook
// ============================================================================

export function useDisconnectNodes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Disconnect nodes by removing an edge
   * Can disconnect by edgeId OR by sourceNodeId + targetNodeId
   * @param focusId - The ID of the focus containing the nodes
   * @param data - Disconnect data (edgeId or source+target node IDs)
   * @returns The deleted edge ID or null on error
   */
  const disconnectNodes = useCallback(async (
    focusId: string,
    data: DisconnectNodesRequest
  ): Promise<string | null> => {
    if (!focusId) {
      setError('Focus ID is required');
      return null;
    }

    // Validate that either edgeId or both source+target are provided
    const hasEdgeId = !!data.edgeId;
    const hasSourceTarget = !!data.sourceNodeId && !!data.targetNodeId;

    if (!hasEdgeId && !hasSourceTarget) {
      setError('Either edgeId or both sourceNodeId and targetNodeId are required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[useDisconnectNodes] Disconnecting nodes:', focusId, data);

      const response = await axios.delete<DisconnectNodesResponse>(
        endpoints.focus.disconnectNodes(focusId),
        { data } // DELETE requests need data in config object
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to disconnect nodes');
      }

      console.log('[useDisconnectNodes] Nodes disconnected:', response.data.data.deletedEdgeId);

      return response.data.data.deletedEdgeId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disconnect nodes';
      console.error('[useDisconnectNodes] Error:', message);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Disconnect by edge ID (convenience method)
   */
  const disconnectByEdgeId = useCallback(async (
    focusId: string,
    edgeId: string
  ): Promise<string | null> => {
    return disconnectNodes(focusId, { edgeId });
  }, [disconnectNodes]);

  /**
   * Disconnect by source and target node IDs (convenience method)
   */
  const disconnectByNodes = useCallback(async (
    focusId: string,
    sourceNodeId: string,
    targetNodeId: string
  ): Promise<string | null> => {
    return disconnectNodes(focusId, { sourceNodeId, targetNodeId });
  }, [disconnectNodes]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    disconnectNodes,
    disconnectByEdgeId,
    disconnectByNodes,
    clearError,
    loading,
    error,
  };
}

