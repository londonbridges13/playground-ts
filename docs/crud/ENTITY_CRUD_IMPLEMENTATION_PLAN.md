# Entity CRUD Test Page Implementation Plan

> ✅ **IMPLEMENTATION COMPLETE** - All 13 entity forms have been created and are accessible at `/dashboard/entities`

## Overview

Create a comprehensive CRUD test page at `/dashboard/entities` that allows testing all 13 entity types with forms containing essential and optional fields.

---

## 🎛️ Available Form Components

From `src/components/hook-form/fields.tsx`:

| Component | Use Case | Example |
|-----------|----------|---------|
| `Field.Text` | Text input, URLs, multiline | `<Field.Text name="title" label="Title" />` |
| `Field.Select` | Single dropdown selection | `<Field.Select name="entityType" options={[...]} />` |
| `Field.MultiSelect` | Multiple dropdown selections | `<Field.MultiSelect name="tags" options={[...]} />` |
| `Field.Switch` | Boolean toggle | `<Field.Switch name="isPrivate" label="Private" />` |
| `Field.Checkbox` | Single checkbox | `<Field.Checkbox name="agree" label="I agree" />` |
| `Field.MultiCheckbox` | Multiple checkboxes | `<Field.MultiCheckbox name="options" options={[...]} />` |
| `Field.Autocomplete` | Searchable dropdown (for IDs) | `<Field.Autocomplete name="atlasId" options={atlases} />` |
| `Field.DatePicker` | Date selection | `<Field.DatePicker name="deadline" label="Deadline" />` |
| `Field.TimePicker` | Time selection | `<Field.TimePicker name="time" />` |
| `Field.DateTimePicker` | Date + Time selection | `<Field.DateTimePicker name="scheduledAt" />` |
| `Field.Slider` | Numeric range | `<Field.Slider name="order" min={0} max={100} />` |
| `Field.Rating` | Star rating | `<Field.Rating name="priority" />` |
| `Field.RadioGroup` | Radio button group | `<Field.RadioGroup name="layout" options={[...]} />` |

---

## 📋 Entity Form Field Specifications

### 1. Atlas Form

| Field | Required | Type | Component | Props |
|-------|----------|------|-----------|-------|
| `title` | ✅ YES | string | `Field.Text` | `label="Title" required` |
| `userId` | ✅ YES | string | `Field.Text` | `label="User ID" required disabled` (auto-filled) |
| `description` | ❌ | string | `Field.Text` | `label="Description" multiline rows={3}` |
| `initLog` | ❌ | string | `Field.Text` | `label="Initial Log" multiline rows={2}` |
| `imageUrl` | ❌ | string | `Field.Text` | `label="Image URL" type="url"` |
| `coverImageUrl` | ❌ | string | `Field.Text` | `label="Cover Image URL" type="url"` |
| `isPrivate` | ❌ | boolean | `Field.Switch` | `label="Private"` |
| `artificial` | ❌ | boolean | `Field.Switch` | `label="AI Generated"` |
| `focusId` | ❌ | string | `Field.Autocomplete` | `label="Focus" options={focusList}` |

---

### 2. Path Form

| Field | Required | Type | Component | Props |
|-------|----------|------|-----------|-------|
| `title` | ✅ YES | string | `Field.Text` | `label="Title" required` |
| `userId` | ✅ YES | string | `Field.Text` | `label="User ID" required disabled` |
| `description` | ❌ | string | `Field.Text` | `label="Description" multiline rows={3}` |
| `initLog` | ❌ | string | `Field.Text` | `label="Initial Log" multiline rows={2}` |
| `imageUrl` | ❌ | string | `Field.Text` | `label="Image URL" type="url"` |
| `active` | ❌ | boolean | `Field.Switch` | `label="Active"` |
| `isPrivate` | ❌ | boolean | `Field.Switch` | `label="Private"` |
| `isComplete` | ❌ | boolean | `Field.Switch` | `label="Complete"` |
| `isReproduced` | ❌ | boolean | `Field.Switch` | `label="Reproduced"` |
| `activeAtlasId` | ❌ | string | `Field.Autocomplete` | `label="Active Atlas" options={atlasList}` |
| `initialAtlasId` | ❌ | string | `Field.Autocomplete` | `label="Initial Atlas" options={atlasList}` |
| `focusId` | ❌ | string | `Field.Autocomplete` | `label="Focus" options={focusList}` |

