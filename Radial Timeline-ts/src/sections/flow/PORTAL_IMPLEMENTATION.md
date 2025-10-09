# React Portal Implementation for Radial Timeline

## Overview

The `NodeDialog` component now uses **React Portal** to render the Radial Timeline outside the React Flow component tree. This solves layout and interaction issues by rendering the dialog directly to `document.body`.

## Why React Portal?

### Problems Solved

1. **Layout Independence**: The Radial Timeline is no longer constrained by parent container styles, transforms, or overflow properties from React Flow
2. **Z-index Issues**: Portals render at the root level, avoiding z-index stacking context problems
3. **Event Handling**: Scroll and gesture events (`useScroll`, `useWheel`) won't conflict with React Flow's pan/zoom
4. **Performance**: Complex animations don't trigger unnecessary re-renders in the React Flow tree
5. **Transform Isolation**: React Flow's CSS transforms for pan/zoom don't affect the dialog positioning

## Implementation Details

### File: `node-dialog.tsx`

```typescript
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Node } from '@xyflow/react';
import { m, AnimatePresence } from 'motion/react';

import RadialTimeline from './radial-timeline/radial-timeline';
import './radial-timeline/system.css';

export function NodeDialog({ node, open, onClose }: NodeDialogProps) {
  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            margin: 0,
            padding: 0,
            overflow: 'hidden',
            backgroundColor: 'var(--color-bg, #fff)',
          }}
        >
          <RadialTimeline 
            onClose={onClose} 
            nodeLabel={(node?.data?.label as string) || 'Timeline'} 
          />
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
```

### Key Features

1. **Portal Rendering**: Uses `createPortal(component, document.body)` to render outside the component tree
2. **Framer Motion Animation**: Smooth fade in/out with `AnimatePresence`
3. **Body Scroll Lock**: Prevents background scrolling when dialog is open
4. **Full Screen**: Fixed positioning with 100vw/100vh dimensions
5. **High Z-index**: Ensures dialog appears above all other content

## Usage Example

See `USAGE_EXAMPLE.tsx` for a complete integration example with React Flow.

### Basic Usage

```typescript
import { useState } from 'react';
import { NodeDialog } from './node-dialog';

function MyComponent() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <ReactFlow onNodeClick={handleNodeClick}>
        {/* Your flow content */}
      </ReactFlow>

      <NodeDialog
        node={selectedNode}
        open={dialogOpen}
        onClose={handleClose}
      />
    </>
  );
}
```

## Technical Benefits

### 1. DOM Structure
```
document.body
├── #root (React app)
│   └── ReactFlow
│       └── Your nodes and edges
└── Portal (NodeDialog)
    └── Radial Timeline
```

The portal renders as a sibling to the React app root, not nested inside it.

### 2. Event Isolation

- Click events don't bubble to React Flow
- Scroll events are isolated to the Radial Timeline
- Keyboard shortcuts (Escape, Arrow keys) work independently

### 3. Style Isolation

- No CSS inheritance from parent components
- Independent stacking context
- No transform inheritance from React Flow's viewport

### 4. Performance

- Dialog animations don't cause React Flow re-renders
- Radial Timeline's complex scroll-based zoom is isolated
- Gesture handlers don't interfere with each other

## Migration from MUI Dialog

### Before (MUI Dialog)
```typescript
<Dialog fullScreen open={open} onClose={onClose}>
  <RadialTimeline />
</Dialog>
```

### After (React Portal)
```typescript
createPortal(
  <AnimatePresence>
    {open && <m.div>{/* ... */}</m.div>}
  </AnimatePresence>,
  document.body
)
```

### Advantages Over MUI Dialog

1. **Lighter weight**: No MUI Dialog overhead
2. **More control**: Direct control over rendering location
3. **Better animations**: Custom Framer Motion animations
4. **Simpler styling**: No fighting with MUI's default styles
5. **Cleaner DOM**: Fewer wrapper elements

## Browser Compatibility

React Portals are supported in all modern browsers:
- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile browsers: ✅

## Troubleshooting

### Dialog doesn't appear
- Check that `open` prop is `true`
- Verify `document.body` exists (SSR considerations)
- Check z-index conflicts

### Animations not working
- Ensure `motion/react` is installed
- Check that `AnimatePresence` wraps the animated component
- Verify `initial`, `animate`, and `exit` props are set

### Scroll issues
- The `useEffect` hook should handle body scroll locking
- Check for conflicting `overflow` styles on `body`

## Future Enhancements

Potential improvements:
1. Custom portal root element (instead of `document.body`)
2. Focus trap for accessibility
3. Backdrop click to close
4. Multiple dialog support with portal stacking

## Related Files

- `node-dialog.tsx` - Portal implementation
- `radial-timeline/radial-timeline.tsx` - Timeline component
- `radial-timeline/system.css` - Timeline styles
- `USAGE_EXAMPLE.tsx` - Integration example

