// src/sections/focus-interface/nodes/appstore-node.tsx

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Node dimensions
const NODE_WIDTH = 240;
const NODE_HEIGHT = 320;

// Helper to convert absolute coordinates to relative node coordinates
const getRelativeCoordinates = (absoluteX: number, absoluteY: number, nodeX: number, nodeY: number) => ({
  x: absoluteX - nodeX,
  y: absoluteY - nodeY,
});

// ----------------------------------------------------------------------

export const AppStoreNode = memo(({ data, id, xPos = 0, yPos = 0 }: NodeProps) => (
  <Box
    sx={{
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      opacity: data.opacity || 1,
      backgroundColor: data.backgroundColor || 'grey.800',
      borderRadius: 3,
      overflow: 'hidden',
      position: 'relative',
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

    {data.imageUrl && (
      <Box sx={{ height: 192 }}>
        <img
          src={data.imageUrl}
          alt={data.label}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>
    )}
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight="bold" color="white">
        {data.label}
      </Typography>
      {data.description && (
        <Typography variant="body2" color="grey.300" sx={{ mt: 1 }}>
          {data.description}
        </Typography>
      )}
      {data.amount && (
        <Typography variant="body2" color="success.main" fontWeight="bold" sx={{ mt: 1 }}>
          {data.amount}
        </Typography>
      )}
      {data.category && (
        <Typography variant="caption" color="grey.400" sx={{ mt: 0.5, display: 'block' }}>
          {data.category}
        </Typography>
      )}
    </Box>
  </Box>
));

AppStoreNode.displayName = 'AppStoreNode';

