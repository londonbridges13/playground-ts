'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  isAnimating: boolean;
  isFading?: boolean;
  color?: string;
  pausedColor?: string;
}

export function RecordingWaveform({
  isAnimating,
  isFading = false,
  color = '#d1d5db',
  pausedColor = '#9ca3af',
}: RecordingWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic bar count based on container width
  const [barCount, setBarCount] = useState(16);
  const [heights, setHeights] = useState<number[]>(() =>
    Array.from({ length: 16 }, () => MIN_HEIGHT)
  );

  // Generate random heights for animation
  const generateRandomHeights = useCallback(
    (count: number) =>
      Array.from({ length: count }, () =>
        MIN_HEIGHT + Math.random() * (MAX_HEIGHT - MIN_HEIGHT)
      ),
    []
  );

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
        // Only set heights on resize, not on isAnimating change
        setHeights(
          isAnimating
            ? generateRandomHeights(count)
            : Array.from({ length: count }, () => MIN_HEIGHT)
        );
      }
    };

    // Initial calculation
    updateBarCount();

    // Observe resize
    const resizeObserver = new ResizeObserver(updateBarCount);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [barCount, isAnimating, generateRandomHeights]);

  // Animation loop
  useEffect(() => {
    if (isAnimating) {
      // Initial random heights with slight delay
      const initialTimeout = setTimeout(() => {
        setHeights(generateRandomHeights(barCount));
      }, 50);

      // Continuous animation
      intervalRef.current = setInterval(() => {
        setHeights(generateRandomHeights(barCount));
      }, 150);

      return () => {
        clearTimeout(initialTimeout);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }

    // When not animating, stop the interval and animate to silence
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Animate transition to minimum height (spring will handle smooth transition)
    setHeights(Array.from({ length: barCount }, () => MIN_HEIGHT));

    return undefined;
  }, [isAnimating, barCount, generateRandomHeights]);

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

