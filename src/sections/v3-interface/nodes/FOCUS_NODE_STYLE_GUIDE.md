# Focus Node Style Guide

## Overview

This guide documents the customizable styling options for the Focus Node in V3 Interface. Each style can be enabled/disabled and configured via node data properties.

---

## Style Categories

### 1. Background Styles

| Style | Property | Type | Default | Description |
|-------|----------|------|---------|-------------|
| Solid | `backgroundColor` | `string` | `#1a1a2e` | Flat background color |
| Gradient | `gradientColors` | `[string, string]` | `undefined` | Two-color gradient (overrides backgroundColor) |
| Gradient Direction | `gradientDirection` | `'radial' \| 'linear'` | `'radial'` | Gradient type |
| Gradient Angle | `gradientAngle` | `number` | `135` | Angle for linear gradient (degrees) |

```typescript
// Solid background
data: { backgroundColor: '#1a1a2e' }

// Gradient background
data: {
  gradientColors: ['#667eea', '#764ba2'],
  gradientDirection: 'linear',
  gradientAngle: 135
}

// Radial gradient (spotlight effect)
data: {
  gradientColors: ['#2a2a4e', '#1a1a2e'],
  gradientDirection: 'radial'
}
```

---

### 2. Glow Effects

| Style | Property | Type | Default | Description |
|-------|----------|------|---------|-------------|
| Enable Glow | `glowEnabled` | `boolean` | `false` | Toggle glow effect |
| Glow Color | `glowColor` | `string` | `'rgba(99, 102, 241, 0.5)'` | Color of the glow |
| Glow Intensity | `glowIntensity` | `'subtle' \| 'medium' \| 'intense'` | `'medium'` | Glow strength |
| Glow Animation | `glowPulse` | `boolean` | `false` | Animated pulsing glow |

```typescript
// Static glow
data: {
  glowEnabled: true,
  glowColor: 'rgba(99, 102, 241, 0.6)',
  glowIntensity: 'medium'
}

// Pulsing glow
data: {
  glowEnabled: true,
  glowColor: 'rgba(168, 85, 247, 0.5)',
  glowPulse: true
}
```

**Glow Intensity Values:**
- `subtle`: `0 0 20px 5px {color}`
- `medium`: `0 0 40px 10px {color}`
- `intense`: `0 0 60px 20px {color}`

---

### 3. Border Styles

| Style | Property | Type | Default | Description |
|-------|----------|------|---------|-------------|
| Border Width | `borderWidth` | `number` | `2` | Border thickness in pixels |
| Border Color | `borderColor` | `string` | `'rgba(255,255,255,0.3)'` | Solid border color |
| Gradient Border | `borderGradient` | `[string, string]` | `undefined` | Two-color gradient border |
| Animated Border | `borderAnimated` | `boolean` | `false` | Rotating gradient effect |
| Double Ring | `doubleRing` | `boolean` | `false` | Inner + outer ring |
| Ring Gap | `ringGap` | `number` | `8` | Gap between rings (if doubleRing) |

```typescript
// Solid border
data: { borderColor: 'rgba(255, 255, 255, 0.4)', borderWidth: 2 }

// Gradient border
data: { borderGradient: ['#667eea', '#764ba2'] }

// Animated rotating border
data: {
  borderGradient: ['#06b6d4', '#8b5cf6'],
  borderAnimated: true
}

// Double ring
data: {
  borderColor: 'rgba(255, 255, 255, 0.3)',
  doubleRing: true,
  ringGap: 10
}
```

---

### 4. Glass/Frosted Effect

| Style | Property | Type | Default | Description |
|-------|----------|------|---------|-------------|
| Enable Glass | `glassEffect` | `boolean` | `false` | Enable glassmorphism |
| Blur Amount | `glassBlur` | `number` | `8` | Backdrop blur in pixels |
| Tint Color | `glassTint` | `string` | `'rgba(255,255,255,0.1)'` | Overlay tint |
| Distortion | `glassDistortion` | `boolean` | `false` | SVG liquid distortion |
| Distortion Strength | `distortionStrength` | `number` | `50` | Displacement intensity |

```typescript
// Simple glass effect
data: {
  glassEffect: true,
  glassBlur: 12,
  glassTint: 'rgba(255, 255, 255, 0.15)'
}

// Liquid glass with distortion
data: {
  glassEffect: true,
  glassBlur: 8,
  glassDistortion: true,
  distortionStrength: 40
}
```

---

### 5. Shadow Styles

