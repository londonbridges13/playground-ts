'use client';

import { memo, useMemo } from 'react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------
// Mesh Gradient Component for Dialog
// ----------------------------------------------------------------------

interface MeshGradientProps {
  width: number;
  height: number;
  colors: [string, string, string, string];
  speed?: number;
  amplitude?: number;
}

const MeshGradient = memo(({ width, height, colors, speed = 1, amplitude = 50 }: MeshGradientProps) => {
  const [c1, c2, c3, c4] = colors;
  const baseDuration = 8 / speed;
  const moveRange = (amplitude / 100) * 30;

  return (
    <Box
      sx={{
        position: 'absolute',
        width,
        height,
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
          left: '-10%',
          top: '-10%',
          background: `radial-gradient(circle at center, ${c2} 0%, transparent 70%)`,
          opacity: 0.7,
        }}
        animate={{
          x: [`0%`, `-${moveRange}%`, `0%`, `${moveRange}%`, `0%`],
          y: [`${moveRange}%`, `0%`, `-${moveRange}%`, `0%`, `${moveRange}%`],
        }}
        transition={{ duration: baseDuration * 1.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Animated blob 3 */}
      <m.div
        style={{
          position: 'absolute',
          width: '130%',
          height: '130%',
          left: '-15%',
          top: '-15%',
          background: `radial-gradient(circle at center, ${c3} 0%, transparent 70%)`,
          opacity: 0.6,
        }}
        animate={{
          x: [`${moveRange}%`, `0%`, `-${moveRange}%`, `0%`, `${moveRange}%`],
          y: [`0%`, `${moveRange}%`, `0%`, `-${moveRange}%`, `0%`],
        }}
        transition={{ duration: baseDuration * 0.9, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Animated blob 4 */}
      <m.div
        style={{
          position: 'absolute',
          width: '110%',
          height: '110%',
          left: '-5%',
          top: '-5%',
          background: `radial-gradient(circle at center, ${c4} 0%, transparent 70%)`,
          opacity: 0.5,
        }}
        animate={{
          x: [`-${moveRange}%`, `${moveRange}%`, `0%`, `-${moveRange}%`, `-${moveRange}%`],
          y: [`${moveRange}%`, `-${moveRange}%`, `${moveRange}%`, `0%`, `${moveRange}%`],
        }}
        transition={{ duration: baseDuration * 1.1, repeat: Infinity, ease: 'easeInOut' }}
      />
    </Box>
  );
});
MeshGradient.displayName = 'MeshGradient';

// ----------------------------------------------------------------------
// Marble Background Component for Dialog
// ----------------------------------------------------------------------

interface MarbleBackgroundProps {
  width: number;
  height: number;
  baseColor?: string;
  accentColor1?: string;
  accentColor2?: string;
  filterId: string;
}

const MarbleBackground = memo(({
  width,
  height,
  baseColor = '#b5f4bc',
  accentColor1 = '#fff19e',
  accentColor2 = '#ffdc8a',
  filterId,
}: MarbleBackgroundProps) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        width,
        height,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <filter id={filterId} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="20" result="effect1_foregroundBlur" />
          </filter>
        </defs>
        {/* Base color */}
        <rect width={width} height={height} fill={baseColor} />
        {/* Accent shape 1 */}
        <path
          filter={`url(#${filterId})`}
          d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z"
          fill={accentColor1}
          transform={`translate(${width * 0.3} ${height * 0.3}) rotate(-320 89 87) scale(3)`}
        />
        {/* Accent shape 2 */}
        <path
          filter={`url(#${filterId})`}
          d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z"
          fill={accentColor2}
          transform={`translate(${width * 0.2} ${height * 0.2}) rotate(-300 89 87) scale(3)`}
          style={{ mixBlendMode: 'overlay' }}
        />
      </svg>
    </Box>
  );
});
MarbleBackground.displayName = 'MarbleBackground';

// ----------------------------------------------------------------------
// Grain Overlay Component for Dialog
// ----------------------------------------------------------------------

interface GrainOverlayProps {
  width: number;
  height: number;
  amount: number;
  blendMode?: 'overlay' | 'soft-light' | 'multiply' | 'screen';
  filterId: string;
}

