// src/app/playground/page.tsx
'use client';

import { PlaygroundView } from 'src/sections/playground';

// ----------------------------------------------------------------------

/**
 * Playground Page
 *
 * A living component library showcasing all React Flow node types,
 * connections, and UI components from the Focus Interface.
 *
 * Goals:
 * - "All Components" - Demonstrates all node types (hexagon, glass, appstore),
 *   edge styles, and dialog/drawer interactions
 * - "18 Archetypes" - Jungian archetypes visualized as a connected network
 *
 * Features:
 * - Click nodes to trigger different dialog types (dialog, drawer, appstore)
 * - Use the floating text input with "g/" command to switch goals
 * - Expand stackable avatars to see liquid glass overlay
 * - FAB button opens radial timeline
 */
export default function PlaygroundPage() {
  return <PlaygroundView />;
}