| Style | Property | Type | Default | Description |
|-------|----------|------|---------|-------------|
| Shadow Type | `shadowType` | `'none' \| 'soft' \| 'elevated' \| 'layered'` | `'soft'` | Shadow preset |
| Shadow Color | `shadowColor` | `string` | `'rgba(0,0,0,0.2)'` | Custom shadow color |
| Inner Shadow | `innerShadow` | `boolean` | `false` | Inset shadow for depth |

```typescript
// Elevated shadow
data: { shadowType: 'elevated' }

// Colored shadow
data: {
  shadowType: 'soft',
  shadowColor: 'rgba(99, 102, 241, 0.3)'
}

// Layered with inner shadow
data: {
  shadowType: 'layered',
  innerShadow: true
}
```

**Shadow Presets:**
```css
/* none */
box-shadow: none;

/* soft */
box-shadow: 0 8px 32px {shadowColor};

/* elevated */
box-shadow: 0 4px 6px -1px {shadowColor}, 0 10px 20px -2px {shadowColor};

/* layered */
box-shadow:
  0 2px 4px {shadowColor},
  0 8px 16px {shadowColor},
  0 16px 32px {shadowColor};
```

---

### 6. Animation Styles

| Style | Property | Type | Default | Description |
|-------|----------|------|---------|-------------|
| Entrance | `entranceAnimation` | `'scale' \| 'fade' \| 'pop' \| 'float'` | `'scale'` | How node appears |
| Entrance Delay | `entranceDelay` | `number` | `0` | Delay in seconds |
| Idle Animation | `idleAnimation` | `'none' \| 'pulse' \| 'breathe' \| 'float'` | `'none'` | Continuous animation |
| Hover Animation | `hoverAnimation` | `'none' \| 'lift' \| 'glow' \| 'scale'` | `'none'` | On hover effect |
| Ring Pulse | `ringPulse` | `boolean` | `false` | Expanding ring animation |

```typescript
// Pop entrance with breathing idle
data: {
  entranceAnimation: 'pop',
  idleAnimation: 'breathe'
}

// Lift on hover with ring pulse
data: {
  hoverAnimation: 'lift',
  ringPulse: true
}
```

**Animation Definitions:**

```typescript
// Entrance animations
const entranceAnimations = {
  scale: { initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 } },
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  pop: { initial: { scale: 0.5, opacity: 0 }, animate: { scale: [1.1, 1], opacity: 1 } },
  float: { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 } },
};

// Idle animations (loop)
const idleAnimations = {
  pulse: { scale: [1, 1.02, 1], transition: { duration: 2, repeat: Infinity } },
  breathe: { scale: [1, 1.015, 1], opacity: [1, 0.95, 1], transition: { duration: 3, repeat: Infinity } },
  float: { y: [0, -5, 0], transition: { duration: 2.5, repeat: Infinity } },
};

// Hover animations
const hoverAnimations = {
  lift: { y: -4, boxShadow: 'elevated' },
  glow: { glowIntensity: 'intense' },
  scale: { scale: 1.05 },
};
```

---

### 7. Typography

| Style | Property | Type | Default | Description |
|-------|----------|------|---------|-------------|
| Text Color | `textColor` | `string` | `'#ffffff'` | Label color |
| Font Size | `fontSize` | `number` | `14` | Label font size |
| Font Weight | `fontWeight` | `number` | `600` | Label font weight |
| Font Family | `fontFamily` | `string` | `'inherit'` | Custom font |
| Text Gradient | `textGradient` | `[string, string]` | `undefined` | Gradient text |
| Description Visible | `showDescription` | `boolean` | `true` | Show/hide description |

```typescript
// Gradient text
data: {
  label: 'Focus',
  textGradient: ['#667eea', '#764ba2']
}

// Custom typography
data: {
  label: 'Focus',
  fontSize: 16,
  fontWeight: 700,
  textColor: '#e0e7ff'
}
```

---

### 8. Icon/Image

| Style | Property | Type | Default | Description |
|-------|----------|------|---------|-------------|
| Icon | `icon` | `string` | `undefined` | Icon name (from icon set) |
| Icon URL | `iconUrl` | `string` | `undefined` | Custom icon image URL |
| Icon Position | `iconPosition` | `'top' \| 'left' \| 'center'` | `'top'` | Icon placement |
| Icon Size | `iconSize` | `number` | `24` | Icon dimensions |

```typescript
// With icon
data: {
  label: 'Focus',
  icon: 'target',
  iconPosition: 'top',
  iconSize: 28
}
```

---

### 9. Mesh Gradient

