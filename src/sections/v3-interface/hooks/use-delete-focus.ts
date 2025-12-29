'use client';

import { useCallback, useState } from 'react';

import axios, { endpoints } from 'src/lib/axios';

// ============================================================================
// Types
// ============================================================================

export interface DeleteFocusResponse {
  success: boolean;
  data?: {
    message: string;
    deletedFocus: {
      id: string;
      title: string;
    };
    severedConnections: {
      commits: number;
      focusBases: number;
      requests: number;
      requestBases: number;
      contexts: number;
    };
    deletedBases?: {
      count: number;
      basisCommits: number;
      basisRequestBases: number;
      messagesUpdated: number;
    };
  };
  error?: string;
}

export interface DeleteFocusOptions {
  deleteBases?: boolean;
}

// ============================================================================
// Hook
// ============================================================================

export function useDeleteFocus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Delete a focus and optionally its associated bases
   * @param focusId - The ID of the focus to delete
   * @param options - Options including whether to delete associated bases
   * @returns The deletion result or null on error
   */
  const deleteFocus = useCallback(async (
    focusId: string,
    options: DeleteFocusOptions = {}
  ): Promise<DeleteFocusResponse['data'] | null> => {
    if (!focusId) {
      setError('Focus ID is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[useDeleteFocus] Deleting focus:', focusId, options);

      // Build URL with query param if deleteBases is true
      const url = options.deleteBases
        ? `${endpoints.focus.delete(focusId)}?deleteBases=true`
        : endpoints.focus.delete(focusId);

      const response = await axios.delete<DeleteFocusResponse>(url);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to delete focus');
      }

      console.log('[useDeleteFocus] Focus deleted:', response.data.data);

      return response.data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete focus';
      console.error('[useDeleteFocus] Error:', message);
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
    deleteFocus,
    clearError,
    loading,
    error,
  };
}

