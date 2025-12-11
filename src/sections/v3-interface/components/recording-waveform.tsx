'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { m } from 'framer-motion';

// Constants adapted from line-graph/source.tsx
const BAR_WIDTH = 2;
const BAR_GAP = 4;
const MAX_HEIGHT = 24;
const MIN_HEIGHT = 4;
const BAR_STEP = BAR_WIDTH + BAR_GAP; // Total space per bar

// Spring config inspired by line-graph's POINTER_SPRING
const WAVEFORM_SPRING = { stiffness: 300, damping: 25 };

interface RecordingWaveformProps {
  /** Whether the waveform should be animating (recording state) */
  isAnimating: boolean;
  /** Whether the waveform is fading out */
  isFading?: boolean;
  /** Audio levels from the analyzer (0-1 for each band) */
  audioLevels?: number[];
  /** Color when animating */
  color?: string;
  /** Color when paused */
  pausedColor?: string;
}

export function RecordingWaveform({
  isAnimating,
  isFading = false,
  audioLevels,
  color = '#d1d5db',
  pausedColor = '#9ca3af',
}: RecordingWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic bar count based on container width
  const [barCount, setBarCount] = useState(16);

  // Observe container width and calculate bar count
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const updateBarCount = () => {
      const width = container.offsetWidth;
      // Calculate how many bars fit in the available width
      const count = Math.max(1, Math.floor(width / BAR_STEP));
      if (count !== barCount) {
        setBarCount(count);
      }
    };

    // Initial calculation
    updateBarCount();

    // Observe resize
    const resizeObserver = new ResizeObserver(updateBarCount);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [barCount]);

  // Calculate heights from audio levels or use minimum
  const heights = useMemo(() => {
    if (!isAnimating || !audioLevels || audioLevels.length === 0) {
      // Not animating or no audio data - return minimum heights
      return Array.from({ length: barCount }, () => MIN_HEIGHT);
    }

    // Only use voice-range frequencies (~0-4kHz = first 25% of bins)
    // This stretches voice content across all bars instead of bunching on the left
    const voiceRangeFraction = 0.55;
    const voiceBins = Math.floor(audioLevels.length * voiceRangeFraction);
    const step = voiceBins / barCount;

    // Map audio levels to bar heights
    const result: number[] = [];

    for (let i = 0; i < barCount; i++) {
      // Sample from voice-range bins only
      const index = Math.floor(i * step);
      const level = audioLevels[Math.min(index, voiceBins - 1)] || 0;
      // Map level (0-1) to height (MIN_HEIGHT to MAX_HEIGHT)
      // Apply some amplification for better visual effect
      const amplifiedLevel = Math.min(1, level * 2.5);
      const height = MIN_HEIGHT + amplifiedLevel * (MAX_HEIGHT - MIN_HEIGHT);
      result.push(height);
    }

    return result;
  }, [isAnimating, audioLevels, barCount]);

  return (
    <m.div
      ref={containerRef}
      animate={{ opacity: isFading ? 0 : 1, filter: isFading ? 'blur(8px)' : 'blur(0px)' }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        gap: `${BAR_GAP}px`,
        height: MAX_HEIGHT,
        width: '63%',
        position: 'absolute',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        paddingLeft: 16,
        paddingRight: 32,
      }}
    >
      {heights.map((height, i) => (
        <m.div
          key={i}
          animate={{ height }}
          transition={{
            type: 'spring',
            ...WAVEFORM_SPRING,
          }}
          style={{
            width: BAR_WIDTH,
            flexShrink: 0,
            background: isAnimating
              ? `linear-gradient(to top, ${color} 0%, ${color}80 50%, ${color}33 100%)`
              : `linear-gradient(to top, ${pausedColor} 0%, ${pausedColor}80 50%, ${pausedColor}33 100%)`,
            borderRadius: 1,
          }}
        />
      ))}
    </m.div>
  );
}

