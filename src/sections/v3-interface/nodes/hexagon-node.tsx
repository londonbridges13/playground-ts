'use client';

import { memo, useMemo, useRef, useState, useLayoutEffect } from 'react';
import { Handle, Position, useConnection, useNodeId } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import { MagicHexBorder } from '../components/magic-border';

// ----------------------------------------------------------------------
// Marble/Bauhaus Background Component
// ----------------------------------------------------------------------

interface MarbleBackgroundProps {
  clipPathId: string;
  baseColor?: string;
  accentColor1?: string;
  accentColor2?: string;
  filterId: string;
}

const MarbleBackground = memo(({
  clipPathId,
  baseColor = '#b5f4bc',
  accentColor1 = '#fff19e',
  accentColor2 = '#ffdc8a',
  filterId,
}: MarbleBackgroundProps) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        width: 178,
        height: 174,
        clipPath: `url(#${clipPathId})`,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <svg
        viewBox="0 0 178 174"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="178"
        height="174"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <filter id={filterId} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="12" result="effect1_foregroundBlur" />
          </filter>
        </defs>

        {/* Base color */}
        <rect width="178" height="174" fill={baseColor} />

        {/* Accent shape 1 */}
        <path
          filter={`url(#${filterId})`}
          d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z"
          fill={accentColor1}
          transform="translate(49 47) rotate(-320 89 87) scale(2.2)"
        />

        {/* Accent shape 2 with overlay blend */}
        <path
          filter={`url(#${filterId})`}
          d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z"
          fill={accentColor2}
          transform="translate(40 40) rotate(-300 89 87) scale(2.2)"
          style={{ mixBlendMode: 'overlay' }}
        />
      </svg>
    </Box>
  );
});
MarbleBackground.displayName = 'MarbleBackground';

// ----------------------------------------------------------------------
// Hexagon Mesh Gradient Component
// ----------------------------------------------------------------------

interface HexMeshGradientProps {
  colors: [string, string, string, string];
  speed?: number;
  amplitude?: number;
  clipPathId: string;
}

