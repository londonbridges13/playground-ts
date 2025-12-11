'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseAudioAnalyzerOptions {
  /** Number of frequency bands to analyze (default: 32) */
  bandCount?: number;
  /** Smoothing time constant for the analyzer (0-1, default: 0.8) */
  smoothingTimeConstant?: number;
  /** Minimum decibel value (default: -90) */
  minDecibels?: number;
  /** Maximum decibel value (default: -10) */
  maxDecibels?: number;
  /** Update interval in ms (default: 50) */
  updateInterval?: number;
}

interface UseAudioAnalyzerReturn {
  /** Array of audio levels (0-1) for each frequency band */
  audioLevels: number[];
  /** Whether the analyzer is currently active */
  isActive: boolean;
  /** Start the audio analyzer (requests microphone permission) */
  start: () => Promise<void>;
  /** Stop the audio analyzer and release microphone */
  stop: () => void;
  /** Error message if microphone access failed */
  error: string | null;
}

export function useAudioAnalyzer(options: UseAudioAnalyzerOptions = {}): UseAudioAnalyzerReturn {
  const {
    bandCount = 32,
    smoothingTimeConstant = 0.8,
    minDecibels = -90,
    maxDecibels = -10,
    updateInterval = 50,
  } = options;

  const [audioLevels, setAudioLevels] = useState<number[]>(() =>
    Array.from({ length: bandCount }, () => 0)
  );
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for audio resources
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyzerRef.current = null;
    setAudioLevels(Array.from({ length: bandCount }, () => 0));
    setIsActive(false);
  }, [bandCount]);

  // Start the audio analyzer
  const start = useCallback(async () => {
    try {
      setError(null);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create audio context and analyzer
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256; // Gives us 128 frequency bins
      analyzer.smoothingTimeConstant = smoothingTimeConstant;
      analyzer.minDecibels = minDecibels;
      analyzer.maxDecibels = maxDecibels;
      analyzerRef.current = analyzer;

      // Connect microphone to analyzer
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyzer);

      // Start analyzing
      setIsActive(true);

      const dataArray = new Uint8Array(analyzer.frequencyBinCount);

      const analyze = () => {
        if (!analyzerRef.current) return;

        analyzerRef.current.getByteFrequencyData(dataArray);

        // Map frequency data to our band count
        const binSize = Math.floor(dataArray.length / bandCount);
        const levels: number[] = [];

        for (let i = 0; i < bandCount; i++) {
          // Average the bins for this band
          let sum = 0;
          for (let j = 0; j < binSize; j++) {
            sum += dataArray[i * binSize + j];
          }
          // Normalize to 0-1
          levels.push(sum / binSize / 255);
        }

        setAudioLevels(levels);
      };

      // Use interval for consistent updates
      intervalRef.current = setInterval(analyze, updateInterval);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to access microphone';
      setError(message);
      console.error('[useAudioAnalyzer] Error:', message);
      cleanup();
    }
  }, [bandCount, smoothingTimeConstant, minDecibels, maxDecibels, updateInterval, cleanup]);

  // Stop the audio analyzer
  const stop = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  return {
    audioLevels,
    isActive,
    start,
    stop,
    error,
  };
}

