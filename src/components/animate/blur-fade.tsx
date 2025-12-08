'use client';

import type { BoxProps } from '@mui/material/Box';

import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import { styled, keyframes } from '@mui/material/styles';

// ----------------------------------------------------------------------

const DEFAULT_BLUR = 8;
const DEFAULT_DURATION = 500;

export type BlurFadeProps = BoxProps & {
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Blur intensity in pixels */
  blur?: number;
  /** Whether to trigger the fade animation */
  trigger?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
};

/**
 * BlurFade - Fades out content with a clip-path animation and clear-to-blur effect
 *
 * The content starts visible and clear, then animates to clipped and blurred.
 * This is the reverse of BlurReveal.
 */
export function BlurFade({
  children,
  duration = DEFAULT_DURATION,
  blur = DEFAULT_BLUR,
  trigger = false,
  onComplete,
  sx,
  ...other
}: BlurFadeProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Start animation when trigger becomes true
  useEffect(() => {
    if (trigger && !isAnimating && !isComplete) {
      setIsAnimating(true);
    }
  }, [trigger, isAnimating, isComplete]);

  // Handle animation completion
  useEffect(() => {
    if (isAnimating) {
      const timeout = setTimeout(() => {
        setIsComplete(true);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [isAnimating, duration, onComplete]);

  // Return null after animation completes
  if (isComplete) {
    return null;
  }

  return (
    <BlurFadeRoot
      sx={sx}
      style={
        {
          '--duration': `${duration}ms`,
          '--blur': `${blur}px`,
        } as React.CSSProperties
      }
      {...other}
    >
      <BlurFadeBanner data-animating={isAnimating}>{children}</BlurFadeBanner>
    </BlurFadeRoot>
  );
}

// ----------------------------------------------------------------------
// Keyframes
// ----------------------------------------------------------------------

const clipOutKeyframes = keyframes`
  from {
    clip-path: inset(0 0 0 0 round 9999px);
  }
  to {
    clip-path: inset(0 100% 0 0 round 9999px);
  }
`;

const blurOutKeyframes = keyframes`
  from {
    filter: blur(0px);
  }
  to {
    filter: blur(var(--blur));
  }
`;

// ----------------------------------------------------------------------
// Styled Components
// ----------------------------------------------------------------------

const BlurFadeRoot = styled(Box)({
  position: 'relative',
  display: 'flex',
});

const BlurFadeBanner = styled('div')({
  // Start visible and clear
  clipPath: 'inset(0 0 0 0 round 9999px)',
  filter: 'blur(0px)',

  // Only animate when data-animating is true
  '&[data-animating="true"]': {
    animation: `${clipOutKeyframes} var(--duration) ease-in-out forwards, ${blurOutKeyframes} var(--duration) ease-in-out forwards`,
  },
});

