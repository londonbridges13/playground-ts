'use client';

import { useRef, useCallback, useEffect } from 'react';

import axios, { endpoints } from 'src/lib/axios';

// ============================================================================
// Types
// ============================================================================

export interface Position {
  x: number;
  y: number;
}

export interface NodePositionUpdate {
  nodeId: string;
  position: Position;
}

export interface BatchUpdatePositionsRequest {
  positions: NodePositionUpdate[];
}

export interface BatchUpdatePositionsResponse {
  success: boolean;
  data?: {
    updated: number;
    failed: number;
    focusId: string;
    details: Array<{
      nodeId: string;
      position: Position;
      success: boolean;
      error?: string;
    }>;
  };
  error?: string;
}

export interface UseNodePositionSyncOptions {
  focusId: string | null;
  debounceMs?: number;
  onSaveStart?: () => void;
  onSaveComplete?: (updated: number, failed: number) => void;
  onSaveError?: (error: string) => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useNodePositionSync({
  focusId,
  debounceMs = 500,
  onSaveStart,
  onSaveComplete,
  onSaveError,
}: UseNodePositionSyncOptions) {
  const pendingUpdates = useRef<Map<string, Position>>(new Map());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Store callbacks in refs to avoid re-creating functions
  const onSaveStartRef = useRef(onSaveStart);
  const onSaveCompleteRef = useRef(onSaveComplete);
  const onSaveErrorRef = useRef(onSaveError);

  useEffect(() => {
    onSaveStartRef.current = onSaveStart;
    onSaveCompleteRef.current = onSaveComplete;
    onSaveErrorRef.current = onSaveError;
  }, [onSaveStart, onSaveComplete, onSaveError]);

  /**
   * Flush all pending position updates to the server
   */
  const flushUpdates = useCallback(async () => {
    if (!focusId || pendingUpdates.current.size === 0 || isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;
    onSaveStartRef.current?.();

    // Convert Map to array of position updates
    const positions: NodePositionUpdate[] = Array.from(
      pendingUpdates.current.entries()
    ).map(([nodeId, position]) => ({ nodeId, position }));

    // Clear pending updates before sending (optimistic)
    pendingUpdates.current.clear();

    try {
      console.log('[useNodePositionSync] Saving positions:', positions.length, 'nodes');

      const response = await axios.put<BatchUpdatePositionsResponse>(
        endpoints.focus.updateNodePositions(focusId),
        { positions }
      );

      if (response.data.success && response.data.data) {
        console.log(
          '[useNodePositionSync] Positions saved:',
          response.data.data.updated,
          'updated,',
          response.data.data.failed,
          'failed'
        );
        onSaveCompleteRef.current?.(
          response.data.data.updated,
          response.data.data.failed
        );
      } else {
        const errorMsg = response.data.error || 'Failed to save positions';
        console.error('[useNodePositionSync] Save failed:', errorMsg);
        onSaveErrorRef.current?.(errorMsg);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save positions';
      console.error('[useNodePositionSync] Error:', message);
      onSaveErrorRef.current?.(message);
    } finally {
      isSavingRef.current = false;
    }
  }, [focusId]);

  /**
   * Queue a position update for a node (debounced)
   */
  const queuePositionUpdate = useCallback(
    (nodeId: string, position: Position) => {
      if (!focusId) return;

      pendingUpdates.current.set(nodeId, position);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Debounce: save after debounceMs of no changes
      timeoutRef.current = setTimeout(flushUpdates, debounceMs);
    },
    [focusId, debounceMs, flushUpdates]
  );

  /**
   * Force save all pending updates immediately (e.g., before navigation)
   */
  const forceSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    await flushUpdates();
  }, [flushUpdates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    queuePositionUpdate,
    forceSave,
    hasPendingUpdates: () => pendingUpdates.current.size > 0,
  };
}

