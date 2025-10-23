'use client';

import Box from '@mui/material/Box';
import { useColorScheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

interface LiquidGlassOverlayProps {
  open: boolean;
  onClick?: () => void;
  noiseFrequency?: number;
  distortionStrength?: number;
  frostBlur?: number;
  tintColor?: string;
  tintOpacity?: number;
  innerShadowBlur?: number;
  innerShadowSpread?: number;
  innerShadowColor?: string;
}

export function LiquidGlassOverlay({
  open,
  onClick,
  noiseFrequency = 0.005,
  distortionStrength = 50,
  frostBlur,
  tintColor,
  tintOpacity ,
  innerShadowBlur = 20,
  innerShadowSpread = -5,
  innerShadowColor,
}: LiquidGlassOverlayProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Use darker tint for dark mode, lighter for light mode
  const effectiveTintColor = tintColor ?? (isDark ? '20, 26, 33' : '255, 255, 255');
  const effectiveInnerShadowColor = innerShadowColor ?? (isDark
    ? 'rgba(20, 26, 33, 0.5)'
    : 'rgba(255, 255, 255, 0.7)');
  const effectiveFrostBlur = frostBlur ?? (isDark ? 2 : 3);
  const effectiveTintOpacity = tintOpacity ?? (isDark ? 0.15 : 0.2);
  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: open ? 'auto' : 'none',
          zIndex: 5,
          isolation: 'isolate',

          // Inner shadow + tint layer
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            boxShadow: open
              ? `inset 0 0 ${innerShadowBlur}px ${innerShadowSpread}px ${effectiveInnerShadowColor}`
              : 'none',
            backgroundColor: open
              ? `rgba(${effectiveTintColor}, ${effectiveTintOpacity})`
              : 'transparent',
            transition: 'box-shadow 0.3s ease, background-color 0.3s ease',
          },

          // Backdrop blur + SVG distortion layer
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            zIndex: -1,
            backdropFilter: open ? `blur(${effectiveFrostBlur}px)` : 'none',
            filter: open ? 'url(#glass-distortion)' : 'none',
            isolation: 'isolate',
            WebkitBackdropFilter: open ? `blur(${effectiveFrostBlur}px)` : 'none',
            WebkitFilter: open ? 'url(#glass-distortion)' : 'none',
            transition: 'backdrop-filter 0.3s ease, filter 0.3s ease',
          },
        }}
        onClick={onClick}
      />

      {/* SVG Filter Definition for Liquid Glass Distortion */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="0"
        height="0"
        style={{ position: 'absolute', overflow: 'hidden' }}
      >
        <defs>
          <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%">
            {/* Generate fractal noise for organic distortion */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency={`${noiseFrequency} ${noiseFrequency}`}
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
              scale={distortionStrength}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
    </>
  );
}

