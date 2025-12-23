# Focus Interface Mock Data Guide

> **Goal:** Running a Marathon
> **Purpose:** Demonstrate how Focus, Context, Request, and Interface work together

---

## Overview

| Component | What It Is | Marathon Example |
|-----------|------------|------------------|
| **Focus** | The main workspace/goal container | "Run My First Marathon" |
| **Context** | Active working session within Focus | "Week 1 Training Plan" |
| **Request** | User's ask to the system | "Create a 16-week training schedule" |
| **Interface** | Visual canvas with nodes & edges | Training milestones, dependencies, tasks |

---

## 1. Focus

The Focus is the top-level container representing the user's goal or project.

```json
{
  "id": "focus_marathon_2025",
  "title": "Run My First Marathon",
  "description": "Complete the Chicago Marathon in October 2025",
  "userId": "user_lyndon_123",
  "currentHead": "commit_abc123",
  "interface": { /* FocusInterfaceV2 - see section 4 */ },
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-12-23T10:30:00Z"
}
```

**Key Points:**
- One Focus = One major goal
- Contains the Interface (visual canvas)
- Has version control via `currentHead`

---

## 2. Context

The Context is an active working session within the Focus. Think of it as "what the user is currently working on."

```json
{
  "id": "ctx_week1_training",
  "title": "Week 1 Training Plan",
  "description": "Planning the first week of marathon training",
  "focusId": "focus_marathon_2025",
  "userId": "user_lyndon_123",
  "isActive": true,
  "activeBases": [
    "basis_running_fundamentals",
    "basis_nutrition_basics",
    "basis_injury_prevention"
  ],
  "metadata": {
    "currentWeek": 1,
    "totalWeeks": 16,
    "targetRace": "Chicago Marathon 2025"
  },
  "createdAt": "2025-01-01T08:00:00Z",
  "updatedAt": "2025-01-01T10:30:00Z"
}
```

**Key Points:**
- Context lives inside a Focus
- `activeBases` = which Basis entities are relevant to this context
- `isActive` = whether this is the current working context
- User can have multiple Contexts per Focus (Week 1, Week 2, Race Day, etc.)

---

## 3. Request

The Request is what the user asks the system to do within a Context.

```json
{
  "id": "req_create_training_plan",
  "input": "Create a 16-week marathon training plan for a beginner. I can run 3 miles currently.",
  "type": "AI_GENERATION",
  "status": "COMPLETED",
  "focusId": "focus_marathon_2025",
  "contextId": "ctx_week1_training",
  "userId": "user_lyndon_123",
  "parameters": {
    "currentFitness": "beginner",
    "currentDistance": "3 miles",
    "targetRace": "marathon",
    "weeksAvailable": 16
  },
  "metadata": {
    "model": "claude-3-opus",
    "temperature": 0.7
  },
  "createdAt": "2025-01-01T09:00:00Z",
  "updatedAt": "2025-01-01T09:02:30Z"
}
```

### Request Result

```json
{
  "id": "result_training_plan_001",
  "requestId": "req_create_training_plan",
  "output": "Here's your 16-week marathon training plan...",
  "wasSuccessful": true,
  "processingTimeMs": 2500,
  "tokensUsed": 1250,
  "estimatedCost": 0.0375,
  "createdEntityIds": [
    "basis_week1_plan",
    "basis_week2_plan",
    "basis_long_run_strategy"
  ],
  "createdEntityType": "Basis",
  "data": {
    "weeklyPlans": [
      { "week": 1, "totalMiles": 15, "longRun": 4 },
      { "week": 2, "totalMiles": 17, "longRun": 5 }
    ]
  },
  "createdAt": "2025-01-01T09:02:30Z",
  "updatedAt": "2025-01-01T09:02:30Z"
}
```

**Request Types:**
| Type | Example |
|------|---------|
| `AI_GENERATION` | "Create a training plan" |
| `DATA_QUERY` | "Show me all my long runs" |
| `ENTITY_CREATE` | "Add a new milestone for Week 8" |
| `ENTITY_UPDATE` | "Update Week 3 to include hill training" |
| `ENTITY_DELETE` | "Remove the rest day on Tuesday" |
| `ANALYSIS` | "Analyze my training progress" |

---

## 4. Interface (FocusInterfaceV2)

The Interface is the visual canvas where nodes and edges represent the user's thinking.

