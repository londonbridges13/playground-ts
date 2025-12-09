'use client';

import { memo, useMemo } from 'react';
import type { EdgeProps } from '@xyflow/react';
import { m } from 'framer-motion';
import type { Variants } from 'framer-motion';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export interface HandDrawnEdgeData extends Record<string, unknown> {
  /** The hand-drawn SVG path data */
  path: string;
  /** Original viewBox of the path (e.g., "0 0 279 37") */
  viewBox: string;
  /** Stroke color */
  strokeColor?: string;
  /** Stroke width */
  strokeWidth?: number;
  /** Stroke line cap */
  strokeLinecap?: 'butt' | 'round' | 'square';
  /** Animation duration in seconds */
  animationDuration?: number;
  /** Animation delay in seconds */
  animationDelay?: number;
  /** Animation bounce (spring effect) */
  animationBounce?: number;
  /** Whether to reverse the animation direction */
  reverseAnimation?: boolean;
  /** Whether to enable hover animation */
  enableHoverAnimation?: boolean;
}

// ----------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------

/**
 * Parse viewBox string into numeric values
 */
function parseViewBox(viewBox: string): { x: number; y: number; width: number; height: number } {
  const parts = viewBox.split(' ').map(Number);
  return {
    x: parts[0] || 0,
    y: parts[1] || 0,
    width: parts[2] || 100,
    height: parts[3] || 100,
  };
}

/**
 * Calculate the bounding box of an SVG path
 * This is a simplified version that extracts coordinates from the path
 */
function getPathBounds(pathData: string): { minX: number; minY: number; maxX: number; maxY: number } {
  // Extract all numbers from the path
  const numbers = pathData.match(/-?\d+\.?\d*/g)?.map(Number) || [];

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  // Process pairs of numbers as x,y coordinates
  for (let i = 0; i < numbers.length - 1; i += 2) {
    const x = numbers[i];
    const y = numbers[i + 1];
    if (!Number.isNaN(x) && !Number.isNaN(y)) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  return { minX, minY, maxX, maxY };
}

// ----------------------------------------------------------------------
// Hand Drawn Edge Component
// ----------------------------------------------------------------------

/**
 * A hand-drawn style edge that uses a custom SVG path with draw animation.
 * The path is scaled and rotated to fit between source and target nodes.
 */
export const HandDrawnEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps) => {
  const edgeData = (data ?? {}) as HandDrawnEdgeData;

  // Extract props with defaults
  const path = edgeData.path ?? '';
  const viewBox = edgeData.viewBox ?? '0 0 100 100';
  const strokeColor = edgeData.strokeColor ?? '#000000';
  const strokeWidth = edgeData.strokeWidth ?? 1.5;
  const strokeLinecap = edgeData.strokeLinecap ?? 'round';
  const animationDuration = edgeData.animationDuration ?? 1.5;
  const animationDelay = edgeData.animationDelay ?? 0;
  const animationBounce = edgeData.animationBounce ?? 0.3;
  const reverseAnimation = edgeData.reverseAnimation ?? false;
  const enableHoverAnimation = edgeData.enableHoverAnimation ?? false;

  // Calculate transformation values
  const transform = useMemo(() => {
    // Calculate distance and angle between source and target
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Parse the viewBox to get original dimensions
    const vb = parseViewBox(viewBox);

    // Get the actual path bounds for more accurate scaling
    const bounds = getPathBounds(path);
    const pathWidth = bounds.maxX - bounds.minX;
    const pathHeight = bounds.maxY - bounds.minY;

    // Calculate scale to fit the distance
    // Use the path width for scaling
    const scale = distance / (pathWidth || vb.width);

    // Calculate the center offset for the path height
    const centerOffsetY = (bounds.minY + bounds.maxY) / 2;

    return {
      distance,
      angle,
      scale,
      vb,
      bounds,
      pathWidth,
      pathHeight,
      centerOffsetY,
    };
  }, [sourceX, sourceY, targetX, targetY, viewBox, path]);

  if (!path) {
    return null;
  }

  // Animation variants
  const pathVariants: Variants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
      pathOffset: reverseAnimation ? 1 : 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      pathOffset: 0,
      transition: {
        pathLength: {
          type: 'spring',
          duration: animationDuration,
          bounce: animationBounce,
          delay: animationDelay,
        },
        pathOffset: {
          duration: animationDuration,
          delay: animationDelay,
        },
        opacity: {
          duration: animationDuration / 4,
          delay: animationDelay,
        },
      },
    },
  };

  // Hover animation
  const whileHover = enableHoverAnimation
    ? {
        pathLength: [1, 0, 1],
        transition: {
          pathLength: {
            repeat: Infinity,
            duration: 3,
            ease: 'easeInOut' as const,
          },
        },
      }
    : undefined;

  return (
    <g>
      {/* Transform group: translate to source, rotate to target, scale to fit */}
      <g
        transform={`
          translate(${sourceX}, ${sourceY})
          rotate(${transform.angle})
          scale(${transform.scale})
          translate(${-transform.bounds.minX}, ${-transform.centerOffsetY})
        `}
      >
        <m.path
          id={id}
          d={path}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth / transform.scale}
          strokeLinecap={strokeLinecap}
          initial="hidden"
          animate="visible"
          variants={pathVariants}
          whileHover={whileHover}
        />
      </g>
    </g>
  );
});

HandDrawnEdge.displayName = 'HandDrawnEdge';

