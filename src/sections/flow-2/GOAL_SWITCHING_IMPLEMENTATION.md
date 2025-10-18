# Goal Switching System Implementation

## Overview
Implemented a comprehensive goal-switching system that allows users to switch between different goal configurations using the `g/[goal]` command in the text input.

## Features Implemented

### ✅ 1. Goals Data Structure (`goals-data.ts`)
Created a centralized goals registry with 4 complete goal configurations:

#### **Goal 1: Startup Fundraising**
- **Command**: `g/startup`
- **Icon**: `solar:rocket-2-bold`
- **Milestones**: 7 nodes (Idea → MVP → Users → PMF → Team → Revenue → Series A)
- **Journey**: $0 to $1M fundraising

#### **Goal 2: Run a Marathon**
- **Command**: `g/marathon`
- **Icon**: `solar:running-round-bold`
- **Milestones**: 6 nodes (Decide → Base Training → Long Run → Peak → Taper → Race Day)
- **Journey**: 16-week training plan to 26.2 miles

#### **Goal 3: Build an App**
- **Command**: `g/app`
- **Icon**: `solar:smartphone-2-bold`
- **Milestones**: 6 nodes (Idea → Wireframes → Prototype → MVP → Beta → Launch)
- **Journey**: From concept to app store launch

#### **Goal 4: Start a Magazine**
- **Command**: `g/magazine`
- **Icon**: `solar:book-2-bold`
- **Milestones**: 6 nodes (Concept → Editorial → Writers → Content → Design → First Issue)
- **Journey**: Create and publish inaugural issue

### ✅ 2. Enhanced Text Input (`floating-text-input.tsx`)

#### **Goal Detection**
- Automatically detects when user types `g/`
- Opens goal selection menu immediately
- Auto-completes as user types (e.g., `g/mar` → highlights "marathon")

#### **Keyboard Navigation**
- **Arrow Down/Up**: Navigate through goals
- **Enter**: Select highlighted goal and load it
- **Escape**: Close menu without selecting

#### **Visual Menu**
- Beautiful dropdown with goal icons
- Shows goal name and description
- Highlights selected goal
- Positioned above text input

#### **Command Examples**
```
g/startup   → Loads startup fundraising goal
g/marathon  → Loads marathon training goal
g/app       → Loads app development goal
g/magazine  → Loads magazine creation goal
g/          → Opens menu with all goals
```

### ✅ 3. Updated View Component (`view.tsx`)

#### **Goal State Management**
- Tracks current active goal
- Automatically re-layouts nodes when goal changes
- Preserves layout configuration preference

#### **Visual Indicator**
- Chip in top-left corner shows current goal
- Displays goal icon and name
- Updates when goal switches

#### **Layout Switching**
- All 5 layout buttons (Organic, Clean, Dramatic, Grouped, Strict) work for each goal
- Layout preference resets to "Organic" when switching goals

## User Flow

### **Switching Goals**
1. User clicks in text input
2. User types `g/`
3. Menu opens showing all 4 goals
4. User can:
   - Continue typing to filter (e.g., `g/mar`)
   - Use arrow keys to navigate
   - Click a goal to select
5. User presses Enter or clicks Send button
6. Goal loads with new nodes and edges
7. Layout buttons remain functional for new goal

### **Visual Feedback**
- Top-left chip shows current goal name and icon
- Text input placeholder hints: "Ask Anything... (type 'g/' for goals)"
- Menu shows goal descriptions for context

## Technical Implementation

### **Data Structure**
```typescript
interface Goal {
  id: string;              // 'startup', 'marathon', 'app', 'magazine'
  name: string;            // Display name
  description: string;     // Short description
  icon?: string;           // Iconify icon name
  nodes: Node[];           // React Flow nodes
  edges: Edge[];           // React Flow edges
  defaultConfig: LayoutConfig;
  layoutConfigs: Record<string, LayoutConfig>;
}
```

### **Goals Registry**
```typescript
export const GOALS: Record<string, Goal> = {
  startup: { ... },
  marathon: { ... },
  app: { ... },
  magazine: { ... },
};
```

### **Helper Functions**
- `getGoal(goalId)` - Get goal by ID
- `getGoalIds()` - Get all goal IDs
- `DEFAULT_GOAL` - Default goal (startup)