---

### 3. Milestone Form

| Field | Required | Type | Component | Props |
|-------|----------|------|-----------|-------|
| `title` | ✅ YES | string | `Field.Text` | `label="Title" required` |
| `description` | ❌ | string | `Field.Text` | `label="Description" multiline rows={3}` |
| `initLog` | ❌ | string | `Field.Text` | `label="Initial Log" multiline rows={2}` |
| `imageUrl` | ❌ | string | `Field.Text` | `label="Image URL" type="url"` |
| `active` | ❌ | boolean | `Field.Switch` | `label="Active"` |
| `isPrivate` | ❌ | boolean | `Field.Switch` | `label="Private"` |
| `isComplete` | ❌ | boolean | `Field.Switch` | `label="Complete"` |
| `isEssential` | ❌ | boolean | `Field.Switch` | `label="Essential"` |
| `isAdjacent` | ❌ | boolean | `Field.Switch` | `label="Adjacent"` |
| `artificial` | ❌ | boolean | `Field.Switch` | `label="AI Generated"` |
| `horizonId` | ❌ | string | `Field.Autocomplete` | `label="Horizon" options={horizonList}` |
| `atlasId` | ❌ | string | `Field.Autocomplete` | `label="Atlas" options={atlasList}` |
| `pathId` | ❌ | string | `Field.Autocomplete` | `label="Path" options={pathList}` |
| `focusId` | ❌ | string | `Field.Autocomplete` | `label="Focus" options={focusList}` |

---

### 4. Horizon Form

| Field | Required | Type | Component | Props |
|-------|----------|------|-----------|-------|
| `title` | ✅ YES | string | `Field.Text` | `label="Title" required` |
| `description` | ❌ | string | `Field.Text` | `label="Description" multiline rows={3}` |
| `initLog` | ❌ | string | `Field.Text` | `label="Initial Log" multiline rows={2}` |
| `imageUrl` | ❌ | string | `Field.Text` | `label="Image URL" type="url"` |
| `active` | ❌ | boolean | `Field.Switch` | `label="Active"` |
| `isPrivate` | ❌ | boolean | `Field.Switch` | `label="Private"` |
| `artificial` | ❌ | boolean | `Field.Switch` | `label="AI Generated"` |
| `atlasId` | ❌ | string | `Field.Autocomplete` | `label="Atlas" options={atlasList}` |
| `pathId` | ❌ | string | `Field.Autocomplete` | `label="Path" options={pathList}` |
| `initialAtlasId` | ❌ | string | `Field.Autocomplete` | `label="Initial Atlas" options={atlasList}` |
| `initialPathId` | ❌ | string | `Field.Autocomplete` | `label="Initial Path" options={pathList}` |
| `focusId` | ❌ | string | `Field.Autocomplete` | `label="Focus" options={focusList}` |

---

### 5. Pathway Form

| Field | Required | Type | Component | Props |
|-------|----------|------|-----------|-------|
| `title` | ✅ YES | string | `Field.Text` | `label="Title" required` |
| `description` | ❌ | string | `Field.Text` | `label="Description" multiline rows={3}` |
| `initLog` | ❌ | string | `Field.Text` | `label="Initial Log" multiline rows={2}` |
| `imageUrl` | ❌ | string | `Field.Text` | `label="Image URL" type="url"` |
| `active` | ❌ | boolean | `Field.Switch` | `label="Active"` |
| `isPrivate` | ❌ | boolean | `Field.Switch` | `label="Private"` |
| `isComplete` | ❌ | boolean | `Field.Switch` | `label="Complete"` |
| `artificial` | ❌ | boolean | `Field.Switch` | `label="AI Generated"` |
| `deadline` | ❌ | Date | `Field.DatePicker` | `label="Deadline"` |
| `timeEstimate` | ❌ | number | `Field.Text` | `label="Time Estimate (hours)" type="number"` |
| `pathId` | ❌ | string | `Field.Autocomplete` | `label="Path" options={pathList}` |
| `atlasId` | ❌ | string | `Field.Autocomplete` | `label="Atlas" options={atlasList}` |
| `initialMilestoneId` | ❌ | string | `Field.Autocomplete` | `label="Initial Milestone" options={milestoneList}` |
| `initialHorizonId` | ❌ | string | `Field.Autocomplete` | `label="Initial Horizon" options={horizonList}` |
| `focusId` | ❌ | string | `Field.Autocomplete` | `label="Focus" options={focusList}` |

