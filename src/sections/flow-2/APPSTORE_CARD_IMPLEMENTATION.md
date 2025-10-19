# App Store Card Node Implementation

## Overview

Successfully implemented the **3rd node type** for React Flow: **App Store-style Card Node** with expansion animation inspired by the NodeDetailView project.

## Features

### 1. **AppStoreNode** - Compact Card for React Flow Canvas
- **File**: `src/sections/flow-2/appstore-node.tsx`
- Displays as a compact card (240x320px) in the React Flow canvas
- Features:
  - Gradient background or custom image support
  - Category label and title
  - Hover animation (lift effect)
  - Exit/entrance animations (slide & shuffle modes)
  - React Flow connection handles
  - Consistent with existing node patterns (HexagonNode, GlassNode)

### 2. **AppStoreCardDialog** - Full-Screen Expansion
- **File**: `src/sections/flow-2/appstore-card-dialog.tsx`
- App Store-style modal expansion with layout transitions
- Features:
  - **Framer Motion layout animations** (FLIP animation)
  - **Swipe-to-dismiss gesture** (150px threshold)
  - **Backdrop blur effect**
  - **Elastic scroll** with rubber-banding
  - **Escape key** to close
  - **Portal rendering** (renders outside React Flow)
  - **Body scroll lock** when open

### 3. **Card Components**
Located in `src/sections/flow-2/appstore-card/`:

#### **card-image.tsx**
- Parallax image effect with `pointOfInterest` value
- Gradient fallback if no image provided
- Inverted border radius during scale transformations

#### **card-title.tsx**
- Category label (uppercase, small text)
- Title with dynamic sizing (18px → 28px when expanded)
- Smooth transitions

#### **card-content.tsx**
- Lorem ipsum placeholder content
- Fade-in animation when dialog opens
- Only renders when card is selected

### 4. **Utility Hooks**
Located in `src/sections/flow-2/appstore-card/`:

#### **use-inverted-border-radius.ts**
- Maintains visual border radius during parent scale transformations
- Critical for smooth layout transitions
- Adapted from NodeDetailView for modern Framer Motion API

#### **use-scroll-constraints.ts**
- Calculates scroll boundaries for expanded card content
- Prevents over-scrolling

#### **use-wheel-scroll.ts**
- Apple Watch crown-style elastic scrolling
- Rubber-banding at scroll boundaries
- Smooth spring physics

#### **animations.ts**
- Spring configurations for open/close transitions
- `openSpring`: stiffness 200, damping 30
- `closeSpring`: stiffness 300, damping 35

## Integration

### FlowView Updates (`src/sections/flow-2/view.tsx`)

1. **Imports**:
   ```typescript
   import { AppStoreNode } from './appstore-node';
   import { AppStoreCardDialog } from './appstore-card-dialog';
   ```

2. **State Management**:
   ```typescript
   const [appStoreDialogOpen, setAppStoreDialogOpen] = useState(false);
   const [appStoreNode, setAppStoreNode] = useState<Node | null>(null);
   ```

3. **Node Types Registration**:
   ```typescript
   const nodeTypes = useMemo(() => ({ 
     hexagon: HexagonNode, 
     glass: GlassNode,
     appstore: AppStoreNode  // NEW
   }), []);
   ```

4. **Click Handler Routing**:
   ```typescript
   const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
     const actionType = node.data?.actionType || 'dialog';
     
     if (actionType === 'appstore') {
       setAppStoreNode(node);
       setAppStoreDialogOpen(true);
     } else if (actionType === 'drawer') {
       // ... existing drawer logic
     } else {
       // ... existing dialog logic
     }
   }, []);
   ```

5. **Dialog Rendering**:
   ```typescript
   <AppStoreCardDialog
     open={appStoreDialogOpen}
     node={appStoreNode}
     onClose={handleCloseAppStoreDialog}
   />
   ```

### Goals Data (`src/sections/flow-2/goals-data.ts`)

Added new goal: **"App Store Apps"** with 5 example nodes:

```typescript
{
  id: 'appstore',
  name: 'App Store Apps',
  description: 'Showcase of app store-style cards',
  icon: 'solar:widget-5-bold',
  nodes: [
    {
      id: 'pizza-app',
      type: 'appstore',  // Uses AppStoreNode
      data: {
        label: 'Pizza Delivery',
        category: 'Food & Drink',
        actionType: 'appstore',  // Routes to AppStoreCardDialog
        backgroundColor: '#FF6B35',
        pointOfInterest: 60,
      }
    },
    // ... 4 more app cards
  ]
}
```

## Node Data Schema

AppStore nodes support the following data properties:

