'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { CONFIG } from 'src/global-config';
import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

// ============================================================================
// Types
// ============================================================================

export interface SearchData {
  query: string;
  types?: Array<'focus' | 'basis'>;
  limit?: number;
}

export interface SearchFocusResult {
  id: string;
  title: string;
  description: string | null;
  type: 'focus';
}

export interface SearchBasisResult {
  id: string;
  title: string;
  description: string | null;
  entityType: string;
  type: 'basis';
}

export interface SearchResults {
  focuses: SearchFocusResult[];
  bases: SearchBasisResult[];
}

interface SearchAck {
  success: boolean;
  query?: string;
  results?: SearchResults;
  totalResults?: number;
  error?: string;
}

// ============================================================================
// Hook
// ============================================================================

export function useSearch() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({ focuses: [], bases: [] });
  const [totalResults, setTotalResults] = useState(0);
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

  const search = useCallback(async (query: string, types?: Array<'focus' | 'basis'>, limit?: number) => {
    if (!query.trim()) {
      setResults({ focuses: [], bases: [] });
      setTotalResults(0);
      return;
    }

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
      console.error('[useSearch] Connection error:', err);
      setError('Failed to connect to server');
      setLoading(false);
    });

    const searchData: SearchData = { query };
    if (types) searchData.types = types;
    if (limit) searchData.limit = limit;

    socketRef.current.emit('user:search', searchData, (ack: SearchAck) => {
      setLoading(false);
      if (ack.success) {
        setResults(ack.results || { focuses: [], bases: [] });
        setTotalResults(ack.totalResults || 0);
      } else {
        setError(ack.error || 'Search failed');
      }
      // Disconnect after receiving response
      socketRef.current?.disconnect();
      socketRef.current = null;
    });
  }, []);

  const clearResults = useCallback(() => {
    setResults({ focuses: [], bases: [] });
    setTotalResults(0);
    setError(null);
  }, []);

  return {
    search,
    results,
    totalResults,
    loading,
    error,
    clearResults,
  };
}