const GrainOverlay = memo(({ width, height, amount, blendMode = 'overlay', filterId }: GrainOverlayProps) => {
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
              seed={42}
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
GrainOverlay.displayName = 'GrainOverlay';

// ----------------------------------------------------------------------
// Pattern Overlay Component for Dialog
// ----------------------------------------------------------------------

interface PatternOverlayProps {
  width: number;
  height: number;
  patternSrc: string;
  id: string;
}

const PatternOverlay = memo(({ width, height, patternSrc, id }: PatternOverlayProps) => {
  return (
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
      }}
    >
      <defs>
        {/* Radial gradient for fade mask - fades from center */}
        <radialGradient id={`dialog-pattern-fade-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="40%" stopColor="white" stopOpacity="0.3" />
          <stop offset="70%" stopColor="white" stopOpacity="0.7" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </radialGradient>
        <mask id={`dialog-pattern-mask-${id}`}>
          <rect width={width} height={height} fill={`url(#dialog-pattern-fade-${id})`} />
        </mask>
      </defs>
      {/* Pattern image with radial fade mask */}
      <image
        href={patternSrc}
        width={width}
        height={height}
        mask={`url(#dialog-pattern-mask-${id})`}
        preserveAspectRatio="xMidYMid slice"
      />
    </svg>
  );
});
PatternOverlay.displayName = 'PatternOverlay';

// ----------------------------------------------------------------------
// Main Dialog Background Renderer
// ----------------------------------------------------------------------

interface DialogBackgroundRendererProps {
  nodeData: Record<string, any>;
  width: number;
  height: number;
  id: string;
}

export const DialogBackgroundRenderer = memo(({ nodeData, width, height, id }: DialogBackgroundRendererProps) => {
  // Extract background properties from node data
  const meshGradient = nodeData.meshGradient ?? false;
  const meshColors = (nodeData.meshColors as [string, string, string, string]) ?? ['#667eea', '#764ba2', '#f093fb', '#f5576c'];
  const meshSpeed = (nodeData.meshSpeed as number) ?? 1;
  const meshAmplitude = (nodeData.meshAmplitude as number) ?? 50;

  const marbleBackground = nodeData.marbleBackground ?? false;
  const marbleBaseColor = (nodeData.marbleBaseColor as string) ?? '#b5f4bc';
  const marbleAccent1 = (nodeData.marbleAccent1 as string) ?? '#fff19e';
  const marbleAccent2 = (nodeData.marbleAccent2 as string) ?? '#ffdc8a';

  const backgroundImage = (nodeData.backgroundImage as string) ?? null;
  const patternOverlay = (nodeData.patternOverlay as string) ?? null;
  const backgroundColor = (nodeData.backgroundColor as string) ?? '#d0d0d0';

  const grainAmount = (nodeData.grainAmount as number) ?? 0;
  const grainBlendMode = (nodeData.grainBlendMode as 'overlay' | 'soft-light' | 'multiply' | 'screen') ?? 'overlay';

  // Unique IDs for filters
  const marbleFilterId = useMemo(() => `dialog-marble-${id}`, [id]);
  const grainFilterId = useMemo(() => `dialog-grain-${id}`, [id]);

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
      }}
    >
      {/* Layer 1: Base Background */}
      {meshGradient ? (
        <MeshGradient
          width={width}
          height={height}
          colors={meshColors}
          speed={meshSpeed}
          amplitude={meshAmplitude}
        />
      ) : marbleBackground ? (
        <MarbleBackground
          width={width}
          height={height}
          baseColor={marbleBaseColor}
          accentColor1={marbleAccent1}
          accentColor2={marbleAccent2}
          filterId={marbleFilterId}
        />
      ) : backgroundImage ? (
        <Box
          component="img"
          src={backgroundImage}
          alt=""
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `linear-gradient(135deg, ${backgroundColor} 0%, ${adjustBrightness(backgroundColor, -20)} 100%)`,
          }}
        />
      )}

      {/* Layer 2: Pattern Overlay */}
      {patternOverlay && (
        <PatternOverlay
          width={width}
          height={height}
          patternSrc={patternOverlay}
          id={id}
        />
      )}

      {/* Layer 3: Grain Overlay */}
      {grainAmount > 0 && (
        <GrainOverlay
          width={width}
          height={height}
          amount={grainAmount}
          blendMode={grainBlendMode}
          filterId={grainFilterId}
        />
      )}
    </Box>
  );
});
DialogBackgroundRenderer.displayName = 'DialogBackgroundRenderer';

// Helper to adjust color brightness
function adjustBrightness(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

