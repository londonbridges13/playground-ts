import { CONFIG } from 'src/global-config';

import { RadialTimelineView } from 'src/sections/radial-timeline/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Radial Timeline | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <RadialTimelineView />;
}

