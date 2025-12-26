'use client';

import { useCallback, useState } from 'react';

import axios, { endpoints } from 'src/lib/axios';
import { focusInterfaceAPI } from 'src/lib/api/focus-interface';
import type { FocusInterface } from 'src/types/focus-interface';

// ============================================================================
// Types
// ============================================================================

export interface FocusBasis {
  id: string;
  focusId: string;
  basisId: string;
  position: { x: number; y: number } | null;
  basis: {
    id: string;
    title: string;
    description: string | null;
    entityType: string;
    metadata: Record<string, unknown>;
    sourceEntityId: string | null;
  };
}

export interface FocusData {
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
  user: {
    id: string;
    name: string;
    email: string;
  };
  bases: FocusBasis[];
}

interface GetFocusResponse {
  success: boolean;
  data?: FocusData;
  error?: string;
}

export interface LoadedFocus {
  focus: FocusData;
  interface: FocusInterface | null;
}

// ============================================================================
// Hook
// ============================================================================

export function useFocus() {
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState<FocusData | null>(null);
  const [focusInterface, setFocusInterface] = useState<FocusInterface | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load a focus by ID with full details and interface
   */
  const loadFocus = useCallback(async (focusId: string): Promise<LoadedFocus | null> => {
    if (!focusId) {
      setError('Focus ID is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[useFocus] Loading focus:', focusId);

      // Fetch focus data and interface in parallel
      const [focusRes, interfaceData] = await Promise.all([
        axios.get<GetFocusResponse>(endpoints.focus.get(focusId)),
        focusInterfaceAPI.getInterface(focusId).catch((err) => {
          console.warn('[useFocus] Failed to load interface:', err);
          return null;
        }),
      ]);

      if (!focusRes.data.success || !focusRes.data.data) {
        throw new Error(focusRes.data.error || 'Failed to load focus');
      }

      const focusData = focusRes.data.data;

      console.log('[useFocus] Focus loaded:', focusData);
      console.log('[useFocus] Interface loaded:', interfaceData);

      setFocus(focusData);
      setFocusInterface(interfaceData);

      return {
        focus: focusData,
        interface: interfaceData,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load focus';
      console.error('[useFocus] Error:', message);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear the loaded focus data
   */
  const clearFocus = useCallback(() => {
    setFocus(null);
    setFocusInterface(null);
    setError(null);
  }, []);

  return {
    loadFocus,
    clearFocus,
    focus,
    focusInterface,
    loading,
    error,
  };
}

