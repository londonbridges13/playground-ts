'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { CONFIG } from 'src/global-config';
import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

// ============================================================================
// Types
// ============================================================================

export interface ListBasesData {
  limit?: number;
  offset?: number;
  entityType?: string;
  title?: string;
}

export interface BasisListItem {
  id: string;
  title: string;
  description: string | null;
  entityType: string;
  sourceEntityId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface ListBasesAck {
  success: boolean;
  data?: BasisListItem[];
  total?: number;
  hasMore?: boolean;
  error?: string;
}

// ============================================================================
// Hook
// ============================================================================

export function useListBases() {
  const [loading, setLoading] = useState(false);
  const [bases, setBases] = useState<BasisListItem[]>([]);
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

  const listBases = useCallback(async (options: ListBasesData = {}) => {
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
      console.error('[useListBases] Connection error:', err);
      setError('Failed to connect to server');
      setLoading(false);
    });

    socketRef.current.emit('user:list-bases', options, (ack: ListBasesAck) => {
      setLoading(false);
      if (ack.success) {
        setBases(ack.data || []);
        setTotal(ack.total || 0);
        setHasMore(ack.hasMore || false);
      } else {
        setError(ack.error || 'Failed to list bases');
      }
      // Disconnect after receiving response
      socketRef.current?.disconnect();
      socketRef.current = null;
    });
  }, []);

  const clearBases = useCallback(() => {
    setBases([]);
    setTotal(0);
    setHasMore(false);
    setError(null);
  }, []);

  return {
    listBases,
    bases,
    total,
    hasMore,
    loading,
    error,
    clearBases,
  };
}

