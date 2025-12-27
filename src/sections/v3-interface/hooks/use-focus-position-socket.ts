'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

import { CONFIG } from 'src/global-config';
import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';
import type { FocusNodesPositionsUpdatedData, FocusNodePosition } from 'src/types/socket';

// ============================================================================
// Types
// ============================================================================

export interface UseFocusPositionSocketOptions {
  focusId: string | null;
  onPositionsUpdated?: (positions: FocusNodePosition[]) => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useFocusPositionSocket({
  focusId,
  onPositionsUpdated,
}: UseFocusPositionSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const currentFocusIdRef = useRef<string | null>(null);

  // Store callback in ref to avoid re-creating socket on callback changes
  const onPositionsUpdatedRef = useRef(onPositionsUpdated);

  useEffect(() => {
    onPositionsUpdatedRef.current = onPositionsUpdated;
  }, [onPositionsUpdated]);

  // Initialize socket and join focus room
  useEffect(() => {
    const token = sessionStorage.getItem(JWT_STORAGE_KEY);
    if (!token || !focusId) {
      // Cleanup if no token or focusId
      if (socketRef.current) {
        if (currentFocusIdRef.current) {
          socketRef.current.emit('leave-focus', currentFocusIdRef.current);
        }
        socketRef.current.disconnect();
        socketRef.current = null;
        currentFocusIdRef.current = null;
      }
      return;
    }

    // If socket exists and focus changed, leave old room and join new
    if (socketRef.current && currentFocusIdRef.current !== focusId) {
      if (currentFocusIdRef.current) {
        socketRef.current.emit('leave-focus', currentFocusIdRef.current);
      }
      socketRef.current.emit('join-focus', focusId);
      currentFocusIdRef.current = focusId;
      return;
    }

    // Create new socket connection
    if (!socketRef.current) {
      console.log('[useFocusPositionSocket] Creating socket connection');
      socketRef.current = io(CONFIG.apiUrl, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketRef.current.on('connect', () => {
        console.log('[useFocusPositionSocket] Connected, joining focus:', focusId);
        socketRef.current?.emit('join-focus', focusId);
        currentFocusIdRef.current = focusId;
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('[useFocusPositionSocket] Disconnected:', reason);
      });

      // Position update event
      socketRef.current.on('focus:nodes-positions-updated', (data: FocusNodesPositionsUpdatedData) => {
        console.log('[useFocusPositionSocket] Positions updated:', data);
        if (data.focusId === currentFocusIdRef.current) {
          onPositionsUpdatedRef.current?.(data.positions);
        }
      });
    }

    return () => {
      if (socketRef.current) {
        if (currentFocusIdRef.current) {
          socketRef.current.emit('leave-focus', currentFocusIdRef.current);
        }
        socketRef.current.disconnect();
        socketRef.current = null;
        currentFocusIdRef.current = null;
      }
    };
  }, [focusId]);

  // Manual disconnect function
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      if (currentFocusIdRef.current) {
        socketRef.current.emit('leave-focus', currentFocusIdRef.current);
      }
      socketRef.current.disconnect();
      socketRef.current = null;
      currentFocusIdRef.current = null;
    }
  }, []);

  return {
    disconnect,
    isConnected: !!socketRef.current?.connected,
  };
}

