# V3 Interface Implementation Guide

## Overview

V3 Interface is a complete rebuild of the Focus Interface. This guide provides a phased implementation plan to build a working ReactFlow-based interface from scratch, avoiding the CSS/layout issues encountered in V2.

## Goals

1. **ReactFlow canvas** that renders correctly on first load
2. **Centered circular node** as the starting point
3. **Smooth cursor** with rotation based on movement direction
4. **Background dots** visible at all times
5. **Modular architecture** for future feature additions
6. **No dormant/disabled flags** - everything works or isn't included

---

## Architecture

```
src/
├── app/v3-interface/
│   └── page.tsx                    # Main page component
│
└── sections/v3-interface/
    ├── index.ts                    # Barrel exports
    ├── view.tsx                    # Main view component (inner)
    ├── types.ts                    # TypeScript interfaces
    │
    ├── nodes/
    │   ├── index.ts
    │   └── circular-node.tsx       # Circular node component
    │
    ├── edges/
    │   ├── index.ts
    │   └── animated-edge.tsx       # Custom animated edge
    │
    ├── components/
    │   ├── index.ts
    │   ├── canvas-container.tsx    # Properly sized ReactFlow container
    │   └── smooth-cursor.tsx       # Custom cursor (moved here)
    │
    └── hooks/
        ├── index.ts
        └── use-centered-nodes.ts   # Hook to center nodes in viewport
```

---

## Phase 1: Foundation (Core ReactFlow Setup)

### 1.1 Create Directory Structure

Create the following empty directories:
- `src/app/v3-interface/`
- `src/sections/v3-interface/`
- `src/sections/v3-interface/nodes/`
- `src/sections/v3-interface/edges/`
- `src/sections/v3-interface/components/`
- `src/sections/v3-interface/hooks/`

### 1.2 Create Types File

**File**: `src/sections/v3-interface/types.ts`

```typescript
import type { Node, Edge } from '@xyflow/react';

export interface CircularNodeData {
  label: string;
  description?: string;
  size?: number;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

export type CircularNode = Node<CircularNodeData, 'circular'>;

export interface V3InterfaceProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
}
```

### 1.3 Create Canvas Container Component

**File**: `src/sections/v3-interface/components/canvas-container.tsx`

This component solves the CSS height inheritance problem by using `position: fixed` with explicit viewport dimensions.

```typescript
'use client';

import { forwardRef } from 'react';
import Box from '@mui/material/Box';

interface CanvasContainerProps {
  children: React.ReactNode;
}

export const CanvasContainer = forwardRef<HTMLDivElement, CanvasContainerProps>(
  ({ children }, ref) => (
    <Box
      ref={ref}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  )
);

CanvasContainer.displayName = 'CanvasContainer';
```

**Why this works**: 
- `position: fixed` removes element from document flow
- `100vw` and `100vh` are explicit viewport units (not percentages)
- No CSS inheritance chain to break

### 1.4 Create Circular Node Component

**File**: `src/sections/v3-interface/nodes/circular-node.tsx`

```typescript
'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { m } from 'framer-motion';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { CircularNodeData } from '../types';

export const CircularNode = memo(({ data, isConnectable, selected }: NodeProps<CircularNodeData>) => {
  const {
    label = '',
    description = '',
    size = 140,
    backgroundColor = '#1a1a2e',
    borderColor = 'rgba(255, 255, 255, 0.3)',
    textColor = '#ffffff',
  } = data;

  return (
    <m.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      style={{ width: size, height: size }}
    >
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor,
          border: `2px solid ${borderColor}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: selected
            ? '0 0 0 3px rgba(25, 118, 210, 0.5), 0 8px 32px rgba(0, 0, 0, 0.3)'
            : '0 8px 32px rgba(0, 0, 0, 0.2)',
          cursor: 'pointer',
        }}
      >
        <Typography sx={{ color: textColor, fontWeight: 600, textAlign: 'center' }}>
          {label}
        </Typography>
        {description && (
          <Typography sx={{ color: textColor, opacity: 0.7, fontSize: '0.65rem' }}>
            {description}
          </Typography>
        )}

        {/* Handles */}
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
        <Handle type="target" position={Position.Left} id="left" isConnectable={isConnectable} />
        <Handle type="source" position={Position.Right} id="right" isConnectable={isConnectable} />
      </Box>
    </m.div>
  );
});

