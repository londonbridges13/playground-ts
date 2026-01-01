'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

import { CONFIG } from 'src/global-config';
import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

import type {
  FocusVoiceStartData,
  FocusVoiceAck,
  FocusVoiceStartedData,
  FocusVoicePartialData,
  FocusVoiceTranscriptData,
  FocusVoiceChunkData,
  FocusVoiceProcessingData,
  FocusVoiceErrorData,
  FocusVoiceEndedData,
  FocusVoiceRequestType,
  FocusRequestCompleteData,
} from 'src/types/socket';

// ============================================================================
// Types
// ============================================================================

export interface VoiceChunk {
  id: string;
  text: string;
  wordCount: number;
  confidence: number;
  reason: string;
}

export interface FocusVoiceState {
  isRecording: boolean;
  sessionId: string | null;
  partialTranscript: string;
  finalTranscript: string;
  chunks: VoiceChunk[];
  isProcessing: boolean;
  error: string | null;
}

export interface UseFocusVoiceOptions {
  focusId: string | null;
  onVoiceStarted?: (data: FocusVoiceStartedData) => void;
  onVoicePartial?: (data: FocusVoicePartialData) => void;
  onVoiceTranscript?: (data: FocusVoiceTranscriptData) => void;
  onVoiceChunk?: (data: FocusVoiceChunkData) => void;
  onVoiceProcessing?: (data: FocusVoiceProcessingData) => void;
  onVoiceError?: (data: FocusVoiceErrorData) => void;
  onVoiceEnded?: (data: FocusVoiceEndedData) => void;
  onRequestComplete?: (data: FocusRequestCompleteData) => void;
}

export interface StartRecordingOptions {
  researchEnabled?: boolean;
  referencedBasisIds?: string[];
  requestType?: FocusVoiceRequestType;
  enableChunking?: boolean;
  autoSubmit?: boolean;
  language?: string;
}

export interface UseFocusVoiceReturn {
  // Connection state
  connected: boolean;

  // Voice state
  voiceState: FocusVoiceState;

  // Convenience accessors
  isRecording: boolean;
  sessionId: string | null;
  partialTranscript: string;
  finalTranscript: string;
  chunks: VoiceChunk[];
  isProcessing: boolean;
  error: string | null;

  // Actions
  startRecording: (options?: StartRecordingOptions) => Promise<string>;
  stopRecording: (submitToCRW3?: boolean) => Promise<void>;
  reset: () => void;
}

const initialVoiceState: FocusVoiceState = {
  isRecording: false,
  sessionId: null,
  partialTranscript: '',
  finalTranscript: '',
  chunks: [],
  isProcessing: false,
  error: null,
};

// ============================================================================
// Hook
// ============================================================================

