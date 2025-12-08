'use client';

import { useCallback, useEffect, memo } from 'react';
import { m, useMotionValue, useMotionTemplate } from 'framer-motion';
import Box from '@mui/material/Box';

// ----------------------------------------------------------------------
// Magic Border for Rectangular/Circular shapes
// ----------------------------------------------------------------------

interface MagicBorderProps {
  width: number;
  height: number;
  borderRadius?: number | string;
  borderWidth?: number;
  gradientSize?: number;
  gradientFrom?: string;
  gradientTo?: string;
  gradientOpacity?: number;
}

export const MagicBorder = memo(({
  width,
  height,
  borderRadius = 16,
  borderWidth = 2,
  gradientSize = 200,
  gradientFrom = '#9E7AFF',
  gradientTo = '#FE8BBB',
  gradientOpacity = 1,
}: MagicBorderProps) => {
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const reset = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [gradientSize, mouseX, mouseY]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    const handleGlobalPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) {
        reset();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') {
        reset();
      }
    };

    window.addEventListener('pointerout', handleGlobalPointerOut);
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('pointerout', handleGlobalPointerOut);
      window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [reset]);

  // Create the gradient template for the border
  const borderGradient = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
    ${gradientFrom},
    ${gradientTo},
    rgba(255, 255, 255, 0.2) 100%)
  `;

  const radiusValue = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;

  return (
    <Box
      component="div"
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      onPointerEnter={reset}
      sx={{
        position: 'absolute',
        inset: 0,
        width,
        height,
        borderRadius: radiusValue,
        zIndex: 10,
        pointerEvents: 'auto',
      }}
    >
      {/* Animated gradient border layer */}
      <Box
        component={m.div}
        style={{ background: borderGradient }}
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          opacity: gradientOpacity,
          transition: 'opacity 0.3s',
        }}
      />

      {/* Inner cutout (transparent center) */}
      <Box
        sx={{
          position: 'absolute',
          inset: borderWidth,
          borderRadius: 'inherit',
          backgroundColor: 'transparent',
          // Use a pseudo-element to cut out the center
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            backgroundColor: 'black',
          },
        }}
        style={{
          // Use mask to cut out the center, leaving only the border visible
          WebkitMaskImage: 'linear-gradient(black, black)',
          maskImage: 'linear-gradient(black, black)',
          WebkitMaskComposite: 'destination-out',
          maskComposite: 'exclude',
        }}
      />
    </Box>
  );
});
MagicBorder.displayName = 'MagicBorder';

// ----------------------------------------------------------------------
// Magic Border for Hexagon shapes (CSS gradient with clip-path)
// ----------------------------------------------------------------------

// Hexagon clip path for 178x174 dimensions
const HEX_CLIP_PATH = 'polygon(50% 5.7%, 89.9% 28.7%, 89.9% 71.3%, 50% 94.3%, 10.1% 71.3%, 10.1% 28.7%)';
// Inner hexagon for border cutout (slightly smaller)
const getInnerHexClipPath = (borderWidth: number) => {
  const inset = (borderWidth / 178) * 100; // Convert to percentage
  return `polygon(50% ${5.7 + inset}%, ${89.9 - inset}% ${28.7 + inset * 0.5}%, ${89.9 - inset}% ${71.3 - inset * 0.5}%, 50% ${94.3 - inset}%, ${10.1 + inset}% ${71.3 - inset * 0.5}%, ${10.1 + inset}% ${28.7 + inset * 0.5}%)`;
};

interface MagicHexBorderProps {
  borderWidth?: number;
  gradientSize?: number;
  gradientFrom?: string;
  gradientTo?: string;
  gradientOpacity?: number;
  hexPath: string;
  filterId: string;
}

export const MagicHexBorder = memo(({
  borderWidth = 4,
  gradientSize = 200,
  gradientFrom = '#9E7AFF',
  gradientTo = '#FE8BBB',
  gradientOpacity = 1,
}: MagicHexBorderProps) => {
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const reset = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [gradientSize, mouseX, mouseY]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    const handleGlobalPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) {
        reset();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') {
        reset();
      }
    };

    window.addEventListener('pointerout', handleGlobalPointerOut);
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('pointerout', handleGlobalPointerOut);
      window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [reset]);

  // Create the gradient template for the border
  const borderGradient = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
    ${gradientFrom},
    ${gradientTo},
    rgba(255, 255, 255, 0.2) 100%)
  `;

  return (
    <Box
      component="div"
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      onPointerEnter={reset}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 178,
        height: 174,
        zIndex: 10,
        pointerEvents: 'auto',
        clipPath: HEX_CLIP_PATH,
      }}
    >
      {/* Animated gradient layer */}
      <Box
        component={m.div}
        style={{ background: borderGradient }}
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: gradientOpacity,
        }}
      />

      {/* Inner cutout (transparent center) - creates the border effect */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          clipPath: getInnerHexClipPath(borderWidth),
          backgroundColor: 'black',
          mixBlendMode: 'destination-out',
        }}
      />
    </Box>
  );
});
MagicHexBorder.displayName = 'MagicHexBorder';

// ----------------------------------------------------------------------
// Magic Border for Circular shapes
// ----------------------------------------------------------------------

interface MagicCircleBorderProps {
  size: number;
  borderWidth?: number;
  gradientSize?: number;
  gradientFrom?: string;
  gradientTo?: string;
  gradientOpacity?: number;
}

export const MagicCircleBorder = memo(({
  size,
  borderWidth = 2,
  gradientSize = 200,
  gradientFrom = '#9E7AFF',
  gradientTo = '#FE8BBB',
  gradientOpacity = 1,
}: MagicCircleBorderProps) => {
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const reset = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [gradientSize, mouseX, mouseY]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    const handleGlobalPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) {
        reset();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') {
        reset();
      }
    };

    window.addEventListener('pointerout', handleGlobalPointerOut);
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('pointerout', handleGlobalPointerOut);
      window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [reset]);

  // Create the gradient template for the border
  const borderGradient = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
    ${gradientFrom},
    ${gradientTo},
    rgba(255, 255, 255, 0.3) 100%)
  `;

  return (
    <Box
      component="div"
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      onPointerEnter={reset}
      sx={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        zIndex: 10,
        pointerEvents: 'auto',
      }}
    >
      {/* Animated gradient border layer */}
      <Box
        component={m.div}
        style={{ background: borderGradient }}
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          opacity: gradientOpacity,
        }}
      />

      {/* Inner cutout (transparent center) - creates the border effect */}
      <Box
        sx={{
          position: 'absolute',
          inset: borderWidth,
          borderRadius: '50%',
          backgroundColor: 'inherit',
          // Mask to show only the border ring
          background: 'black',
          mixBlendMode: 'destination-out',
        }}
      />
    </Box>
  );
});
MagicCircleBorder.displayName = 'MagicCircleBorder';