---

### 6. Story Form

| Field | Required | Type | Component | Props |
|-------|----------|------|-----------|-------|
| `title` | ✅ YES | string | `Field.Text` | `label="Title" required` |
| `description` | ❌ | string | `Field.Text` | `label="Description" multiline rows={3}` |
| `userId` | ❌ | string | `Field.Text` | `label="User ID"` |
| `atlasId` | ❌ | string | `Field.Autocomplete` | `label="Atlas" options={atlasList}` |
| `focusId` | ❌ | string | `Field.Autocomplete` | `label="Focus" options={focusList}` |

**Nested: chapters[]** (Dynamic field array)
| Sub-Field | Type | Component | Props |
|-----------|------|-----------|-------|
| `chapters[].title` | string | `Field.Text` | `label="Chapter Title" required` |
| `chapters[].content` | string | `Field.Text` | `label="Content" multiline rows={4}` |
| `chapters[].order` | number | `Field.Text` | `label="Order" type="number" required` |

---

### 7. Insight Form

| Field | Required | Type | Component | Props |
|-------|----------|------|-----------|-------|
| `title` | ✅ YES | string | `Field.Text` | `label="Title" required` |
| `atlasId` | ✅ YES | string | `Field.Autocomplete` | `label="Atlas" options={atlasList} required` |
| `description` | ❌ | string | `Field.Text` | `label="Description" multiline rows={3}` |
| `explanation` | ❌ | string | `Field.Text` | `label="Explanation" multiline rows={4}` |
| `artificial` | ❌ | boolean | `Field.Switch` | `label="AI Generated"` |
| `userId` | ❌ | string | `Field.Text` | `label="User ID"` |
| `focusId` | ❌ | string | `Field.Autocomplete` | `label="Focus" options={focusList}` |

---

### 8. Archetype Form

⚠️ **Note:** Uses `name` instead of `title`

| Field | Required | Type | Component | Props |
|-------|----------|------|-----------|-------|
| `name` | ✅ YES | string | `Field.Text` | `label="Name" required` |
| `atlasId` | ✅ YES | string | `Field.Autocomplete` | `label="Atlas" options={atlasList} required` |
| `description` | ❌ | string | `Field.Text` | `label="Description" multiline rows={3}` |
| `focusId` | ❌ | string | `Field.Autocomplete` | `label="Focus" options={focusList}` |

**Nested Arrays** (all optional, use dynamic field arrays):
| Array Field | Sub-Fields | Components |
|-------------|------------|------------|
| `notions[]` | `title`, `description`, `user` | `Field.Text` × 3 |
| `traits[]` | `title`, `description` | `Field.Text` × 2 |
| `values[]` | `title`, `description` | `Field.Text` × 2 |
| `motivations[]` | `title`, `description` | `Field.Text` × 2 |
| `logs[]` | `title`, `description` | `Field.Text` × 2 |
| `categories[]` | `title`, `description` | `Field.Text` × 2 |
| `strengths[]` | `title`, `description` | `Field.Text` × 2 |
| `flaws[]` | `title`, `description` | `Field.Text` × 2 |

---

### 9. Polarity Form

| Field | Required | Type | Component | Props |
|-------|----------|------|-----------|-------|
| `title` | ✅ YES | string | `Field.Text` | `label="Title" required` |
| `description` | ❌ | string | `Field.Text` | `label="Description" multiline rows={3}` |
| `userId` | ❌ | string | `Field.Text` | `label="User ID"` |
| `atlasId` | ❌ | string | `Field.Autocomplete` | `label="Atlas" options={atlasList}` |
| `focusId` | ❌ | string | `Field.Autocomplete` | `label="Focus" options={focusList}` |

**Nested Arrays** (all optional):
| Array Field | Sub-Fields | Components |
|-------------|------------|------------|
| `powerLaws[]` | `title`, `description` | `Field.Text` × 2 |
| `keyConsiderations[]` | `title`, `description` | `Field.Text` × 2 |
| `questionsToExplore[]` | `question` | `Field.Text` × 1 |