CircularNode.displayName = 'CircularNode';
```

### 1.5 Create Centered Nodes Hook

**File**: `src/sections/v3-interface/hooks/use-centered-nodes.ts`

```typescript
'use client';

import { useMemo } from 'react';
import type { Node } from '@xyflow/react';

interface UseCenteredNodesOptions {
  nodeSize?: number;
}

export function useCenteredNodes(
  nodes: Node[],
  options: UseCenteredNodesOptions = {}
): Node[] {
  const { nodeSize = 140 } = options;

  return useMemo(() => {
    if (typeof window === 'undefined') return nodes;

    const centerX = window.innerWidth / 2 - nodeSize / 2;
    const centerY = window.innerHeight / 2 - nodeSize / 2;

    return nodes.map((node, index) => {
      if (index === 0) {
        return { ...node, position: { x: centerX, y: centerY } };
      }
      return node;
    });
  }, [nodes, nodeSize]);
}
```

### 1.6 Create Main View Component

**File**: `src/sections/v3-interface/view.tsx`

```typescript
'use client';

import { useMemo } from 'react';
import { ReactFlow, ReactFlowProvider, Background, BackgroundVariant } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CanvasContainer } from './components/canvas-container';
import { CircularNode } from './nodes/circular-node';
import { useCenteredNodes } from './hooks/use-centered-nodes';
import type { V3InterfaceProps } from './types';

// Node types - defined outside component, memoized
const nodeTypes = { circular: CircularNode };

// Default initial node
const DEFAULT_NODES: Node[] = [
  {
    id: 'center-node',
    type: 'circular',
    position: { x: 0, y: 0 },
    data: {
      label: 'Focus',
      description: 'Start here',
      size: 140,
      backgroundColor: '#1a1a2e',
      borderColor: 'rgba(255, 255, 255, 0.3)',
      textColor: '#ffffff',
    },
  },
];

function V3InterfaceViewInner({ initialNodes = DEFAULT_NODES, initialEdges = [] }: V3InterfaceProps) {
  const centeredNodes = useCenteredNodes(initialNodes);
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  return (
    <CanvasContainer>
      <ReactFlow
        nodes={centeredNodes}
        edges={initialEdges}
        nodeTypes={memoizedNodeTypes}
        panOnScroll
        panOnScrollMode="free"
        panOnScrollSpeed={1.3}
        zoomOnScroll={false}
        zoomOnPinch
        zoomOnDoubleClick
        minZoom={0.5}
        maxZoom={2}
        preventScrolling
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(150, 150, 150, 0.5)"
        />
      </ReactFlow>
    </CanvasContainer>
  );
}

export function V3InterfaceView(props: V3InterfaceProps) {
  return (
    <ReactFlowProvider>
      <V3InterfaceViewInner {...props} />
    </ReactFlowProvider>
  );
}
```

### 1.7 Create Barrel Exports

**File**: `src/sections/v3-interface/index.ts`

```typescript
export { V3InterfaceView } from './view';
export { CircularNode } from './nodes/circular-node';
export { CanvasContainer } from './components/canvas-container';
export { useCenteredNodes } from './hooks/use-centered-nodes';
export type * from './types';
```

**File**: `src/sections/v3-interface/nodes/index.ts`

```typescript
export { CircularNode } from './circular-node';
```

**File**: `src/sections/v3-interface/components/index.ts`

```typescript
export { CanvasContainer } from './canvas-container';
```

**File**: `src/sections/v3-interface/hooks/index.ts`

```typescript
export { useCenteredNodes } from './use-centered-nodes';
```

### 1.8 Create Page Component

**File**: `src/app/v3-interface/page.tsx`

```typescript
import { V3InterfaceView } from 'src/sections/v3-interface';

