# Playground Page Implementation Guide

A comprehensive guide for creating a playground page that showcases all React Flow node types, connections, and UI components from the Focus Interface.

---

## Overview

The playground page serves as a **living component library** for testing and visualizing all UI components. It displays:
- All 3 node types (Hexagon, Glass, AppStore)
- Custom animated edges with various styles
- All dialog/drawer components
- Interactive UI overlays

---

## File Structure

```
src/
├── app/playground/
│   └── page.tsx                    # Playground page route
└── sections/playground/
    ├── index.ts                    # Barrel exports
    ├── view.tsx                    # Main playground view
    └── playground-data.ts          # Sample nodes/edges data
```

---

## Components to Include

### 1. Node Types

| Type | Component | Dimensions | Action Type | Description |
|------|-----------|------------|-------------|-------------|
| `hexagon` | `HexagonNode` | 178×174px | `dialog` | Hexagon SVG with rounded corners |
| `glass` | `GlassNode` | 200×200px | `drawer` | Glass-effect with backdrop blur |
| `appstore` | `AppStoreNode` | 240×320px | `appstore` | App Store card with image |

**Import from:**
```typescript
import { HexagonNode, GlassNode, AppStoreNode } from 'src/sections/focus-interface';
```

### 2. Edge Types

| Type | Component | Features |
|------|-----------|----------|
| `animated` | `CustomAnimatedEdge` | Framer Motion animations, multiple line types |

**Edge Data Options:**
```typescript
{
  strokeColor: '#000000',
  strokeWidth: 2,
  animationDuration: 3,
  animationBounce: 0.3,
  enableHoverAnimation: true,
  hoverAnimationType: 'redraw' | 'float' | 'pulse' | 'color' | 'sequential',
  lineType: 'straight' | 'curved' | 'artistic',
  curvature: 0.3,
}
```

### 3. Dialog Components

| Component | Trigger | Description |
|-----------|---------|-------------|
| `NodeDialog` | `actionType: 'dialog'` | Full-screen Radial Timeline |
| `NodeContextDrawer` | `actionType: 'drawer'` | Left drawer for context |
| `PathChatDrawer` | Chat button | Right drawer for chat |
| `AppStoreCardDialog` | `actionType: 'appstore'` | Morphing card expansion |

### 4. UI Overlay Components

| Component | Position | Description |
|-----------|----------|-------------|
| `FloatingTextInput` | Bottom center | Command palette with `g/` goal switching |
| `Stackable` + `AvatarCard` | Bottom right | Stackable avatar cards |
| `LiquidGlassOverlay` | Full screen | Blur overlay when avatars expanded |
| `Fab` buttons | Bottom left | Radial timeline & add document |

---

## Sample Data Structure

### Nodes

```typescript
import type { Node } from '@xyflow/react';

const playgroundNodes: Node[] = [
  // Hexagon Node
  {
    id: 'hex-1',
    type: 'hexagon',
    position: { x: 0, y: 0 },
    data: {
      label: 'Hexagon Node',
      opacity: 1,
      actionType: 'dialog',
      description: 'Opens Radial Timeline dialog',
      importance: 8,
      stage: 'Planning',
      index: 0,
    },
  },
  // Glass Node
  {
    id: 'glass-1',
    type: 'glass',
    position: { x: 300, y: 0 },
    data: {
      label: 'Glass Node',
      opacity: 1,
      actionType: 'drawer',
      description: 'Opens context drawer',
      stage: 'In Progress',
      index: 1,
    },
  },
  // AppStore Node
  {
    id: 'appstore-1',
    type: 'appstore',
    position: { x: 600, y: 0 },
    data: {
      id: 'appstore-1',
      label: 'App Store Card',
      opacity: 1,
      actionType: 'appstore',
      description: 'Expands to full card view',
      category: 'Productivity',
      amount: '$4.99',
      backgroundColor: '#814A0E',
      imageUrl: '/assets/images/cover/cover-1.webp',
      index: 2,
    },
  },
];
```

### Edges

