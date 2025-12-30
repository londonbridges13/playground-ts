'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

import { CONFIG } from 'src/global-config';
import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

import type {
  FocusRequestData,
  FocusRequestAck,
  FocusRequestStartedData,
  FocusRequestProgressData,
  FocusRequestCompleteData,
  FocusRequestErrorData,
  FocusRequestStage,
  FocusRequestType,
  ChangeBatchPendingData,
  ChangeBatchApprovedData,
  BasisCreatedData,
  ApproveBatchAck,
  RejectBatchAck,
  ProposedChange,
} from 'src/types/socket';

// ============================================================================
// Types
// ============================================================================

export interface FocusRequestState {
  isProcessing: boolean;
  requestId: string | null;
  workflowId: string | null;
  stage: FocusRequestStage | null;
  progress: number;
  message: string | null;
  response: string | null;
  batchId: string | null;
  error: string | null;
  recoverable: boolean;
  duration: number | null;
}

export interface PendingBatch {
  batchId: string;
  focusId: string;
  changes: ProposedChange[];
  timestamp: string;
}

export interface CreatedBasis {
  id: string;
  title: string;
  description?: string;
  entityType: string;
  metadata: Record<string, unknown>;
  focusId?: string;
  timestamp: string;
}

export interface UseFocusRequestSocketOptions {
  focusId: string | null;
  onRequestStarted?: (data: FocusRequestStartedData) => void;
  onRequestProgress?: (data: FocusRequestProgressData) => void;
  onRequestComplete?: (data: FocusRequestCompleteData) => void;
  onRequestError?: (data: FocusRequestErrorData) => void;
  onBatchPending?: (data: ChangeBatchPendingData) => void;
  onBatchApproved?: (data: ChangeBatchApprovedData) => void;
  onBasisCreated?: (data: BasisCreatedData) => void;
}

export interface UseFocusRequestSocketReturn {
  // Connection state
  connected: boolean;

  // Request state
  requestState: FocusRequestState;

  // Pending batches and created bases
  pendingBatch: PendingBatch | null;
  createdBases: CreatedBasis[];

  // Actions
  sendRequest: (
    input: string,
    options?: {
      researchEnabled?: boolean;
      referencedBasisIds?: string[];
      requestType?: FocusRequestType;
    }
  ) => Promise<FocusRequestAck>;
  approveBatch: (batchId: string) => Promise<ApproveBatchAck>;
  rejectBatch: (batchId: string, reason?: string) => Promise<RejectBatchAck>;
  resetRequestState: () => void;
  clearPendingBatch: () => void;
  clearCreatedBases: () => void;
}

const initialRequestState: FocusRequestState = {
  isProcessing: false,
  requestId: null,
  workflowId: null,
  stage: null,
  progress: 0,
  message: null,
  response: null,
  batchId: null,
  error: null,
  recoverable: false,
  duration: null,
};

// ============================================================================
// Hook
// ============================================================================

