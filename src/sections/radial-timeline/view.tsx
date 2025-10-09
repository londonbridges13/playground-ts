'use client';

import { useEffect } from 'react';

import RadialTimeline from 'src/sections/flow/radial-timeline/radial-timeline';
import 'src/sections/flow/radial-timeline/system.css';

// ----------------------------------------------------------------------

export function RadialTimelineView() {
  // Ensure body is scrollable for the radial timeline
  useEffect(() => {
    // Reset scroll to top
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;

    // Allow body to scroll
    document.body.style.overflow = 'auto';
    document.body.style.overflowX = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    return () => {
      document.body.style.overflow = '';
      document.body.style.overflowX = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, []);

  return <RadialTimeline nodeLabel="Radial Timeline" />;
}

