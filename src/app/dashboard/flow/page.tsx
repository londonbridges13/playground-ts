import { CONFIG } from 'src/global-config';

import { FlowView } from 'src/sections/flow/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Flow | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <FlowView title="Flow" />;
}