```typescript
{
  label: string;              // App name/title
  category: string;           // Category label (e.g., "Food & Drink")
  actionType: 'appstore';     // Routes to AppStoreCardDialog
  backgroundColor: string;    // Hex color for gradient background
  pointOfInterest?: number;   // 0-100, parallax offset (default: 50)
  imageUrl?: string;          // Optional image URL
  opacity?: number;           // Node opacity (default: 1)
  index?: number;             // For staggered animations
  isExiting?: boolean;        // Exit animation state
  exitAnimationType?: 'slide' | 'shuffle';  // Exit animation style
}
```

## Animation System

### Entrance Animations
- **Initial state**: `opacity: 0, scale: 0.4`
- **Animate to**: `opacity: 1, scale: 1`
- **Duration**: 0.55s
- **Stagger delay**: `index * 0.09`

### Exit Animations

#### Slide Mode
- Opacity: 0
- Scale: 0.4
- Y: 30px
- Duration: 0.55s

#### Shuffle Mode
- Opacity: 0
- Scale: 0.7
- X: ±350px (alternating)
- Rotate: ±20deg (alternating)
- Y: Random (-60 to +60)
- Duration: 0.75s

### Expansion Animation
- Uses Framer Motion's `layout` prop for FLIP animation
- Spring physics: stiffness 200, damping 30
- Morphs from compact card → full-screen dialog
- Maintains border radius with inverted scaling

## Usage

### 1. Navigate to Flow View
Visit the React Flow page in your application.

### 2. Switch to "App Store Apps" Goal
Use the goal selector (command input or UI) to switch to the `appstore` goal.

### 3. Click Any Card
Click on any of the 5 app cards to see the expansion animation.

### 4. Interact with Dialog
- **Scroll**: Mouse wheel with elastic rubber-banding
- **Swipe down**: Drag down 150px to dismiss
- **Escape key**: Close dialog
- **Close button**: Click X button in top-right
- **Backdrop click**: Click outside to close

## File Structure

```
src/sections/flow-2/
├── appstore-node.tsx                    # Compact card node component
├── appstore-card-dialog.tsx             # Full-screen expansion dialog
├── appstore-card/                       # Shared card components
│   ├── card-image.tsx                   # Image with parallax
│   ├── card-title.tsx                   # Title with category
│   ├── card-content.tsx                 # Lorem ipsum content
│   ├── animations.ts                    # Spring configs
│   ├── use-inverted-border-radius.ts    # Border radius preservation
│   ├── use-scroll-constraints.ts        # Scroll boundaries
│   └── use-wheel-scroll.ts              # Elastic scrolling
├── view.tsx                             # Updated with AppStore integration
├── goals-data.ts                        # Added appstore goal
└── APPSTORE_CARD_IMPLEMENTATION.md      # This file
```

## Technical Highlights

### 1. Modern Framer Motion API
- Uses `layout` prop instead of deprecated `layoutTransition`
- Uses `m` import from `framer-motion` for motion components
- Compatible with Framer Motion v12

### 2. Portal Rendering
- Renders outside React Flow DOM tree
- Prevents z-index and overflow issues
- Consistent with existing NodeDialog pattern

### 3. Gesture Support
- Drag-to-dismiss with threshold detection
- Elastic scroll with spring physics
- Smooth animations throughout

### 4. Responsive Design
- Dialog: 90% width, max 600px
- Max height: 85vh
- Scrollable content area
- Mobile-friendly interactions

## Comparison with Other Node Types

| Feature | HexagonNode | GlassNode | **AppStoreNode** |
|---------|-------------|-----------|------------------|
| Shape | Hexagon | Rounded square | Rounded card |
| Size | 178x174 | 200x200 | **240x320** |
| Dialog | RadialTimeline | RadialTimeline | **App Store Card** |
| Animation | Slide/Shuffle | Slide/Shuffle | **Slide/Shuffle** |
| Special Effect | SVG filter | Liquid glass | **Parallax image** |
| Action Type | `dialog` | `dialog`/`drawer` | **`appstore`** |

## Next Steps (Optional Enhancements)

1. **Real Images**: Replace gradient backgrounds with actual app screenshots
2. **Custom Content**: Pass node-specific content instead of lorem ipsum
3. **App Store Metadata**: Add ratings, reviews, download count
4. **Multiple Cards**: Support multiple card views per node
5. **Shared Element Transition**: Improve transition from node to dialog
6. **Touch Gestures**: Enhanced mobile gesture support
7. **Keyboard Navigation**: Arrow keys to navigate between cards

## Credits

- **Inspiration**: NodeDetailView App Store card UI
- **Animation Pattern**: Framer Motion layout transitions
- **Integration**: Follows existing flow-2 patterns (NodeDialog, NodeContextDrawer)