export function useFocusRequestSocket(
  options: UseFocusRequestSocketOptions
): UseFocusRequestSocketReturn {
  const {
    focusId,
    onRequestStarted,
    onRequestProgress,
    onRequestComplete,
    onRequestError,
    onBatchPending,
    onBatchApproved,
    onBasisCreated,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const currentFocusIdRef = useRef<string | null>(null);

  const [connected, setConnected] = useState(false);
  const [requestState, setRequestState] = useState<FocusRequestState>(initialRequestState);
  const [pendingBatch, setPendingBatch] = useState<PendingBatch | null>(null);
  const [createdBases, setCreatedBases] = useState<CreatedBasis[]>([]);

  // Store callbacks in refs to avoid re-subscribing on every render
  const onRequestStartedRef = useRef(onRequestStarted);
  const onRequestProgressRef = useRef(onRequestProgress);
  const onRequestCompleteRef = useRef(onRequestComplete);
  const onRequestErrorRef = useRef(onRequestError);
  const onBatchPendingRef = useRef(onBatchPending);
  const onBatchApprovedRef = useRef(onBatchApproved);
  const onBasisCreatedRef = useRef(onBasisCreated);

  useEffect(() => {
    onRequestStartedRef.current = onRequestStarted;
    onRequestProgressRef.current = onRequestProgress;
    onRequestCompleteRef.current = onRequestComplete;
    onRequestErrorRef.current = onRequestError;
    onBatchPendingRef.current = onBatchPending;
    onBatchApprovedRef.current = onBatchApproved;
    onBasisCreatedRef.current = onBasisCreated;
  }, [
    onRequestStarted,
    onRequestProgress,
    onRequestComplete,
    onRequestError,
    onBatchPending,
    onBatchApproved,
    onBasisCreated,
  ]);

  // Initialize socket and join focus room
  useEffect(() => {
    const token = sessionStorage.getItem(JWT_STORAGE_KEY);
    if (!token || !focusId) {
      // Cleanup if no token or focusId
      if (socketRef.current) {
        if (currentFocusIdRef.current) {
          console.log('[useFocusRequestSocket] Unsubscribing from focus:', currentFocusIdRef.current);
          socketRef.current.emit('focus:unsubscribe', { focusId: currentFocusIdRef.current });
        }
        socketRef.current.disconnect();
        socketRef.current = null;
        currentFocusIdRef.current = null;
        setConnected(false);
      }
      return;
    }

    // If socket exists and focus changed, leave old room and join new
    if (socketRef.current && currentFocusIdRef.current !== focusId) {
      if (currentFocusIdRef.current) {
        console.log('[useFocusRequestSocket] Unsubscribing from old focus:', currentFocusIdRef.current);
        socketRef.current.emit('focus:unsubscribe', { focusId: currentFocusIdRef.current });
      }
      console.log('[useFocusRequestSocket] Subscribing to new focus:', focusId);
      socketRef.current.emit('focus:subscribe', { focusId });
      currentFocusIdRef.current = focusId;
      return;
    }

    // Create new socket connection
    if (!socketRef.current) {
      console.log('[useFocusRequestSocket] Creating socket connection to:', CONFIG.apiUrl);
      socketRef.current = io(CONFIG.apiUrl, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketRef.current.on('connect', () => {
        console.log('[useFocusRequestSocket] Connected! Socket ID:', socketRef.current?.id);
        console.log('[useFocusRequestSocket] Subscribing to focus:', focusId);
        socketRef.current?.emit('focus:subscribe', { focusId });
        currentFocusIdRef.current = focusId;
        setConnected(true);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('[useFocusRequestSocket] Disconnected:', reason);
        setConnected(false);
      });

      // Focus request events
      socketRef.current.on('focus:request-started', (data: FocusRequestStartedData) => {
        console.log('[useFocusRequestSocket] Request started:', data);
        if (data.focusId === currentFocusIdRef.current) {
          setRequestState((prev) => ({
            ...prev,
            isProcessing: true,
            requestId: data.requestId,
            workflowId: data.workflowId,
            stage: 'STARTED',
            progress: 0,
            error: null,
          }));
          onRequestStartedRef.current?.(data);
        }
      });

      socketRef.current.on('focus:request-progress', (data: FocusRequestProgressData) => {
        console.log('[useFocusRequestSocket] Request progress:', data);
        if (data.focusId === currentFocusIdRef.current) {
          setRequestState((prev) => ({
            ...prev,
            stage: data.stage,
            progress: data.progress ?? prev.progress,
            message: data.message,
          }));
          onRequestProgressRef.current?.(data);
        }
      });

      socketRef.current.on('focus:request-complete', (data: FocusRequestCompleteData) => {
        console.log('[useFocusRequestSocket] Request complete:', data);
        if (data.focusId === currentFocusIdRef.current) {
          setRequestState((prev) => ({
            ...prev,
            isProcessing: false,
            stage: 'COMPLETE',
            progress: 100,
            response: data.response,
            batchId: data.batchId ?? null,
            duration: data.duration,
          }));
          onRequestCompleteRef.current?.(data);
        }
      });

      socketRef.current.on('focus:request-error', (data: FocusRequestErrorData) => {
        console.log('[useFocusRequestSocket] Request error:', data);
        if (data.focusId === currentFocusIdRef.current) {
          setRequestState((prev) => ({
            ...prev,
            isProcessing: false,
            stage: 'ERROR',
            error: data.error,
            recoverable: data.recoverable,
          }));
          onRequestErrorRef.current?.(data);
        }
      });

      socketRef.current.on('change-batch-pending', (data: ChangeBatchPendingData) => {
        console.log('[useFocusRequestSocket] Batch pending:', data);
        if (data.focusId === currentFocusIdRef.current) {
          setPendingBatch({
            batchId: data.batchId,
            focusId: data.focusId,
            changes: data.changes,
            timestamp: data.timestamp,
          });
          onBatchPendingRef.current?.(data);
        }
      });

      socketRef.current.on('change-batch-approved', (data: ChangeBatchApprovedData) => {
        console.log('[useFocusRequestSocket] Batch approved:', data);
        if (data.focusId === currentFocusIdRef.current) {
          setPendingBatch(null);
          onBatchApprovedRef.current?.(data);
        }
      });

      socketRef.current.on('basis-created', (data: BasisCreatedData) => {
        console.log('[useFocusRequestSocket] Basis created:', data);
        const newBasis: CreatedBasis = {
          id: data.basis.id,
          title: data.basis.title,
          description: data.basis.description,
          entityType: data.basis.entityType,
          metadata: data.basis.metadata,
          focusId: data.focusId,
          timestamp: data.timestamp,
        };
        setCreatedBases((prev) => [...prev, newBasis]);
        onBasisCreatedRef.current?.(data);
      });
    }

    // Cleanup function - only runs when component unmounts, NOT on focusId change
    // We handle focusId changes above to avoid disconnecting mid-request
    return () => {
      console.log('[useFocusRequestSocket] Cleanup - unmounting');
      if (socketRef.current) {
        if (currentFocusIdRef.current) {
          console.log('[useFocusRequestSocket] Unsubscribing from focus:', currentFocusIdRef.current);
          socketRef.current.emit('focus:unsubscribe', { focusId: currentFocusIdRef.current });
        }
        socketRef.current.disconnect();
        socketRef.current = null;
        currentFocusIdRef.current = null;
        setConnected(false);
      }
    };
  }, [focusId]);

  // Send a focus request
  const sendRequest = useCallback(
    async (
      input: string,
      sendOptions?: {
        researchEnabled?: boolean;
        referencedBasisIds?: string[];
        requestType?: FocusRequestType;
      }
    ): Promise<FocusRequestAck> => {
      if (!socketRef.current || !focusId) {
        return { success: false, error: 'Socket not connected or no focus selected' };
      }

      const requestData: FocusRequestData = {
        focusId,
        input,
        researchEnabled: sendOptions?.researchEnabled ?? false,
        referencedBasisIds: sendOptions?.referencedBasisIds,
        requestType: sendOptions?.requestType ?? 'AI_GENERATION',
      };

      console.log('[useFocusRequestSocket] ========== SENDING FOCUS REQUEST ==========');
      console.log('[useFocusRequestSocket] Socket connected:', socketRef.current?.connected);
      console.log('[useFocusRequestSocket] Socket ID:', socketRef.current?.id);
      console.log('[useFocusRequestSocket] Focus ID:', focusId);
      console.log('[useFocusRequestSocket] Request Data:', JSON.stringify(requestData, null, 2));
      console.log('[useFocusRequestSocket] ============================================');

      // Set initial processing state
      setRequestState((prev) => ({
        ...prev,
        isProcessing: true,
        stage: 'STARTED',
        progress: 0,
        response: null,
        batchId: null,
        error: null,
        message: 'Sending request...',
      }));

      return new Promise((resolve) => {
        console.log('[useFocusRequestSocket] Emitting focus:request event...');
        socketRef.current!.emit('focus:request', requestData, (ack: FocusRequestAck) => {
          console.log('[useFocusRequestSocket] ========== RECEIVED ACK ==========');
          console.log('[useFocusRequestSocket] Success:', ack.success);
          console.log('[useFocusRequestSocket] Request ID:', ack.requestId);
          console.log('[useFocusRequestSocket] Workflow ID:', ack.workflowId);
          console.log('[useFocusRequestSocket] Error:', ack.error);
          console.log('[useFocusRequestSocket] Full ACK:', JSON.stringify(ack, null, 2));
          console.log('[useFocusRequestSocket] ================================');

          if (ack.success) {
            setRequestState((prev) => ({
              ...prev,
              requestId: ack.requestId ?? null,
              workflowId: ack.workflowId ?? null,
              message: 'Request submitted',
            }));
          } else {
            setRequestState((prev) => ({
              ...prev,
              isProcessing: false,
              stage: 'ERROR',
              error: ack.error ?? 'Request failed',
            }));
          }
          resolve(ack);
        });
      });
    },
    [focusId]
  );

  // Approve a pending batch
  const approveBatch = useCallback(async (batchId: string): Promise<ApproveBatchAck> => {
    if (!socketRef.current) {
      return { success: false, error: 'Socket not connected' };
    }

    return new Promise((resolve) => {
      socketRef.current!.emit('approve-batch', { batchId }, (ack: ApproveBatchAck) => {
        if (ack.success) {
          setPendingBatch(null);
        }
        resolve(ack);
      });
    });
  }, []);

  // Reject a pending batch
  const rejectBatch = useCallback(
    async (batchId: string, reason?: string): Promise<RejectBatchAck> => {
      if (!socketRef.current) {
        return { success: false, error: 'Socket not connected' };
      }

      return new Promise((resolve) => {
        socketRef.current!.emit('reject-batch', { batchId, reason }, (ack: RejectBatchAck) => {
          if (ack.success) {
            setPendingBatch(null);
          }
          resolve(ack);
        });
      });
    },
    []
  );

  // Reset request state
  const resetRequestState = useCallback(() => {
    setRequestState(initialRequestState);
  }, []);

  // Clear pending batch
  const clearPendingBatch = useCallback(() => {
    setPendingBatch(null);
  }, []);

  // Clear created bases
  const clearCreatedBases = useCallback(() => {
    setCreatedBases([]);
  }, []);

  return {
    connected,
    requestState,
    pendingBatch,
    createdBases,
    sendRequest,
    approveBatch,
    rejectBatch,
    resetRequestState,
    clearPendingBatch,
    clearCreatedBases,
  };
}
