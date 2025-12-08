'use client';

import type { MotionProps } from 'framer-motion';

import { useEffect, useRef, useState } from 'react';
import { m } from 'framer-motion';

import { styled } from '@mui/material/styles';

// ----------------------------------------------------------------------

type CharacterSet = string[] | readonly string[];

const DEFAULT_CHARACTER_SET = Object.freeze(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
) as readonly string[];

const getRandomInt = (max: number): number => Math.floor(Math.random() * max);

// ----------------------------------------------------------------------

export interface HyperTextProps extends MotionProps {
  /** The text content to be animated */
  children: string;
  /** Duration of the animation in milliseconds (ignored if durationPerChar is set) */
  duration?: number;
  /** Duration per character change in milliseconds */
  durationPerChar?: number;
  /** Delay before animation starts in milliseconds */
  delay?: number;
  /** Whether to start animation when element comes into view */
  startOnView?: boolean;
  /** Whether to trigger animation on hover */
  animateOnHover?: boolean;
  /** Custom character set for scramble effect */
  characterSet?: CharacterSet;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
  /** Custom styles */
  sx?: Record<string, unknown>;
}

export function HyperText({
  children,
  duration = 800,
  durationPerChar,
  delay = 0,
  startOnView = false,
  animateOnHover = false,
  characterSet = DEFAULT_CHARACTER_SET,
  onAnimationComplete,
  sx,
  ...props
}: HyperTextProps) {
  const [displayText, setDisplayText] = useState<string[]>(() =>
    children.split('')
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  const prevChildrenRef = useRef(children);
  const prevLengthRef = useRef(children.length);
  const targetTextRef = useRef(children);

  const handleAnimationTrigger = () => {
    if (animateOnHover && !isAnimating) {
      setIsAnimating(true);
    }
  };

  // Trigger animation when children changes
  useEffect(() => {
    if (prevChildrenRef.current !== children) {
      // Store the previous length before updating
      prevLengthRef.current = prevChildrenRef.current.length;
      prevChildrenRef.current = children;
      targetTextRef.current = children;
      setIsAnimating(true);
    }
  }, [children]);

  // Handle animation start based on view or delay
  useEffect(() => {
    if (!startOnView) {
      const startTimeout = setTimeout(() => {
        setIsAnimating(true);
      }, delay);
      return () => clearTimeout(startTimeout);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsAnimating(true);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '-30% 0px -30% 0px' }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay, startOnView]);

  // Handle scramble animation with length interpolation
  useEffect(() => {
    if (!isAnimating) return;

    const targetText = targetTextRef.current;
    const startLength = prevLengthRef.current;
    const endLength = targetText.length;
    const lengthDiff = Math.abs(endLength - startLength);

    // Calculate total duration: use durationPerChar if set, otherwise use duration
    const totalDuration = durationPerChar
      ? durationPerChar * Math.max(lengthDiff, endLength)
      : duration;

    const startTime = performance.now();
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      // Interpolate the current display length
      const currentLength = Math.round(
        startLength + (endLength - startLength) * progress
      );

      // Calculate how many characters should be "settled" (showing final text)
      const settledCount = Math.floor(progress * endLength);

      // Build the display text
      const newDisplayText: string[] = [];
      for (let i = 0; i < currentLength; i++) {
        if (i < settledCount && i < endLength) {
          // This character has settled to its final value
          newDisplayText.push(targetText[i]);
        } else if (i < endLength) {
          // This character is still scrambling but will be part of final text
          const char = targetText[i];
          newDisplayText.push(
            char === ' ' ? ' ' : characterSet[getRandomInt(characterSet.length)]
          );
        } else {
          // Extra characters that will be removed (scrambling out)
          newDisplayText.push(characterSet[getRandomInt(characterSet.length)]);
        }
      }

      setDisplayText(newDisplayText);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Ensure final state is exactly the target text
        setDisplayText(targetText.split(''));
        setIsAnimating(false);
        onAnimationComplete?.();
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [duration, isAnimating, characterSet, onAnimationComplete]);

  return (
    <HyperTextRoot
      ref={elementRef}
      onMouseEnter={handleAnimationTrigger}
      style={sx as React.CSSProperties}
      {...props}
    >
      {displayText.map((letter, index) => (
        <span
          key={index}
          style={{
            display: 'inline-block',
            whiteSpace: 'pre',
            fontFamily: 'inherit',
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </span>
      ))}
    </HyperTextRoot>
  );
}

// ----------------------------------------------------------------------
// Styled Components
// ----------------------------------------------------------------------

const HyperTextRoot = styled(m.span)({
  display: 'inline-flex',
  overflow: 'hidden',
});

