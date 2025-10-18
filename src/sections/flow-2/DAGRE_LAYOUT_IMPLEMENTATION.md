# Dagre Layout Implementation - $1M Fundraising Journey

## Overview
Implemented a flexible, extensible node placement system for React Flow using Dagre layout algorithm with customizable staggering strategies. The system automatically positions 7 milestone nodes representing a startup's journey from idea to raising $1M.

## Files Created

### 1. `layout-strategies.ts`
**Purpose**: Core strategy system for node positioning and staggering

**Key Components**:
- **Strategy Interface**: Defines how positioning strategies work
- **Helper Functions**: 
  - `calculateNodeDepth()` - Determines hierarchical depth of nodes
  - `calculateNodeDegree()` - Counts incoming/outgoing connections
  - `groupNodesByRank()` - Groups sibling nodes at same level
  - `seededRandom()` - Consistent random values based on node ID

- **Built-in Strategies**:
  - `depthStrategy` - Stagger increases with depth in hierarchy
  - `degreeStrategy` - Hub nodes (many connections) stay centered
  - `typeStrategy` - Different node types get different stagger amounts
  - `siblingStrategy` - Evenly distributes nodes at same level
  - `randomStrategy` - Seeded random positioning
  - `noStaggerStrategy` - No staggering (baseline)

- **Strategy Registry**: Allows easy registration and retrieval of strategies
- **Strategy Combiner**: Mixes multiple strategies with weighted averages

### 2. `dagre-layout.ts`
**Purpose**: Integrates Dagre algorithm with stagger strategies

**Key Function**: `getLayoutedElements(nodes, edges, config)`
- Sets up Dagre graph with spacing and direction
- Calculates base positions using Dagre
- Applies stagger strategies to positions
- Handles node-specific overrides
- Returns positioned nodes and edges

### 3. `fundraising-data.ts`
**Purpose**: Defines the $1M fundraising journey data and layout configurations

**7 Milestones**:
1. **Idea Validation** ($0) - Pre-seed stage
2. **Build MVP** ($50K) - Pre-seed stage
3. **First 100 Users** ($100K) - Pre-seed stage
4. **Product-Market Fit** ($250K) - Seed stage (Glass node)
5. **Scale Team** ($500K) - Seed stage
6. **First Revenue** ($750K) - Seed stage
7. **Series A Ready** ($1M) - Series A stage (Glass node)

**Edge Features**:
- Color-coded by phase (Blue → Purple → Green → Amber → Pink → Cyan)
- Artistic animated paths with curvature
- Staggered animation delays for sequential reveal
- Hover effects with color transitions

**5 Layout Configurations**:
1. **Organic** (default) - Balanced depth/degree/type stagger (45px base)
2. **Clean** - Minimal stagger for professional look (25px base)
3. **Dramatic** - High stagger for visual impact (70px base)
4. **Grouped** - Sibling-focused for clear progression (55px base)
5. **Strict** - No stagger, pure Dagre alignment

## Integration in view.tsx

### Changes Made:
1. **Imports**: Added Dagre layout and fundraising data imports
2. **Layout Application**: Applied Dagre layout on component mount
3. **Layout Switcher**: Added `switchLayout()` function to change configs
4. **UI Controls**: Added 5 FAB buttons (top-right) to switch between layouts

### Layout Switcher Buttons:
- 🌊 **Organic** (Blue) - Default balanced layout
- ⬌ **Clean** (Green) - Minimal stagger
- 📈 **Dramatic** (Orange) - High visual impact
- 👥 **Grouped** (Cyan) - Sibling distribution
- ☰ **Strict** (Red) - No stagger

## Key Features

### ✅ Extensibility
- **Add new strategies**: Just implement `StaggerStrategy` interface and register
- **Combine strategies**: Mix multiple with custom weights
- **Override specific nodes**: Per-node customization via config
- **Switch configs**: Runtime layout changes without code modification

### ✅ Consistency
- **Seeded random**: Same layout every time for same data
- **Type-safe**: Full TypeScript support
- **Deterministic**: Reproducible positioning

### ✅ Flexibility
- **Multiple directions**: TB, BT, LR, RL layouts
- **Configurable spacing**: Node and rank spacing adjustable
- **Node overrides**: Lock axes, fix positions, adjust multipliers
- **Strategy weights**: Fine-tune influence of each strategy

## Configuration Example

```typescript
const config: LayoutConfig = {
  dagre: {
    direction: 'LR',        // Left to right
    nodeSpacing: 140,       // Horizontal spacing
    rankSpacing: 220,       // Vertical spacing between levels
    align: 'UL',           // Upper-left alignment
  },
  stagger: {
    enabled: true,
    baseAmount: 45,         // Base stagger in pixels
    strategies: [
      { name: 'depth', weight: 0.5 },   // 50% depth influence
      { name: 'degree', weight: 0.3 },  // 30% degree influence
      { name: 'type', weight: 0.2 },    // 20% type influence
    ],
  },
  nodeOverrides: {
    'product-market-fit': {
      staggerMultiplier: 0.5,  // Half the stagger for this node
    },
  },
};
```

## Usage

### View the Fundraising Journey:
1. Navigate to the React Flow page in your app
2. The 7 milestones will be automatically laid out horizontally
3. Click the colored FAB buttons (top-right) to switch layouts
4. Click nodes to open dialogs/drawers with milestone details

### Extend with New Strategies:
```typescript
// Create custom strategy
const customStrategy: StaggerStrategy = {
  name: 'custom',
  calculate: (node, context) => {
    // Your positioning logic
    return { x: 0, y: someValue };
  },
};

// Register it
strategyRegistry.register(customStrategy);

// Use it in config
const config = {
  stagger: {
    strategies: [
      { name: 'custom', weight: 1.0 },
    ],
  },
};
```

## Dependencies Installed
- `@dagrejs/dagre` - Directed graph layout library
- `@types/dagre` - TypeScript type definitions

## Visual Result
The fundraising journey displays as a horizontal flow with:
- Organic staggering for visual interest
- Color-coded edges showing progression
- Sequential animations revealing the path
- Glass nodes highlighting major milestones (PMF, Series A)
- Interactive nodes with dialogs/drawers
- Smooth layout transitions when switching configs

## Next Steps
- Add more milestone data (team members, metrics, etc.)
- Create custom strategies based on milestone importance
- Add animations when switching layouts
- Persist user's preferred layout choice
- Add zoom-to-node functionality
- Create timeline view alongside flow view