export const metadata = {
  title: 'V3 Interface',
};

export default function V3InterfacePage() {
  return <V3InterfaceView />;
}
```

### 1.9 Phase 1 Verification

After completing Phase 1:
- [ ] Navigate to `/v3-interface`
- [ ] ReactFlow canvas renders immediately
- [ ] Background dots are visible
- [ ] Circular "Focus" node appears at center of viewport
- [ ] Node has entrance animation (scale from 0 to 1)
- [ ] Canvas is pannable and zoomable

---

## Phase 2: Smooth Cursor

### 2.1 Create Smooth Cursor Component

**File**: `src/sections/v3-interface/components/smooth-cursor.tsx`

Move and refactor the smooth cursor from `src/components/ui/smooth-cursor.tsx`:

Key requirements:
- Uses `m` from framer-motion (not `motion`) for LazyMotion compatibility
- Uses `useSpring` for smooth position interpolation
- Rotates based on movement direction
- Tracks during drag operations using `pointermove` with capture
- Arrow SVG cursor design

### 2.2 Integrate Cursor into View

Update `src/sections/v3-interface/view.tsx`:

```typescript
import { SmoothCursor } from './components/smooth-cursor';

// In the component:
return (
  <CanvasContainer>
    <SmoothCursor />
    <ReactFlow ...>
      ...
    </ReactFlow>
  </CanvasContainer>
);
```

### 2.3 Hide Native Cursor

Add to `CanvasContainer`:

```typescript
sx={{
  // ... existing styles
  cursor: 'none',
  '& *': { cursor: 'none !important' },
}}
```

### 2.4 Phase 2 Verification

- [ ] Native cursor is hidden
- [ ] Custom arrow cursor follows mouse smoothly
- [ ] Cursor rotates based on movement direction
- [ ] Cursor tracks during click-and-drag operations
- [ ] Cursor has slight scale animation while moving

---

## Phase 3: Node Interactions

### 3.1 Add Node State Management

Update view to use React state for nodes:

```typescript
const [nodes, setNodes] = useState<Node[]>(centeredNodes);
const [edges, setEdges] = useState<Edge[]>(initialEdges);

