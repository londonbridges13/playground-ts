'use client';

import type { Variants } from 'framer-motion';

import { forwardRef, useRef, useCallback, useImperativeHandle } from 'react';
import { m, useAnimation, useReducedMotion } from 'framer-motion';

// ----------------------------------------------------------------------

export interface CompassIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CompassIconProps {
  size?: number;
  duration?: number;
  isAnimated?: boolean;
  className?: string;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  color?: string;
}

const CompassIcon = forwardRef<CompassIconHandle, CompassIconProps>(
  (
    {
      onMouseEnter,
      onMouseLeave,
      className,
      size = 24,
      duration = 1,
      isAnimated = true,
      color = 'currentColor',
      ...props
    },
    ref
  ) => {
    const controls = useAnimation();
    const reduced = useReducedMotion();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () =>
          reduced ? controls.start('normal') : controls.start('animate'),
        stopAnimation: () => controls.start('normal'),
      };
    });

    const handleEnter = useCallback(
      (e?: React.MouseEvent<HTMLDivElement>) => {
        if (!isAnimated || reduced) return;
        if (!isControlled.current) controls.start('animate');
        else onMouseEnter?.(e as React.MouseEvent<HTMLDivElement>);
      },
      [controls, reduced, isAnimated, onMouseEnter]
    );

    const handleLeave = useCallback(
      (e?: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlled.current) controls.start('normal');
        else onMouseLeave?.(e as React.MouseEvent<HTMLDivElement>);
      },
      [controls, onMouseLeave]
    );

    const circleVariants: Variants = {
      normal: { rotate: 0, scale: 1 },
      animate: {
        rotate: [0, 10, -6, 3, 0],
        scale: [1, 1.05, 0.98, 1],
        transition: { duration: 0.9 * duration, ease: [0.22, 1, 0.36, 1] },
      },
    };

    const needleVariants: Variants = {
      normal: { rotate: 0, pathLength: 1, opacity: 1 },
      animate: {
        rotate: [0, -28, 8, -4, 0],
        pathLength: [0.8, 1, 0.6, 1],
        opacity: [0.9, 1, 0.85, 1],
        transition: { duration: 1 * duration, ease: [0.22, 1, 0.36, 1] },
      },
    };

    return (
      <m.div
        className={className}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        {...props}
      >
        <m.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={controls}
          initial="normal"
          variants={circleVariants}
        >
          <m.path
            d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"
            variants={needleVariants}
            initial="normal"
            style={{ transformOrigin: 'center' }}
          />
          <m.circle
            cx="12"
            cy="12"
            r="10"
            variants={circleVariants}
            initial="normal"
          />
        </m.svg>
      </m.div>
    );
  }
);

CompassIcon.displayName = 'CompassIcon';

export { CompassIcon };

