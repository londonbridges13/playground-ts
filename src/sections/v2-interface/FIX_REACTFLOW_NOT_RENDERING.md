# FIX: ReactFlow Not Rendering in v2-interface

## Problem Summary

ReactFlow canvas is not visible when `ENABLE_UNROLLING = false`. The circular node and background dots don't appear.

## Root Cause

**CSS height inheritance chain is broken.**

When using `height: 100%`, each element in the chain must have an explicit height. The current structure:

```
Box (100vw x 100vh, position: relative)     ← OK, explicit viewport units
  └── CanvasReveal Box (100% x 100%, position: relative)  ← BROKEN
        └── Inner Box (100% x 100%, position: absolute)
              └── ReactFlow
```

The `CanvasReveal` disabled state returns:
```tsx
<Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
  {children}
</Box>
```

**Problem**: `height: 100%` with `position: relative` doesn't inherit height properly. The box collapses to 0 height because `position: relative` elements don't automatically stretch to fill their parent.

## Solution

### Fix 1: Update `CanvasReveal` disabled state

**File**: `src/sections/v2-interface/components/canvas-reveal.tsx`

**Change line 44-51 from:**
```tsx
if (!enabled) {
  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {children}
    </Box>
  );
}
```

**To:**
```tsx
if (!enabled) {
  return (
    <Box sx={{ position: 'absolute', inset: 0 }}>
      {children}
    </Box>
  );
}
```

Using `position: absolute` with `inset: 0` makes the element fill its nearest positioned ancestor (the outer Box with `position: relative`).

### Fix 2: Simplify the page structure

**File**: `src/app/v2-interface/page.tsx`

Remove the extra wrapper Box around ReactFlow since CanvasReveal now handles sizing:

**Change from:**
```tsx
<CanvasReveal ...>
  <Box sx={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
    <ReactFlow ...>
      <Background ... />
    </ReactFlow>
  </Box>
  <UnrollingCanvas ... />
</CanvasReveal>
```

**To:**
```tsx
<CanvasReveal ...>
  <ReactFlow ...>
    <Background ... />
  </ReactFlow>
  <UnrollingCanvas ... />
</CanvasReveal>
```

## Why This Works

1. **`position: absolute`** removes the element from normal document flow
2. **`inset: 0`** is shorthand for `top: 0; right: 0; bottom: 0; left: 0;`
3. Together, they make the element fill its positioned ancestor completely
4. This bypasses the `height: 100%` inheritance problem entirely

## Visual of Fixed Structure

```
Box (100vw x 100vh, position: relative)     ← Positioned ancestor
  └── CanvasReveal Box (position: absolute, inset: 0)  ← Fills parent
        └── ReactFlow                                    ← Renders correctly
```

## Expected Result

After applying these fixes:
- ReactFlow canvas renders with background dots
- Circular "Focus" node appears at center of viewport
- Works correctly when `ENABLE_UNROLLING = false`
- Will also work when `ENABLE_UNROLLING = true` (for future activation)

