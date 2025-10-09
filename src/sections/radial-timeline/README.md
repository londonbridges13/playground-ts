# Radial Timeline Page

## Overview

A dedicated full-page view for the Radial Timeline component, accessible from the dashboard navigation.

## Access

### URL
```
/dashboard/radial-timeline
```

### Navigation
- **Menu Item**: "Radial Timeline"
- **Icon**: Calendar icon
- **Location**: Dashboard → Overview section

## Features

✅ **Full-page immersive experience**  
✅ **Scroll-based zoom interaction**  
✅ **360° radial timeline visualization**  
✅ **Interactive timeline lines**  
✅ **Detailed content sheets**  
✅ **Keyboard shortcuts support**  

## How to Use

### 1. Navigate to the Page
- Click "Radial Timeline" in the dashboard sidebar
- Or navigate directly to `/dashboard/radial-timeline`

### 2. Interact with the Timeline

#### **Scroll to Zoom**
- **Scroll down 0-250px**: Progressive zoom in
- **Scroll 250px+**: Snap to full zoom
- **Scroll up**: Zoom out to overview

#### **Click Timeline Lines**
- Click any line to rotate and focus on it
- View detailed information in the content sheet

#### **Keyboard Shortcuts**
- **Escape**: Reset zoom and rotation
- **Arrow Left**: Navigate to previous timeline item
- **Arrow Right**: Navigate to next timeline item

#### **Mouse Wheel (when zoomed)**
- Horizontal wheel scroll to rotate the timeline

### 3. View Content
- When zoomed in, scroll down to read detailed content
- Each timeline item has its own content sheet
- Images and text are displayed in the sheet

## File Structure

```
src/
├── app/
│   └── dashboard/
│       └── radial-timeline/
│           └── page.tsx              ← Next.js page route
│
├── sections/
│   ├── radial-timeline/
│   │   ├── view.tsx                  ← Main view component
│   │   └── README.md                 ← This file
│   │
│   └── flow/
│       └── radial-timeline/          ← Shared timeline component
│           ├── radial-timeline.tsx
│           ├── system.css
│           ├── data.ts
│           └── ... (all utilities)
│
├── routes/
│   └── paths.ts                      ← Route configuration
│
└── layouts/
    └── nav-config-dashboard.tsx      ← Navigation menu config
```

## Implementation Details

### Page Component
**File**: `src/app/dashboard/radial-timeline/page.tsx`

```typescript
import { CONFIG } from 'src/global-config';
import { RadialTimelineView } from 'src/sections/radial-timeline/view';

export const metadata = { 
  title: `Radial Timeline | Dashboard - ${CONFIG.appName}` 
};

export default function Page() {
  return <RadialTimelineView />;
}
```

### View Component
**File**: `src/sections/radial-timeline/view.tsx`

```typescript
'use client';

import RadialTimeline from 'src/sections/flow/radial-timeline/radial-timeline';
import 'src/sections/flow/radial-timeline/system.css';

export function RadialTimelineView() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        backgroundColor: 'var(--color-bg, #fff)',
      }}
    >
      <RadialTimeline nodeLabel="Radial Timeline" />
    </div>
  );
}
```

### Route Configuration
**File**: `src/routes/paths.ts`

```typescript
dashboard: {
  // ...
  radialTimeline: `${ROOTS.DASHBOARD}/radial-timeline`,
  // ...
}
```

### Navigation Menu
**File**: `src/layouts/nav-config-dashboard.tsx`

```typescript
{
  title: 'Radial Timeline',
  path: paths.dashboard.radialTimeline,
  icon: ICONS.calendar
}
```

## Component Reuse

The Radial Timeline component is shared between:

1. **Full Page View** (`/dashboard/radial-timeline`)
   - Standalone immersive experience
   - Direct access from navigation

2. **Flow Dialog** (`/dashboard/flow`)
   - Opens in portal dialog when clicking hexagon nodes
   - Displays node-specific timeline data

Both use the same underlying component:
- `src/sections/flow/radial-timeline/radial-timeline.tsx`

## Customization

### Change Timeline Data
Edit `src/sections/flow/radial-timeline/data.ts`:

```typescript
export const DATA: Item[] = [
  {
    name: "Your Event",
    year: "2024",
    title: "Event Title",
    variant: "large",
  },
  // Add more items...
];
```

### Change Node Label
In `view.tsx`, modify the `nodeLabel` prop:

```typescript
<RadialTimeline nodeLabel="Your Custom Title" />
```

### Styling
The timeline uses CSS variables from `system.css`:

```css
--color-bg: Background color
--color-gray12: Text color
--color-orange: Highlight color
--font-sans: Font family
```

## Scroll Behavior

### Zoom Levels

| Scroll Position | Scale | State | Description |
|----------------|-------|-------|-------------|
| 0px | 1.0 | Zoomed Out | Overview of all timeline lines |
| 1-249px | 1.0-6.0 | Progressive | Gradual zoom in |
| 250px+ | 6.0 | Zoomed In | Focused view with content sheet |

### Interaction States

**Zoomed Out (scale = 1)**
- All timeline lines visible
- Radial layout centered
- Content sheet hidden
- Can click lines to focus

**Progressive Zoom (scale 1-6)**
- Lines gradually zoom in
- Scale increases with scroll
- Content sheet fading in
- Smooth transition

**Zoomed In (scale = 6)**
- Single timeline focused
- Content sheet visible
- Can scroll within content
- Can rotate with wheel/arrows

## Browser Support

✅ Chrome/Edge (latest)  
✅ Firefox (latest)  
✅ Safari (latest)  
✅ Mobile browsers (iOS Safari, Chrome Mobile)  

## Performance

- Uses Framer Motion for smooth animations
- Hardware-accelerated transforms
- Optimized scroll listeners
- Efficient re-renders with React hooks

## Troubleshooting

### Timeline not visible
- Check that you're on `/dashboard/radial-timeline`
- Ensure CSS is loading (`system.css`)
- Check browser console for errors

### Scroll not working
- Verify body overflow is not hidden
- Check that component has `min-h-screen`
- Ensure window scroll is enabled

### Lines in wrong position
- Clear browser cache
- Check CSS transform values
- Verify viewport dimensions

## Related Documentation

- [Layout Fix Summary](../flow/LAYOUT_FIX_SUMMARY.md)
- [Portal Implementation](../flow/PORTAL_IMPLEMENTATION.md)
- [Implementation Summary](../flow/IMPLEMENTATION_SUMMARY.md)

## Future Enhancements

Potential improvements:
- [ ] Custom timeline data per page
- [ ] Multiple timeline themes
- [ ] Export timeline as image
- [ ] Share timeline link
- [ ] Timeline animation presets
- [ ] Touch gesture support
- [ ] Accessibility improvements

