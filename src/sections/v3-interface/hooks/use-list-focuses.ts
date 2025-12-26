'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { CONFIG } from 'src/global-config';
import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

// ============================================================================
// Types
// ============================================================================

export interface ListFocusesData {
  limit?: number;
  offset?: number;
  title?: string;
}

export interface FocusListItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  basesCount: number;
}

interface ListFocusesAck {
  success: boolean;
  data?: FocusListItem[];
  total?: number;
  hasMore?: boolean;
  error?: string;
}

// ============================================================================
// Hook
// ============================================================================

export function useListFocuses() {
  const [loading, setLoading] = useState(false);
  const [focuses, setFocuses] = useState<FocusListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const listFocuses = useCallback(async (options: ListFocusesData = {}) => {
    const token = sessionStorage.getItem(JWT_STORAGE_KEY);
    if (!token) {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Create socket connection
    socketRef.current = io(CONFIG.apiUrl, {
      auth: { token },
      reconnection: false,
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('[useListFocuses] Connection error:', err);
      setError('Failed to connect to server');
      setLoading(false);
    });

    socketRef.current.emit('user:list-focuses', options, (ack: ListFocusesAck) => {
      setLoading(false);
      if (ack.success) {
        setFocuses(ack.data || []);
        setTotal(ack.total || 0);
        setHasMore(ack.hasMore || false);
      } else {
        setError(ack.error || 'Failed to list focuses');
      }
      // Disconnect after receiving response
      socketRef.current?.disconnect();
      socketRef.current = null;
    });
  }, []);

  const clearFocuses = useCallback(() => {
    setFocuses([]);
    setTotal(0);
    setHasMore(false);
    setError(null);
  }, []);

  return {
    listFocuses,
    focuses,
    total,
    hasMore,
    loading,
    error,
    clearFocuses,
  };
}

