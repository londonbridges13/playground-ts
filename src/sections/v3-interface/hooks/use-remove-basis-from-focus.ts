'use client';

import { useCallback, useState } from 'react';

import axios, { endpoints } from 'src/lib/axios';

// ============================================================================
// Types
// ============================================================================

// API response structure (what the server actually returns)
export interface RemoveBasisFromFocusResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Return type for the hook (constructed from known values)
export interface RemoveBasisResult {
  message: string;
  focusId: string;
  basisId: string;
  removedEdges: number;
}

// ============================================================================
// Hook
// ============================================================================

export function useRemoveBasisFromFocus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Remove a basis from a focus without deleting the basis
   * This removes the node from the interface and severs edge connections
   * @param focusId - The ID of the focus
   * @param basisId - The ID of the basis to remove
   * @returns The removal result or null on error
   */
  const removeBasisFromFocus = useCallback(async (
    focusId: string,
    basisId: string
  ): Promise<RemoveBasisResult | null> => {
    if (!focusId) {
      setError('Focus ID is required');
      return null;
    }

    if (!basisId) {
      setError('Basis ID is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[useRemoveBasisFromFocus] Removing basis from focus:', focusId, basisId);

      const response = await axios.delete<RemoveBasisFromFocusResponse>(
        endpoints.focus.removeNode(focusId, basisId)
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to remove basis from focus');
      }

      console.log('[useRemoveBasisFromFocus] Basis removed:', response.data.message);

      // Construct return from known values since API only returns success/message
      return {
        message: response.data.message || 'Node removed from focus',
        focusId,
        basisId,
        removedEdges: 0,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove basis from focus';
      console.error('[useRemoveBasisFromFocus] Error:', message);
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
    removeBasisFromFocus,
    clearError,
    loading,
    error,
  };
}

