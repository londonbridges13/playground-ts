'use client';

import { memo, useMemo, useRef, useState, useLayoutEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import { MagicBorder } from '../components/magic-border';

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

  // Pattern overlay props
  const patternOverlay = (data.patternOverlay as string) ?? null;

  // Background color
  const backgroundColor = (data.backgroundColor as string) ?? '#d0d0d0';

  // Grain props
  const grainAmount = (data.grainAmount as number) ?? 0;
  const grainBlendMode = (data.grainBlendMode as 'overlay' | 'soft-light' | 'multiply' | 'screen') ?? 'overlay';

  // Border
  const borderWidth = (data.borderWidth as number) ?? 4;
  const borderColor = (data.borderColor as string) ?? 'rgba(255, 255, 255, 0.5)';

  // Magic Border
  const magicBorder = data.magicBorder ?? false;
  const magicGradientSize = (data.magicGradientSize as number) ?? 200;
  const magicGradientFrom = (data.magicGradientFrom as string) ?? '#9E7AFF';
  const magicGradientTo = (data.magicGradientTo as string) ?? '#FE8BBB';

  // Text
  const textColor = (data.textColor as string) ?? '#000000';

  // Shine Effect
  const shine = data.shine ?? false;

  // Unique IDs for filters
  const grainFilterId = useMemo(() => `rect-grain-${id}`, [id]);

  // Chip ref and size for dynamic fade mask
  const chipRef = useRef<HTMLDivElement>(null);
  const [chipSize, setChipSize] = useState({ width: 80, height: 32 });

  // Hover state for showing handles
  const [isHovered, setIsHovered] = useState(false);

  useLayoutEffect(() => {
    if (chipRef.current && patternOverlay) {
      const rect = chipRef.current.getBoundingClientRect();
      setChipSize({ width: rect.width, height: rect.height });
    }
  }, [data.label, patternOverlay]);

  // Calculate fade mask radii based on chip size (with padding for smooth fade)
  const fadePadding = 30; // Extra padding around chip for fade effect
  const fadeRadiusX = ((chipSize.width / 2 + fadePadding) / width) * 100;
  const fadeRadiusY = ((chipSize.height / 2 + fadePadding) / height) * 100;

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

        {/* Shine Effect Overlay */}
        {shine && (
          <m.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
              pointerEvents: 'none',
              zIndex: 100,
            }}
          />
        )}

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

        {/* Pattern Overlay with radial fade mask */}
        {patternOverlay && (
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
              opacity: 0.8,
              borderRadius: `${borderRadius}px`,
            }}
          >
            <defs>
              <clipPath id={`pattern-clip-${id}`}>
                <rect width={width} height={height} rx={borderRadius} />
              </clipPath>
              {/* Radial gradient for fade mask - sized to chip dimensions */}
              <radialGradient
                id={`pattern-fade-${id}`}
                cx="50%"
                cy="50%"
                rx={`${fadeRadiusX}%`}
                ry={`${fadeRadiusY}%`}
              >
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="50%" stopColor="white" stopOpacity="0.3" />
                <stop offset="80%" stopColor="white" stopOpacity="0.7" />
                <stop offset="100%" stopColor="white" stopOpacity="1" />
              </radialGradient>
              <mask id={`pattern-mask-${id}`}>
                <rect width={width} height={height} fill={`url(#pattern-fade-${id})`} />
              </mask>
            </defs>
            {/* Pattern image with radial fade mask */}
            <image
              href={patternOverlay}
              width={width}
              height={height}
              clipPath={`url(#pattern-clip-${id})`}
              mask={`url(#pattern-mask-${id})`}
              preserveAspectRatio="xMidYMid slice"
            />
            {/* Red border ellipse at the edge of the fade mask (disabled - uncomment to debug) */}
            {/* <ellipse
              cx={width / 2}
              cy={height / 2}
              rx={(chipSize.width / 2) + fadePadding}
              ry={(chipSize.height / 2) + fadePadding}
              fill="none"
              stroke="red"
              strokeWidth="2"
            /> */}
          </svg>
        )}

        {/* Border - Magic or Static */}
        {magicBorder ? (
          <MagicBorder
            width={width}
            height={height}
            borderRadius={borderRadius}
            borderWidth={borderWidth}
            gradientSize={magicGradientSize}
            gradientFrom={magicGradientFrom}
            gradientTo={magicGradientTo}
          />
        ) : (
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
        )}

        {/* Content */}
        {patternOverlay ? (
          <Chip
            ref={chipRef}
            label={data.label as string}
            sx={{
              position: 'relative',
              zIndex: 3,
              fontWeight: 600,
              backgroundColor: 'transparent',
              color: textColor,
              fontSize: '0.875rem',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          />
        ) : (
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
            {data.label as string}
          </Typography>
        )}

        {/* Invisible center handle - covers entire node for easy drop target */}
        <Handle
          type="target"
          position={Position.Top}
          id="center"
          isConnectable={isConnectable}
          style={{
            width,
            height,
            background: 'transparent',
            border: 'none',
            borderRadius,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0,
            pointerEvents: 'all',
          }}
        />
        {/* Connection Handles - visible on hover */}
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          style={{
            width: 12,
            height: 12,
            background: '#6366f1',
            border: '2px solid #fff',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          style={{
            width: 12,
            height: 12,
            background: '#6366f1',
            border: '2px solid #fff',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          isConnectable={isConnectable}
          style={{
            width: 12,
            height: 12,
            background: '#6366f1',
            border: '2px solid #fff',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          isConnectable={isConnectable}
          style={{
            width: 12,
            height: 12,
            background: '#6366f1',
            border: '2px solid #fff',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        />
      </Box>
    </m.div>
  );
});

RectangleNode.displayName = 'RectangleNode';

