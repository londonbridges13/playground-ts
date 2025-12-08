'use client';

import type { MotionProps } from 'framer-motion';

import { useEffect, useMemo, useRef, useState } from 'react';
import { m, useInView } from 'framer-motion';

import { styled, keyframes } from '@mui/material/styles';

// ----------------------------------------------------------------------

const blinkKeyframes = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

// ----------------------------------------------------------------------

export interface TypingAnimationProps extends MotionProps {
  /** Text to type (single string) */
  children?: string;
  /** Multiple words to cycle through */
  words?: string[];
  /** Typing speed in ms per character */
  duration?: number;
  /** Override typing speed */
  typeSpeed?: number;
  /** Override delete speed */
  deleteSpeed?: number;
  /** Initial delay before starting */
  delay?: number;
  /** Pause duration after typing before deleting */
  pauseDelay?: number;
  /** Whether to loop the animation */
  loop?: boolean;
  /** Start animation when element comes into view */
  startOnView?: boolean;
  /** Show cursor */
  showCursor?: boolean;
  /** Blink cursor */
  blinkCursor?: boolean;
  /** Cursor style */
  cursorStyle?: 'line' | 'block' | 'underscore';
  /** Callback when typing is complete (before deletion) */
  onTypingComplete?: () => void;
  /** Callback when deletion is complete */
  onDeleteComplete?: () => void;
  /** Force start deletion (for external control) */
  startDelete?: boolean;
  /** Custom styles */
  sx?: Record<string, unknown>;
}

export function TypingAnimation({
  children,
  words,
  duration = 100,
  typeSpeed,
  deleteSpeed,
  delay = 0,
  pauseDelay = 1000,
  loop = false,
  startOnView = true,
  showCursor = true,
  blinkCursor = true,
  cursorStyle = 'line',
  onTypingComplete,
  onDeleteComplete,
  startDelete = false,
  sx,
  ...props
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'pause' | 'deleting'>('typing');
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(elementRef, {
    amount: 0.3,
    once: true,
  });

  const wordsToAnimate = useMemo(
    () => words || (children ? [children] : []),
    [words, children]
  );
  const hasMultipleWords = wordsToAnimate.length > 1;

  const typingSpeed = typeSpeed || duration;
  const deletingSpeed = deleteSpeed || typingSpeed / 2;

  const shouldStart = startOnView ? isInView : true;

  // Handle external trigger to start deletion
  useEffect(() => {
    if (startDelete && phase === 'pause') {
      setPhase('deleting');
    }
  }, [startDelete, phase]);

  useEffect(() => {
    if (!shouldStart || wordsToAnimate.length === 0) return;

    const timeoutDelay =
      delay > 0 && displayedText === ''
        ? delay
        : phase === 'typing'
          ? typingSpeed
          : phase === 'deleting'
            ? deletingSpeed
            : pauseDelay;

    const timeout = setTimeout(() => {
      const currentWord = wordsToAnimate[currentWordIndex] || '';
      const graphemes = Array.from(currentWord);

      switch (phase) {
        case 'typing':
          if (currentCharIndex < graphemes.length) {
            setDisplayedText(graphemes.slice(0, currentCharIndex + 1).join(''));
            setCurrentCharIndex(currentCharIndex + 1);
          } else {
            // Typing complete
            onTypingComplete?.();
            if (hasMultipleWords || loop) {
              const isLastWord = currentWordIndex === wordsToAnimate.length - 1;
              if (!isLastWord || loop) {
                setPhase('pause');
              }
            } else {
              // Single word, no loop - stay in pause (wait for startDelete or auto-delete)
              setPhase('pause');
            }
          }
          break;

        case 'pause':
          // If hasMultipleWords or loop, auto-delete after pause
          if (hasMultipleWords || loop) {
            setPhase('deleting');
          }
          // Otherwise, wait for external startDelete trigger
          break;

        case 'deleting':
          if (currentCharIndex > 0) {
            setDisplayedText(graphemes.slice(0, currentCharIndex - 1).join(''));
            setCurrentCharIndex(currentCharIndex - 1);
          } else {
            // Deletion complete
            onDeleteComplete?.();
            if (hasMultipleWords || loop) {
              const nextIndex = (currentWordIndex + 1) % wordsToAnimate.length;
              setCurrentWordIndex(nextIndex);
              setPhase('typing');
            }
          }
          break;
      }
    }, timeoutDelay);

    return () => clearTimeout(timeout);
  }, [
    shouldStart,
    phase,
    currentCharIndex,
    currentWordIndex,
    displayedText,
    wordsToAnimate,
    hasMultipleWords,
    loop,
    typingSpeed,
    deletingSpeed,
    pauseDelay,
    delay,
    onTypingComplete,
    onDeleteComplete,
  ]);

  const currentWordGraphemes = Array.from(wordsToAnimate[currentWordIndex] || '');
  const isComplete =
    !loop &&
    !hasMultipleWords &&
    currentWordIndex === wordsToAnimate.length - 1 &&
    currentCharIndex >= currentWordGraphemes.length &&
    phase !== 'deleting';

  const shouldShowCursor =
    showCursor &&
    !isComplete &&
    (hasMultipleWords || loop || phase === 'typing' || phase === 'deleting');

  const getCursorChar = () => {
    switch (cursorStyle) {
      case 'block':
        return '▌';
      case 'underscore':
        return '_';
      case 'line':
      default:
        return '|';
    }
  };

  return (
    <TypingRoot
      ref={elementRef}
      style={sx as React.CSSProperties}
      {...props}
    >
      {displayedText}
      {shouldShowCursor && (
        <CursorSpan shouldBlink={blinkCursor}>
          {getCursorChar()}
        </CursorSpan>
      )}
    </TypingRoot>
  );
}

// ----------------------------------------------------------------------
// Styled Components
// ----------------------------------------------------------------------

const TypingRoot = styled(m.span)({
  display: 'inline-flex',
});

const CursorSpan = styled('span')<{ shouldBlink: boolean }>(({ shouldBlink }) => ({
  display: 'inline-block',
  ...(shouldBlink && {
    animation: `${blinkKeyframes} 1s step-end infinite`,
  }),
}));

