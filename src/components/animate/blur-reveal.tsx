'use client';

import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';
import { styled, keyframes } from '@mui/material/styles';

// ----------------------------------------------------------------------

const DEFAULT_BLUR = 8;
const DEFAULT_DURATION = 800;

export type BlurRevealProps = BoxProps & {
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Blur intensity in pixels */
  blur?: number;
};

/**
 * BlurReveal - Reveals content with a clip-path animation and blur-to-clear effect
 *
 * The content starts clipped and blurred, then animates to fully visible and clear.
 */
export function BlurReveal({
  children,
  duration = DEFAULT_DURATION,
  blur = DEFAULT_BLUR,
  sx,
  ...other
}: BlurRevealProps) {
  return (
    <BlurRevealRoot
      sx={sx}
      style={
        {
          '--duration': `${duration}ms`,
          '--blur': `${blur}px`,
        } as React.CSSProperties
      }
      {...other}
    >
      <BlurRevealBanner>{children}</BlurRevealBanner>
    </BlurRevealRoot>
  );
}

// ----------------------------------------------------------------------
// Keyframes
// ----------------------------------------------------------------------

const unclipKeyframes = keyframes`
  to {
    clip-path: inset(0 0 0 0 round 9999px);
  }
`;

const unblurKeyframes = keyframes`
  to {
    filter: blur(0px);
  }
`;

// ----------------------------------------------------------------------
// Styled Components
// ----------------------------------------------------------------------

const BlurRevealRoot = styled(Box)({
  position: 'relative',
  display: 'flex',
});

const BlurRevealBanner = styled('div')({
  clipPath: 'inset(0 100% 0 0 round 9999px)',
  filter: 'blur(var(--blur))',
  animation: `${unclipKeyframes} var(--duration) ease-in-out forwards, ${unblurKeyframes} var(--duration) ease-in-out forwards`,
});

