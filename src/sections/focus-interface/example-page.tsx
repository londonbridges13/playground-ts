// src/sections/focus-interface/example-page.tsx
'use client';

/**
 * Example usage of FocusInterfaceView
 *
 * To use this in your app:
 * 1. Create a page at: src/app/focus/[id]/page.tsx
 * 2. Import and use this component
 *
 * Example:
 * ```tsx
 * import { FocusInterfacePage } from 'src/sections/focus-interface/example-page';
 *
 * export default function Page({ params }: { params: { id: string } }) {
 *   return <FocusInterfacePage focusId={params.id} />;
 * }
 * ```
 */

import { FocusInterfaceView } from './view';

// ----------------------------------------------------------------------

interface FocusInterfacePageProps {
  focusId: string;
}

export function FocusInterfacePage({ focusId }: FocusInterfacePageProps) {
  // FocusInterfaceView now includes ReactFlowProvider internally
  // and handles all dialogs/drawers via URL parameters
  return <FocusInterfaceView focusId={focusId} />;
}

