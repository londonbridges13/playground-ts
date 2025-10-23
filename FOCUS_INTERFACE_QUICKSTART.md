# Focus Interface - Quick Start Guide

Get up and running with Focus Interface visualization in 5 minutes!

---

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install @xyflow/react
```

### 2. Create a Test Page

Create `src/app/focus-test/page.tsx`:

```typescript
'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { FocusInterfaceView } from 'src/sections/focus-interface';
import Box from '@mui/material/Box';

export default function FocusTestPage() {
  // Replace with actual focus ID from your database
  const testFocusId = 'test-focus-123';

  return (
    <Box sx={{ height: '100vh' }}>
      <ReactFlowProvider>
        <FocusInterfaceView focusId={testFocusId} />
      </ReactFlowProvider>
    </Box>
  );
}
```

### 3. Run Your App

```bash
npm run dev
```

Navigate to: `http://localhost:3000/focus-test`

---

## 🎯 What You Get

### ✅ **Implemented Files**

```
src/
├── types/focus-interface.ts           # TypeScript types
├── lib/
│   ├── axios.ts                       # ✅ Updated with endpoints
│   └── api/focus-interface.ts         # API client
├── hooks/
│   ├── index.ts                       # Barrel export
│   └── use-focus-interface.ts         # Custom hook
└── sections/focus-interface/
    ├── index.ts                       # Barrel export
    ├── view.tsx                       # Main component
    ├── example-page.tsx               # Full example
    ├── README.md                      # Documentation
    ├── nodes/
    │   ├── hexagon-node.tsx          # 178x174px
    │   ├── glass-node.tsx            # 200x200px
    │   └── appstore-node.tsx         # 240x320px
    └── components/
        └── node-detail-dialog.tsx    # Node details
```

---

## 🔌 Backend Setup Required

The frontend expects these endpoints:

### **GET** `/api/focus/:focusId/interface`

Returns existing interface:

```json
{
  "success": true,
  "interface": {
    "goal": {
      "id": "goal-1",
      "name": "My Goal",
      "description": "Goal description",
      "icon": "🎯"
    },
    "nodes": [...],
    "edges": [...]
  }
}
```

### **POST** `/api/focus/:focusId/generate-interface`

Generates new interface:

```json
{
  "nodes": [
    {
      "id": "node-1",
      "type": "hexagon",
      "data": {
        "label": "Node 1",
        "importance": 8
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2"
    }
  ]
}
```

**See `FOCUS_INTERFACE_GENERATOR.md` for complete backend implementation.**

---

## 📖 Usage Examples

### **Basic Usage**

```typescript
import { ReactFlowProvider } from '@xyflow/react';
import { FocusInterfaceView } from 'src/sections/focus-interface';

<ReactFlowProvider>
  <FocusInterfaceView focusId="focus-123" />
</ReactFlowProvider>
```

### **With Node Click Handler**

```typescript
import { useState } from 'react';
import { FocusInterfaceView, NodeDetailDialog } from 'src/sections/focus-interface';

const [selectedNode, setSelectedNode] = useState(null);

<>
  <FocusInterfaceView 
    focusId="focus-123"
    onNodeClick={(id, data) => setSelectedNode(data)}
  />
  <NodeDetailDialog
    open={!!selectedNode}
    onClose={() => setSelectedNode(null)}
    nodeData={selectedNode}
  />
</>
```

### **Using the Hook**

```typescript
import { useFocusInterface } from 'src/hooks';

const { focusInterface, loading, error, regenerate } = useFocusInterface('focus-123');

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;

return <div>{focusInterface.goal.name}</div>;
```

---

## 🎨 Component Props

### **FocusInterfaceView**

```typescript
interface FocusInterfaceViewProps {
  focusId: string;                                    // Required
  onNodeClick?: (nodeId: string, nodeData: any) => void;
  onEdgeClick?: (edgeId: string, edgeData: any) => void;
  editable?: boolean;                                 // Default: false
}
```

### **NodeDetailDialog**

```typescript
interface NodeDetailDialogProps {
  open: boolean;
  onClose: () => void;
  nodeData: any;
}
```

---

## 🔧 Configuration

### **Server URL**

Set in `.env.local`:

```bash
NEXT_PUBLIC_SERVER_URL=http://localhost:4000
```

Or update `src/global-config.ts`:

```typescript
serverUrl: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:4000',
```

### **Endpoints**

Already configured in `src/lib/axios.ts`:

```typescript
focus: {
  interface: (id: string) => `/api/focus/${id}/interface`,
  generateInterface: (id: string) => `/api/focus/${id}/generate-interface`,
}
```

---

## 🐛 Troubleshooting

### **"Module not found: @xyflow/react"**

```bash
npm install @xyflow/react
```

### **"Cannot GET /api/focus/..."**

Backend not running or endpoints not implemented. See `FOCUS_INTERFACE_GENERATOR.md`.

### **Blank screen / No nodes**

1. Check browser console for errors
2. Verify backend is returning correct data structure
3. Check that `CONFIG.serverUrl` is correct
4. Ensure focusId exists in database

### **TypeScript errors**

```bash
npm run type-check
```

---

## 📚 Documentation

- **Quick Start**: `FOCUS_INTERFACE_QUICKSTART.md` (this file)
- **Implementation Summary**: `FOCUS_INTERFACE_IMPLEMENTATION_SUMMARY.md`
- **Frontend Guide**: `FOCUS_INTERFACE_FRONTEND_GUIDE.md`
- **Backend Guide**: `FOCUS_INTERFACE_GENERATOR.md`
- **Component Docs**: `src/sections/focus-interface/README.md`

---

## ✅ Checklist

- [ ] Install `@xyflow/react`
- [ ] Set `NEXT_PUBLIC_SERVER_URL` in `.env.local`
- [ ] Implement backend endpoints (see `FOCUS_INTERFACE_GENERATOR.md`)
- [ ] Create a test page
- [ ] Test with a real Focus ID
- [ ] Customize node styling (optional)
- [ ] Add to your navigation/routing

---

## 🚀 Next Steps

1. **Implement Backend** - Use `FOCUS_INTERFACE_GENERATOR.md`
2. **Create Real Page** - Replace test page with actual route
3. **Customize Styling** - Edit node components to match your design
4. **Add Features** - Implement node editing, saving, etc.

---

**Need Help?** Check the comprehensive guides:
- Frontend: `FOCUS_INTERFACE_FRONTEND_GUIDE.md`
- Backend: `FOCUS_INTERFACE_GENERATOR.md`
- Component README: `src/sections/focus-interface/README.md`

---

**Status**: ✅ Frontend implementation complete and ready to use!