export function useFocusVoice(options: UseFocusVoiceOptions): UseFocusVoiceReturn {
  const {
    focusId,
    onVoiceStarted,
    onVoicePartial,
    onVoiceTranscript,
    onVoiceChunk,
    onVoiceProcessing,
    onVoiceError,
    onVoiceEnded,
    onRequestComplete,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const currentFocusIdRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const [connected, setConnected] = useState(false);
  const [voiceState, setVoiceState] = useState<FocusVoiceState>(initialVoiceState);

  // Store callbacks in refs to avoid re-subscribing on every render
  const onVoiceStartedRef = useRef(onVoiceStarted);
  const onVoicePartialRef = useRef(onVoicePartial);
  const onVoiceTranscriptRef = useRef(onVoiceTranscript);
  const onVoiceChunkRef = useRef(onVoiceChunk);
  const onVoiceProcessingRef = useRef(onVoiceProcessing);
  const onVoiceErrorRef = useRef(onVoiceError);
  const onVoiceEndedRef = useRef(onVoiceEnded);
  const onRequestCompleteRef = useRef(onRequestComplete);

  useEffect(() => {
    onVoiceStartedRef.current = onVoiceStarted;
    onVoicePartialRef.current = onVoicePartial;
    onVoiceTranscriptRef.current = onVoiceTranscript;
    onVoiceChunkRef.current = onVoiceChunk;
    onVoiceProcessingRef.current = onVoiceProcessing;
    onVoiceErrorRef.current = onVoiceError;
    onVoiceEndedRef.current = onVoiceEnded;
    onRequestCompleteRef.current = onRequestComplete;
  }, [
    onVoiceStarted,
    onVoicePartial,
    onVoiceTranscript,
    onVoiceChunk,
    onVoiceProcessing,
    onVoiceError,
    onVoiceEnded,
    onRequestComplete,
  ]);

  // Cleanup audio resources
  const cleanupAudio = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Initialize socket and join focus room
  useEffect(() => {
    const token = sessionStorage.getItem(JWT_STORAGE_KEY);
    if (!token || !focusId) {
      // Cleanup if no token or focusId
      if (socketRef.current) {
        if (currentFocusIdRef.current) {
          console.log('[useFocusVoice] Unsubscribing from focus:', currentFocusIdRef.current);
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
        console.log('[useFocusVoice] Unsubscribing from old focus:', currentFocusIdRef.current);
        socketRef.current.emit('focus:unsubscribe', { focusId: currentFocusIdRef.current });
      }
      console.log('[useFocusVoice] Subscribing to new focus:', focusId);
      socketRef.current.emit('focus:subscribe', { focusId });
      currentFocusIdRef.current = focusId;
      return;
    }

    // Create new socket connection
    if (!socketRef.current) {
      console.log('[useFocusVoice] Creating socket connection to:', CONFIG.apiUrl);
      socketRef.current = io(CONFIG.apiUrl, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketRef.current.on('connect', () => {
        console.log('[useFocusVoice] Connected! Socket ID:', socketRef.current?.id);
        console.log('[useFocusVoice] Subscribing to focus:', focusId);
        socketRef.current?.emit('focus:subscribe', { focusId });
        currentFocusIdRef.current = focusId;
        setConnected(true);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('[useFocusVoice] Disconnected:', reason);
        setConnected(false);
        // Cleanup audio on disconnect
        cleanupAudio();
        setVoiceState((prev) => ({
          ...prev,
          isRecording: false,
          error: 'Socket disconnected',
        }));
      });

      // Voice events
      socketRef.current.on('focus:voice-started', (data: FocusVoiceStartedData) => {
        console.log('[useFocusVoice] Voice started:', data);
        if (data.focusId === currentFocusIdRef.current) {
          setVoiceState((prev) => ({ ...prev, sessionId: data.sessionId }));
          onVoiceStartedRef.current?.(data);
        }
      });

      socketRef.current.on('focus:voice-partial', (data: FocusVoicePartialData) => {
        if (data.focusId === currentFocusIdRef.current) {
          setVoiceState((prev) => ({ ...prev, partialTranscript: data.transcript }));
          onVoicePartialRef.current?.(data);
        }
      });

      socketRef.current.on('focus:voice-transcript', (data: FocusVoiceTranscriptData) => {
        console.log('[useFocusVoice] Voice transcript:', data.transcript);
        if (data.focusId === currentFocusIdRef.current) {
          setVoiceState((prev) => ({
            ...prev,
            finalTranscript: prev.finalTranscript
              ? `${prev.finalTranscript} ${data.transcript}`
              : data.transcript,
            partialTranscript: '',
          }));
          onVoiceTranscriptRef.current?.(data);
        }
      });

      socketRef.current.on('focus:voice-chunk', (data: FocusVoiceChunkData) => {
        console.log('[useFocusVoice] Voice chunk:', data.chunk);
        if (data.focusId === currentFocusIdRef.current) {
          setVoiceState((prev) => ({
            ...prev,
            chunks: [...prev.chunks, data.chunk],
          }));
          onVoiceChunkRef.current?.(data);
        }
      });

      socketRef.current.on('focus:voice-processing', (data: FocusVoiceProcessingData) => {
        console.log('[useFocusVoice] Voice processing:', data);
        if (data.focusId === currentFocusIdRef.current) {
          setVoiceState((prev) => ({ ...prev, isProcessing: true }));
          onVoiceProcessingRef.current?.(data);
        }
      });

      socketRef.current.on('focus:voice-error', (data: FocusVoiceErrorData) => {
        console.error('[useFocusVoice] Voice error:', data);
        if (data.focusId === currentFocusIdRef.current) {
          cleanupAudio();
          setVoiceState((prev) => ({
            ...prev,
            isRecording: false,
            error: data.error,
          }));
          onVoiceErrorRef.current?.(data);
        }
      });

      socketRef.current.on('focus:voice-ended', (data: FocusVoiceEndedData) => {
        console.log('[useFocusVoice] Voice ended:', data);
        if (data.focusId === currentFocusIdRef.current) {
          setVoiceState((prev) => ({
            ...prev,
            isRecording: false,
            finalTranscript: data.fullTranscript,
            chunks: data.chunks,
          }));
          onVoiceEndedRef.current?.(data);
        }
      });

      // Also listen for CRW3 completion
      socketRef.current.on('focus:request-complete', (data: FocusRequestCompleteData) => {
        if (data.focusId === currentFocusIdRef.current) {
          setVoiceState((prev) => ({ ...prev, isProcessing: false }));
          onRequestCompleteRef.current?.(data);
        }
      });
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        if (currentFocusIdRef.current) {
          socketRef.current.emit('focus:unsubscribe', { focusId: currentFocusIdRef.current });
        }
        socketRef.current.disconnect();
        socketRef.current = null;
        currentFocusIdRef.current = null;
      }
      cleanupAudio();
    };
  }, [focusId, cleanupAudio]);

  // Start recording
  const startRecording = useCallback(
    async (recordingOptions: StartRecordingOptions = {}): Promise<string> => {
      const {
        researchEnabled = false,
        referencedBasisIds,
        requestType,
        enableChunking = false,
        autoSubmit = true,
        language = 'en',
      } = recordingOptions;

      if (!socketRef.current) {
        throw new Error('Socket not connected');
      }

      if (!focusId) {
        throw new Error('No focus ID provided');
      }

      // Reset state for new recording
      setVoiceState({
        isRecording: true,
        sessionId: null,
        partialTranscript: '',
        finalTranscript: '',
        chunks: [],
        isProcessing: false,
        error: null,
      });

      return new Promise<string>((resolve, reject) => {
        const startData: FocusVoiceStartData = {
          focusId,
          researchEnabled,
          referencedBasisIds,
          requestType,
          config: {
            language,
            enableChunking,
            autoSubmit,
          },
        };

        socketRef.current!.emit('focus:voice-start', startData, async (ack: FocusVoiceAck) => {
          if (!ack.success) {
            setVoiceState((prev) => ({
              ...prev,
              isRecording: false,
              error: ack.error || 'Failed to start voice session',
            }));
            reject(new Error(ack.error || 'Failed to start voice session'));
            return;
          }

          const sessionId = ack.sessionId!;
          sessionIdRef.current = sessionId;
          setVoiceState((prev) => ({ ...prev, sessionId }));

          try {
            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: {
                sampleRate: 16000,
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true,
              },
            });
            streamRef.current = stream;

            // Create audio context for PCM conversion
            const audioContext = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              if (!socketRef.current || !sessionIdRef.current) return;

              const inputData = e.inputBuffer.getChannelData(0);
              // Convert Float32 to Int16 PCM
              const pcmData = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
              }

              // Send audio chunk to server
              socketRef.current.emit('focus:voice-audio', {
                sessionId: sessionIdRef.current,
                audioChunk: pcmData.buffer,
              });
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            console.log('[useFocusVoice] Recording started, session:', sessionId);
            resolve(sessionId);
          } catch (err) {
            console.error('[useFocusVoice] Microphone access error:', err);
            cleanupAudio();
            setVoiceState((prev) => ({
              ...prev,
              isRecording: false,
              error: 'Microphone access denied',
            }));
            reject(err);
          }
        });
      });
    },
    [focusId, cleanupAudio]
  );

  // Stop recording
  const stopRecording = useCallback(
    async (submitToCRW3: boolean = true): Promise<void> => {
      const sessionId = sessionIdRef.current;
      if (!socketRef.current || !sessionId) {
        console.warn('[useFocusVoice] Cannot stop recording: no active session');
        return;
      }

      console.log('[useFocusVoice] Stopping recording, session:', sessionId);

      // Stop audio processing
      cleanupAudio();

      // End session on server
      socketRef.current.emit('focus:voice-end', { sessionId, submitToCRW3 });

      setVoiceState((prev) => ({ ...prev, isRecording: false }));
      sessionIdRef.current = null;
    },
    [cleanupAudio]
  );

  // Reset state
  const reset = useCallback(() => {
    cleanupAudio();
    sessionIdRef.current = null;
    setVoiceState(initialVoiceState);
  }, [cleanupAudio]);

  return {
    // Connection state
    connected,

    // Voice state
    voiceState,

    // Convenience accessors
    isRecording: voiceState.isRecording,
    sessionId: voiceState.sessionId,
    partialTranscript: voiceState.partialTranscript,
    finalTranscript: voiceState.finalTranscript,
    chunks: voiceState.chunks,
    isProcessing: voiceState.isProcessing,
    error: voiceState.error,

    // Actions
    startRecording,
    stopRecording,
    reset,
  };
}
