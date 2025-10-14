import { CONFIG } from 'src/global-config';

import { FlowView } from 'src/sections/flow-2/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Flow 2 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <FlowView />;
}