```json
{
  "schemaVersion": "2.0",
  "viewport": {
    "x": -200,
    "y": -100,
    "zoom": 0.8
  },
  "nodes": [ /* See nodes below */ ],
  "edges": [ /* See edges below */ ]
}
```

### Interface Nodes

```json
[
  {
    "id": "node-goal",
    "type": "hexagon",
    "position": { "x": 400, "y": 100 },
    "data": {
      "label": "🏃 Run Chicago Marathon",
      "basisId": "basis_marathon_goal",
      "content": {
        "type": "doc",
        "content": [
          { "type": "paragraph", "content": [{ "type": "text", "text": "Complete the Chicago Marathon in October 2025" }] },
          { "type": "paragraph", "content": [{ "type": "text", "text": "Target time: Under 5 hours" }] }
        ]
      },
      "index": 0,
      "backgroundImage": "/mesh/magic3.png",
      "patternOverlay": null,
      "grainAmount": 25,
      "grainBlendMode": "overlay",
      "borderWidth": 5,
      "textColor": "#ffffff",
      "showFloatingHandles": true,
      "handleSize": 16,
      "handleColor": "#d1d5db",
      "handleOffset": 10
    }
  },
  {
    "id": "node-phase1",
    "type": "diamond",
    "position": { "x": 200, "y": 300 },
    "data": {
      "label": "📅 Phase 1: Base Building",
      "basisId": "basis_phase1",
      "content": {
        "type": "doc",
        "content": [
          { "type": "paragraph", "content": [{ "type": "text", "text": "Weeks 1-4: Build aerobic base" }] },
          { "type": "paragraph", "content": [{ "type": "text", "text": "Focus: Easy runs, consistency" }] }
        ]
      },
      "index": 1,
      "backgroundImage": "/mesh/magic5.png",
      "patternOverlay": null,
      "grainAmount": 25,
      "grainBlendMode": "overlay",
      "borderWidth": 5,
      "textColor": "#ffffff",
      "showFloatingHandles": true,
      "handleSize": 16,
      "handleColor": "#d1d5db",
      "handleOffset": 10
    }
  },
  {
    "id": "node-phase2",
    "type": "diamond",
    "position": { "x": 400, "y": 300 },
    "data": {
      "label": "💪 Phase 2: Build Strength",
      "basisId": "basis_phase2",
      "content": {
        "type": "doc",
        "content": [
          { "type": "paragraph", "content": [{ "type": "text", "text": "Weeks 5-10: Increase mileage" }] },
          { "type": "paragraph", "content": [{ "type": "text", "text": "Focus: Long runs, tempo work" }] }
        ]
      },
      "index": 2,
      "backgroundImage": "/mesh/magic6.png",
      "patternOverlay": null,
      "grainAmount": 25,
      "grainBlendMode": "overlay",
      "borderWidth": 5,
      "textColor": "#ffffff",
      "showFloatingHandles": true,
      "handleSize": 16,
      "handleColor": "#d1d5db",
      "handleOffset": 10
    }
  },
  {
    "id": "node-phase3",
    "type": "diamond",
    "position": { "x": 600, "y": 300 },
    "data": {
      "label": "🔥 Phase 3: Peak & Taper",
      "basisId": "basis_phase3",
      "content": {
        "type": "doc",
        "content": [
          { "type": "paragraph", "content": [{ "type": "text", "text": "Weeks 11-16: Peak then taper" }] },
          { "type": "paragraph", "content": [{ "type": "text", "text": "Focus: Race simulation, recovery" }] }
        ]
      },
      "index": 3,
      "backgroundImage": "/mesh/magic7.png",
      "patternOverlay": null,
      "grainAmount": 25,
      "grainBlendMode": "overlay",
      "borderWidth": 5,
      "textColor": "#ffffff",
      "showFloatingHandles": true,
      "handleSize": 16,
      "handleColor": "#d1d5db",
      "handleOffset": 10
    }
  },
  {
    "id": "node-week1",
    "type": "rectangle",
    "position": { "x": 100, "y": 500 },
    "data": {
      "label": "Week 1",
      "basisId": "basis_week1_plan",
      "content": {
        "type": "doc",
        "content": [
          { "type": "paragraph", "content": [{ "type": "text", "text": "Mon: Rest" }] },
          { "type": "paragraph", "content": [{ "type": "text", "text": "Tue: 3 mi easy" }] },
          { "type": "paragraph", "content": [{ "type": "text", "text": "Wed: Cross-train" }] },
          { "type": "paragraph", "content": [{ "type": "text", "text": "Thu: 3 mi easy" }] },
          { "type": "paragraph", "content": [{ "type": "text", "text": "Fri: Rest" }] },
          { "type": "paragraph", "content": [{ "type": "text", "text": "Sat: 4 mi long run" }] },
          { "type": "paragraph", "content": [{ "type": "text", "text": "Sun: 2 mi recovery" }] }
        ]
      },
      "index": 4,
      "backgroundImage": "/mesh/magic8.png",
      "patternOverlay": null,
      "grainAmount": 25,
      "grainBlendMode": "overlay",
      "borderWidth": 5,
      "textColor": "#ffffff",
      "showFloatingHandles": true,
      "handleSize": 16,
      "handleColor": "#d1d5db",
      "handleOffset": 10,
      "hasCheckbox": true,
      "checked": false
    }
  },
  {
    "id": "node-nutrition",
    "type": "hexagon",
    "position": { "x": 700, "y": 500 },
    "data": {
      "label": "🥗 Nutrition Strategy",
      "basisId": "basis_nutrition_basics",
      "content": {
        "type": "doc",
        "content": [
          { "type": "paragraph", "content": [{ "type": "text", "text": "Carb loading before long runs" }] },
          { "type": "paragraph", "content": [{ "type": "text", "text": "Hydration: 8oz every 20 min" }] },
          { "type": "paragraph", "content": [{ "type": "text", "text": "Post-run: Protein within 30 min" }] }
        ]
      },
      "index": 5,
      "backgroundImage": "/mesh/magic9.png",
      "patternOverlay": null,
      "grainAmount": 25,
      "grainBlendMode": "overlay",
      "borderWidth": 5,
      "textColor": "#ffffff",
      "showFloatingHandles": true,
      "handleSize": 16,
      "handleColor": "#d1d5db",
      "handleOffset": 10
    }
  }
]
```

