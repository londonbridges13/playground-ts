# Focus Interface API - Frontend Implementation Guide

Complete guide for implementing Focus Interface visualization in your React/Next.js frontend.

**Adapted for your codebase patterns:**
- ✅ Uses `axios` instead of `fetch()`
- ✅ Uses `src/` imports (not `@/`)
- ✅ Follows your existing patterns for hooks, API clients, and types
- ✅ Includes `'use client'` directives for client components
- ✅ Uses Material-UI styling patterns

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [File Structure](#file-structure)
5. [TypeScript Types](#typescript-types)
6. [API Integration](#api-integration)
7. [React Flow Setup](#react-flow-setup)
8. [Custom Node Components](#custom-node-components)
9. [Interface Visualization](#interface-visualization)
10. [State Management](#state-management)
11. [Interactive Features](#interactive-features)
12. [Best Practices](#best-practices)

---

## Overview

The Focus Interface API generates React Flow-compatible visualizations with:
- **Automatic Layout** - Dagre algorithm positions nodes intelligently
- **Precise Handle Coordinates** - Pixel-perfect edge connections
- **Custom Node Types** - Hexagon, Glass, and AppStore nodes
- **Smart Edge Routing** - Automatic source/target handle selection

---

## Prerequisites

### Required Dependencies

```bash
npm install reactflow @xyflow/react
```

---

## File Structure

Recommended structure following your codebase conventions:

```
src/
├── lib/
│   ├── axios.ts                    # ✅ Add endpoints here
│   └── api/
│       └── focus-interface.ts      # NEW: API client
├── hooks/
│   ├── index.ts                    # NEW: Export barrel
│   └── use-focus-interface.ts      # NEW: Custom hook
├── types/
│   └── focus-interface.ts          # NEW: TypeScript types
└── sections/
    └── focus-interface/            # NEW: Focus interface section
        ├── view.tsx                # Main view component
        ├── focus-visualization.tsx # Visualization component
        └── nodes/
            ├── hexagon-node.tsx
            ├── glass-node.tsx
            └── appstore-node.tsx
```

---

## TypeScript Types

Create `src/types/focus-interface.ts`:

```typescript
// src/types/focus-interface.ts
export interface FocusInterface {
  goal: {
    id: string;
    name: string;
    description: string;
    icon?: string;
  };
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface FlowNode {
  id: string;
  type: 'hexagon' | 'glass' | 'appstore';
  position: { x: number; y: number };
  data: {
    label: string;
    opacity: number;
    actionType: 'dialog' | 'drawer' | 'appstore';
    description?: string;
    amount?: string;
    stage?: string;
    importance?: number;
    category?: string;
    backgroundColor?: string;
    imageUrl?: string;
    pointOfInterest?: number;
  };
  handles: {
    sources: HandleCoordinates[];
    targets: HandleCoordinates[];
  };
}

export interface HandleCoordinates {
  id: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  coordinates: { x: number; y: number };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  type: string;
  data: {
    strokeColor?: string;
    strokeWidth?: number;
    animationDuration?: number;
    lineType?: 'artistic' | 'curved' | 'straight';
  };
}
```

---

## Installation

### 1. Install Dependencies

```bash
npm install reactflow @xyflow/react
```

### 2. Configure Next.js

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['reactflow', '@xyflow/react'],
};

module.exports = nextConfig;
```

---

## API Integration

### Step 1: Add Endpoints to Axios Config

Update `src/lib/axios.ts`:

```typescript
// src/lib/axios.ts
export const endpoints = {
  // ... existing endpoints
  focus: {
    interface: (id: string) => `/api/focus/${id}/interface`,
    generateInterface: (id: string) => `/api/focus/${id}/generate-interface`,
  },
} as const;
```

### Step 2: Create API Client

Create `src/lib/api/focus-interface.ts`:

```typescript
// src/lib/api/focus-interface.ts
import type { FocusInterface, NodeInput, EdgeInput, LayoutConfig } from 'src/types/focus-interface';
import axios, { endpoints } from 'src/lib/axios';

/**
 * Focus Interface API Client
 * Uses axios instance with centralized error handling
 */
export const focusInterfaceAPI = {
  /**
   * Get existing interface for a Focus
   */
  async getInterface(focusId: string): Promise<FocusInterface> {
    try {
      const res = await axios.get(endpoints.focus.interface(focusId));

      if (!res.data.success) {
        throw new Error(res.data.error || 'Failed to fetch interface');
      }

      return res.data.interface;
    } catch (error) {
      console.error('Error fetching interface:', error);
      throw error;
    }
  },

  /**
   * Generate a new interface for a Focus
   */
  async generateInterface(
    focusId: string,
    nodes: NodeInput[],
    edges: EdgeInput[],
    options?: {
      layoutConfig?: LayoutConfig;
      goalIcon?: string;
    }
  ): Promise<FocusInterface> {
    try {
      const res = await axios.post(endpoints.focus.generateInterface(focusId), {
        nodes,
        edges,
        layoutConfig: options?.layoutConfig,
        goalIcon: options?.goalIcon,
      });

      if (!res.data.success) {
        throw new Error(res.data.error || 'Failed to generate interface');
      }

      return res.data.interface;
    } catch (error) {
      console.error('Error generating interface:', error);
      throw error;
    }
  },
};
```

### Step 3: Create Custom Hook

Create `src/hooks/use-focus-interface.ts`:

```typescript
// src/hooks/use-focus-interface.ts
'use client';

import type { FocusInterface, NodeInput, EdgeInput } from 'src/types/focus-interface';
import { useState, useEffect, useCallback } from 'react';
import { focusInterfaceAPI } from 'src/lib/api/focus-interface';

export function useFocusInterface(focusId: string) {
  const [focusInterface, setFocusInterface] = useState<FocusInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!focusId) return;

    const fetchInterface = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await focusInterfaceAPI.getInterface(focusId);
        setFocusInterface(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load interface');
      } finally {
        setLoading(false);
      }
    };

    fetchInterface();
  }, [focusId]);

  const regenerate = useCallback(
    async (nodes: NodeInput[], edges: EdgeInput[]) => {
      try {
        setLoading(true);
        setError(null);
        const data = await focusInterfaceAPI.generateInterface(focusId, nodes, edges);
        setFocusInterface(data);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate interface');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [focusId]
  );

  return {
    focusInterface,
    loading,
    error,
    regenerate,
  };
}
```

### Step 4: Export Hook

Create/update `src/hooks/index.ts`:

```typescript
// src/hooks/index.ts
export { useFocusInterface } from './use-focus-interface';
```

---

## React Flow Setup

### Basic React Flow Component

Create `src/sections/focus-interface/focus-visualization.tsx`:

```typescript
// src/sections/focus-interface/focus-visualization.tsx
'use client';

import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { useFocusInterface } from 'src/hooks';
import { HexagonNode } from './nodes/hexagon-node';
import { GlassNode } from './nodes/glass-node';
import { AppStoreNode } from './nodes/appstore-node';

// Define custom node types
const nodeTypes = {
  hexagon: HexagonNode,
  glass: GlassNode,
  appstore: AppStoreNode,
};

interface FocusVisualizationProps {
  focusId: string;
}

export function FocusVisualization({ focusId }: FocusVisualizationProps) {
  const { focusInterface, loading, error } = useFocusInterface(focusId);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Load interface data into React Flow
  useEffect(() => {
    if (focusInterface) {
      setNodes(focusInterface.nodes);
      setEdges(focusInterface.edges);
    }
  }, [focusInterface, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body1">Loading visualization...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Typography variant="body1" color="error">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  if (!focusInterface) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No interface available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </Box>
  );
}
```

---

## Custom Node Components

### Hexagon Node

Create `src/sections/focus-interface/nodes/hexagon-node.tsx`:

```typescript
// src/sections/focus-interface/nodes/hexagon-node.tsx
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const HexagonNode = memo(({ data, id }: NodeProps) => {
  return (
    <Box
      sx={{
        width: 178,
        height: 174,
        opacity: data.opacity || 1,
        backgroundColor: data.backgroundColor || 'primary.main',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: 2,
      }}
    >
      {/* Render handles at precise coordinates */}
      {data.handles?.sources?.map((handle: any) => (
        <Handle
          key={handle.id}
          type="source"
          position={handle.position as Position}
          id={handle.id}
          style={{
            left: `${handle.coordinates.x}px`,
            top: `${handle.coordinates.y}px`,
          }}
        />
      ))}

      {data.handles?.targets?.map((handle: any) => (
        <Handle
          key={handle.id}
          type="target"
          position={handle.position as Position}
          id={handle.id}
          style={{
            left: `${handle.coordinates.x}px`,
            top: `${handle.coordinates.y}px`,
          }}
        />
      ))}

      <Typography variant="h6" color="white" textAlign="center">
        {data.label}
      </Typography>
      {data.description && (
        <Typography variant="caption" color="white" textAlign="center" sx={{ mt: 1 }}>
          {data.description}
        </Typography>
      )}
      {data.importance && (
        <Typography variant="caption" color="white" sx={{ mt: 1 }}>
          Importance: {data.importance}
        </Typography>
      )}
    </Box>
  );
});

HexagonNode.displayName = 'HexagonNode';
```

### Glass Node

Create `src/sections/focus-interface/nodes/glass-node.tsx`:

```typescript
// src/sections/focus-interface/nodes/glass-node.tsx
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const GlassNode = memo(({ data, id }: NodeProps) => {
  return (
    <Box
      sx={{
        width: 200,
        height: 200,
        opacity: data.opacity || 0.9,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        position: 'relative',
        padding: 2,
      }}
    >
      {/* Handles */}
      {data.handles?.sources?.map((handle: any) => (
        <Handle
          key={handle.id}
          type="source"
          position={handle.position as Position}
          id={handle.id}
          style={{
            left: `${handle.coordinates.x}px`,
            top: `${handle.coordinates.y}px`,
          }}
        />
      ))}

      {data.handles?.targets?.map((handle: any) => (
        <Handle
          key={handle.id}
          type="target"
          position={handle.position as Position}
          id={handle.id}
          style={{
            left: `${handle.coordinates.x}px`,
            top: `${handle.coordinates.y}px`,
          }}
        />
      ))}

      <Typography variant="h6" fontWeight="bold">
        {data.label}
      </Typography>
      {data.description && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          {data.description}
        </Typography>
      )}
      {data.stage && (
        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
          Stage: {data.stage}
        </Typography>
      )}
    </Box>
  );
});

GlassNode.displayName = 'GlassNode';
```

### AppStore Node

Create `src/sections/focus-interface/nodes/appstore-node.tsx`:

```typescript
// src/sections/focus-interface/nodes/appstore-node.tsx
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const AppStoreNode = memo(({ data, id }: NodeProps) => {
  return (
    <Box
      sx={{
        width: 240,
        height: 320,
        opacity: data.opacity || 1,
        backgroundColor: data.backgroundColor || 'grey.800',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Handles */}
      {data.handles?.sources?.map((handle: any) => (
        <Handle
          key={handle.id}
          type="source"
          position={handle.position as Position}
          id={handle.id}
          style={{
            left: `${handle.coordinates.x}px`,
            top: `${handle.coordinates.y}px`,
          }}
        />
      ))}

      {data.handles?.targets?.map((handle: any) => (
        <Handle
          key={handle.id}
          type="target"
          position={handle.position as Position}
          id={handle.id}
          style={{
            left: `${handle.coordinates.x}px`,
            top: `${handle.coordinates.y}px`,
          }}
        />
      ))}

      {data.imageUrl && (
        <Box sx={{ height: 192 }}>
          <img
            src={data.imageUrl}
            alt={data.label}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
      )}
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold" color="white">
          {data.label}
        </Typography>
        {data.description && (
          <Typography variant="body2" color="grey.300" sx={{ mt: 1 }}>
            {data.description}
          </Typography>
        )}
        {data.amount && (
          <Typography variant="body2" color="success.main" fontWeight="bold" sx={{ mt: 1 }}>
            {data.amount}
          </Typography>
        )}
        {data.category && (
          <Typography variant="caption" color="grey.400" sx={{ mt: 0.5, display: 'block' }}>
            {data.category}
          </Typography>
        )}
      </Box>
    </Box>
  );
});

AppStoreNode.displayName = 'AppStoreNode';
```

---

## Interface Visualization

### Complete Visualization Component

Create `src/sections/focus-interface/view.tsx`:

```typescript
// src/sections/focus-interface/view.tsx
'use client';

import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Panel,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useFocusInterface } from 'src/hooks';
import { HexagonNode } from './nodes/hexagon-node';
import { GlassNode } from './nodes/glass-node';
import { AppStoreNode } from './nodes/appstore-node';

const nodeTypes = {
  hexagon: HexagonNode,
  glass: GlassNode,
  appstore: AppStoreNode,
};

interface FocusInterfaceViewProps {
  focusId: string;
  onNodeClick?: (nodeId: string, nodeData: any) => void;
  onEdgeClick?: (edgeId: string, edgeData: any) => void;
  editable?: boolean;
}

export function FocusInterfaceView({
  focusId,
  onNodeClick,
  onEdgeClick,
  editable = false,
}: FocusInterfaceViewProps) {
  const { focusInterface, loading, error } = useFocusInterface(focusId);
  const { fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Load interface data
  useEffect(() => {
    if (focusInterface) {
      setNodes(focusInterface.nodes);
      setEdges(focusInterface.edges);

      // Fit view after nodes are loaded
      setTimeout(() => fitView({ padding: 0.2 }), 100);
    }
  }, [focusInterface, setNodes, setEdges, fitView]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (editable) {
        setEdges((eds) => addEdge(params, eds));
      }
    },
    [setEdges, editable]
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: any) => {
      if (onNodeClick) {
        onNodeClick(node.id, node.data);
      }
    },
    [onNodeClick]
  );

  const handleEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      if (onEdgeClick) {
        onEdgeClick(edge.id, edge.data);
      }
    },
    [onEdgeClick]
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={48} />
          <Typography variant="body1" sx={{ mt: 2 }} color="text.secondary">
            Loading visualization...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="error" fontWeight="bold">
            Error
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }} color="text.secondary">
            {error}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!focusInterface) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No interface available
          </Typography>
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }} color="text.disabled">
            Generate an interface to visualize this Focus
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={editable ? onNodesChange : undefined}
        onEdgesChange={editable ? onEdgesChange : undefined}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        nodesDraggable={editable}
        nodesConnectable={editable}
        elementsSelectable
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'hexagon':
                return '#4F46E5';
              case 'glass':
                return '#10B981';
              case 'appstore':
                return '#F59E0B';
              default:
                return '#6B7280';
            }
          }}
        />

        {/* Goal Panel */}
        {focusInterface.goal && (
          <Panel position="top-left">
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              {focusInterface.goal.icon && (
                <Typography variant="h4">{focusInterface.goal.icon}</Typography>
              )}
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {focusInterface.goal.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {focusInterface.goal.description}
                </Typography>
              </Box>
            </Paper>
          </Panel>
        )}
      </ReactFlow>
    </Box>
  );
}
```

---

## State Management

### Optional: Context Provider for Focus Interface

If you need global state management, create a context provider following your codebase pattern:

```typescript
// src/sections/focus-interface/context/focus-interface-context.tsx
'use client';

