import { CONFIG } from 'src/global-config';

import { FlowView } from 'src/sections/flow-2/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Path Interface - ${CONFIG.appName}` };

export default function Page() {
  return <FlowView />;
}

