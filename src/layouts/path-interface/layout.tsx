'use client';

import type { Breakpoint } from '@mui/material/styles';
import type { MainSectionProps, LayoutSectionProps } from '../core';

import { MainSection, LayoutSection } from '../core';
import { pathInterfaceLayoutVars } from './css-vars';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type PathInterfaceLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    main?: MainSectionProps;
  };
};

/**
 * PathInterfaceLayout - A minimal, full-screen layout for immersive path/flow interfaces
 * 
 * Features:
 * - No header or navigation
 * - Full viewport coverage
 * - Optimized for canvas-based interfaces
 * - Minimal overhead for maximum performance
 */
export function PathInterfaceLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'md',
}: PathInterfaceLayoutProps) {
  const renderFooter = () => null;

  const renderMain = () => (
    <MainSection
      {...slotProps?.main}
      sx={[
        {
          // Full viewport, no padding
          minHeight: '100vh',
          overflow: 'hidden',
          position: 'relative',
        },
        ...(Array.isArray(slotProps?.main?.sx) ? slotProps.main.sx : [slotProps?.main?.sx]),
      ]}
    >
      {children}
    </MainSection>
  );

  return (
    <LayoutSection
      /** **************************************
       * @Header - Intentionally omitted for full-screen experience
       *************************************** */
      headerSection={null}
      /** **************************************
       * @Footer - Intentionally omitted
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles - Minimal CSS vars for performance
       *************************************** */
      cssVars={{ ...pathInterfaceLayoutVars, ...cssVars }}
      sx={[
        {
          // Ensure full viewport coverage
          minHeight: '100vh',
          overflow: 'hidden',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {renderMain()}
    </LayoutSection>
  );
}