import { use, createContext } from 'react';

import type { FocusInterface, NodeInput, EdgeInput } from 'src/types/focus-interface';

// ----------------------------------------------------------------------

export type FocusInterfaceContextValue = {
  currentInterface: FocusInterface | null;
  loading: boolean;
  error: string | null;
  loadInterface: (focusId: string) => Promise<void>;
  generateInterface: (focusId: string, nodes: NodeInput[], edges: EdgeInput[]) => Promise<void>;
  clearInterface: () => void;
};

// ----------------------------------------------------------------------

export const FocusInterfaceContext = createContext<FocusInterfaceContextValue | undefined>(
  undefined
);

// ----------------------------------------------------------------------

export function useFocusInterfaceContext() {
  const context = use(FocusInterfaceContext);

  if (!context) {
    throw new Error('useFocusInterfaceContext must be used within FocusInterfaceProvider');
  }

  return context;
}
```

```typescript
// src/sections/focus-interface/context/focus-interface-provider.tsx
'use client';

import type { ReactNode } from 'react';
import type { FocusInterface, NodeInput, EdgeInput } from 'src/types/focus-interface';

import { useState, useCallback, useMemo } from 'react';

import { focusInterfaceAPI } from 'src/lib/api/focus-interface';

import { FocusInterfaceContext } from './focus-interface-context';

