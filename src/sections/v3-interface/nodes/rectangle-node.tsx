'use client';

import { memo, useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------
// Grain Overlay Component
// ----------------------------------------------------------------------

interface RectGrainOverlayProps {
  width: number;
  height: number;
  amount: number;
  blendMode?: 'overlay' | 'soft-light' | 'multiply' | 'screen';
  filterId: string;
  borderRadius: number;
}

const RectGrainOverlay = memo(({ width, height, amount, blendMode = 'overlay', filterId, borderRadius }: RectGrainOverlayProps) => {
  if (amount <= 0) return null;

  const baseFrequency = 0.5 + (amount / 100) * 0.4;
  const opacity = (amount / 100) * 0.4;

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id={filterId} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={baseFrequency}
              numOctaves={4}
              seed={Math.floor(Math.random() * 100)}
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix type="saturate" values="0" in="noise" result="mono" />
          </filter>
        </defs>
      </svg>
      <Box
        sx={{
          position: 'absolute',
          width,
          height,
          borderRadius: `${borderRadius}px`,
          filter: `url(#${filterId})`,
          opacity,
          mixBlendMode: blendMode,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
    </>
  );
});
RectGrainOverlay.displayName = 'RectGrainOverlay';

// ----------------------------------------------------------------------
// Main Rectangle Node Component
// ----------------------------------------------------------------------

export const RectangleNode = memo(({ data, isConnectable, selected, id }: NodeProps) => {
  const nodeIndex = (data.index as number) ?? 0;
  const isExiting = data.isExiting ?? false;
  const exitAnimationType = (data.exitAnimationType as 'slide' | 'shuffle') ?? 'slide';

  // Dimensions
  const width = (data.width as number) ?? 200;
  const height = (data.height as number) ?? 120;
  const borderRadius = (data.borderRadius as number) ?? 16;

  // Image background
  const backgroundImage = (data.backgroundImage as string) ?? null;

  // Background color
  const backgroundColor = (data.backgroundColor as string) ?? '#d0d0d0';

  // Grain props
  const grainAmount = (data.grainAmount as number) ?? 0;
  const grainBlendMode = (data.grainBlendMode as 'overlay' | 'soft-light' | 'multiply' | 'screen') ?? 'overlay';

  // Border
  const borderWidth = (data.borderWidth as number) ?? 4;
  const borderColor = (data.borderColor as string) ?? 'rgba(255, 255, 255, 0.5)';

  // Text
  const textColor = (data.textColor as string) ?? '#000000';

  // Unique IDs for filters
  const grainFilterId = useMemo(() => `rect-grain-${id}`, [id]);

  // Exit animations
  const exitAnimations = {
    slide: {
      scale: 0.3,
      x: 0,
      rotate: 0,
    },
    shuffle: {
      scale: 0.8,
      x: (nodeIndex % 2 === 0 ? -1 : 1) * 300,
      rotate: (nodeIndex % 2 === 0 ? -1 : 1) * 15,
    },
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
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: selected ? '2px solid #1976d2' : 'none',
          outlineOffset: 4,
          filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))',
          borderRadius: `${borderRadius}px`,
          overflow: 'hidden',
        }}
      >
        {/* Background - Image or Color */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: `${borderRadius}px`,
            overflow: 'hidden',
            ...(backgroundImage
              ? {
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {
                  backgroundColor,
                }),
          }}
        />

        {/* Grain Overlay */}
        {grainAmount > 0 && (
          <RectGrainOverlay
            width={width}
            height={height}
            amount={grainAmount}
            blendMode={grainBlendMode}
            filterId={grainFilterId}
            borderRadius={borderRadius}
          />
        )}

        {/* Border */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: `${borderRadius}px`,
            border: `${borderWidth}px solid white`,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />

        {/* Content */}
        <Typography
          variant="body2"
          sx={{
            position: 'relative',
            zIndex: 3,
            textAlign: 'center',
            px: 2,
            fontWeight: 500,
            color: textColor,
          }}
        >
          {data.label}
        </Typography>

        {/* Connection Handles */}
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          style={{ background: '#555', opacity: 0 }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          style={{ background: '#555', opacity: 0 }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          isConnectable={isConnectable}
          style={{ background: '#555', opacity: 0 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          isConnectable={isConnectable}
          style={{ background: '#555', opacity: 0 }}
        />
      </Box>
    </m.div>
  );
});

RectangleNode.displayName = 'RectangleNode';

