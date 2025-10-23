// src/sections/focus-interface/nodes/hexagon-node.tsx

import { memo } from 'react';
import { Handle, Position, useNode } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Node dimensions
const NODE_WIDTH = 178;
const NODE_HEIGHT = 174;

// Helper to convert absolute coordinates to relative node coordinates
const getRelativeCoordinates = (absoluteX: number, absoluteY: number, nodeX: number, nodeY: number) => ({
  x: absoluteX - nodeX,
  y: absoluteY - nodeY,
});

// ----------------------------------------------------------------------

export const HexagonNode = memo(({ data, id, xPos = 0, yPos = 0 }: NodeProps) => (
  <Box
    sx={{
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      opacity: data.opacity || 1,
      backgroundColor: data.backgroundColor || 'primary.main',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: 2,
      borderRadius: 1,
    }}
  >
    {/* Render handles at relative coordinates */}
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

    <Typography variant="h6" color="white" textAlign="center">
      {data.label}
    </Typography>
    {data.description && (
      <Typography variant="caption" color="white" textAlign="center" sx={{ mt: 1 }}>
        {data.description}
      </Typography>
    )}
    {data.importance && (
      <Typography variant="caption" color="white" sx={{ mt: 1 }}>
        Importance: {data.importance}
      </Typography>
    )}
  </Box>
));

HexagonNode.displayName = 'HexagonNode';