```typescript
import type { Edge } from '@xyflow/react';

const playgroundEdges: Edge[] = [
  {
    id: 'e-hex-glass',
    source: 'hex-1',
    target: 'glass-1',
    type: 'animated',
    data: {
      strokeColor: '#000000',
      strokeWidth: 2,
      animationDuration: 2,
      lineType: 'curved',
      curvature: 0.3,
      initialAnimation: true,
      enableHoverAnimation: true,
      hoverAnimationType: 'redraw',
    },
  },
  {
    id: 'e-glass-appstore',
    source: 'glass-1',
    target: 'appstore-1',
    type: 'animated',
    data: {
      strokeColor: '#4f46e5',
      strokeWidth: 3,
      animationDuration: 1.5,
      lineType: 'artistic',
      initialAnimation: true,
      enableHoverAnimation: true,
      hoverAnimationType: 'pulse',
    },
  },
];
```

---

## View Component Structure

```tsx
// src/sections/playground/view.tsx
'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Import all components from focus-interface
import {
  HexagonNode,
  GlassNode,
  AppStoreNode,
  CustomAnimatedEdge,
  NodeDialog,
  NodeContextDrawer,
  PathChatDrawer,
  AppStoreCardDialog,
} from 'src/sections/focus-interface';

import { FloatingTextInput } from 'src/sections/focus-interface/floating-text-input';
import { LiquidGlassOverlay } from 'src/sections/focus-interface/liquid-glass-overlay';
import { Stackable, AvatarCard } from 'src/sections/focus-interface/stackable-avatars';

// Import sample data
import { playgroundNodes, playgroundEdges } from './playground-data';

function PlaygroundViewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL-based dialog state
  const dialogNodeId = searchParams.get('dialog');
  const dialogType = searchParams.get('type');
  
  // Node/Edge types
  const nodeTypes = useMemo(() => ({
    hexagon: HexagonNode,
    glass: GlassNode,
    appstore: AppStoreNode,
  }), []);
  
  const edgeTypes = useMemo(() => ({
    animated: CustomAnimatedEdge,
  }), []);
  
  // Handle node click - update URL
  const onNodeClick = useCallback((_event, node) => {
    const actionType = node.data?.actionType || 'dialog';
    const params = new URLSearchParams(searchParams);
    params.set('dialog', node.id);
    params.set('type', actionType);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);
  
  // Close dialog - clear URL params
  const handleCloseDialog = useCallback(() => {
    router.push('?', { scroll: false });
  }, [router]);

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={playgroundNodes}
        edges={playgroundEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        fitView
      />
      
      {/* Dialogs rendered based on URL params */}
      {dialogNodeId && dialogType === 'dialog' && (
        <NodeDialog node={...} open onClose={handleCloseDialog} />
      )}
      {dialogNodeId && dialogType === 'drawer' && (
        <NodeContextDrawer node={...} open onClose={handleCloseDialog} />
      )}
      {dialogNodeId && dialogType === 'appstore' && (
        <AppStoreCardDialog node={...} open onClose={handleCloseDialog} />
      )}
      
      {/* UI Overlays */}
      <FloatingTextInput onSend={console.log} />
      <Stackable>
        <AvatarCard avatarIndex={1} />
        <AvatarCard avatarIndex={2} />
        <AvatarCard avatarIndex={3} />
      </Stackable>
    </Box>
  );
}

export function PlaygroundView() {
  return (
    <ReactFlowProvider>
      <PlaygroundViewInner />
    </ReactFlowProvider>
  );
}
```

---

## URL-Based Dialog Routing

Dialogs are controlled via URL query parameters:

| URL | Dialog |
|-----|--------|
| `?dialog=nodeId&type=dialog` | Radial Timeline |
| `?dialog=nodeId&type=drawer` | Context Drawer |
| `?dialog=nodeId&type=appstore` | App Store Card |

---

## Animation Properties

### Node Animations (Framer Motion)

All nodes support entrance/exit animations:

```typescript
{
  index: 0,              // Animation delay = index * 0.08s
  isExiting: false,      // Trigger exit animation
  exitAnimationType: 'slide' | 'shuffle',
}
```

### Edge Animations

```typescript
{
  initialAnimation: true,    // Draw-in animation on mount
  animationDuration: 2,      // Duration in seconds
  animationBounce: 0.3,      // Spring bounce factor
}
```

---

## Next Steps

1. Create `src/app/playground/page.tsx`
2. Create `src/sections/playground/view.tsx`
3. Create `src/sections/playground/playground-data.ts`
4. Add navigation link in dashboard sidebar
5. Test all component interactions

---

## Related Files

- `src/sections/focus-interface/view.tsx` - Reference implementation
- `src/sections/flow-2/goals-data.ts` - Sample data structure
- `src/types/focus-interface.ts` - TypeScript types