| Style | Property | Type | Default | Description |
|-------|----------|------|---------|-------------|
| Enable Mesh | `meshGradient` | `boolean` | `false` | Toggle mesh gradient background |
| Mesh Colors | `meshColors` | `[string, string, string, string]` | Aurora preset | 4 colors for mesh points |
| Mesh Speed | `meshSpeed` | `number` | `1` | Animation speed multiplier (0.1 - 2.0) |
| Mesh Amplitude | `meshAmplitude` | `number` | `50` | Wave amplitude (0-100) |

```typescript
// Basic mesh gradient
data: {
  meshGradient: true,
  meshColors: ['#667eea', '#764ba2', '#f093fb', '#f5576c']
}

// Slow, subtle mesh
data: {
  meshGradient: true,
  meshColors: ['#0077b6', '#00b4d8', '#90e0ef', '#48cae4'],
  meshSpeed: 0.5,
  meshAmplitude: 30
}

// Fast, dramatic mesh
data: {
  meshGradient: true,
  meshColors: ['#ff4d4d', '#ff6b35', '#f7931e', '#ffd23f'],
  meshSpeed: 1.5,
  meshAmplitude: 80
}
```

**Available Mesh Presets:**

```typescript
import { MESH_GRADIENT_PRESETS } from '../types';

// Presets available:
MESH_GRADIENT_PRESETS.aurora  // ['#667eea', '#764ba2', '#f093fb', '#f5576c']
MESH_GRADIENT_PRESETS.ocean   // ['#0077b6', '#00b4d8', '#90e0ef', '#48cae4']
MESH_GRADIENT_PRESETS.sunset  // ['#ff6b6b', '#feca57', '#ff9ff3', '#f368e0']
MESH_GRADIENT_PRESETS.forest  // ['#2d6a4f', '#40916c', '#52b788', '#95d5b2']
MESH_GRADIENT_PRESETS.cosmic  // ['#7400b8', '#6930c3', '#5e60ce', '#4ea8de']
MESH_GRADIENT_PRESETS.fire    // ['#ff4d4d', '#ff6b35', '#f7931e', '#ffd23f']
```

---

### 10. Grain Effect

| Style | Property | Type | Default | Description |
|-------|----------|------|---------|-------------|
| Grain Amount | `grainAmount` | `number` | `0` | Grain intensity (0-100, 0 = no grain) |
| Grain Blend Mode | `grainBlendMode` | `'overlay' \| 'soft-light' \| 'multiply' \| 'screen'` | `'overlay'` | How grain blends with background |

```typescript
// Subtle grain (15%)
data: {
  meshGradient: true,
  meshColors: MESH_GRADIENT_PRESETS.aurora,
  grainAmount: 15,
  grainBlendMode: 'overlay'
}

// Medium grain (50%)
data: {
  meshGradient: true,
  meshColors: MESH_GRADIENT_PRESETS.ocean,
  grainAmount: 50,
  grainBlendMode: 'soft-light'
}

// Heavy grain (100%)
data: {
  meshGradient: true,
  meshColors: MESH_GRADIENT_PRESETS.fire,
  grainAmount: 100,
  grainBlendMode: 'multiply'
}
```

**Grain Blend Modes:**

| Mode | Effect |
|------|--------|
| `overlay` | Balanced blend, preserves colors (default) |
| `soft-light` | Softer, more subtle grain |
| `multiply` | Darker, more dramatic grain |
| `screen` | Lighter, adds brightness to grain |

---

### 11. Light Rays

| Style | Property | Type | Default | Description |
|-------|----------|------|---------|-------------|
| Enable Light Rays | `lightRays` | `boolean` | `false` | Toggle light rays effect |
| Ray Count | `lightRaysCount` | `number` | `7` | Number of animated rays |
| Ray Color | `lightRaysColor` | `string` | `'rgba(160, 210, 255, 0.2)'` | Color of the rays |
| Ray Blur | `lightRaysBlur` | `number` | `36` | Blur amount in pixels |
| Ray Speed | `lightRaysSpeed` | `number` | `14` | Animation cycle duration in seconds |
| Ray Length | `lightRaysLength` | `string` | `'100%'` | Length of rays (CSS value) |

```typescript
// Divine golden rays
data: {
  backgroundColor: '#0a0a1a',
  lightRays: true,
  lightRaysCount: 9,
  lightRaysColor: 'rgba(255, 215, 100, 0.25)',
  lightRaysBlur: 24,
  lightRaysSpeed: 12,
}

// Cool blue aurora rays
data: {
  backgroundColor: '#0a1020',
  lightRays: true,
  lightRaysCount: 12,
  lightRaysColor: 'rgba(100, 180, 255, 0.3)',
  lightRaysBlur: 30,
  lightRaysSpeed: 16,
  lightRaysLength: '120%',
}

// Subtle white rays
data: {
  backgroundColor: '#1a1a2e',
  lightRays: true,
  lightRaysCount: 5,
  lightRaysColor: 'rgba(255, 255, 255, 0.15)',
  lightRaysBlur: 40,
  lightRaysSpeed: 20,
}
```

