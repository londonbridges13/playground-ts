# Focus Test Data - Frontend Testing

## 🎯 Test Focus Created

A complete Focus object with interface has been created in the backend database for frontend testing.

---

## 📋 Focus Details

### Focus ID
```
cmh3inmsa00072gdtkwiherjh
```

### Title
**Learn TypeScript Fundamentals**

### Description
A comprehensive learning path for mastering TypeScript from basics to advanced concepts

### Metadata
```json
{
  "category": "Programming",
  "difficulty": "Intermediate",
  "estimatedHours": 40,
  "tags": ["typescript", "javascript", "programming", "web-development"]
}
```

---

## 🎨 Interface Visualization

The Focus includes a **complete React Flow interface** with:

### Nodes (7 total)

1. **TypeScript Basics** (Hexagon)
   - Stage: Foundation
   - Importance: 10/10
   - Category: Core Concepts

2. **Types & Interfaces** (Glass)
   - Stage: Foundation
   - Importance: 9/10
   - Category: Type System

3. **Generics** (Hexagon)
   - Stage: Intermediate
   - Importance: 8/10
   - Category: Advanced Types

4. **Decorators** (Glass)
   - Stage: Advanced
   - Importance: 7/10
   - Category: Advanced Features

5. **Advanced Patterns** (AppStore)
   - Stage: Advanced
   - Importance: 9/10
   - Category: Design Patterns
   - Image: Unsplash code image
   - Amount: 20+ Patterns

6. **Tooling & Config** (Hexagon)
   - Stage: Intermediate
   - Importance: 6/10
   - Category: Development Tools

7. **Testing with TS** (Glass)
   - Stage: Intermediate
   - Importance: 7/10
   - Category: Testing

### Edges (7 total)

- **Main Learning Path:**
  - TypeScript Basics → Types & Interfaces
  - Types & Interfaces → Generics
  - Generics → Decorators
  - Decorators → Advanced Patterns

- **Supporting Paths:**
  - TypeScript Basics → Tooling & Config
  - Generics → Testing with TS
  - Testing with TS → Advanced Patterns

### Goal
- **Name:** TypeScript Mastery
- **Description:** Complete understanding of TypeScript
- **Icon:** 🎯

---

## 🔗 API Endpoints for Testing

### Get Focus
```bash
curl http://localhost:3000/api/focus/cmh3inmsa00072gdtkwiherjh
```

### Get Interface
```bash
curl http://localhost:3000/api/focus/cmh3inmsa00072gdtkwiherjh/interface
```

### Update Focus
```bash
curl -X PATCH http://localhost:3000/api/focus/cmh3inmsa00072gdtkwiherjh \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'
```

---

## 🌐 Frontend Test URLs

### Using the Focus ID in your frontend:

#### React Component
```typescript
import { FocusInterfaceVisualization } from '@/components/FocusInterfaceVisualization';

export default function TestPage() {
  return (
    <div className="h-screen">
      <ReactFlowProvider>
        <FocusInterfaceVisualization focusId="cmh3inmsa00072gdtkwiherjh" />
      </ReactFlowProvider>
    </div>
  );
}
```

#### Direct API Call
```typescript
import { focusInterfaceAPI } from '@/lib/api/focus-interface';

const focusInterface = await focusInterfaceAPI.getInterface('cmh3inmsa00072gdtkwiherjh');
```

#### Using Hook
```typescript
import { useFocusInterface } from '@/hooks/useFocusInterface';

function MyComponent() {
  const { interface, loading, error } = useFocusInterface('cmh3inmsa00072gdtkwiherjh');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{interface.nodes.length} nodes loaded</div>;
}
```

---

## 📊 Expected Interface Response

The interface includes:

- ✅ **7 nodes** with precise positions calculated by Dagre layout
- ✅ **7 edges** with smart handle routing
- ✅ **Handle coordinates** for all nodes (top, right, bottom, left)
- ✅ **Goal panel** data
- ✅ **Animated edges** with custom styling
- ✅ **Mixed node types** (hexagon, glass, appstore)

### Sample Node Structure
```json
{
  "id": "ts-basics",
  "type": "hexagon",
  "position": { "x": 50, "y": 123 },
  "data": {
    "label": "TypeScript Basics",
    "description": "Learn the fundamentals of TypeScript",
    "opacity": 1,
    "actionType": "dialog",
    "importance": 10,
    "stage": "Foundation",
    "category": "Core Concepts"
  },
  "handles": {
    "sources": [
      { "id": "right", "position": "right", "coordinates": { "x": 198, "y": 210 } },
      { "id": "bottom", "position": "bottom", "coordinates": { "x": 139, "y": 287 } }
    ],
    "targets": [
      { "id": "left", "position": "left", "coordinates": { "x": 80, "y": 210 } },
      { "id": "top", "position": "top", "coordinates": { "x": 139, "y": 133 } }
    ]
  }
}
```

---

## ✅ Testing Checklist

Use this Focus to test:

- [ ] Fetch Focus data from API
- [ ] Fetch interface data from API
- [ ] Render React Flow visualization
- [ ] Display all 7 nodes correctly
- [ ] Display all 7 edges with connections
- [ ] Show goal panel
- [ ] Handle coordinates render correctly
- [ ] Node types render (hexagon, glass, appstore)
- [ ] Animated edges work
- [ ] MiniMap displays
- [ ] Controls work (zoom, pan, fit view)
- [ ] Node click handlers
- [ ] Edge click handlers
- [ ] Loading states
- [ ] Error handling

---

## 🎨 Visual Layout

The interface creates a learning path visualization:

```
[TypeScript Basics] → [Types & Interfaces] → [Generics] → [Decorators] → [Advanced Patterns]
         ↓                                        ↓                              ↑
   [Tooling & Config]                      [Testing with TS] ──────────────────┘
```

---

## 🔄 Version Control

The Focus has been committed to the version control system:

- **Current Head:** `44b92f66543eb92a75d2f07fa8a7c0ab7a99a4b33bced7c163e595ea25fab8d5`
- **Commit Message:** "Initial commit: Created focus \"Learn TypeScript Fundamentals\""
- **Timestamp:** 2025-10-23T14:27:24.997Z

---

## 📝 Notes

- Backend server must be running on `http://localhost:3000`
- Focus is associated with user: `cmh1850tt00g82gsnk16ui52k`
- Interface was generated using the Dagre layout algorithm
- All handle coordinates are precisely calculated for optimal edge routing
- The AppStore node includes an Unsplash image URL

---

**Created:** 2025-10-23  
**Focus ID:** `cmh3inmsa00072gdtkwiherjh`  
**Status:** ✅ Ready for frontend testing

