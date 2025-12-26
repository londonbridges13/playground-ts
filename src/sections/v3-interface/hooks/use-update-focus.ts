'use client';

import { useCallback, useState } from 'react';

import axios, { endpoints } from 'src/lib/axios';

// ============================================================================
// Types
// ============================================================================

export interface UpdateFocusRequest {
  title?: string;
  description?: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
  interface?: Record<string, unknown>;
}

export interface UpdatedFocus {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  metadata: Record<string, unknown> | null;
  interface: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  atlasId: string | null;
  pathId: string | null;
}

interface UpdateFocusResponse {
  success: boolean;
  data?: UpdatedFocus;
  error?: string;
}

// ============================================================================
// Hook
// ============================================================================

export function useUpdateFocus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update a focus by ID
   * @param focusId - The ID of the focus to update
   * @param updates - The fields to update
   * @returns The updated focus data or null on error
   */
  const updateFocus = useCallback(async (
    focusId: string,
    updates: UpdateFocusRequest
  ): Promise<UpdatedFocus | null> => {
    if (!focusId) {
      setError('Focus ID is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[useUpdateFocus] Updating focus:', focusId, updates);

      const response = await axios.put<UpdateFocusResponse>(
        endpoints.focus.update(focusId),
        updates
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to update focus');
      }

      console.log('[useUpdateFocus] Focus updated:', response.data.data);

      return response.data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update focus';
      console.error('[useUpdateFocus] Error:', message);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update focus title with optimistic update support
   */
  const updateTitle = useCallback(async (
    focusId: string,
    newTitle: string
  ): Promise<UpdatedFocus | null> => {
    return updateFocus(focusId, { title: newTitle });
  }, [updateFocus]);

  /**
   * Update focus description with optimistic update support
   */
  const updateDescription = useCallback(async (
    focusId: string,
    newDescription: string
  ): Promise<UpdatedFocus | null> => {
    return updateFocus(focusId, { description: newDescription });
  }, [updateFocus]);

  /**
   * Update focus metadata
   */
  const updateMetadata = useCallback(async (
    focusId: string,
    metadata: Record<string, unknown>
  ): Promise<UpdatedFocus | null> => {
    return updateFocus(focusId, { metadata });
  }, [updateFocus]);

  /**
   * Update focus interface (React Flow nodes/edges)
   */
  const updateInterface = useCallback(async (
    focusId: string,
    interfaceData: Record<string, unknown>
  ): Promise<UpdatedFocus | null> => {
    return updateFocus(focusId, { interface: interfaceData });
  }, [updateFocus]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    updateFocus,
    updateTitle,
    updateDescription,
    updateMetadata,
    updateInterface,
    clearError,
    loading,
    error,
  };
}

