'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

import { toast } from 'src/components/snackbar';

import type {
  Context as FocusContext,
  RequestStatus,
  RequestType,
  FocusInterfaceV2,
} from 'src/types/v3-interface-api-structure';

// ============================================
// Types
// ============================================

export interface Focus {
  id: string;
  title: string;
  description?: string;
  userId: string;
  currentHead?: string;
}

export interface PendingRequest {
  id?: string;
  input: string;
  type: RequestType;
  status: RequestStatus;
  startedAt: string;
}

export interface V3InterfaceState {
  focus: Focus | null;
  context: FocusContext | null;
  interface: FocusInterfaceV2 | null;
  pendingRequest: PendingRequest | null;
  isLoading: boolean;
}

export interface SetFocusOptions {
  /** If true, suppresses the "Focus loaded" toast notification */
  silent?: boolean;
}

export interface V3InterfaceActions {
  // Focus actions
  setFocus: (focus: Focus | null, options?: SetFocusOptions) => void;

  // Context actions
  setContext: (context: FocusContext | null) => void;
  updateContextBases: (bases: string[]) => void;

  // Interface actions
  setInterface: (iface: FocusInterfaceV2 | null) => void;

  // Request actions
  startRequest: (input: string, type?: RequestType) => void;
  updateRequestStatus: (status: RequestStatus) => void;
  completeRequest: (success: boolean, message?: string) => void;
  cancelRequest: () => void;
}

export type V3InterfaceContextValue = V3InterfaceState & V3InterfaceActions;

// ============================================
// Context
// ============================================

const V3InterfaceContext = createContext<V3InterfaceContextValue | null>(null);

// ============================================
// Provider
// ============================================

interface V3InterfaceProviderProps {
  children: ReactNode;
  initialFocus?: Focus | null;
  initialContext?: FocusContext | null;
}

export function V3InterfaceProvider({
  children,
  initialFocus = null,
  initialContext = null,
}: V3InterfaceProviderProps) {
  const [focus, setFocusState] = useState<Focus | null>(initialFocus);
  const [context, setContextState] = useState<FocusContext | null>(initialContext);
  const [interfaceData, setInterfaceData] = useState<FocusInterfaceV2 | null>(null);
  const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Focus actions
  const setFocus = useCallback((newFocus: Focus | null, options?: SetFocusOptions) => {
    setFocusState(newFocus);
    if (newFocus && !options?.silent) {
      toast.info('Focus loaded', {
        description: newFocus.title,
      });
    }
  }, []);

  // Context actions
  const setContext = useCallback((newContext: FocusContext | null) => {
    setContextState(newContext);
    if (newContext) {
      toast.info('Context updated', {
        description: newContext.title || 'Active session',
      });
    }
  }, []);

  const updateContextBases = useCallback((bases: string[]) => {
    setContextState((prev) => {
      if (!prev) return prev;
      return { ...prev, activeBases: bases };
    });
    toast.info('Active bases updated', {
      description: `${bases.length} bases selected`,
    });
  }, []);

  // Interface actions
  const setInterface = useCallback((iface: FocusInterfaceV2 | null) => {
    setInterfaceData(iface);
  }, []);

  // Request actions
  const startRequest = useCallback((input: string, type: RequestType = 'AI_GENERATION') => {
    const newRequest: PendingRequest = {
      input,
      type,
      status: 'PENDING',
      startedAt: new Date().toISOString(),
    };
    setPendingRequest(newRequest);
    setIsLoading(true);
    toast.info('Request submitted', {
      description: input.length > 50 ? `${input.substring(0, 50)}...` : input,
    });
  }, []);

  const updateRequestStatus = useCallback((status: RequestStatus) => {
    setPendingRequest((prev) => {
      if (!prev) return prev;
      return { ...prev, status };
    });
    if (status === 'PROCESSING') {
      toast.info('Processing...', { description: 'AI is working on your request' });
    }
  }, []);

  const completeRequest = useCallback((success: boolean, message?: string) => {
    setIsLoading(false);
    if (success) {
      toast.success('Request completed', { description: message || 'Done!' });
    } else {
      toast.error('Request failed', { description: message || 'Something went wrong' });
    }
    setPendingRequest(null);
  }, []);

  const cancelRequest = useCallback(() => {
    setPendingRequest(null);
    setIsLoading(false);
    toast.warning('Request cancelled');
  }, []);

  const value = useMemo<V3InterfaceContextValue>(() => ({
    // State
    focus,
    context,
    interface: interfaceData,
    pendingRequest,
    isLoading,
    // Actions
    setFocus,
    setContext,
    updateContextBases,
    setInterface,
    startRequest,
    updateRequestStatus,
    completeRequest,
    cancelRequest,
  }), [
    focus, context, interfaceData, pendingRequest, isLoading,
    setFocus, setContext, updateContextBases, setInterface,
    startRequest, updateRequestStatus, completeRequest, cancelRequest,
  ]);

  return (
    <V3InterfaceContext.Provider value={value}>
      {children}
    </V3InterfaceContext.Provider>
  );
}

// ============================================
// Hooks
// ============================================

export function useV3Interface(): V3InterfaceContextValue {
  const ctx = useContext(V3InterfaceContext);
  if (!ctx) {
    throw new Error('useV3Interface must be used within a V3InterfaceProvider');
  }
  return ctx;
}

// Convenience hooks for specific parts of state
export function useV3Focus() {
  const { focus, setFocus } = useV3Interface();
  return { focus, setFocus };
}

export function useV3Context() {
  const { context, setContext, updateContextBases } = useV3Interface();
  return { context, setContext, updateContextBases };
}

export function useV3Request() {
  const { pendingRequest, isLoading, startRequest, updateRequestStatus, completeRequest, cancelRequest } = useV3Interface();
  return { pendingRequest, isLoading, startRequest, updateRequestStatus, completeRequest, cancelRequest };
}

