# Focus Interface - Frontend Implementation

Complete frontend implementation for visualizing Focus interfaces using React Flow.

## 📁 File Structure

```
src/
├── types/
│   └── focus-interface.ts              # TypeScript type definitions
├── lib/
│   ├── axios.ts                        # ✅ Updated with focus endpoints
│   └── api/
│       └── focus-interface.ts          # API client for Focus Interface
├── hooks/
│   ├── index.ts                        # Barrel export
│   └── use-focus-interface.ts          # Custom hook for fetching interfaces
└── sections/
    └── focus-interface/
        ├── index.ts                    # Barrel export
        ├── view.tsx                    # Main visualization component
        ├── example-page.tsx            # Example usage
        ├── nodes/
        │   ├── hexagon-node.tsx        # Hexagon node component (178x174)
        │   ├── glass-node.tsx          # Glass node component (200x200)
        │   └── appstore-node.tsx       # AppStore node component (240x320)
        └── components/
            └── node-detail-dialog.tsx  # Dialog for node details
```

## ✅ Implementation Complete

All files have been created and are ready to use!

### What's Included:

1. **TypeScript Types** (`src/types/focus-interface.ts`)
   - Complete type definitions for Focus Interface API
   - Input/output types for API calls
   - Layout configuration types

2. **API Integration** (`src/lib/api/focus-interface.ts`)
   - Axios-based API client
   - `getInterface(focusId)` - Fetch existing interface
   - `generateInterface(focusId, nodes, edges, options)` - Generate new interface

3. **Custom Hook** (`src/hooks/use-focus-interface.ts`)
   - `useFocusInterface(focusId)` hook
   - Returns: `{ focusInterface, loading, error, regenerate }`
   - Automatic data fetching on mount

4. **Node Components** (`src/sections/focus-interface/nodes/`)
   - `HexagonNode` - 178x174px hexagon nodes
   - `GlassNode` - 200x200px glass-effect nodes
   - `AppStoreNode` - 240x320px card-style nodes
   - All support precise handle coordinates from backend

5. **Main View** (`src/sections/focus-interface/view.tsx`)
   - Complete React Flow visualization
   - Loading/error states
   - Goal panel display
   - MiniMap and controls
   - Editable/read-only modes

6. **Components** (`src/sections/focus-interface/components/`)
   - `NodeDetailDialog` - Material-UI dialog for node details

## 🚀 Usage

### Basic Usage

```typescript
// In your page component (e.g., src/app/focus/[id]/page.tsx)
'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { FocusInterfaceView } from 'src/sections/focus-interface';

export default function FocusPage({ params }: { params: { id: string } }) {
  return (
    <ReactFlowProvider>
      <FocusInterfaceView focusId={params.id} />
    </ReactFlowProvider>
  );
}
```

### With Node Click Handler

```typescript
'use client';

import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { FocusInterfaceView, NodeDetailDialog } from 'src/sections/focus-interface';

export default function FocusPage({ params }: { params: { id: string } }) {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  return (
    <>
      <ReactFlowProvider>
        <FocusInterfaceView 
          focusId={params.id} 
          onNodeClick={(nodeId, nodeData) => setSelectedNode(nodeData)}
        />
      </ReactFlowProvider>
      
      <NodeDetailDialog
        open={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        nodeData={selectedNode}
      />
    </>
  );
}
```

### Using the Hook Directly

```typescript
'use client';

import { useFocusInterface } from 'src/hooks';

export function MyComponent({ focusId }: { focusId: string }) {
  const { focusInterface, loading, error, regenerate } = useFocusInterface(focusId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{focusInterface?.goal.name}</h1>
      <p>Nodes: {focusInterface?.nodes.length}</p>
      <p>Edges: {focusInterface?.edges.length}</p>
    </div>
  );
}
```

## 🔧 API Endpoints

The implementation expects these backend endpoints:

- `GET /api/focus/:focusId/interface` - Get existing interface
- `POST /api/focus/:focusId/generate-interface` - Generate new interface

These are configured in `src/lib/axios.ts`:

```typescript
focus: {
  interface: (id: string) => `/api/focus/${id}/interface`,
  generateInterface: (id: string) => `/api/focus/${id}/generate-interface`,
}
```

## 📦 Dependencies

Make sure you have these installed:

```bash
npm install @xyflow/react
```

Already in your project:
- `@mui/material` ✅
- `axios` ✅
- `framer-motion` ✅ (optional, for animations)

## 🎨 Customization

### Custom Node Styling

Edit the node components in `src/sections/focus-interface/nodes/` to customize appearance.

### Custom Edge Styling

The backend generates edge styles, but you can override them in the view component.

### Layout Configuration

Pass layout options when generating interfaces:

```typescript
const { regenerate } = useFocusInterface(focusId);

await regenerate(nodes, edges, {
  layoutConfig: {
    rankdir: 'TB',  // Top to bottom
    nodesep: 100,   // Horizontal spacing
    ranksep: 150,   // Vertical spacing
  },
  goalIcon: '🎯',
});
```

## 🔗 Related Files

- **Backend Guide**: `FOCUS_INTERFACE_GENERATOR.md` - Backend implementation
- **Frontend Guide**: `FOCUS_INTERFACE_FRONTEND_GUIDE.md` - Detailed frontend guide
- **Example**: `src/sections/focus-interface/example-page.tsx` - Full page example

## 📝 Next Steps

1. **Install dependencies** (if not already installed):
   ```bash
   npm install @xyflow/react
   ```

2. **Create a page** to use the component:
   ```bash
   # Example: Create src/app/focus/[id]/page.tsx
   ```

3. **Import and use**:
   ```typescript
   import { ReactFlowProvider } from '@xyflow/react';
   import { FocusInterfaceView } from 'src/sections/focus-interface';
   ```

4. **Connect to your backend** - Make sure the backend endpoints are implemented

## ✨ Features

- ✅ Automatic layout from backend (Dagre algorithm)
- ✅ Precise handle coordinates for perfect edge connections
- ✅ Three custom node types (Hexagon, Glass, AppStore)
- ✅ Loading and error states
- ✅ Material-UI styling
- ✅ TypeScript support throughout
- ✅ Editable/read-only modes
- ✅ Goal panel display
- ✅ MiniMap and controls
- ✅ Node click handlers
- ✅ Responsive design

## 🐛 Troubleshooting

### "Module not found: @xyflow/react"
```bash
npm install @xyflow/react
```

### Backend endpoints not working
- Check `CONFIG.serverUrl` in `src/global-config.ts`
- Verify backend is running and endpoints are implemented
- Check browser console for API errors

### Nodes not displaying
- Verify the backend is returning the correct interface structure
- Check that node types match: 'hexagon', 'glass', or 'appstore'
- Ensure handle coordinates are being generated by backend

---

**Implementation Status**: ✅ Complete and ready to use!

