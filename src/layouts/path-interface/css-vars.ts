import type { CSSObject } from '@mui/material/styles';

// ----------------------------------------------------------------------

/**
 * CSS variables for PathInterfaceLayout
 * Minimal set for full-screen immersive experiences
 */
export const pathInterfaceLayoutVars: CSSObject = {
  // No header/nav spacing needed
  '--layout-path-interface-padding': '0px',
  
  // Optional: Custom z-index layers for overlays
  '--layout-path-interface-overlay-zIndex': '1000',
  '--layout-path-interface-drawer-zIndex': '1100',
  '--layout-path-interface-dialog-zIndex': '1200',
  
  // Optional: Transition settings for smooth animations
  '--layout-path-interface-transition-duration': '300ms',
  '--layout-path-interface-transition-easing': 'cubic-bezier(0.4, 0, 0.2, 1)',
};