// ----------------------------------------------------------------------

export type FocusInterfaceProviderProps = {
  children: ReactNode;
};

export function FocusInterfaceProvider({ children }: FocusInterfaceProviderProps) {
  const [currentInterface, setCurrentInterface] = useState<FocusInterface | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInterface = useCallback(async (focusId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await focusInterfaceAPI.getInterface(focusId);
      setCurrentInterface(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interface');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateInterface = useCallback(
    async (focusId: string, nodes: NodeInput[], edges: EdgeInput[]) => {
      try {
        setLoading(true);
        setError(null);
        const data = await focusInterfaceAPI.generateInterface(focusId, nodes, edges);
        setCurrentInterface(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate interface');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearInterface = useCallback(() => {
    setCurrentInterface(null);
    setError(null);
  }, []);

  const memoizedValue = useMemo(
    () => ({
      currentInterface,
      loading,
      error,
      loadInterface,
      generateInterface,
      clearInterface,
    }),
    [currentInterface, loading, error, loadInterface, generateInterface, clearInterface]
  );

  return (
    <FocusInterfaceContext.Provider value={memoizedValue}>
      {children}
    </FocusInterfaceContext.Provider>
  );
}
```

**Note:** Your codebase uses the `use()` hook pattern (from React 19) instead of `useContext()`. See `src/auth/hooks/use-auth-context.ts` for reference.
```


---

## Interactive Features

### Node Detail Dialog

Create `src/sections/focus-interface/components/node-detail-dialog.tsx`:

```typescript
// src/sections/focus-interface/components/node-detail-dialog.tsx
'use client';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

interface NodeDetailDialogProps {
  open: boolean;
  onClose: () => void;
  nodeData: any;
}

export function NodeDetailDialog({ open, onClose, nodeData }: NodeDetailDialogProps) {
  if (!nodeData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{nodeData.label}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {nodeData.description && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2">{nodeData.description}</Typography>
            </Box>
          )}

          {nodeData.importance && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Importance
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={nodeData.importance * 10}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
                <Typography variant="body2">{nodeData.importance}/10</Typography>
              </Box>
            </Box>
          )}

          {nodeData.stage && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Stage
              </Typography>
              <Typography variant="body2">{nodeData.stage}</Typography>
            </Box>
          )}

          {nodeData.category && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Category
              </Typography>
              <Typography variant="body2">{nodeData.category}</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
```

### Usage Example

```typescript
// src/app/focus/[id]/page.tsx
'use client';

import { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { FocusInterfaceView } from 'src/sections/focus-interface/view';
import { NodeDetailDialog } from 'src/sections/focus-interface/components/node-detail-dialog';

export default function FocusPage({ params }: { params: { id: string } }) {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const handleNodeClick = (nodeId: string, nodeData: any) => {
    setSelectedNode(nodeData);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1 }}>
        <ReactFlowProvider>
          <FocusInterfaceView focusId={params.id} onNodeClick={handleNodeClick} />
        </ReactFlowProvider>
      </Box>

      <NodeDetailDialog
        open={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        nodeData={selectedNode}
      />
    </Box>
  );
}



---

## Best Practices

### 1. Error Handling

Your codebase uses axios interceptors for centralized error handling. Errors are already formatted:

```typescript
// Error handling is automatic via axios interceptors
const handleGenerateInterface = async () => {
  try {
    setLoading(true);
    setError(null);

    const result = await focusInterfaceAPI.generateInterface(focusId, nodes, edges);

    // Success - no need to check result.success
    return result;
  } catch (error) {
    // Error is already formatted by axios interceptor
    const message = error instanceof Error ? error.message : 'Failed to generate interface';
    setError(message);
    console.error('Interface generation error:', error);
  } finally {
    setLoading(false);
  }
};
```

### 2. Loading States

Use Material-UI components for loading states:

```typescript
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';

{loading && (
  <Backdrop open sx={{ position: 'absolute', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
    <Box sx={{ textAlign: 'center' }}>
      <CircularProgress />
      <Typography variant="body2" sx={{ mt: 2 }}>
        Loading interface...
      </Typography>
    </Box>
  </Backdrop>
)}
```

### 3. Memoization

Use React.memo for custom nodes to prevent unnecessary re-renders:

```typescript
export const HexagonNode = memo(({ data, id }: NodeProps) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.data === nextProps.data &&
    prevProps.selected === nextProps.selected
  );
});
```

### 4. Handle Coordinates

Always use the provided handle coordinates for precise positioning:

```typescript
// ✅ Correct - Use provided coordinates
<Handle
  type="source"
  position={handle.position}
  id={handle.id}
  style={{
    left: `${handle.coordinates.x}px`,
    top: `${handle.coordinates.y}px`,
  }}
/>

// ❌ Incorrect - Don't use default positioning
<Handle type="source" position="right" />
```

### 5. Responsive Design

Use Material-UI's sx prop for responsive design:

```typescript
<Box
  sx={{
    width: '100%',
    height: { xs: '100vh', md: 600, lg: 800 },
  }}
>
  <ReactFlow {...props} />
</Box>
```

### 6. Performance Optimization

For large graphs, use React Flow's performance features:

```typescript
<ReactFlow
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}
  // Performance optimizations
  elevateNodesOnSelect={false}
  elevateEdgesOnSelect={false}
  selectNodesOnDrag={false}
  // Only update on significant changes
  onlyRenderVisibleElements={true}
/>
```

### 7. Accessibility

Add ARIA labels and keyboard navigation:

```typescript
<ReactFlow
  nodes={nodes}
  edges={edges}
  aria-label="Focus interface visualization"
  // Enable keyboard navigation
  panOnScroll={true}
  zoomOnScroll={true}
  zoomOnPinch={true}
/>
```

---

## Complete Example

### Full Page Implementation

```typescript
// src/app/focus/[id]/page.tsx
'use client';

import { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { FocusInterfaceView } from 'src/sections/focus-interface/view';
import { NodeDetailDialog } from 'src/sections/focus-interface/components/node-detail-dialog';

export default function FocusInterfacePage({ params }: { params: { id: string } }) {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const handleNodeClick = (nodeId: string, nodeData: any) => {
    setSelectedNode(nodeData);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <Paper
        sx={{
          width: 320,
          borderRight: 1,
          borderColor: 'divider',
          p: 2,
          overflowY: 'auto',
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Focus Interface
        </Typography>
        {/* Add your controls here */}
      </Paper>

      {/* Visualization */}
      <Box sx={{ flex: 1 }}>
        <ReactFlowProvider>
          <FocusInterfaceView focusId={params.id} onNodeClick={handleNodeClick} />
        </ReactFlowProvider>
      </Box>

      {/* Node Detail Dialog */}
      <NodeDetailDialog
        open={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        nodeData={selectedNode}
      />
    </Box>
  );
}
```

---

## Troubleshooting

### Issue: Nodes not rendering

**Solution:** Ensure node types are registered:

```typescript
const nodeTypes = {
  hexagon: HexagonNode,
  glass: GlassNode,
  appstore: AppStoreNode,
};

<ReactFlow nodeTypes={nodeTypes} />
```

### Issue: Handles not connecting

**Solution:** Use exact handle IDs from API response:

```typescript
<Handle
  id={handle.id}  // Must match sourceHandle/targetHandle in edges
  type="source"
  position={handle.position}
/>
```

### Issue: Layout looks wrong

**Solution:** Use `fitView` after loading:

```typescript
useEffect(() => {
  if (nodes.length > 0) {
    setTimeout(() => fitView({ padding: 0.2 }), 100);
  }
}, [nodes, fitView]);
```

---

## Key Differences from Generic Guide

### ✅ Adapted to Your Codebase

1. **Import Paths**: Uses `src/` instead of `@/`
2. **HTTP Client**: Uses `axios` from `src/lib/axios` instead of `fetch()`
3. **Endpoints**: Added to existing `endpoints` object in `src/lib/axios.ts`
4. **Styling**: Uses Material-UI components and `sx` prop instead of Tailwind
5. **Client Components**: Includes `'use client'` directive
6. **Hook Pattern**: Follows your `useCallback` and `useMemo` patterns
7. **Context Pattern**: Uses `use()` hook (React 19) instead of `useContext()`
8. **Error Handling**: Leverages axios interceptors for centralized error handling
9. **File Organization**: Follows your `sections/` pattern for feature components
10. **Export Pattern**: Uses barrel exports with `index.ts` files

---

## Resources

- **[React Flow Documentation](https://reactflow.dev/)** - Official React Flow docs
- **[FOCUS_INTERFACE_GENERATOR.md](./FOCUS_INTERFACE_GENERATOR.md)** - Backend implementation guide
- **[Material-UI Documentation](https://mui.com/)** - Your UI framework

---

## Summary

This guide has been adapted to match your codebase conventions:

- ✅ Uses axios with centralized endpoints
- ✅ Follows Material-UI styling patterns
- ✅ Uses `src/` import paths
- ✅ Includes `'use client'` directives
- ✅ Follows your existing hook and context patterns
- ✅ Organized in `sections/` directory structure
- ✅ Uses barrel exports with `index.ts`

**Next Steps:**
1. Create the TypeScript types in `src/types/focus-interface.ts`
2. Add endpoints to `src/lib/axios.ts`
3. Create the API client in `src/lib/api/focus-interface.ts`
4. Create the custom hook in `src/hooks/use-focus-interface.ts`
5. Create the node components in `src/sections/focus-interface/nodes/`
6. Create the main view in `src/sections/focus-interface/view.tsx`

---

**Last Updated:** 2025-10-23

**Version:** 2.0.0 (Adapted for your codebase)


