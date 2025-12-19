'use client';

import { memo, useCallback } from 'react';
import { m, useSpring, useTransform } from 'framer-motion';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

interface NodeCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: number;
  activeColor?: string;
  tickColor?: string;
  borderColor?: string;
}

/**
 * Animated checkbox component for nodes.
 * Adapted from Devouring Details prototype.
 * Features smooth SVG path animation and spring physics.
 */
export const NodeCheckbox = memo(({
  checked,
  onChange,
  size = 18,
  activeColor = '#ff4d00',
  tickColor = '#ffffff',
  borderColor = 'rgba(255, 255, 255, 0.4)',
}: NodeCheckboxProps) => {
  // Spring for the nudge animation when checking
  const x = useSpring(0, { stiffness: 300, damping: 30 });

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection/drag
    const newChecked = !checked;
    onChange(newChecked);

    // Trigger nudge animation when checking
    if (newChecked) {
      setTimeout(() => x.set(-3), 100);
      setTimeout(() => x.set(0), 250);
    }
  }, [checked, onChange, x]);

  // Animation values for the SVG path
  const dashArray = checked ? '16 86.12' : '86.12';
  const dashOffset = checked ? 102.22 : 86.12;

  return (
    <Box
      component={m.div}
      style={{ x }}
      onClick={handleClick}
      sx={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '4px',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'box-shadow 0.3s, background 0.3s',
        boxShadow: checked
          ? `inset 0 0 0 2px ${activeColor}`
          : `inset 0 0 0 2px ${borderColor}`,
        background: checked ? activeColor : 'transparent',
        transitionDelay: checked ? '0.4s' : '0s',
        '&:hover': {
          boxShadow: checked
            ? `inset 0 0 0 2px ${activeColor}`
            : `inset 0 0 0 2px rgba(255, 255, 255, 0.6)`,
        },
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 21 21"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          fill: 'none',
          stroke: checked ? tickColor : activeColor,
          strokeWidth: 2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeDasharray: dashArray,
          strokeDashoffset: dashOffset,
          transition: 'stroke-dasharray 0.6s, stroke-dashoffset 0.6s, stroke 0.6s',
          transitionDelay: checked ? '0.3s' : '0s',
        }}
      >
        <path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186" />
      </Box>
    </Box>
  );
});

NodeCheckbox.displayName = 'NodeCheckbox';

