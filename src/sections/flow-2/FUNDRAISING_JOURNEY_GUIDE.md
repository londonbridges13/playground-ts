# $1M Fundraising Journey - Visual Guide

## What You'll See

### The Flow
A horizontal journey of 7 connected milestones flowing from left to right:

```
Idea Validation → Build MVP → First 100 Users → Product-Market Fit → Scale Team → First Revenue → Series A Ready
    ($0)          ($50K)         ($100K)            ($250K)           ($500K)       ($750K)          ($1M)
```

### Node Types
- **Hexagon Nodes** (5): Regular milestones with rounded hexagon shape
- **Glass Nodes** (2): Major achievements (Product-Market Fit, Series A Ready) with liquid-glass effect

### Edge Colors & Meaning
1. **Blue** (Idea → MVP): Foundation phase
2. **Purple** (MVP → Users): Growth phase  
3. **Green** (Users → PMF): Validation phase ⭐
4. **Amber** (PMF → Team): Scaling phase
5. **Pink** (Team → Revenue): Monetization phase
6. **Cyan** (Revenue → Series A): Investment ready phase ⭐

### Layout Styles

#### 🌊 Organic (Default - Blue Button)
- Balanced stagger using depth, degree, and type
- Natural, flowing appearance
- Best for presentations and storytelling

#### ⬌ Clean (Green Button)
- Minimal stagger for professional look
- Subtle variation while maintaining alignment
- Best for formal pitches and reports

#### 📈 Dramatic (Orange Button)
- High stagger for maximum visual impact
- Eye-catching, dynamic layout
- Best for marketing materials and demos

#### 👥 Grouped (Cyan Button)
- Sibling-focused distribution
- Clear level-based grouping
- Best for showing parallel tracks

#### ☰ Strict (Red Button)
- No stagger, pure alignment
- Traditional flowchart appearance
- Best for technical documentation

## Interactive Features

### Click on Nodes
- **Dialog nodes** (Idea, First 100 Users, Scale Team, Series A): Opens radial timeline dialog
- **Drawer nodes** (MVP, PMF, Revenue): Opens context drawer from right side

### Hover on Edges
- Edges change color on hover
- Shows connection between milestones

### Layout Switching
- Click colored FAB buttons in top-right corner
- Smooth transition between layouts
- Nodes animate to new positions

## Milestone Details

### 1. Idea Validation ($0)
- **Stage**: Pre-seed
- **Focus**: Validate product-market fit
- **Action**: Dialog
- **Importance**: Critical (10/10)

### 2. Build MVP ($50K)
- **Stage**: Pre-seed
- **Focus**: Develop minimum viable product
- **Action**: Drawer
- **Importance**: Very High (9/10)

### 3. First 100 Users ($100K)
- **Stage**: Pre-seed
- **Focus**: Acquire early adopters
- **Action**: Dialog
- **Importance**: High (8/10)

### 4. Product-Market Fit ($250K) ⭐
- **Stage**: Seed
- **Focus**: Achieve strong retention metrics
- **Action**: Drawer
- **Importance**: Critical (10/10)
- **Special**: Glass node effect

### 5. Scale Team ($500K)
- **Stage**: Seed
- **Focus**: Hire key team members
- **Action**: Dialog
- **Importance**: Medium-High (7/10)

### 6. First Revenue ($750K)
- **Stage**: Seed
- **Focus**: Generate $10K MRR
- **Action**: Drawer
- **Importance**: Very High (9/10)

### 7. Series A Ready ($1M) ⭐
- **Stage**: Series A
- **Focus**: Hit $1M ARR, ready for growth
- **Action**: Dialog
- **Importance**: Critical (10/10)
- **Special**: Glass node effect

## Technical Details

### Positioning Algorithm
1. **Dagre** calculates base positions based on graph structure
2. **Depth strategy** adds variation based on distance from start
3. **Degree strategy** keeps hub nodes centered
4. **Type strategy** gives glass nodes less stagger (more stable)
5. **Seeded random** ensures consistency across renders

### Stagger Amounts by Layout
- **Organic**: 45px base (±90px range)
- **Clean**: 25px base (±50px range)
- **Dramatic**: 70px base (±140px range)
- **Grouped**: 55px base (±110px range)
- **Strict**: 0px (no variation)

### Node Spacing
- **Horizontal** (between nodes at same level): 120-150px
- **Vertical** (between levels): 180-250px depending on layout

## Animation Sequence

### Initial Load
1. Nodes appear in position
2. Edges animate in sequence with delays:
   - Edge 1 (Blue): 0s delay
   - Edge 2 (Purple): 0.3s delay
   - Edge 3 (Green): 0.6s delay
   - Edge 4 (Amber): 0.9s delay
   - Edge 5 (Pink): 1.2s delay
   - Edge 6 (Cyan): 1.5s delay

### Layout Switch
- All nodes smoothly transition to new positions
- Maintains edge connections during transition
- Takes ~0.5s to complete

## Customization Options

### Easy Changes
1. **Add more milestones**: Add to `fundraisingNodes` array
2. **Change colors**: Modify `strokeColor` in edges
3. **Adjust spacing**: Change `nodeSpacing` and `rankSpacing`
4. **Create new layout**: Add to `fundraisingLayoutConfigs`
5. **Add custom strategy**: Implement and register new strategy

### Example: Add a Milestone
```typescript
{
  id: 'new-milestone',
  type: 'hexagon',
  position: { x: 0, y: 0 }, // Auto-calculated
  data: { 
    label: 'New Milestone',
    opacity: 1,
    actionType: 'dialog',
    amount: '$XXX',
    stage: 'Seed',
    importance: 8,
  }
}
```

## Best Practices

### For Presentations
- Use **Organic** layout for storytelling
- Click through nodes to show details
- Hover edges to highlight connections

### For Pitches
- Use **Clean** layout for professional appearance
- Focus on key milestones (PMF, Series A)
- Emphasize the progression

### For Demos
- Use **Dramatic** layout to wow audience
- Switch between layouts to show flexibility
- Interact with nodes to show features

### For Documentation
- Use **Strict** layout for clarity
- Export as static image if needed
- Include milestone descriptions

## Troubleshooting

### Nodes overlap
- Increase `nodeSpacing` or `rankSpacing`
- Reduce `staggerAmount`
- Use **Strict** layout

### Layout looks too chaotic
- Reduce `staggerAmount`
- Use **Clean** layout
- Adjust strategy weights

### Edges cross awkwardly
- Adjust `edgePadding` in edge data
- Change `curvature` value
- Reorder nodes in data array

### Performance issues
- Reduce number of nodes
- Disable `initialAnimation`
- Simplify edge animations