### Interface Edges

```json
[
  {
    "id": "edge-goal-phase1",
    "type": "smartPulseButton",
    "source": "node-goal",
    "target": "node-phase1",
    "data": {
      "strokeColor": "rgba(158, 122, 255, 0.8)",
      "strokeWidth": 2,
      "dashArray": "0",
      "animated": false,
      "relationship": {
        "type": "sequence",
        "direction": "forward",
        "strength": 1.0,
        "label": "starts with"
      }
    }
  },
  {
    "id": "edge-goal-phase2",
    "type": "smartPulseButton",
    "source": "node-goal",
    "target": "node-phase2",
    "data": {
      "strokeColor": "rgba(158, 122, 255, 0.8)",
      "strokeWidth": 2,
      "dashArray": "0",
      "animated": false,
      "relationship": {
        "type": "sequence",
        "direction": "forward",
        "strength": 1.0,
        "label": "continues with"
      }
    }
  },
  {
    "id": "edge-goal-phase3",
    "type": "smartPulseButton",
    "source": "node-goal",
    "target": "node-phase3",
    "data": {
      "strokeColor": "rgba(158, 122, 255, 0.8)",
      "strokeWidth": 2,
      "dashArray": "0",
      "animated": false,
      "relationship": {
        "type": "sequence",
        "direction": "forward",
        "strength": 1.0,
        "label": "ends with"
      }
    }
  },
  {
    "id": "edge-phase1-phase2",
    "type": "smartPulseButton",
    "source": "node-phase1",
    "target": "node-phase2",
    "data": {
      "strokeColor": "rgba(100, 200, 150, 0.8)",
      "strokeWidth": 3,
      "dashArray": "0",
      "animated": true,
      "relationship": {
        "type": "dependency",
        "direction": "forward",
        "strength": 1.0,
        "label": "must complete before"
      }
    }
  },
  {
    "id": "edge-phase2-phase3",
    "type": "smartPulseButton",
    "source": "node-phase2",
    "target": "node-phase3",
    "data": {
      "strokeColor": "rgba(100, 200, 150, 0.8)",
      "strokeWidth": 3,
      "dashArray": "0",
      "animated": true,
      "relationship": {
        "type": "dependency",
        "direction": "forward",
        "strength": 1.0,
        "label": "must complete before"
      }
    }
  },
  {
    "id": "edge-phase1-week1",
    "type": "smartPulseButton",
    "source": "node-phase1",
    "target": "node-week1",
    "data": {
      "strokeColor": "rgba(255, 200, 100, 0.8)",
      "strokeWidth": 2,
      "dashArray": "5,5",
      "animated": false,
      "relationship": {
        "type": "grouping",
        "direction": "forward",
        "strength": 0.8,
        "label": "contains"
      }
    }
  },
  {
    "id": "edge-nutrition-phase2",
    "type": "smartPulseButton",
    "source": "node-nutrition",
    "target": "node-phase2",
    "data": {
      "strokeColor": "rgba(255, 150, 200, 0.8)",
      "strokeWidth": 2,
      "dashArray": "0",
      "animated": false,
      "relationship": {
        "type": "reference",
        "direction": "bidirectional",
        "strength": 0.6,
        "label": "supports"
      }
    }
  }
]
```