**Light Rays Tips:**

| Setting | Effect |
|---------|--------|
| Higher `lightRaysCount` | More rays, denser effect |
| Lower `lightRaysBlur` | Sharper, more defined rays |
| Higher `lightRaysSpeed` | Slower animation (duration in seconds) |
| `lightRaysLength: '120%'` | Rays extend beyond node boundary |
| Combine with `glowEnabled` | Enhanced ethereal effect |

---

## Complete Example

```typescript
const focusNode: Node = {
  id: 'focus-node',
  type: 'circular',
  position: { x: 0, y: 0 },
  data: {
    // Content
    label: 'Focus',
    description: 'Start here',

    // Size
    size: 160,

    // Background
    gradientColors: ['#1e1b4b', '#312e81'],
    gradientDirection: 'radial',

    // Glow
    glowEnabled: true,
    glowColor: 'rgba(99, 102, 241, 0.4)',
    glowIntensity: 'medium',
    glowPulse: true,

    // Border
    borderGradient: ['#818cf8', '#c084fc'],
    borderWidth: 2,
    borderAnimated: true,

    // Shadow
    shadowType: 'layered',
    innerShadow: true,

    // Animation
    entranceAnimation: 'pop',
    idleAnimation: 'breathe',
    hoverAnimation: 'lift',
    ringPulse: true,

    // Typography
    textColor: '#e0e7ff',
    fontWeight: 600,
    fontSize: 16,
  },
};
```

---

## Style Presets

### Minimal
```typescript
{ backgroundColor: '#1a1a2e', borderColor: 'rgba(255,255,255,0.2)', shadowType: 'soft' }
```

### Glassmorphism
```typescript
{ glassEffect: true, glassBlur: 12, glassTint: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }
```

### Neon
```typescript
{ backgroundColor: '#0a0a0a', glowEnabled: true, glowColor: '#22d3ee', glowIntensity: 'intense', borderColor: '#22d3ee' }
```

### Gradient Glow
```typescript
{ gradientColors: ['#667eea', '#764ba2'], glowEnabled: true, glowPulse: true, borderGradient: ['#a78bfa', '#f472b6'] }
```

### Elevated Card
```typescript
{ backgroundColor: '#ffffff', textColor: '#1f2937', shadowType: 'elevated', hoverAnimation: 'lift' }
```

### Mesh Aurora (with grain)
```typescript
{ meshGradient: true, meshColors: MESH_GRADIENT_PRESETS.aurora, meshSpeed: 0.8, grainAmount: 25, grainBlendMode: 'overlay' }
```

### Mesh Ocean (heavy grain)
```typescript
{ meshGradient: true, meshColors: MESH_GRADIENT_PRESETS.ocean, meshSpeed: 1.2, grainAmount: 50, grainBlendMode: 'soft-light' }
```

### Divine Light (golden rays)
```typescript
{ backgroundColor: '#0a0a1a', lightRays: true, lightRaysCount: 9, lightRaysColor: 'rgba(255, 215, 100, 0.25)', lightRaysBlur: 24, lightRaysSpeed: 12, glowEnabled: true, glowColor: 'rgba(255, 215, 100, 0.2)' }
```

### Aurora Light (blue rays)
```typescript
{ backgroundColor: '#0a1020', lightRays: true, lightRaysCount: 12, lightRaysColor: 'rgba(100, 180, 255, 0.3)', lightRaysBlur: 30, lightRaysSpeed: 16, glowEnabled: true, glowColor: 'rgba(100, 180, 255, 0.25)' }
```

---

## Implementation Priority

1. **Phase 1**: Background + Border + Shadow (basic styling) ✅
2. **Phase 2**: Glow effects ✅
3. **Phase 3**: Animations (entrance, idle, hover) ✅
4. **Phase 4**: Glass effect with distortion ✅
5. **Phase 5**: Gradient borders (animated) ✅
6. **Phase 6**: Ring pulse animation ✅
7. **Phase 7**: Icon support
8. **Phase 8**: Mesh gradient background ✅
9. **Phase 9**: Grain overlay (0-100%) ✅
10. **Phase 10**: Light rays effect ✅

