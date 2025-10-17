import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const GlassNode = memo(({ data, isConnectable, selected }: NodeProps) => {
  const nodeOpacity = data.opacity ?? 1;

  return (
    <Box
      sx={{
        position: 'relative',
        width: 200,
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        outline: selected ? '2px solid #1976d2' : 'none',
        outlineOffset: 4,
        opacity: nodeOpacity,
        isolation: 'isolate',
      }}
    >
      {/* Glass effect container */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '28px',
          isolation: 'isolate',
          boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.2)',
          
          // Inner shadow + tint layer
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            borderRadius: '28px',
            boxShadow: 'inset 0 0 20px -5px rgba(255, 255, 255, 0.7)',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          },
          
          // Backdrop blur + SVG distortion layer
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            zIndex: -1,
            borderRadius: '28px',
            backdropFilter: 'blur(8px)',
            filter: 'url(#glass-node-distortion)',
            isolation: 'isolate',
            WebkitBackdropFilter: 'blur(8px)',
            WebkitFilter: 'url(#glass-node-distortion)',
          },
        }}
      />

      {/* Content */}
      <Typography
        variant="h6"
        sx={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          px: 2,
          fontWeight: 600,
          color: 'rgba(0, 0, 0, 0.8)',
          textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
        }}
      >
        {data.label}
      </Typography>

      {/* SVG Filter Definition for Glass Distortion */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="0" 
        height="0" 
        style={{ position: 'absolute', overflow: 'hidden' }}
      >
        <defs>
          <filter id="glass-node-distortion" x="0%" y="0%" width="100%" height="100%">
            {/* Generate fractal noise for organic distortion */}
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.008 0.008"
              numOctaves="2" 
              seed="92" 
              result="noise" 
            />
            
            {/* Blur the noise for smoother liquid effect */}
            <feGaussianBlur 
              in="noise" 
              stdDeviation="2" 
              result="blurred" 
            />
            
            {/* Apply displacement to create liquid glass distortion */}
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="blurred" 
              scale="77"
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
          </filter>
        </defs>
      </svg>

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ background: '#555', top: 10, opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ background: '#555', bottom: 10, opacity: 0 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        style={{ background: '#555', left: 30 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        style={{ background: '#555', right: 30 }}
      />
    </Box>
  );
});

GlassNode.displayName = 'GlassNode';

