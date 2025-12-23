import { useCallback } from 'react';

import { toast } from 'src/components/snackbar';

import type {
  CreateRequestInput,
  RequestType,
  Request,
  Result,
} from 'src/types/v3-interface-api-structure';

import { useV3Interface } from '../context';

// ============================================
// Types
// ============================================

export interface SubmitRequestOptions {
  input: string;
  type?: RequestType;
  parameters?: Record<string, unknown>;
  referencedBasisIds?: string[];
}

export interface UseRequestReturn {
  submitRequest: (options: SubmitRequestOptions) => Promise<Result | null>;
  isSubmitting: boolean;
  pendingRequest: ReturnType<typeof useV3Interface>['pendingRequest'];
}

// ============================================
// Mock API (replace with real API calls)
// ============================================

async function mockSubmitRequest(input: CreateRequestInput): Promise<{ request: Request; result: Result }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  const now = new Date().toISOString();
  
  const request: Request = {
    id: `req_${Date.now()}`,
    input: input.input,
    type: input.type,
    status: 'COMPLETED',
    parameters: input.parameters,
    focusId: input.focusId,
    contextId: input.contextId,
    userId: input.userId,
    createdAt: now,
    updatedAt: now,
  };
  
  const result: Result = {
    id: `result_${Date.now()}`,
    output: `Processed: "${input.input}"`,
    wasSuccessful: true,
    requestId: request.id,
    processingTimeMs: 2000,
    createdAt: now,
    updatedAt: now,
  };
  
  return { request, result };
}

// ============================================
// Hook
// ============================================

export function useRequest(): UseRequestReturn {
  const {
    focus,
    context,
    pendingRequest,
    isLoading,
    startRequest,
    updateRequestStatus,
    completeRequest,
  } = useV3Interface();

  const submitRequest = useCallback(async (options: SubmitRequestOptions): Promise<Result | null> => {
    const { input, type = 'AI_GENERATION', parameters, referencedBasisIds } = options;

    // Validate we have focus and context
    if (!focus) {
      toast.warning('No Focus selected', {
        description: 'Please select or create a Focus first',
      });
      return null;
    }

    if (!context) {
      toast.warning('No Context active', {
        description: 'Please start a working session first',
      });
      return null;
    }

    // Get userId from localStorage
    let userId = '';
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        userId = user.id || '';
      }
    } catch (err) {
      console.error('Error getting userId:', err);
    }

    if (!userId) {
      toast.warning('Not logged in', {
        description: 'Please log in to submit requests',
      });
      return null;
    }

    // Build request input
    const requestInput: CreateRequestInput = {
      input,
      type,
      focusId: focus.id,
      contextId: context.id,
      userId,
      parameters: {
        ...parameters,
        activeBases: context.activeBases,
      },
      referencedBasisIds,
    };

    try {
      // Start the request
      startRequest(input, type);
      updateRequestStatus('PROCESSING');

      // Submit to API (mock for now)
      const { result } = await mockSubmitRequest(requestInput);

      // Complete successfully
      completeRequest(true, result.output);
      
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      completeRequest(false, message);
      return null;
    }
  }, [focus, context, startRequest, updateRequestStatus, completeRequest]);

  return {
    submitRequest,
    isSubmitting: isLoading,
    pendingRequest,
  };
}

