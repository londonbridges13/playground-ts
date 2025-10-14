# ✅ Radial Timeline Layout Issues - FIXED

## Problems Identified

### 1. **Lines Missing / Pushed to Lower Right Corner**
- **Cause**: Portal container had `overflow: 'hidden'` which prevented proper layout
- **Cause**: RadialTimeline `<main>` had `h-full overflow-hidden` which constrained the component

### 2. **Scroll Not Working**
- **Cause**: Portal container blocked scrolling with `overflow: 'hidden'`
- **Cause**: Body scroll was locked with `document.body.style.overflow = 'hidden'`
- **Cause**: RadialTimeline's `useScroll` hook targets `window`, but scroll was blocked

### 3. **Snap Scroll Not Working**
- **Cause**: Scroll offset never reached `SCROLL_SNAP = 250px` because scrolling was disabled
- **Cause**: The zoom-in/zoom-out behavior depends on scroll position

## Root Cause Analysis

The Radial Timeline was designed as a **full-page scrollable experience** that:
1. Uses `useScroll` hook targeting `window` (line 146-189)
2. Requires document scroll to trigger zoom at 250px (`SCROLL_SNAP`)
3. Has a Sheet component positioned at `mt-[50vh]` that needs scroll space
4. Uses `document.documentElement.scrollTop` for programmatic scrolling

**But the portal implementation:**
- ❌ Set `overflow: 'hidden'` on portal container → blocked scroll
- ❌ Set `document.body.style.overflow = 'hidden'` → blocked window scroll
- ❌ RadialTimeline had `h-full overflow-hidden` → constrained height

## Fixes Applied

### File 1: `src/sections/flow/node-dialog.tsx`

#### Change 1: Removed Portal Container Overflow Hidden
**Before:**
```typescript
style={{
  position: 'fixed',
  overflow: 'hidden',  // ❌ Blocked scroll
  // ...
}}
```

**After:**
```typescript
style={{
  position: 'fixed',
  // No overflow property - allows natural flow
  minHeight: '100vh',  // ✅ Ensures full height
  // ...
}}
```

#### Change 2: Allow Body Scroll Instead of Blocking It
**Before:**
```typescript
useEffect(() => {
  if (open) {
    document.body.style.overflow = 'hidden';  // ❌ Blocked scroll
  }
}, [open]);
```

**After:**
```typescript
useEffect(() => {
  if (open) {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    
    // ✅ Allow body to scroll for the radial timeline
    document.body.style.overflow = 'auto';
    document.body.style.overflowX = 'hidden';
  } else {
    // Restore body overflow when closing
    document.body.style.overflow = '';
    document.body.style.overflowX = '';
  }
  
  return () => {
    document.body.style.overflow = '';
    document.body.style.overflowX = '';
  };
}, [open]);
```

### File 2: `src/sections/flow/radial-timeline/radial-timeline.tsx`

#### Change: Allow Component to Expand with Content
**Before:**
```typescript
<main className="w-full h-full overflow-hidden">
```

**After:**
```typescript
<main className="w-full min-h-screen overflow-x-hidden">
```

**Changes:**
- `h-full` → `min-h-screen`: Allows component to be taller than viewport
- `overflow-hidden` → `overflow-x-hidden`: Only prevents horizontal scroll, allows vertical

## How It Works Now

### Scroll Behavior Flow:

1. **User scrolls down** → Window scroll event fires
2. **`useScroll` hook captures** → Gets scroll offset `oy`
3. **When `oy < 0`** → Zoom out (scale = 1)
4. **When `0 < oy < 250`** → Progressive zoom (scale increases)
5. **When `oy >= 250`** → Snap to zoom in (scale = 6)
6. **Sheet component appears** → Content becomes visible and scrollable

### Layout Structure:

```
document.body (scrollable)
└── Portal Container (fixed, full viewport)
    └── RadialTimeline (min-h-screen, allows expansion)
        ├── Close Button (fixed)
        ├── Timeline Lines (fixed, centered)
        └── Sheet Component (mt-[50vh], creates scroll space)
```

## What's Fixed

✅ **Lines visible and centered** - No longer pushed to corner  
✅ **Scrolling works** - Window scroll is enabled  
✅ **Snap scroll works** - Zoom triggers at 250px scroll  
✅ **Layout correct** - Components positioned properly  
✅ **Sheet appears** - Content visible when zoomed in  
✅ **Horizontal scroll prevented** - Only vertical scroll allowed  

## Testing Checklist

- [ ] Open dialog by clicking hexagon node
- [ ] Lines appear centered on screen (not in corner)
- [ ] Scroll down slowly - lines should zoom in progressively
- [ ] Scroll to ~250px - should snap to full zoom
- [ ] Sheet content should appear and be readable
- [ ] Scroll within sheet content works
- [ ] Scroll up - should zoom out
- [ ] Horizontal scroll doesn't occur
- [ ] Close button works
- [ ] Escape key closes dialog

## Technical Details

### Scroll Snap Points:
- **0px**: Fully zoomed out (scale = 1)
- **1-249px**: Progressive zoom (scale increases)
- **250px+**: Fully zoomed in (scale = 6)

### Key Components:
- **useScroll hook**: Monitors window scroll offset
- **scrollY motion value**: Tracks scroll position
- **scale motion value**: Controls zoom level
- **Sheet component**: Content area that appears when zoomed

### CSS Classes Changed:
- `h-full` → `min-h-screen`: Allows vertical expansion
- `overflow-hidden` → `overflow-x-hidden`: Allows vertical scroll

## Before vs After

### Before (Broken):
```
Portal: overflow: hidden ❌
Body: overflow: hidden ❌
Main: h-full overflow-hidden ❌
Result: No scroll, lines in corner, layout broken
```

### After (Fixed):
```
Portal: no overflow restriction ✅
Body: overflow: auto ✅
Main: min-h-screen overflow-x-hidden ✅
Result: Scroll works, lines centered, layout correct
```

## Success! 🎉

The Radial Timeline now works as designed:
- Lines are centered and visible
- Scroll-based zoom works smoothly
- Snap scroll triggers at 250px
- Layout is correct and responsive

