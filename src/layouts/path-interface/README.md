# PathInterfaceLayout

A minimal, full-screen layout designed specifically for immersive path/flow interfaces.

## Features

- ✅ **No Header or Navigation** - Maximizes canvas space
- ✅ **Full Viewport Coverage** - 100vh/100vw with no padding
- ✅ **Optimized for Canvas-Based Interfaces** - Perfect for React Flow, diagrams, etc.
- ✅ **Minimal Overhead** - Maximum performance with minimal components
- ✅ **Type Safe** - Full TypeScript support
- ✅ **Consistent Architecture** - Follows the same pattern as other layouts

## File Structure

```
src/layouts/path-interface/
├── index.ts          # Exports
├── layout.tsx        # Main PathInterfaceLayout component
├── css-vars.ts       # CSS variables for theming
├── content.tsx       # Optional content wrapper
└── README.md         # This file
```

## Usage

### Basic Usage

```typescript
import { PathInterfaceLayout } from 'src/layouts/path-interface';

export default function Layout({ children }: Props) {
  return <PathInterfaceLayout>{children}</PathInterfaceLayout>;
}
```

### With Custom Styling

```typescript
import { PathInterfaceLayout } from 'src/layouts/path-interface';

export default function Layout({ children }: Props) {
  return (
    <PathInterfaceLayout
      cssVars={{
        '--custom-overlay-color': 'rgba(0, 0, 0, 0.5)',
      }}
      sx={{
        bgcolor: 'grey.900',
      }}
      slotProps={{
        main: {
          sx: {
            '& > *': {
              isolation: 'isolate',
            },
          },
        },
      }}
    >
      {children}
    </PathInterfaceLayout>
  );
}
```

### With Content Wrapper

```typescript
import { PathInterfaceLayout, PathInterfaceContent } from 'src/layouts/path-interface';

export default function Layout({ children }: Props) {
  return (
    <PathInterfaceLayout>
      <PathInterfaceContent disableScrollLock>
        {children}
      </PathInterfaceContent>
    </PathInterfaceLayout>
  );
}
```

## CSS Variables

The layout provides the following CSS variables:

```css
--layout-path-interface-padding: 0px
--layout-path-interface-overlay-zIndex: 1000
--layout-path-interface-drawer-zIndex: 1100
--layout-path-interface-dialog-zIndex: 1200
--layout-path-interface-transition-duration: 300ms
--layout-path-interface-transition-easing: cubic-bezier(0.4, 0, 0.2, 1)
```

## Props

### PathInterfaceLayoutProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Content to render |
| `sx` | `SxProps<Theme>` | - | Custom styles |
| `cssVars` | `CSSObject` | - | Custom CSS variables |
| `layoutQuery` | `Breakpoint` | `'md'` | Responsive breakpoint |
| `slotProps.main` | `MainSectionProps` | - | Props for main section |

### PathInterfaceContentProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Content to render |
| `disableScrollLock` | `boolean` | `false` | Disable scroll locking |
| `sx` | `SxProps<Theme>` | - | Custom styles |

## Implementation Example

See `src/app/dashboard/flow-2/layout.tsx` for a complete implementation example.

## Comparison with Other Layouts

| Feature | DashboardLayout | SimpleLayout | PathInterfaceLayout |
|---------|----------------|--------------|---------------------|
| Header | ✅ Full | ✅ Minimal | ❌ None |
| Sidebar | ✅ Yes | ❌ No | ❌ No |
| Footer | ❌ No | ❌ No | ❌ No |
| Use Case | Admin panels | Auth pages | Canvas/Flow UIs |
| Viewport | Contained | Contained | Full-screen |

## Benefits for Flow-2

1. **No Navigation Interference** - Left drawer won't be blocked by navbar
2. **Full Viewport Control** - Perfect for React Flow canvas
3. **Performance Optimized** - No unnecessary header/sidebar rendering
4. **Clean Architecture** - Separation of concerns
5. **Easy to Extend** - Add features as needed

## Notes

- This layout is specifically designed for immersive, full-screen experiences
- It intentionally omits header and navigation for maximum canvas space
- Perfect for flow diagrams, canvas-based editors, and interactive visualizations
- The layout follows the same architectural patterns as DashboardLayout and SimpleLayout

