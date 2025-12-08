'use client';

import { forwardRef } from 'react';
import Box from '@mui/material/Box';

interface CanvasContainerProps {
  children: React.ReactNode;
}

export const CanvasContainer = forwardRef<HTMLDivElement, CanvasContainerProps>(
  ({ children }, ref) => (
    <Box
      ref={ref}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        cursor: 'none',
        '& *': { cursor: 'none !important' },
      }}
    >
      {children}
    </Box>
  )
);

CanvasContainer.displayName = 'CanvasContainer';

