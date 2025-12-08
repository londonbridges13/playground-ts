'use client';

import { useState, memo, useCallback, useMemo } from 'react';
import { useViewport } from '@xyflow/react';
import Box from '@mui/material/Box';

// ----------------------------------------------------------------------
// Interactive Grid Pattern Component
// ----------------------------------------------------------------------

interface InteractiveGridPatternProps {
  /** Width of each grid square in pixels */
  squareSize?: number;
  /** Stroke color for grid lines */
  strokeColor?: string;
  /** Fill color when hovering a square */
  hoverFillColor?: string;
  /** Current hovered square index (controlled from parent via onPaneMouseMove) */
  hoveredSquare?: number | null;
}

/**
 * InteractiveGridPattern renders an SVG grid with interactive hover effects.
 * Must be rendered inside ReactFlow to access viewport transforms.
 * Hover state is controlled by parent component using ReactFlow's onPaneMouseMove.
 */
export const InteractiveGridPattern = memo(({
  squareSize = 40,
  strokeColor = 'rgba(150, 150, 150, 0.3)',
  hoverFillColor = 'rgba(150, 150, 150, 0.15)',
  hoveredSquare = null,
}: InteractiveGridPatternProps) => {
  const { x, y, zoom } = useViewport();

  // Calculate grid dimensions to cover a large area (will be clipped by viewport)
  // We need enough squares to cover the visible area plus buffer for panning
  const gridExtent = 5000; // Large enough to cover most pan ranges
  const halfExtent = gridExtent / 2;

  // Calculate number of squares needed
  const squaresPerSide = Math.ceil(gridExtent / squareSize);
  const totalSquares = squaresPerSide * squaresPerSide;

  // Memoize the grid squares to avoid recalculating on every render
  const gridSquares = useMemo(() => {
    const squares = [];
    for (let i = 0; i < totalSquares; i++) {
      const col = i % squaresPerSide;
      const row = Math.floor(i / squaresPerSide);
      const squareX = col * squareSize - halfExtent;
      const squareY = row * squareSize - halfExtent;
      squares.push({ index: i, x: squareX, y: squareY });
    }
    return squares;
  }, [squareSize, squaresPerSide, totalSquares, halfExtent]);

  return (
    <Box
      component="svg"
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'visible',
        pointerEvents: 'none', // Let ReactFlow handle events
      }}
    >
      <g
        transform={`translate(${x}, ${y}) scale(${zoom})`}
        style={{ transformOrigin: '0 0' }}
      >
        {gridSquares.map(({ index, x: squareX, y: squareY }) => {
          const isHovered = hoveredSquare === index;

          return (
            <rect
              key={index}
              x={squareX}
              y={squareY}
              width={squareSize}
              height={squareSize}
              fill={isHovered ? hoverFillColor : 'transparent'}
              stroke={strokeColor}
              strokeWidth={1 / zoom} // Keep stroke width consistent regardless of zoom
              style={{
                transition: isHovered
                  ? 'fill 0.1s ease-in-out'
                  : 'fill 1s ease-in-out',
              }}
            />
          );
        })}
      </g>
    </Box>
  );
});

InteractiveGridPattern.displayName = 'InteractiveGridPattern';

// ----------------------------------------------------------------------
// Helper function to calculate hovered square from mouse position
// ----------------------------------------------------------------------

export function calculateHoveredSquare(
  clientX: number,
  clientY: number,
  containerRect: DOMRect,
  viewport: { x: number; y: number; zoom: number },
  squareSize: number
): number | null {
  // Convert client coordinates to flow coordinates
  const flowX = (clientX - containerRect.left - viewport.x) / viewport.zoom;
  const flowY = (clientY - containerRect.top - viewport.y) / viewport.zoom;

  // Calculate grid extent (must match the component)
  const gridExtent = 5000;
  const halfExtent = gridExtent / 2;
  const squaresPerSide = Math.ceil(gridExtent / squareSize);

  // Calculate which square the mouse is over
  const col = Math.floor((flowX + halfExtent) / squareSize);
  const row = Math.floor((flowY + halfExtent) / squareSize);

  // Check if within bounds
  if (col < 0 || col >= squaresPerSide || row < 0 || row >= squaresPerSide) {
    return null;
  }

  return row * squaresPerSide + col;
}

