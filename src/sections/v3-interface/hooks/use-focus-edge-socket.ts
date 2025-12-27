'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

import { CONFIG } from 'src/global-config';
import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';
import type {
  FocusEdge,
  FocusNodesConnectedData,
  FocusNodesDisconnectedData,
  FocusEdgeUpdatedData,
} from 'src/types/socket';

// ============================================================================
// Types
// ============================================================================

export interface UseFocusEdgeSocketOptions {
  focusId: string | null;
  onEdgeConnected?: (edge: FocusEdge) => void;
  onEdgeDisconnected?: (edgeId: string, sourceNodeId?: string, targetNodeId?: string) => void;
  onEdgeUpdated?: (edge: FocusEdge) => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useFocusEdgeSocket({
  focusId,
  onEdgeConnected,
  onEdgeDisconnected,
  onEdgeUpdated,
}: UseFocusEdgeSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const currentFocusIdRef = useRef<string | null>(null);

  // Store callbacks in refs to avoid re-creating socket on callback changes
  const onEdgeConnectedRef = useRef(onEdgeConnected);
  const onEdgeDisconnectedRef = useRef(onEdgeDisconnected);
  const onEdgeUpdatedRef = useRef(onEdgeUpdated);

  useEffect(() => {
    onEdgeConnectedRef.current = onEdgeConnected;
    onEdgeDisconnectedRef.current = onEdgeDisconnected;
    onEdgeUpdatedRef.current = onEdgeUpdated;
  }, [onEdgeConnected, onEdgeDisconnected, onEdgeUpdated]);

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
      console.log('[useFocusEdgeSocket] Creating socket connection');
      socketRef.current = io(CONFIG.apiUrl, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketRef.current.on('connect', () => {
        console.log('[useFocusEdgeSocket] Connected, joining focus:', focusId);
        socketRef.current?.emit('join-focus', focusId);
        currentFocusIdRef.current = focusId;
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('[useFocusEdgeSocket] Disconnected:', reason);
      });

      // Edge events
      socketRef.current.on('focus:nodes-connected', (data: FocusNodesConnectedData) => {
        console.log('[useFocusEdgeSocket] Nodes connected:', data);
        if (data.focusId === currentFocusIdRef.current) {
          onEdgeConnectedRef.current?.(data.edge);
        }
      });

      socketRef.current.on('focus:nodes-disconnected', (data: FocusNodesDisconnectedData) => {
        console.log('[useFocusEdgeSocket] Nodes disconnected:', data);
        if (data.focusId === currentFocusIdRef.current) {
          onEdgeDisconnectedRef.current?.(data.edgeId, data.sourceNodeId, data.targetNodeId);
        }
      });

      socketRef.current.on('focus:edge-updated', (data: FocusEdgeUpdatedData) => {
        console.log('[useFocusEdgeSocket] Edge updated:', data);
        if (data.focusId === currentFocusIdRef.current) {
          onEdgeUpdatedRef.current?.(data.edge);
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