## Files Modified

### **Created**
- `src/sections/flow-2/goals-data.ts` (964 lines)
  - All 4 goal configurations
  - Nodes, edges, and layout configs for each
  - Goals registry and helper functions

### **Modified**
- `src/sections/flow-2/floating-text-input.tsx`
  - Added goal detection logic
  - Added goal selection menu
  - Added keyboard navigation
  - Added `onGoalSelect` callback prop

- `src/sections/flow-2/view.tsx`
  - Added goal state management
  - Added goal switching handler
  - Added current goal indicator chip
  - Updated layout switching to work with current goal

## Layout Configurations

Each goal has 5 layout configurations:

### **1. Organic** (Default)
- Balanced stagger (depth 0.5, degree 0.3, type 0.2)
- Base amount: 45px
- Natural, flowing appearance

### **2. Clean**
- Minimal stagger (depth 0.7, type 0.3)
- Base amount: 25px
- Professional look

### **3. Dramatic**
- High stagger (depth 0.4, degree 0.3, random 0.3)
- Base amount: 70px
- Maximum visual impact

### **4. Grouped**
- Sibling-focused (sibling 0.6, type 0.4)
- Base amount: 55px
- Clear level-based grouping

### **5. Strict**
- No stagger
- Base amount: 0px
- Pure Dagre alignment

## Node Types

Each goal uses a mix of node types:

### **Hexagon Nodes**
- Regular milestones
- Standard importance
- Most common type

### **Glass Nodes**
- Major achievements
- Critical milestones
- Special visual effect
- Examples: PMF, Series A, Race Day, MVP Launch, First Issue

## Edge Styling

All edges use:
- **Artistic paths** with curvature
- **Animated drawing** on initial load
- **Staggered delays** for sequential reveal
- **Color-coded** by phase (blue → purple → green → amber → pink → cyan)
- **Hover effects** with color transitions

## Testing

### **To Test Goal Switching**
1. Navigate to the React Flow page
2. Click in the text input at the bottom
3. Type `g/`
4. See the menu appear with 4 goals
5. Use arrow keys or click to select "marathon"
6. Press Enter
7. Watch the marathon training plan load
8. See the chip in top-left update to "Run a Marathon"
9. Try switching layouts with the buttons on the right
10. Type `g/app` and press Enter to switch to app goal

### **Expected Behavior**
- ✅ Menu opens immediately when typing `g/`
- ✅ Goals are highlighted as you type
- ✅ Arrow keys navigate the menu
- ✅ Enter key loads the selected goal
- ✅ Nodes and edges update smoothly
- ✅ Top-left chip shows current goal
- ✅ Layout buttons work for each goal
- ✅ No errors in console

## Extensibility

### **Adding a New Goal**
1. Define nodes array with milestones
2. Define edges array with connections
3. Add to GOALS registry:
```typescript
newgoal: {
  id: 'newgoal',
  name: 'New Goal Name',
  description: 'Short description',
  icon: 'solar:icon-name',
  nodes: newGoalNodes,
  edges: newGoalEdges,
  defaultConfig: createLayoutConfigs().organic,
  layoutConfigs: createLayoutConfigs(),
}
```
4. Users can now access with `g/newgoal`

### **Customizing Layouts**
Each goal can have custom layout configurations by passing node overrides:
```typescript
layoutConfigs: createLayoutConfigs({
  'important-node': { staggerMultiplier: 0.5 },
  'fixed-node': { lockAxis: 'y' },
})
```

## Benefits

✅ **Fast Goal Switching** - Type `g/[goal]` and press Enter  
✅ **Keyboard-Driven** - Full keyboard navigation support  
✅ **Visual Feedback** - Clear indication of current goal  
✅ **Consistent Experience** - All layout options work for each goal  
✅ **Extensible** - Easy to add new goals  
✅ **Type-Safe** - Full TypeScript support  
✅ **Well-Organized** - Centralized goals registry  

## Next Steps

Potential enhancements:
- Add goal search/filter in menu
- Save user's last selected goal to localStorage
- Add goal-specific metadata (progress, completion %)
- Create goal templates for quick customization
- Add goal import/export functionality
- Support custom user-created goals

