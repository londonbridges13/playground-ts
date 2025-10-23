// src/hooks/use-focus-interface.ts
'use client';

import type { FocusInterface, NodeInput, EdgeInput } from 'src/types/focus-interface';

import { useState, useEffect, useCallback } from 'react';

import { focusInterfaceAPI } from 'src/lib/api/focus-interface';

// ----------------------------------------------------------------------

export function useFocusInterface(focusId: string) {
  const [focusInterface, setFocusInterface] = useState<FocusInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!focusId) return;

    const fetchInterface = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await focusInterfaceAPI.getInterface(focusId);
        setFocusInterface(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load interface');
      } finally {
        setLoading(false);
      }
    };

    fetchInterface();
  }, [focusId]);

  const regenerate = useCallback(
    async (nodes: NodeInput[], edges: EdgeInput[]) => {
      try {
        setLoading(true);
        setError(null);
        const data = await focusInterfaceAPI.generateInterface(focusId, nodes, edges);
        setFocusInterface(data);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate interface');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [focusId]
  );

  return {
    focusInterface,
    loading,
    error,
    regenerate,
  };
}