const HexMeshGradient = memo(({ colors, speed = 1, amplitude = 50, clipPathId }: HexMeshGradientProps) => {
  const [c1, c2, c3, c4] = colors;
  const baseDuration = 8 / speed;
  const moveRange = (amplitude / 100) * 30;

  return (
    <Box
      sx={{
        position: 'absolute',
        width: 178,
        height: 174,
        clipPath: `url(#${clipPathId})`,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Base layer */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`,
        }}
      />

      {/* Animated blob 1 */}
      <m.div
        style={{
          position: 'absolute',
          width: '140%',
          height: '140%',
          left: '-20%',
          top: '-20%',
          background: `radial-gradient(circle at center, ${c1} 0%, transparent 70%)`,
          opacity: 0.8,
        }}
        animate={{
          x: [`0%`, `${moveRange}%`, `0%`, `-${moveRange}%`, `0%`],
          y: [`0%`, `-${moveRange}%`, `${moveRange}%`, `0%`, `0%`],
        }}
        transition={{ duration: baseDuration, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Animated blob 2 */}
      <m.div
        style={{
          position: 'absolute',
          width: '120%',
          height: '120%',
          right: '-10%',
          top: '-10%',
          background: `radial-gradient(circle at center, ${c2} 0%, transparent 70%)`,
          opacity: 0.7,
        }}
        animate={{
          x: [`0%`, `-${moveRange}%`, `${moveRange}%`, `0%`, `0%`],
          y: [`0%`, `${moveRange}%`, `0%`, `-${moveRange}%`, `0%`],
        }}
        transition={{ duration: baseDuration * 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />

      {/* Animated blob 3 */}
      <m.div
        style={{
          position: 'absolute',
          width: '130%',
          height: '130%',
          left: '-15%',
          bottom: '-15%',
          background: `radial-gradient(circle at center, ${c3} 0%, transparent 70%)`,
          opacity: 0.75,
        }}
        animate={{
          x: [`0%`, `${moveRange * 0.8}%`, `-${moveRange * 0.8}%`, `0%`],
          y: [`0%`, `-${moveRange * 0.6}%`, `${moveRange * 0.6}%`, `0%`],
        }}
        transition={{ duration: baseDuration * 0.9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Animated blob 4 */}
      <m.div
        style={{
          position: 'absolute',
          width: '110%',
          height: '110%',
          right: '-5%',
          bottom: '-5%',
          background: `radial-gradient(circle at center, ${c4} 0%, transparent 70%)`,
          opacity: 0.65,
        }}
        animate={{
          x: [`0%`, `-${moveRange * 0.7}%`, `0%`, `${moveRange * 0.7}%`, `0%`],
          y: [`0%`, `${moveRange * 0.5}%`, `-${moveRange * 0.5}%`, `0%`, `0%`],
        }}
        transition={{ duration: baseDuration * 1.1, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />
    </Box>
  );
});
HexMeshGradient.displayName = 'HexMeshGradient';

// ----------------------------------------------------------------------
// Hexagon Grain Overlay Component
// ----------------------------------------------------------------------

interface HexGrainOverlayProps {
  amount: number;
  blendMode?: 'overlay' | 'soft-light' | 'multiply' | 'screen';
  filterId: string;
  clipPathId: string;
}

const HexGrainOverlay = memo(({ amount, blendMode = 'overlay', filterId, clipPathId }: HexGrainOverlayProps) => {
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
          width: 178,
          height: 174,
          clipPath: `url(#${clipPathId})`,
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
HexGrainOverlay.displayName = 'HexGrainOverlay';

// ----------------------------------------------------------------------
// Hexagon Path (same as focus-interface)
// ----------------------------------------------------------------------

const HEX_PATH = 'M89 10 L160 50 L160 124 L89 164 L18 124 L18 50 Z';

// ----------------------------------------------------------------------
// Main Hexagon Node Component
// ----------------------------------------------------------------------

export const HexagonNode = memo(({ data, isConnectable, selected, id }: NodeProps) => {
  const nodeIndex = (data.index as number) ?? 0;
  const isExiting = data.isExiting ?? false;
  const exitAnimationType = (data.exitAnimationType as 'slide' | 'shuffle') ?? 'slide';

  // Mesh gradient props
  const meshGradient = data.meshGradient ?? false;
  const meshColors = (data.meshColors as [string, string, string, string]) ?? ['#667eea', '#764ba2', '#f093fb', '#f5576c'];
  const meshSpeed = (data.meshSpeed as number) ?? 1;
  const meshAmplitude = (data.meshAmplitude as number) ?? 50;

  // Marble background props
  const marbleBackground = data.marbleBackground ?? false;
  const marbleBaseColor = (data.marbleBaseColor as string) ?? '#b5f4bc';
  const marbleAccent1 = (data.marbleAccent1 as string) ?? '#fff19e';
  const marbleAccent2 = (data.marbleAccent2 as string) ?? '#ffdc8a';

  // Image background props
  const backgroundImage = (data.backgroundImage as string) ?? null;

  // Pattern overlay props
  const patternOverlay = (data.patternOverlay as string) ?? null;

  // Grain props
  const grainAmount = (data.grainAmount as number) ?? 0;
  const grainBlendMode = (data.grainBlendMode as 'overlay' | 'soft-light' | 'multiply' | 'screen') ?? 'overlay';

  // Background color (used when no mesh gradient or marble)
  const backgroundColor = (data.backgroundColor as string) ?? '#d0d0d0';

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

  // Floating Handles
  const showFloatingHandles = data.showFloatingHandles ?? false;
  const handleSize = (data.handleSize as number) ?? 16;
  const handleColor = (data.handleColor as string) ?? '#d1d5db';
  const handleOffset = (data.handleOffset as number) ?? 24;

  // Unique IDs for filters
  const clipPathId = useMemo(() => `hex-clip-${id}`, [id]);
  const grainFilterId = useMemo(() => `hex-grain-${id}`, [id]);
  const roundFilterId = useMemo(() => `hex-round-${id}`, [id]);
  const marbleFilterId = useMemo(() => `hex-marble-${id}`, [id]);
  const magicBorderId = useMemo(() => `hex-magic-border-${id}`, [id]);

  // Chip ref and size for dynamic fade mask
  const chipRef = useRef<HTMLDivElement>(null);
  const [chipSize, setChipSize] = useState({ width: 80, height: 32 });

  // Hover state for showing handles
  const [isHovered, setIsHovered] = useState(false);

  // Connection target detection for visual feedback
  const connection = useConnection();
  const nodeId = useNodeId();
  const isConnectionTarget = connection.inProgress && connection.toNode?.id === nodeId;

  // Hexagon dimensions
  const hexWidth = 178;
  const hexHeight = 174;

  useLayoutEffect(() => {
    if (chipRef.current && patternOverlay) {
      const rect = chipRef.current.getBoundingClientRect();
      setChipSize({ width: rect.width, height: rect.height });
    }
  }, [data.label, patternOverlay]);

  // Calculate fade mask radii based on chip size (with padding for smooth fade)
  const fadePadding = 30; // Extra padding around chip for fade effect
  const fadeRadiusX = ((chipSize.width / 2 + fadePadding) / hexWidth) * 100;
  const fadeRadiusY = ((chipSize.height / 2 + fadePadding) / hexHeight) * 100;

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
          : {
              scale: isConnectionTarget ? 1.10 : 1,
              x: 0,
              rotate: 0,
              filter: isConnectionTarget
                ? [
                    'drop-shadow(0 0 3px rgba(158, 122, 255, 0.6)) drop-shadow(0 0 8px rgba(158, 122, 255, 0.4))',
                    'drop-shadow(0 0 8px rgba(158, 122, 255, 0.8)) drop-shadow(0 0 16px rgba(158, 122, 255, 0.5))',
                    'drop-shadow(0 0 3px rgba(158, 122, 255, 0.6)) drop-shadow(0 0 8px rgba(158, 122, 255, 0.4))',
                  ]
                : 'drop-shadow(0 0 0px rgba(158, 122, 255, 0))',
            }
      }
      transition={{
        duration: isExiting && exitAnimationType === 'shuffle' ? 0.7 : 0.5,
        delay: nodeIndex * 0.08,
        ease: isExiting && exitAnimationType === 'shuffle'
          ? [0.6, 0.01, 0.05, 0.95]
          : [0.43, 0.13, 0.23, 0.96],
        scale: { type: 'spring', stiffness: 300, damping: 20 },
        filter: isConnectionTarget
          ? { repeat: Infinity, duration: 1.3, ease: 'easeInOut' }
          : { duration: 0.2 },
      }}
      style={{ width: hexWidth, height: hexHeight }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box
        sx={{
          position: 'relative',
          width: 178,
          height: 174,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))',
        }}
      >
        {/* Hexagonal Selection Outline */}
        {selected && (
          <svg
            width="190"
            height="186"
            viewBox="0 0 190 186"
            style={{
              position: 'absolute',
              top: -6,
              left: -6,
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          >
            <defs>
              <filter id={`selection-round-${id}`}>
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
                  result="goo"
                />
                <feComposite in="SourceGraphic" in2="goo" operator="atop" />
              </filter>
            </defs>
            <path
              d="M95 4 L172 48 L172 138 L95 182 L18 138 L18 48 Z"
              fill="none"
              stroke="#1976d2"
              strokeWidth={3}
              filter={`url(#selection-round-${id})`}
            />
          </svg>
        )}
        {/* SVG Definitions */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            {/* Clip path for mesh gradient and grain */}
            <clipPath id={clipPathId} clipPathUnits="userSpaceOnUse">
              <path d={HEX_PATH} />
            </clipPath>
            {/* Round filter for smooth edges */}
            <filter id={roundFilterId}>
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
        </svg>

        {/* Shine Effect Overlay */}
        {shine && (
          <Box
            sx={{
              position: 'absolute',
              width: 178,
              height: 174,
              clipPath: `url(#${clipPathId})`,
              overflow: 'hidden',
              pointerEvents: 'none',
              zIndex: 100,
            }}
          >
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
              }}
            />
          </Box>
        )}

        {/* Mesh Gradient Background */}
        {meshGradient && (
          <HexMeshGradient
            colors={meshColors}
            speed={meshSpeed}
            amplitude={meshAmplitude}
            clipPathId={clipPathId}
          />
        )}

        {/* Marble Background */}
        {marbleBackground && (
          <MarbleBackground
            clipPathId={clipPathId}
            baseColor={marbleBaseColor}
            accentColor1={marbleAccent1}
            accentColor2={marbleAccent2}
            filterId={marbleFilterId}
          />
        )}

        {/* Image Background */}
        {backgroundImage && (
          <Box
            sx={{
              position: 'absolute',
              width: 178,
              height: 174,
              clipPath: `url(#${clipPathId})`,
              overflow: 'hidden',
              pointerEvents: 'none',
            }}
          >
            <Box
              component="img"
              src={backgroundImage}
              alt=""
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
        )}

        {/* Grain Overlay */}
        {grainAmount > 0 && (
          <HexGrainOverlay
            amount={grainAmount}
            blendMode={grainBlendMode}
            filterId={grainFilterId}
            clipPathId={clipPathId}
          />
        )}

        {/* Pattern Overlay with radial fade mask */}
        {patternOverlay && (
          <svg
            width="178"
            height="174"
            viewBox="0 0 178 174"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
              opacity: 0.8,
            }}
          >
            <defs>
              <clipPath id={`pattern-clip-${id}`}>
                <path d={HEX_PATH} />
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
                <rect width="178" height="174" fill={`url(#pattern-fade-${id})`} />
              </mask>
            </defs>
            {/* Pattern image with radial fade mask */}
            <image
              href={patternOverlay}
              width="178"
              height="174"
              clipPath={`url(#pattern-clip-${id})`}
              mask={`url(#pattern-mask-${id})`}
              preserveAspectRatio="xMidYMid slice"
            />
            {/* Red border ellipse at the edge of the fade mask (disabled - uncomment to debug) */}
            {/* <ellipse
              cx={hexWidth / 2}
              cy={hexHeight / 2}
              rx={(chipSize.width / 2) + fadePadding}
              ry={(chipSize.height / 2) + fadePadding}
              fill="none"
              stroke="red"
              strokeWidth="2"
            /> */}
          </svg>
        )}

        {/* SVG Hexagon Fill (only if no mesh gradient, marble, or image) */}
        {!meshGradient && !marbleBackground && !backgroundImage && (
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
            <path
              fill={backgroundColor}
              d={HEX_PATH}
              filter={`url(#${roundFilterId})`}
            />
          </svg>
        )}

        {/* SVG Hexagon Border - Magic or Static */}
        {magicBorder ? (
          <MagicHexBorder
            borderWidth={borderWidth}
            gradientSize={magicGradientSize}
            gradientFrom={magicGradientFrom}
            gradientTo={magicGradientTo}
            hexPath={HEX_PATH}
            filterId={magicBorderId}
          />
        ) : (
          <svg
            width="178"
            height="174"
            viewBox="0 0 178 174"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <path
              fill="none"
              stroke="white"
              strokeWidth={borderWidth}
              strokeOpacity={1.0}
              d={HEX_PATH}
              filter={`url(#${roundFilterId})`}
            />
          </svg>
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
            top: 10,
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
            bottom: 10,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          isConnectable={isConnectable}
          style={
            showFloatingHandles
              ? {
                  width: handleSize,
                  height: handleSize,
                  background: 'white',
                  border: `2px solid ${handleColor}`,
                  borderRadius: '50%',
                  left: -handleOffset,
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                }
              : {
                  width: 12,
                  height: 12,
                  background: '#6366f1',
                  border: '2px solid #fff',
                  left: 30,
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                }
          }
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          isConnectable={isConnectable}
          style={
            showFloatingHandles
              ? {
                  width: handleSize,
                  height: handleSize,
                  background: 'white',
                  border: `2px solid ${handleColor}`,
                  borderRadius: '50%',
                  right: -handleOffset,
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                }
              : {
                  width: 12,
                  height: 12,
                  background: '#6366f1',
                  border: '2px solid #fff',
                  right: 30,
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                }
          }
        />
      </Box>
    </m.div>
  );
});

HexagonNode.displayName = 'HexagonNode';

