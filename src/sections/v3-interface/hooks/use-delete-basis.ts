'use client';

import { useCallback, useState } from 'react';

import axios, { endpoints } from 'src/lib/axios';

// ============================================================================
// Types
// ============================================================================

export interface DeleteBasisResponse {
  success: boolean;
  data?: {
    message: string;
    deletedBasis: {
      id: string;
      title: string;
      entityType: string;
      atlasId: string | null;
      pathId: string | null;
    };
    severedConnections: {
      commits: number;
      focusBases: number;
      requestBases: number;
      messagesUpdated: number;
    };
  };
  error?: string;
}

// ============================================================================
// Hook
// ============================================================================

export function useDeleteBasis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Delete a basis and sever all its connections
   * @param basisId - The ID of the basis to delete
   * @returns The deletion result or null on error
   */
  const deleteBasis = useCallback(async (
    basisId: string
  ): Promise<DeleteBasisResponse['data'] | null> => {
    if (!basisId) {
      setError('Basis ID is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[useDeleteBasis] Deleting basis:', basisId);

      const response = await axios.delete<DeleteBasisResponse>(
        endpoints.basis.delete(basisId)
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to delete basis');
      }

      console.log('[useDeleteBasis] Basis deleted:', response.data.data);

      return response.data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete basis';
      console.error('[useDeleteBasis] Error:', message);
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
    deleteBasis,
    clearError,
    loading,
    error,
  };
}