---

### 10. Steps Form

| Field | Required | Type | Component | Props |
|-------|----------|------|-----------|-------|
| `title` | ✅ YES | string | `Field.Text` | `label="Title" required` |
| `order` | ✅ YES | number | `Field.Text` | `label="Order" type="number" required` |
| `description` | ❌ | string | `Field.Text` | `label="Description" multiline rows={3}` |
| `isComplete` | ❌ | boolean | `Field.Switch` | `label="Complete"` |
| `pathwayId` | ❌ | string | `Field.Autocomplete` | `label="Pathway" options={pathwayList}` |
| `milestoneId` | ❌ | string | `Field.Autocomplete` | `label="Milestone" options={milestoneList}` |
| `focusId` | ❌ | string | `Field.Autocomplete` | `label="Focus" options={focusList}` |

---

### 11. Basis Form

| Field | Required | Type | Component | Props |
|-------|----------|------|-----------|-------|
| `title` | ✅ YES | string | `Field.Text` | `label="Title" required` |
| `entityType` | ✅ YES | enum | `Field.Select` | `label="Entity Type" required options={entityTypeOptions}` |
| `metadata` | ✅ YES | JSON | `Field.Text` | `label="Metadata (JSON)" multiline rows={6} required` |
| `userId` | ✅ YES | string | `Field.Text` | `label="User ID" required disabled` |
| `description` | ❌ | string | `Field.Text` | `label="Description" multiline rows={3}` |
| `imageUrl` | ❌ | string | `Field.Text` | `label="Image URL" type="url"` |
| `sourceEntityId` | ❌ | string | `Field.Text` | `label="Source Entity ID"` |
| `atlasId` | ❌ | string | `Field.Autocomplete` | `label="Atlas" options={atlasList}` |
| `pathId` | ❌ | string | `Field.Autocomplete` | `label="Path" options={pathList}` |

**entityType options:**
```typescript
const entityTypeOptions = [
  { value: 'milestone', label: 'Milestone' },
  { value: 'horizon', label: 'Horizon' },
  { value: 'pathway', label: 'Pathway' },
  { value: 'atlas', label: 'Atlas' },
  { value: 'story', label: 'Story' },
  { value: 'insight', label: 'Insight' },
  { value: 'step', label: 'Step' },
  { value: 'polarity', label: 'Polarity' },
  { value: 'path', label: 'Path' },
  { value: 'steps', label: 'Steps' },
  { value: 'archetype', label: 'Archetype' },
  { value: 'focus', label: 'Focus' },
  { value: 'discovery', label: 'Discovery' },
  { value: 'conversation', label: 'Conversation' },
  { value: 'custom', label: 'Custom' },
];
```

---

### 12. Focus Form

| Field | Required | Type | Component | Props |
|-------|----------|------|-----------|-------|
| `title` | ✅ YES | string | `Field.Text` | `label="Title" required` |
| `interface` | ✅ YES | JSON | *Custom* | See interface config below |
| `userId` | ✅ YES | string | `Field.Text` | `label="User ID" required disabled` |
| `description` | ❌ | string | `Field.Text` | `label="Description" multiline rows={3}` |
| `imageUrl` | ❌ | string | `Field.Text` | `label="Image URL" type="url"` |
| `metadata` | ❌ | JSON | `Field.Text` | `label="Metadata (JSON)" multiline rows={4}` |
| `atlasId` | ❌ | string | `Field.Autocomplete` | `label="Atlas" options={atlasList}` |
| `pathId` | ❌ | string | `Field.Autocomplete` | `label="Path" options={pathList}` |

**Interface config sub-fields:**
| Sub-Field | Type | Component | Props |
|-----------|------|-----------|-------|
| `interface.layout` | enum | `Field.Select` | `label="Layout" options={layoutOptions} required` |
| `interface.viewMode` | enum | `Field.Select` | `label="View Mode" options={viewModeOptions} required` |

```typescript
const layoutOptions = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
  { value: 'kanban', label: 'Kanban' },
  { value: 'timeline', label: 'Timeline' },
];

const viewModeOptions = [
  { value: 'compact', label: 'Compact' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'visual', label: 'Visual' },
];
```