const onNodesChange = useCallback(
  (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
  []
);

const onEdgesChange = useCallback(
  (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
  []
);
```

### 3.2 Add Node Click Handler

```typescript
const [selectedNode, setSelectedNode] = useState<Node | null>(null);

const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
  setSelectedNode(node);
  console.log('Node clicked:', node.id);
}, []);
```

### 3.3 Phase 3 Verification

- [ ] Nodes can be dragged
- [ ] Node selection works (visual feedback)
- [ ] Node click logs to console
- [ ] Multiple nodes can be added and positioned

---

## Phase 4: Additional Node Types

### 4.1 Create Hexagon Node

**File**: `src/sections/v3-interface/nodes/hexagon-node.tsx`

Port from `src/sections/focus-interface/nodes/hexagon-node.tsx`

### 4.2 Create Glass Node

**File**: `src/sections/v3-interface/nodes/glass-node.tsx`

Port from `src/sections/focus-interface/nodes/glass-node.tsx`

### 4.3 Create AppStore Node

**File**: `src/sections/v3-interface/nodes/appstore-node.tsx`

Port from `src/sections/focus-interface/nodes/appstore-node.tsx`

### 4.4 Register Node Types

```typescript
const nodeTypes = {
  circular: CircularNode,
  hexagon: HexagonNode,
  glass: GlassNode,
  appstore: AppStoreNode,
};
```

### 4.5 Phase 4 Verification

- [ ] All four node types render correctly
- [ ] Each node type has proper styling
- [ ] Entrance animations work for all types
- [ ] Handles are positioned correctly

---

## Phase 5: Custom Edges

### 5.1 Create Animated Edge

**File**: `src/sections/v3-interface/edges/animated-edge.tsx`

Port from `src/sections/focus-interface/custom-edge.tsx`

### 5.2 Register Edge Types

```typescript
const edgeTypes = {
  animated: AnimatedEdge,
};
```

### 5.3 Phase 5 Verification

- [ ] Edges render between nodes
- [ ] Edge animations work
- [ ] Edge styling is correct

---

## Phase 6: Dialogs and Drawers

### 6.1 Create Node Dialog (Radial Timeline)

**File**: `src/sections/v3-interface/components/node-dialog.tsx`

Port from `src/sections/focus-interface/node-dialog.tsx`

### 6.2 Create Node Context Drawer

**File**: `src/sections/v3-interface/components/node-context-drawer.tsx`

Port from `src/sections/focus-interface/node-context-drawer.tsx`

### 6.3 Create Path Chat Drawer

**File**: `src/sections/v3-interface/components/path-chat-drawer.tsx`

Port from `src/sections/focus-interface/path-chat-drawer.tsx`

### 6.4 Create AppStore Card Dialog

**File**: `src/sections/v3-interface/components/appstore-card-dialog.tsx`

Port from `src/sections/focus-interface/appstore-card-dialog.tsx`

### 6.5 Integrate with URL Parameters

Use Next.js `useSearchParams` for dialog state:
- `?dialog=nodeId&type=dialog` → Radial Timeline
- `?dialog=nodeId&type=drawer` → Context Drawer
- `?dialog=nodeId&type=appstore` → App Store Card

### 6.6 Phase 6 Verification

- [ ] Clicking node opens appropriate dialog
- [ ] Dialog state persists in URL
- [ ] Back button closes dialog
- [ ] Animations work correctly

---

## Phase 7: Floating Input and Overlays

### 7.1 Create Floating Text Input

**File**: `src/sections/v3-interface/components/floating-text-input.tsx`

Port from `src/sections/focus-interface/floating-text-input.tsx`

### 7.2 Create Liquid Glass Overlay

**File**: `src/sections/v3-interface/components/liquid-glass-overlay.tsx`

Port from `src/sections/focus-interface/liquid-glass-overlay.tsx`

### 7.3 Create Stackable Avatars

**File**: `src/sections/v3-interface/components/stackable-avatars.tsx`

Port from `src/sections/focus-interface/stackable-avatars.tsx`

### 7.4 Phase 7 Verification

- [ ] Floating input appears at bottom center
- [ ] Input triggers chat drawer on submit
- [ ] Liquid glass overlay works
- [ ] Stackable avatars expand/collapse

---

## Phase 8: API Integration

### 8.1 Create API Hook

**File**: `src/sections/v3-interface/hooks/use-v3-interface.ts`

Similar to `src/hooks/use-focus-interface.ts`

### 8.2 Connect to Backend

- Fetch nodes/edges from API
- Transform API data to ReactFlow format
- Handle loading/error states

### 8.3 Phase 8 Verification

- [ ] Data loads from API
- [ ] Loading state displays
- [ ] Error state displays
- [ ] Nodes/edges render from API data

---

## Key Differences from V2

| Issue | V2 Approach | V3 Approach |
|-------|-------------|-------------|
| Container sizing | `height: 100%` with relative positioning | `position: fixed` with viewport units |
| ReactFlowProvider | Added later as fix | Included from start |
| Dormant features | Disabled with flags | Not included until working |
| Component location | Mixed between sections and components | All in v3-interface section |
| Cursor component | Separate in components/ui | Integrated in v3-interface |

---

## Testing Checklist

After each phase, verify:

1. **No console errors**
2. **No TypeScript errors**
3. **ReactFlow renders immediately** (no blank screen)
4. **Background dots visible**
5. **Nodes render at correct positions**
6. **Interactions work** (pan, zoom, drag, click)

---

## Notes

- **Do not copy files directly** - rewrite each component understanding its purpose
- **Test after each phase** - don't proceed until current phase works
- **Use `m` not `motion`** - project uses LazyMotion with strict mode
- **Memoize node/edge types** - prevents unnecessary re-renders
- **Use viewport units** - avoid percentage-based heights for containers

