import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const HexagonNode = memo(({ data, isConnectable, selected }: NodeProps) => {
  const nodeOpacity = data.opacity ?? 1;
  const nodeIndex = data.index ?? 0;
  const isExiting = data.isExiting ?? false;
  const exitAnimationType = data.exitAnimationType ?? 'slide';

  // Define exit animations
  const exitAnimations = {
    slide: {
      opacity: 0,
      scale: 0.3,
      y: 20,
      x: 0,
      rotate: 0,
    },
    shuffle: {
      opacity: 0,
      scale: 0.8,
      x: (nodeIndex % 2 === 0 ? -1 : 1) * 300,
      rotate: (nodeIndex % 2 === 0 ? -1 : 1) * 15,
      y: Math.random() * 100 - 50,
    }
  };

  return (
    <m.div
      initial={{ scale: 0.3, x: 0, rotate: 0 }}
      animate={
        isExiting
          ? {
              scale: exitAnimations[exitAnimationType].scale,
              x: exitAnimations[exitAnimationType].x,
              rotate: exitAnimations[exitAnimationType].rotate,
              opacity: 0,
            }
          : { scale: 1, x: 0, rotate: 0 }
      }
      transition={{
        duration: isExiting && exitAnimationType === 'shuffle' ? 0.7 : 0.5,
        delay: nodeIndex * 0.08,
        ease: isExiting && exitAnimationType === 'shuffle'
          ? [0.6, 0.01, 0.05, 0.95]
          : [0.43, 0.13, 0.23, 0.96],
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 178,
          height: 174,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: selected ? '2px solid #1976d2' : 'none',
          outlineOffset: 4,
          filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))',
        }}
      >
      {/* SVG with rounded hexagon using filter */}
      <svg
        width="178"
        height="174"
        viewBox="0 0 178 174"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <filter id="round">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>

        {/* Hexagon fill */}
        <path
          fill="#d0d0d0"
          d="M89 10 L160 50 L160 124 L89 164 L18 124 L18 50 Z"
          filter="url(#round)"
        />

        {/* Hexagon border */}
        <path
          fill="none"
          stroke="white"
          strokeWidth="4"
          strokeOpacity="1.0"
          d="M89 10 L160 50 L160 124 L89 164 L18 124 L18 50 Z"
          filter="url(#round)"
        />
      </svg>

      {/* Content */}
      <Typography
        variant="body2"
        sx={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          px: 2,
          fontWeight: 500,
        }}
      >
        {data.label}
      </Typography>

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
    </m.div>
  );
});

HexagonNode.displayName = 'HexagonNode';

