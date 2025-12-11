'use client';

import type { Theme, SxProps } from '@mui/material/styles';

import { useRef } from 'react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

export interface TextGenerateEffectProps {
  /** The text content to animate (words separated by spaces) */
  words: string;
  /** Custom styles */
  sx?: SxProps<Theme>;
  /** Whether to apply blur filter effect */
  filter?: boolean;
  /** Duration of each word's animation in seconds */
  duration?: number;
}

export function TextGenerateEffect({
  words,
  sx,
  filter = true,
  duration = 0.3,
}: TextGenerateEffectProps) {
  const wordsArray = words.split(' ').filter(Boolean);

  // Track which word count was last seen to determine "new" words
  const prevWordCountRef = useRef(0);
  const baseIndexRef = useRef(0);

  // If word count increased, new words appeared - they should animate with delay from their position
  // If word count reset (much smaller), reset the base
  if (wordsArray.length < prevWordCountRef.current / 2) {
    baseIndexRef.current = 0;
  } else if (wordsArray.length > prevWordCountRef.current) {
    // New words added - update base to the old count so only new words get delay
    baseIndexRef.current = prevWordCountRef.current;
  }
  prevWordCountRef.current = wordsArray.length;

  return (
    <Box
      sx={[
        {
          fontFamily: '"JetBrains Mono", monospace',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <div>
        {wordsArray.map((word, idx) => {
          // Only new words (idx >= baseIndex) get animation delay
          const isNew = idx >= baseIndexRef.current;
          const delayOffset = isNew ? (idx - baseIndexRef.current) * 0.03 : 0;

          return (
            <m.span
              key={`word-${idx}`}
              initial={{ opacity: 0, filter: filter ? 'blur(8px)' : 'none' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration, delay: delayOffset }}
              style={{
                display: 'inline-block',
                marginRight: '0.25em',
              }}
            >
              {word}
            </m.span>
          );
        })}
      </div>
    </Box>
  );
}

