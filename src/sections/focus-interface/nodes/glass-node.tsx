// src/sections/focus-interface/nodes/glass-node.tsx

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Node dimensions
const NODE_WIDTH = 200;
const NODE_HEIGHT = 200;

// Helper to convert absolute coordinates to relative node coordinates
const getRelativeCoordinates = (absoluteX: number, absoluteY: number, nodeX: number, nodeY: number) => ({
  x: absoluteX - nodeX,
  y: absoluteY - nodeY,
});

// ----------------------------------------------------------------------

export const GlassNode = memo(({ data, id, xPos = 0, yPos = 0 }: NodeProps) => (
  <Box
    sx={{
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      opacity: data.opacity || 0.9,
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: 2,
      position: 'relative',
      padding: 2,
    }}
  >
    {/* Handles */}
    {data.handles?.sources?.map((handle: any) => {
      const relCoords = getRelativeCoordinates(handle.coordinates.x, handle.coordinates.y, xPos, yPos);
      return (
        <Handle
          key={handle.id}
          type="source"
          position={handle.position as Position}
          id={handle.id}
          style={{
            left: `${relCoords.x}px`,
            top: `${relCoords.y}px`,
          }}
        />
      );
    })}

    {data.handles?.targets?.map((handle: any) => {
      const relCoords = getRelativeCoordinates(handle.coordinates.x, handle.coordinates.y, xPos, yPos);
      return (
        <Handle
          key={handle.id}
          type="target"
          position={handle.position as Position}
          id={handle.id}
          style={{
            left: `${relCoords.x}px`,
            top: `${relCoords.y}px`,
          }}
        />
      );
    })}

    <Typography variant="h6" fontWeight="bold">
      {data.label}
    </Typography>
    {data.description && (
      <Typography variant="body2" sx={{ mt: 1 }}>
        {data.description}
      </Typography>
    )}
    {data.stage && (
      <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
        Stage: {data.stage}
      </Typography>
    )}
  </Box>
));

GlassNode.displayName = 'GlassNode';

