'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

import { CONFIG } from 'src/global-config';
import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

import type {
  SemanticSearchData,
  SemanticSearchAck,
  SemanticSearchMode,
  SemanticSearchFocusResult,
  SemanticSearchBasisResult,
} from 'src/types/socket';

// ============================================================================
// Types
// ============================================================================

export interface SemanticSearchResults {
  focuses: SemanticSearchFocusResult[];
  bases: SemanticSearchBasisResult[];
}

export interface SemanticSearchOptions {
  types?: Array<'focus' | 'basis'>;
  mode?: SemanticSearchMode;
  limit?: number;
  threshold?: number;
  entityTypes?: string[];
  focusId?: string;
}

// ============================================================================
// Hook
// ============================================================================

export function useSemanticSearch() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SemanticSearchResults>({ focuses: [], bases: [] });
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

  const search = useCallback(
    async (query: string, options?: SemanticSearchOptions) => {
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
        console.error('[useSemanticSearch] Connection error:', err);
        setError('Failed to connect to server');
        setLoading(false);
      });

      const searchData: SemanticSearchData = {
        query,
        types: options?.types,
        mode: options?.mode || 'content',
        limit: options?.limit,
        threshold: options?.threshold,
        entityTypes: options?.entityTypes,
        focusId: options?.focusId,
      };

      // Remove undefined values
      Object.keys(searchData).forEach((key) => {
        if (searchData[key as keyof SemanticSearchData] === undefined) {
          delete searchData[key as keyof SemanticSearchData];
        }
      });

      console.log('[useSemanticSearch] Sending semantic search:', searchData);

      socketRef.current.emit('user:semantic-search', searchData, (ack: SemanticSearchAck) => {
        setLoading(false);
        if (ack.success) {
          // Results are already sorted by similarity (highest first)
          setResults(ack.results || { focuses: [], bases: [] });
          setTotalResults(ack.totalResults || 0);
          console.log('[useSemanticSearch] Results:', ack.results);
        } else {
          setError(ack.error || 'Semantic search failed');
          console.error('[useSemanticSearch] Error:', ack.error);
        }
        // Disconnect after receiving response
        socketRef.current?.disconnect();
        socketRef.current = null;
      });
    },
    []
  );

  // Search within a specific Focus (convenience method)
  const searchInFocus = useCallback(
    async (query: string, focusId: string, options?: Omit<SemanticSearchOptions, 'focusId'>) => {
      return search(query, { ...options, focusId, types: ['basis'] });
    },
    [search]
  );

  const clearResults = useCallback(() => {
    setResults({ focuses: [], bases: [] });
    setTotalResults(0);
    setError(null);
  }, []);

  return {
    search,
    searchInFocus,
    results,
    totalResults,
    loading,
    error,
    clearResults,
  };
}