---

## 5. Visual Representation

```
                    ┌─────────────────────────┐
                    │   🏃 Run Chicago        │
                    │      Marathon           │  ← GOAL (hexagon)
                    │   (node-goal)           │
                    └───────────┬─────────────┘
                                │
           ┌────────────────────┼────────────────────┐
           │                    │                    │
           ▼                    ▼                    ▼
    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
    │ Phase 1:     │───▶│ Phase 2:     │───▶│ Phase 3:     │
    │ Base Building│    │ Build Strength│    │ Peak & Taper │
    │ (diamond)    │    │ (diamond)    │    │ (diamond)    │
    └──────┬───────┘    └──────────────┘    └──────────────┘
           │                    ▲
           │                    │
           ▼                    │
    ┌──────────────┐    ┌──────────────┐
    │   Week 1     │    │  Nutrition   │
    │ (rectangle)  │    │  Strategy    │
    │ ☐ Checkbox   │    │  (hexagon)   │
    └──────────────┘    └──────────────┘
```

---

## 6. Relationship Types Explained

| Type | Meaning | Example |
|------|---------|---------|
| `dependency` | B requires A to be complete | Phase 2 depends on Phase 1 |
| `sequence` | A comes before B in order | Goal → Phase 1 → Phase 2 → Phase 3 |
| `reference` | A mentions or relates to B | Nutrition supports Phase 2 |
| `grouping` | A and B belong together | Phase 1 contains Week 1 |
| `contrast` | A and B are opposites | Rest day vs. Long run |
| `derivation` | B was derived from A | Week plan derived from Phase plan |

---

## 7. How It All Connects

```
┌─────────────────────────────────────────────────────────────────┐
│                           FOCUS                                  │
│  "Run My First Marathon"                                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      INTERFACE                           │   │
│  │  (Visual canvas with nodes & edges)                     │   │
│  │                                                          │   │
│  │   [Goal] ──▶ [Phase 1] ──▶ [Phase 2] ──▶ [Phase 3]     │   │
│  │                  │              ▲                        │   │
│  │                  ▼              │                        │   │
│  │             [Week 1]      [Nutrition]                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      CONTEXT                             │   │
│  │  "Week 1 Training Plan"                                 │   │
│  │  activeBases: [running_fundamentals, nutrition_basics]  │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │                    REQUEST                       │   │   │
│  │  │  "Create a 16-week training plan for beginner"  │   │   │
│  │  │                                                  │   │   │
│  │  │  ┌─────────────────────────────────────────┐   │   │   │
│  │  │  │              RESULT                      │   │   │   │
│  │  │  │  Created: basis_week1_plan, etc.        │   │   │   │
│  │  │  └─────────────────────────────────────────┘   │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. TypeScript Usage

```typescript
import {
  FocusInterfaceV2,
  InterfaceNode,
  InterfaceEdge,
  Context,
  Request,
  Result
} from '@/types/v3-interface-api-structure';

// Load interface
const response = await fetch(`/api/focus/${focusId}/interface`);
const { interface: focusInterface } = await response.json() as LoadInterfaceResponse;

// Access nodes with Basis links
focusInterface.nodes.forEach((node: InterfaceNode) => {
  if (node.data.basisId) {
    console.log(`Node "${node.data.label}" linked to Basis: ${node.data.basisId}`);
  }
});

// Access edges with relationships
focusInterface.edges.forEach((edge: InterfaceEdge) => {
  if (edge.data.relationship) {
    console.log(`Edge ${edge.source} → ${edge.target}: ${edge.data.relationship.type}`);
  }
});
```

