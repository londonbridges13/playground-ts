'use client';

import type { BoxProps } from '@mui/material/Box';

import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';

import { layoutClasses } from '../core';

// ----------------------------------------------------------------------

export type PathInterfaceContentProps = BoxProps & {
  disableScrollLock?: boolean;
};

export function PathInterfaceContent({
  sx,
  children,
  className,
  disableScrollLock = false,
  ...other
}: PathInterfaceContentProps) {
  return (
    <Box
      className={mergeClasses([layoutClasses.content, className])}
      sx={[
        {
          width: '100vw',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          overflow: disableScrollLock ? 'hidden' : 'auto',
          display: 'flex',
          flexDirection: 'column',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {children}
    </Box>
  );
}

