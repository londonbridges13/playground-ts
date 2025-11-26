import { CONFIG } from 'src/global-config';

import { EntitiesView } from 'src/sections/entities/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Entity CRUD Test - ${CONFIG.appName}` };

export default function Page() {
  return <EntitiesView />;
}