---

### 13. Discovery Form

| Field | Required | Type | Component | Props |
|-------|----------|------|-----------|-------|
| `title` | ✅ YES | string | `Field.Text` | `label="Title" required` |
| `description` | ❌ | string | `Field.Text` | `label="Description" multiline rows={3}` |
| `content` | ❌ | string | `Field.Text` | `label="Content" multiline rows={6}` |
| `pathId` | ❌ | string | `Field.Autocomplete` | `label="Path" options={pathList}` |
| `focusId` | ❌ | string | `Field.Autocomplete` | `label="Focus" options={focusList}` |

---

## 🏗️ Implementation Phases

### Phase 1: Core Infrastructure

| Task | Description | Files |
|------|-------------|-------|
| 1.1 | Create Zod schemas for all entities | `src/sections/entities/schemas/` |
| 1.2 | Create shared form wrapper component | `src/sections/entities/components/` |
| 1.3 | Create entity test page layout | `src/sections/entities/view.tsx` |
| 1.4 | Add route and navigation | `src/app/dashboard/entities/page.tsx` |

### Phase 2: Primary Entity Forms (5 entities)
- `atlas-form.tsx` - 9 fields
- `path-form.tsx` - 12 fields
- `milestone-form.tsx` - 14 fields
- `horizon-form.tsx` - 12 fields
- `pathway-form.tsx` - 15 fields

### Phase 3: Content Entity Forms (5 entities)
- `story-form.tsx` - 5 fields + nested chapters
- `insight-form.tsx` - 7 fields
- `archetype-form.tsx` - 4 fields + 8 nested arrays
- `polarity-form.tsx` - 5 fields + 3 nested arrays
- `steps-form.tsx` - 7 fields

### Phase 4: System Entity Forms (3 entities)
- `basis-form.tsx` - 9 fields (complex JSON)
- `focus-form.tsx` - 8 fields (nested interface config)
- `discovery-form.tsx` - 5 fields (simplest)

### Phase 5: List & CRUD Operations
- Entity list with DataGrid
- Edit/delete functionality
- Detail views
- Success/error notifications

---

## 📁 File Structure

```
src/
├── app/dashboard/entities/
│   └── page.tsx
│
└── sections/entities/
    ├── view.tsx
    ├── schemas/
    │   ├── index.ts
    │   └── [13 schema files]
    │
    ├── forms/
    │   ├── index.ts
    │   └── [13 form files]
    │
    └── components/
        ├── entity-list.tsx
        ├── entity-tabs.tsx
        └── entity-form-wrapper.tsx
```

---

## 📊 Field Count Summary

| Entity | Essential | Optional | Nested Arrays | Total Fields |
|--------|-----------|----------|---------------|--------------|
| Atlas | 2 | 7 | 0 | 9 |
| Path | 2 | 10 | 0 | 12 |
| Milestone | 1 | 13 | 0 | 14 |
| Horizon | 1 | 11 | 0 | 12 |
| Pathway | 1 | 14 | 0 | 15 |
| Story | 1 | 4 | 1 (chapters) | 5+ |
| Insight | 2 | 5 | 0 | 7 |
| Archetype | 2 | 2 | 8 | 4+ |
| Polarity | 1 | 4 | 3 | 5+ |
| Steps | 2 | 5 | 0 | 7 |
| Basis | 4 | 5 | 0 | 9 |
| Focus | 3 | 5 | 0 | 8+ |
| Discovery | 1 | 4 | 0 | 5 |

---

## 🧪 Test Checklist

- [ ] Phase 1: Core infrastructure complete
- [ ] Phase 2: Primary entity forms (Atlas, Path, Milestone, Horizon, Pathway)
- [ ] Phase 3: Content entity forms (Story, Insight, Archetype, Polarity, Steps)
- [ ] Phase 4: System entity forms (Basis, Focus, Discovery)
- [ ] Phase 5: List views and CRUD operations
- [ ] All forms validate correctly
- [ ] All required fields show validation errors
- [ ] Autocomplete fields load options from API
- [ ] Nested arrays (chapters, traits, etc.) work correctly
- [ ] Create operations work
- [ ] Update operations work
- [ ] Delete operations work
- [ ] Error handling displays properly

