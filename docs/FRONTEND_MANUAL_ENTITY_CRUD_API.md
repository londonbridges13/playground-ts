# Frontend Entity CRUD Implementation Guide

## 🎯 Overview

This guide shows you how to connect your Next.js TypeScript frontend to the Entity CRUD API for managing all 13 entity types in the learning management system.

**Base URL:** Use `process.env.NEXT_PUBLIC_API_URL` for production or `http://localhost:3000` for local development.

**Supported Entities:**
- Atlas, Path, Milestone, Horizon, Pathway
- Story, Insight, Archetype, Polarity, Steps
- Basis, Focus, Discovery

---

## 📋 Available CRUD Endpoints

All entities follow the same RESTful pattern:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/entities/{entity}` | List all entities |
| GET | `/api/entities/{entity}/{id}` | Get single entity by ID |
| POST | `/api/entities/{entity}` | Create new entity |
| PUT | `/api/entities/{entity}/{id}` | Update existing entity |
| DELETE | `/api/entities/{entity}/{id}` | Delete entity |

**Example:** For Atlas entities, use `/api/entities/atlas`

---

## 🚀 Quick Start

### Step 1: Environment Setup

Create `.env.local` in your Next.js project:

```env
# For local development
NEXT_PUBLIC_API_URL=http://localhost:3000

# For production
NEXT_PUBLIC_API_URL=https://your-production-domain.com
```

### Step 2: Install Dependencies

```bash
npm install react-hook-form zod @hookform/resolvers
npm install @mui/material @emotion/react @emotion/styled
```

### Step 3: Create API Utility

Create `src/lib/api.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Generic CRUD API client
 */
export class EntityAPI {
  /**
   * List all entities of a given type
   */
  static async list<T>(entityType: string): Promise<ApiResponse<T[]>> {
    const response = await fetch(`${API_BASE_URL}/api/entities/${entityType}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Failed to fetch ${entityType}`);
    }

    return data;
  }

  /**
   * Get single entity by ID
   */
  static async get<T>(entityType: string, id: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}/api/entities/${entityType}/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Failed to fetch ${entityType}`);
    }

    return data;
  }

  /**
   * Create new entity
   */
  static async create<T>(entityType: string, payload: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}/api/entities/${entityType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Failed to create ${entityType}`);
    }

    return data;
  }

  /**
   * Update existing entity
   */
  static async update<T>(entityType: string, id: string, payload: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}/api/entities/${entityType}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Failed to update ${entityType}`);
    }

    return data;
  }

  /**
   * Delete entity
   */
  static async delete(entityType: string, id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/api/entities/${entityType}/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Failed to delete ${entityType}`);
    }

    return data;
  }
}
```

---

## 📝 Entity-Specific Examples

### Atlas Entity

#### Create Atlas

```typescript
import { EntityAPI } from '@/lib/api';

interface AtlasCreateInput {
  title: string;
  description?: string;
  initLog?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  isPrivate?: boolean;
  artificial?: boolean;
  userId: string;
  focusId?: string;
}

async function createAtlas(data: AtlasCreateInput) {
  try {
    const result = await EntityAPI.create('atlas', data);
    console.log('Atlas created:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error creating atlas:', error);
    throw error;
  }
}

// Usage
const newAtlas = await createAtlas({
  title: 'My Learning Journey',
  description: 'A comprehensive guide to web development',
  userId: 'user-id-here',
  isPrivate: false,
});
```

#### List All Atlases

```typescript
async function listAtlases() {
  try {
    const result = await EntityAPI.list('atlas');
    console.log('Atlases:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error fetching atlases:', error);
    throw error;
  }
}

// Usage
const atlases = await listAtlases();
```

#### Get Single Atlas

```typescript
async function getAtlas(id: string) {
  try {
    const result = await EntityAPI.get('atlas', id);
    console.log('Atlas:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error fetching atlas:', error);
    throw error;
  }
}

// Usage
const atlas = await getAtlas('atlas-id-here');
```

#### Update Atlas

```typescript
interface AtlasUpdateInput {
  id: string;
  title?: string;
  description?: string;
  isPrivate?: boolean;
  // ... other optional fields
}

async function updateAtlas(id: string, data: Partial<AtlasUpdateInput>) {
  try {
    const result = await EntityAPI.update('atlas', id, data);
    console.log('Atlas updated:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error updating atlas:', error);
    throw error;
  }
}

// Usage
const updatedAtlas = await updateAtlas('atlas-id-here', {
  title: 'Updated Title',
  isPrivate: true,
});
```

#### Delete Atlas

```typescript
async function deleteAtlas(id: string) {
  try {
    await EntityAPI.delete('atlas', id);
    console.log('Atlas deleted successfully');
  } catch (error) {
    console.error('Error deleting atlas:', error);
    throw error;
  }
}

// Usage
await deleteAtlas('atlas-id-here');
```

---

## 📖 Complete Entity Field Reference

This section documents all fields for each entity, clearly separating **essential (required)** fields from **optional** fields for both Create and Update operations.

### Legend
- ✅ **ESSENTIAL** - Must be provided for the request to succeed
- ❌ **Optional** - Can be omitted (will use default or null)
- 🔄 **Auto-generated** - System generates this value automatically

---

### 1. Atlas

**Create Request:**

```typescript
// ESSENTIAL FIELDS (required)
interface AtlasCreateEssential {
  title: string;           // Primary identifier
  userId: string;          // Owner of the atlas
}

// OPTIONAL FIELDS (can be omitted)
interface AtlasCreateOptional {
  description?: string;    // Default: null
  initLog?: string;        // Default: null
  imageUrl?: string;       // Default: null
  coverImageUrl?: string;  // Default: null
  isPrivate?: boolean;     // Default: false
  artificial?: boolean;    // Default: false (AI-generated flag)
  focusId?: string;        // Default: null
}

// Complete Create Input
interface AtlasCreateInput extends AtlasCreateEssential, AtlasCreateOptional {}
```

**Update Request:**

```typescript
// All fields are optional for updates
interface AtlasUpdateInput {
  title?: string;
  description?: string;
  initLog?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  isPrivate?: boolean;
  artificial?: boolean;
  focusId?: string;
}
```

**Auto-generated Fields:**
- `id` - Unique identifier (cuid)
- `slug` - URL-friendly identifier (generated from title)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
- `currentHead` - Version control head reference

---

### 2. Path

**Create Request:**

```typescript
// ESSENTIAL FIELDS (required)
interface PathCreateEssential {
  title: string;           // Primary identifier
  userId: string;          // Owner of the path
}

// OPTIONAL FIELDS (can be omitted)
interface PathCreateOptional {
  description?: string;    // Default: null
  initLog?: string;        // Default: null
  imageUrl?: string;       // Default: null
  active?: boolean;        // Default: true
  isPrivate?: boolean;     // Default: false
  isComplete?: boolean;    // Default: false
  isReproduced?: boolean;  // Default: false
  activeAtlasId?: string;  // Current active atlas
  initialAtlasId?: string; // Original atlas reference
  focusId?: string;        // Default: null
}

// Complete Create Input
interface PathCreateInput extends PathCreateEssential, PathCreateOptional {}
```

**Update Request:**

```typescript
interface PathUpdateInput {
  title?: string;
  description?: string;
  initLog?: string;
  imageUrl?: string;
  active?: boolean;
  isPrivate?: boolean;
  isComplete?: boolean;
  isReproduced?: boolean;
  activeAtlasId?: string;
  initialAtlasId?: string;
  focusId?: string;
}
```

**Auto-generated Fields:**
- `id`, `slug`, `createdAt`, `updatedAt`

---

### 3. Milestone

**Create Request:**

```typescript
// ESSENTIAL FIELDS (required)
interface MilestoneCreateEssential {
  title: string;           // Primary identifier
}

// OPTIONAL FIELDS (can be omitted)
interface MilestoneCreateOptional {
  description?: string;    // Default: null
  initLog?: string;        // Default: null
  imageUrl?: string;       // Default: null
  active?: boolean;        // Default: true
  isPrivate?: boolean;     // Default: false
  isComplete?: boolean;    // Default: false
  isEssential?: boolean;   // Default: false
  isAdjacent?: boolean;    // Default: false
  artificial?: boolean;    // Default: false
  horizonId?: string;      // Parent horizon
  atlasId?: string;        // Parent atlas
  pathId?: string;         // Parent path
  initialAtlasId?: string;
  initialHorizonId?: string;
  focusId?: string;
}

// Complete Create Input
interface MilestoneCreateInput extends MilestoneCreateEssential, MilestoneCreateOptional {}
```

**Update Request:**

```typescript
interface MilestoneUpdateInput {
  title?: string;
  description?: string;
  initLog?: string;
  imageUrl?: string;
  active?: boolean;
  isPrivate?: boolean;
  isComplete?: boolean;
  isEssential?: boolean;
  isAdjacent?: boolean;
  artificial?: boolean;
  horizonId?: string;
  atlasId?: string;
  pathId?: string;
  initialAtlasId?: string;
  initialHorizonId?: string;
  focusId?: string;
}
```

**Auto-generated Fields:**
- `id`, `slug`, `createdAt`, `updatedAt`

**Note:** Milestone does NOT require `userId` - ownership is inherited through parent relationships.

---

### 4. Horizon

**Create Request:**

```typescript
// ESSENTIAL FIELDS (required)
interface HorizonCreateEssential {
  title: string;           // Primary identifier
}

// OPTIONAL FIELDS (can be omitted)
interface HorizonCreateOptional {
  description?: string;    // Default: null
  initLog?: string;        // Default: null
  imageUrl?: string;       // Default: null
  active?: boolean;        // Default: true
  isPrivate?: boolean;     // Default: false
  artificial?: boolean;    // Default: false
  atlasId?: string;        // Parent atlas
  pathId?: string;         // Parent path
  initialAtlasId?: string;
  initialPathId?: string;
  focusId?: string;
}

// Complete Create Input
interface HorizonCreateInput extends HorizonCreateEssential, HorizonCreateOptional {}
```

**Update Request:**

```typescript
interface HorizonUpdateInput {
  title?: string;
  description?: string;
  initLog?: string;
  imageUrl?: string;
  active?: boolean;
  isPrivate?: boolean;
  artificial?: boolean;
  atlasId?: string;
  pathId?: string;
  initialAtlasId?: string;
  initialPathId?: string;
  focusId?: string;
}
```

**Auto-generated Fields:**
- `id`, `createdAt`, `updatedAt`

**Note:** Horizon does NOT require `userId` - ownership is inherited through parent relationships.

---

### 5. Pathway

**Create Request:**

```typescript
// ESSENTIAL FIELDS (required)
interface PathwayCreateEssential {
  title: string;           // Primary identifier
}

// OPTIONAL FIELDS (can be omitted)
interface PathwayCreateOptional {
  description?: string;    // Default: null
  initLog?: string;        // Default: null
  imageUrl?: string;       // Default: null
  active?: boolean;        // Default: true
  isPrivate?: boolean;     // Default: false
  isComplete?: boolean;    // Default: false
  artificial?: boolean;    // Default: false
  deadline?: Date;         // Target completion date
  timeEstimate?: number;   // Estimated hours
  pathId?: string;         // Parent path
  atlasId?: string;        // Parent atlas
  initialAtlasId?: string;
  initialMilestoneId?: string;
  initialHorizonId?: string;
  focusId?: string;
}

// Complete Create Input
interface PathwayCreateInput extends PathwayCreateEssential, PathwayCreateOptional {}
```

**Update Request:**

```typescript
interface PathwayUpdateInput {
  title?: string;
  description?: string;
  initLog?: string;
  imageUrl?: string;
  active?: boolean;
  isPrivate?: boolean;
  isComplete?: boolean;
  artificial?: boolean;
  deadline?: Date;
  timeEstimate?: number;
  pathId?: string;
  atlasId?: string;
  initialAtlasId?: string;
  initialMilestoneId?: string;
  initialHorizonId?: string;
  focusId?: string;
}
```

**Auto-generated Fields:**
- `id`, `slug`, `createdAt`, `updatedAt`

---

### 6. Story

**Create Request:**

```typescript
// ESSENTIAL FIELDS (required)
interface StoryCreateEssential {
  title: string;           // Primary identifier
}

// OPTIONAL FIELDS (can be omitted)
interface StoryCreateOptional {
  description?: string;    // Default: null
  userId?: string;         // Owner (optional)
  atlasId?: string;        // Parent atlas
  focusId?: string;
}

// Complete Create Input
interface StoryCreateInput extends StoryCreateEssential, StoryCreateOptional {}
```

**Update Request:**

```typescript
interface StoryUpdateInput {
  title?: string;
  description?: string;
  userId?: string;
  atlasId?: string;
  focusId?: string;
}
```

**Auto-generated Fields:**
- `id`, `createdAt`, `updatedAt`

**Nested Entities:** Stories can include `chapters`:
```typescript
interface ChapterInput {
  title: string;
  content?: string;
  order: number;
}
```

---

### 7. Insight

**Create Request:**

```typescript
// ESSENTIAL FIELDS (required)
interface InsightCreateEssential {
  title: string;           // Primary identifier
  atlasId: string;         // REQUIRED - Must belong to an Atlas
}

// OPTIONAL FIELDS (can be omitted)
interface InsightCreateOptional {
  description?: string;    // Default: null
  explanation?: string;    // Detailed explanation
  artificial?: boolean;    // Default: false
  userId?: string;         // Owner (optional)
  focusId?: string;
}

// Complete Create Input
interface InsightCreateInput extends InsightCreateEssential, InsightCreateOptional {}
```

**Update Request:**

```typescript
interface InsightUpdateInput {
  title?: string;
  description?: string;
  explanation?: string;
  artificial?: boolean;
  userId?: string;
  atlasId?: string;
  focusId?: string;
}
```

**Auto-generated Fields:**
- `id`, `createdAt`, `updatedAt`

---

### 8. Archetype

**⚠️ Note:** Archetype uses `name` instead of `title`.

**Create Request:**

```typescript
// ESSENTIAL FIELDS (required)
interface ArchetypeCreateEssential {
  name: string;            // Primary identifier (NOT 'title')
  atlasId: string;         // REQUIRED - Must belong to an Atlas
}

// OPTIONAL FIELDS (can be omitted)
interface ArchetypeCreateOptional {
  description?: string;    // Default: null
  focusId?: string;
}

// Complete Create Input
interface ArchetypeCreateInput extends ArchetypeCreateEssential, ArchetypeCreateOptional {}
```

**Update Request:**

```typescript
interface ArchetypeUpdateInput {
  name?: string;
  description?: string;
  atlasId?: string;
  focusId?: string;
}
```

**Nested Arrays (all optional):**
```typescript
interface ArchetypeWithDetails extends ArchetypeCreateInput {
  notions?: Array<{ title: string; description?: string; user?: string }>;
  traits?: Array<{ title: string; description?: string }>;
  values?: Array<{ title: string; description?: string }>;
  motivations?: Array<{ title: string; description?: string }>;
  logs?: Array<{ title: string; description?: string }>;
  categories?: Array<{ title: string; description?: string }>;
  strengths?: Array<{ title: string; description?: string }>;
  flaws?: Array<{ title: string; description?: string }>;
}
```

**Auto-generated Fields:**
- `id`, `createdAt`, `updatedAt`

---

### 9. Polarity

**Create Request:**

```typescript
// ESSENTIAL FIELDS (required)
interface PolarityCreateEssential {
  title: string;           // Primary identifier
}

// OPTIONAL FIELDS (can be omitted)
interface PolarityCreateOptional {
  description?: string;    // Default: null
  userId?: string;         // Owner (optional)
  atlasId?: string;        // Parent atlas
  focusId?: string;
}

// Complete Create Input
interface PolarityCreateInput extends PolarityCreateEssential, PolarityCreateOptional {}
```

**Update Request:**

```typescript
interface PolarityUpdateInput {
  title?: string;
  description?: string;
  userId?: string;
  atlasId?: string;
  focusId?: string;
}
```

**Nested Arrays (all optional):**
```typescript
interface PolarityWithDetails extends PolarityCreateInput {
  powerLaws?: Array<{ title: string; description?: string }>;
  keyConsiderations?: Array<{ title: string; description?: string }>;
  questionsToExplore?: Array<{ question: string }>;
}
```

**Auto-generated Fields:**
- `id`, `createdAt`, `updatedAt`

---

### 10. Steps

**Create Request:**

```typescript
// ESSENTIAL FIELDS (required)
interface StepsCreateEssential {
  title: string;           // Primary identifier
  order: number;           // Position in sequence (REQUIRED)
}

// OPTIONAL FIELDS (can be omitted)
interface StepsCreateOptional {
  description?: string;    // Default: null
  isComplete?: boolean;    // Default: false
  pathwayId?: string;      // Parent pathway
  milestoneId?: string;    // Parent milestone
  focusId?: string;
}

// Complete Create Input
interface StepsCreateInput extends StepsCreateEssential, StepsCreateOptional {}
```

**Update Request:**

```typescript
interface StepsUpdateInput {
  title?: string;
  description?: string;
  order?: number;
  isComplete?: boolean;
  pathwayId?: string;
  milestoneId?: string;
  focusId?: string;
}
```

**Auto-generated Fields:**
- `id`, `createdAt`, `updatedAt`

**Note:** Steps can belong to BOTH Pathway AND Milestone simultaneously.

---

### 11. Basis

**Create Request:**

```typescript
// ESSENTIAL FIELDS (required)
interface BasisCreateEssential {
  title: string;           // Primary identifier
  entityType: EntityType;  // Type of entity stored (see valid values below)
  metadata: object;        // The actual entity data structure (JSON)
  userId: string;          // Owner of the basis
}

// Valid entityType values
type EntityType =
  | 'milestone' | 'horizon' | 'pathway' | 'atlas'
  | 'story' | 'insight' | 'step' | 'polarity'
  | 'path' | 'steps' | 'archetype' | 'focus'
  | 'discovery' | 'conversation' | 'custom';

// OPTIONAL FIELDS (can be omitted)
interface BasisCreateOptional {
  description?: string;    // Default: null
  imageUrl?: string;       // Default: null
  sourceEntityId?: string; // Reference to source entity
  atlasId?: string;        // Parent atlas
  pathId?: string;         // Parent path
}

// Complete Create Input
interface BasisCreateInput extends BasisCreateEssential, BasisCreateOptional {}
```

**Update Request:**

```typescript
interface BasisUpdateInput {
  title?: string;
  description?: string;
  imageUrl?: string;
  entityType?: EntityType;
  metadata?: object;
  sourceEntityId?: string;
  atlasId?: string;
  pathId?: string;
}
```

**Auto-generated Fields:**
- `id`, `createdAt`, `updatedAt`

---

### 12. Focus

**Create Request:**

```typescript
// ESSENTIAL FIELDS (required)
interface FocusCreateEssential {
  title: string;           // Primary identifier
  interface: InterfaceConfig; // UI/layout configuration (REQUIRED)
  userId: string;          // Owner of the focus
}

// Interface configuration structure
interface InterfaceConfig {
  layout: 'grid' | 'list' | 'kanban' | 'timeline';
  viewMode: 'compact' | 'detailed' | 'visual';
  columns?: Array<{ id: string; title: string; order: number }>;
  settings?: Record<string, any>;
}

// OPTIONAL FIELDS (can be omitted)
interface FocusCreateOptional {
  description?: string;    // Default: null
  imageUrl?: string;       // Default: null
  metadata?: object;       // Theme, dates, priorities (JSON)
  atlasId?: string;        // Parent atlas
  pathId?: string;         // Parent path
}

// Complete Create Input
interface FocusCreateInput extends FocusCreateEssential, FocusCreateOptional {}
```

**Update Request:**

```typescript
interface FocusUpdateInput {
  title?: string;
  description?: string;
  imageUrl?: string;
  metadata?: object;
  interface?: InterfaceConfig;
  atlasId?: string;
  pathId?: string;
}
```

**Auto-generated Fields:**
- `id`, `createdAt`, `updatedAt`

---

### 13. Discovery

**Create Request:**

```typescript
// ESSENTIAL FIELDS (required)
interface DiscoveryCreateEssential {
  title: string;           // Primary identifier
}

// OPTIONAL FIELDS (can be omitted)
interface DiscoveryCreateOptional {
  description?: string;    // Default: null
  content?: string;        // Main content
  pathId?: string;         // Parent path
  focusId?: string;
}

// Complete Create Input
interface DiscoveryCreateInput extends DiscoveryCreateEssential, DiscoveryCreateOptional {}
```

**Update Request:**

```typescript
interface DiscoveryUpdateInput {
  title?: string;
  description?: string;
  content?: string;
  pathId?: string;
  focusId?: string;
}
```

**Auto-generated Fields:**
- `id`, `createdAt`, `updatedAt`

---

## 📊 Quick Reference Summary

### Essential Fields by Entity

| Entity | Essential Fields | Notes |
|--------|-----------------|-------|
| **Atlas** | `title`, `userId` | Slug auto-generated |
| **Path** | `title`, `userId` | Slug auto-generated |
| **Milestone** | `title` | No userId required |
| **Horizon** | `title` | No userId required |
| **Pathway** | `title` | Slug auto-generated |
| **Story** | `title` | userId optional |
| **Insight** | `title`, `atlasId` | Must belong to Atlas |
| **Archetype** | `name`, `atlasId` | Uses `name` not `title` |
| **Polarity** | `title` | userId optional |
| **Steps** | `title`, `order` | Order is required |
| **Basis** | `title`, `entityType`, `metadata`, `userId` | Complex entity |
| **Focus** | `title`, `interface`, `userId` | Interface config required |
| **Discovery** | `title` | Simplest entity |

### Common Optional Fields

Most entities share these optional fields:
- `description` - Text description
- `imageUrl` - Image URL
- `focusId` - Link to Focus entity

### Entities with Slug Auto-generation
- Atlas, Path, Milestone, Pathway

### Entities Requiring Parent Relationships
- **Insight** → requires `atlasId`
- **Archetype** → requires `atlasId`

---

### Path Entity

#### Create Path

```typescript
interface PathCreateInput {
  title: string;
  description?: string;
  initLog?: string;
  imageUrl?: string;
  active?: boolean;
  isPrivate?: boolean;
  isComplete?: boolean;
  isReproduced?: boolean;
  userId: string;
  activeAtlasId?: string;
  initialAtlasId?: string;
  focusId?: string;
}

async function createPath(data: PathCreateInput) {
  try {
    const result = await EntityAPI.create('path', data);
    console.log('Path created:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error creating path:', error);
    throw error;
  }
}

// Usage
const newPath = await createPath({
  title: 'JavaScript Fundamentals',
  description: 'Learn the basics of JavaScript',
  userId: 'user-id-here',
  active: true,
  isPrivate: false,
});
```

---

### Milestone Entity

#### Create Milestone

```typescript
interface MilestoneCreateInput {
  title: string;
  description?: string;
  initLog?: string;
  imageUrl?: string;
  isComplete?: boolean;
  userId: string;
  pathId?: string;
  atlasId?: string;
}

async function createMilestone(data: MilestoneCreateInput) {
  try {
    const result = await EntityAPI.create('milestone', data);
    console.log('Milestone created:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error creating milestone:', error);
    throw error;
  }
}

// Usage
const newMilestone = await createMilestone({
  title: 'Complete React Tutorial',
  description: 'Finish all React basics',
  userId: 'user-id-here',
  pathId: 'path-id-here',
  isComplete: false,
});
```

---

## 🔧 React Hook Form Integration

### Complete Form Component Example

Create `src/components/forms/AtlasForm.tsx`:

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EntityAPI } from '@/lib/api';
import { useState } from 'react';

// Zod schema for validation
const atlasSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  isPrivate: z.boolean().default(false),
  userId: z.string().min(1, 'User ID is required'),
});

type AtlasFormData = z.infer<typeof atlasSchema>;

interface AtlasFormProps {
  userId: string;
  onSuccess?: (atlas: any) => void;
  onError?: (error: Error) => void;
}

export default function AtlasForm({ userId, onSuccess, onError }: AtlasFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AtlasFormData>({
    resolver: zodResolver(atlasSchema),
    defaultValues: {
      userId,
      isPrivate: false,
    },
  });

  const onSubmit = async (data: AtlasFormData) => {
    setLoading(true);
    try {
      const result = await EntityAPI.create('atlas', data);
      reset();
      onSuccess?.(result.data);
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          {...register('title')}
          placeholder="Enter atlas title"
        />
        {errors.title && <span>{errors.title.message}</span>}
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          {...register('description')}
          placeholder="Enter description"
          rows={4}
        />
        {errors.description && <span>{errors.description.message}</span>}
      </div>

      <div>
        <label htmlFor="imageUrl">Image URL</label>
        <input
          id="imageUrl"
          type="url"
          {...register('imageUrl')}
          placeholder="https://example.com/image.jpg"
        />
        {errors.imageUrl && <span>{errors.imageUrl.message}</span>}
      </div>

      <div>
        <label>
          <input type="checkbox" {...register('isPrivate')} />
          Private Atlas
        </label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Atlas'}
      </button>
    </form>
  );
}
```

### Usage in Page Component

```typescript
'use client';

import AtlasForm from '@/components/forms/AtlasForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function CreateAtlasPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return <div>Please log in to create an atlas</div>;
  }

  return (
    <div>
      <h1>Create New Atlas</h1>
      <AtlasForm
        userId={user.id}
        onSuccess={(atlas) => {
          console.log('Atlas created:', atlas);
          router.push(`/atlas/${atlas.id}`);
        }}
        onError={(error) => {
          console.error('Error:', error);
          alert(error.message);
        }}
      />
    </div>
  );
}
```

---

## 📊 List View with Data Fetching

### Atlas List Component

Create `src/components/lists/AtlasList.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { EntityAPI } from '@/lib/api';

interface Atlas {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  isPrivate: boolean;
  createdAt: string;
}

export default function AtlasList() {
  const [atlases, setAtlases] = useState<Atlas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAtlases();
  }, []);

  const loadAtlases = async () => {
    try {
      setLoading(true);
      const result = await EntityAPI.list<Atlas>('atlas');
      setAtlases(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load atlases');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this atlas?')) return;

    try {
      await EntityAPI.delete('atlas', id);
      setAtlases(atlases.filter(a => a.id !== id));
    } catch (err) {
      alert('Failed to delete atlas');
    }
  };

  if (loading) return <div>Loading atlases...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>My Atlases</h2>
      {atlases.length === 0 ? (
        <p>No atlases found. Create your first one!</p>
      ) : (
        <ul>
          {atlases.map((atlas) => (
            <li key={atlas.id}>
              <h3>{atlas.title}</h3>
              {atlas.description && <p>{atlas.description}</p>}
              {atlas.imageUrl && <img src={atlas.imageUrl} alt={atlas.title} />}
              <span>{atlas.isPrivate ? '🔒 Private' : '🌍 Public'}</span>
              <button onClick={() => handleDelete(atlas.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 🔄 Update/Edit Form Component

### Edit Atlas Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EntityAPI } from '@/lib/api';

const atlasUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isPrivate: z.boolean().optional(),
});

type AtlasUpdateData = z.infer<typeof atlasUpdateSchema>;

interface EditAtlasFormProps {
  atlasId: string;
  onSuccess?: () => void;
}

export default function EditAtlasForm({ atlasId, onSuccess }: EditAtlasFormProps) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AtlasUpdateData>({
    resolver: zodResolver(atlasUpdateSchema),
  });

  useEffect(() => {
    loadAtlas();
  }, [atlasId]);

  const loadAtlas = async () => {
    try {
      const result = await EntityAPI.get('atlas', atlasId);
      reset(result.data);
    } catch (error) {
      console.error('Failed to load atlas:', error);
    }
  };

  const onSubmit = async (data: AtlasUpdateData) => {
    setLoading(true);
    try {
      await EntityAPI.update('atlas', atlasId, data);
      onSuccess?.();
    } catch (error) {
      alert('Failed to update atlas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Title</label>
        <input type="text" {...register('title')} />
        {errors.title && <span>{errors.title.message}</span>}
      </div>

      <div>
        <label>Description</label>
        <textarea {...register('description')} rows={4} />
      </div>

      <div>
        <label>Image URL</label>
        <input type="url" {...register('imageUrl')} />
        {errors.imageUrl && <span>{errors.imageUrl.message}</span>}
      </div>

      <div>
        <label>
          <input type="checkbox" {...register('isPrivate')} />
          Private
        </label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Atlas'}
      </button>
    </form>
  );
}
```

---

## 📚 All Entity Types Reference

### Entity Type Mapping (Corrected)

| Entity Type | Endpoint | Primary Field | Essential Fields |
|-------------|----------|---------------|------------------|
| **Atlas** | `/api/entities/atlas` | `title` | `title`, `userId` |
| **Path** | `/api/entities/path` | `title` | `title`, `userId` |
| **Milestone** | `/api/entities/milestone` | `title` | `title` only |
| **Horizon** | `/api/entities/horizon` | `title` | `title` only |
| **Pathway** | `/api/entities/pathway` | `title` | `title` only |
| **Story** | `/api/entities/story` | `title` | `title` only |
| **Insight** | `/api/entities/insight` | `title` | `title`, `atlasId` |
| **Archetype** | `/api/entities/archetype` | `name` | `name`, `atlasId` |
| **Polarity** | `/api/entities/polarity` | `title` | `title` only |
| **Steps** | `/api/entities/steps` | `title` | `title`, `order` |
| **Basis** | `/api/entities/basis` | `title` | `title`, `entityType`, `metadata`, `userId` |
| **Focus** | `/api/entities/focus` | `title` | `title`, `interface`, `userId` |
| **Discovery** | `/api/entities/discovery` | `title` | `title` only |

### Correct Create Examples for All Entities

```typescript
// ============================================
// ENTITIES REQUIRING userId
// ============================================

// Atlas - requires title + userId
await EntityAPI.create('atlas', {
  title: 'My Learning Journey',           // ESSENTIAL
  userId: 'user-id',                       // ESSENTIAL
  description: 'Optional description',    // optional
});

// Path - requires title + userId
await EntityAPI.create('path', {
  title: 'JavaScript Fundamentals',        // ESSENTIAL
  userId: 'user-id',                       // ESSENTIAL
  description: 'Optional description',    // optional
});

// Basis - requires title + entityType + metadata + userId
await EntityAPI.create('basis', {
  title: 'Saved Milestone Template',       // ESSENTIAL
  entityType: 'milestone',                 // ESSENTIAL
  metadata: { title: 'Template Data' },    // ESSENTIAL
  userId: 'user-id',                       // ESSENTIAL
  description: 'Optional description',    // optional
});

// Focus - requires title + interface + userId
await EntityAPI.create('focus', {
  title: 'Q1 Learning Goals',              // ESSENTIAL
  interface: {                             // ESSENTIAL
    layout: 'kanban',
    viewMode: 'detailed',
  },
  userId: 'user-id',                       // ESSENTIAL
  description: 'Optional description',    // optional
});

// ============================================
// ENTITIES REQUIRING atlasId
// ============================================

// Insight - requires title + atlasId
await EntityAPI.create('insight', {
  title: 'Key Realization',                // ESSENTIAL
  atlasId: 'atlas-id',                     // ESSENTIAL
  description: 'Optional description',    // optional
  explanation: 'Optional explanation',    // optional
});

// Archetype - requires name + atlasId (uses 'name' not 'title')
await EntityAPI.create('archetype', {
  name: 'The Explorer',                    // ESSENTIAL (not 'title')
  atlasId: 'atlas-id',                     // ESSENTIAL
  description: 'Optional description',    // optional
});

// ============================================
// ENTITIES WITH MINIMAL REQUIREMENTS
// ============================================

// Horizon - requires only title
await EntityAPI.create('horizon', {
  title: 'Long-term Vision',               // ESSENTIAL
  description: 'Optional description',    // optional
  atlasId: 'atlas-id',                    // optional - parent relationship
});

// Pathway - requires only title
await EntityAPI.create('pathway', {
  title: 'Frontend Development Path',      // ESSENTIAL
  description: 'Optional description',    // optional
  atlasId: 'atlas-id',                    // optional - parent relationship
});

// Milestone - requires only title
await EntityAPI.create('milestone', {
  title: 'Complete React Tutorial',        // ESSENTIAL
  description: 'Optional description',    // optional
  horizonId: 'horizon-id',                // optional - parent relationship
});

// Story - requires only title
await EntityAPI.create('story', {
  title: 'My Learning Journey',            // ESSENTIAL
  description: 'Optional description',    // optional
  atlasId: 'atlas-id',                    // optional - parent relationship
});

// Polarity - requires only title
await EntityAPI.create('polarity', {
  title: 'Theory vs Practice',             // ESSENTIAL
  description: 'Optional description',    // optional
  atlasId: 'atlas-id',                    // optional - parent relationship
});

// Steps - requires title + order
await EntityAPI.create('steps', {
  title: 'Install Dependencies',           // ESSENTIAL
  order: 1,                                // ESSENTIAL
  description: 'Optional description',    // optional
  pathwayId: 'pathway-id',                // optional - parent relationship
});

// Discovery - requires only title
await EntityAPI.create('discovery', {
  title: 'New Framework Discovery',        // ESSENTIAL
  description: 'Optional description',    // optional
  content: 'Optional content',            // optional
  pathId: 'path-id',                      // optional - parent relationship
});
```

---

## 🧪 Testing Your Implementation

### Test API Connection

Create `src/lib/test-api.ts`:

```typescript
import { EntityAPI } from './api';

export async function testAPIConnection() {
  console.log('🧪 Testing API Connection...');

  try {
    // Test listing users
    console.log('Testing GET /api/entities/user...');
    const users = await EntityAPI.list('user');
    console.log('✅ Users fetched:', users.data?.length || 0);

    // Test listing atlases
    console.log('Testing GET /api/entities/atlas...');
    const atlases = await EntityAPI.list('atlas');
    console.log('✅ Atlases fetched:', atlases.data?.length || 0);

    console.log('✅ All tests passed!');
    return true;
  } catch (error) {
    console.error('❌ API test failed:', error);
    return false;
  }
}

// Usage in a component or page
// import { testAPIConnection } from '@/lib/test-api';
// await testAPIConnection();
```

### Manual Testing with cURL

```bash
# List all atlases
curl http://localhost:3000/api/entities/atlas

# Get single atlas
curl http://localhost:3000/api/entities/atlas/atlas-id-here

# Create atlas
curl -X POST http://localhost:3000/api/entities/atlas \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Atlas",
    "description": "Testing API",
    "userId": "user-id-here"
  }'

# Update atlas
curl -X PUT http://localhost:3000/api/entities/atlas/atlas-id-here \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title"
  }'

# Delete atlas
curl -X DELETE http://localhost:3000/api/entities/atlas/atlas-id-here
```

---

## 📱 Response Formats

### Success Responses

**List Entities (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "title": "My Atlas",
      "description": "Learning journey",
      "userId": "user-id",
      "createdAt": "2025-11-23T10:00:00.000Z",
      "updatedAt": "2025-11-23T10:00:00.000Z"
    }
  ]
}
```

**Get Single Entity (200):**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "title": "My Atlas",
    "description": "Learning journey",
    "userId": "user-id",
    "createdAt": "2025-11-23T10:00:00.000Z",
    "updatedAt": "2025-11-23T10:00:00.000Z"
  }
}
```

**Create Entity (201):**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "title": "New Atlas",
    "description": "Just created",
    "userId": "user-id",
    "createdAt": "2025-11-23T10:00:00.000Z",
    "updatedAt": "2025-11-23T10:00:00.000Z"
  }
}
```

**Update Entity (200):**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "title": "Updated Atlas",
    "description": "Modified description",
    "userId": "user-id",
    "createdAt": "2025-11-23T10:00:00.000Z",
    "updatedAt": "2025-11-23T11:00:00.000Z"
  }
}
```

**Delete Entity (200):**
```json
{
  "success": true,
  "message": "Entity deleted successfully"
}
```

### Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "title": ["Title is required"],
    "userId": ["User ID is required"]
  }
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": "Entity not found"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 🎨 Material-UI Integration

### Styled Form Component

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TextField,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
} from '@mui/material';
import { EntityAPI } from '@/lib/api';
import { useState } from 'react';

const atlasSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  isPrivate: z.boolean().default(false),
  userId: z.string().min(1, 'User ID is required'),
});

type AtlasFormData = z.infer<typeof atlasSchema>;

export default function AtlasFormMUI({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AtlasFormData>({
    resolver: zodResolver(atlasSchema),
    defaultValues: { userId, isPrivate: false },
  });

  const onSubmit = async (data: AtlasFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await EntityAPI.create('atlas', data);
      setSuccess(true);
      reset();
      console.log('Atlas created:', result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create atlas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>
        Create New Atlas
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Atlas created successfully!</Alert>}

      <TextField
        fullWidth
        label="Title"
        {...register('title')}
        error={!!errors.title}
        helperText={errors.title?.message}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="Description"
        {...register('description')}
        error={!!errors.description}
        helperText={errors.description?.message}
        margin="normal"
        multiline
        rows={4}
      />

      <TextField
        fullWidth
        label="Image URL"
        {...register('imageUrl')}
        error={!!errors.imageUrl}
        helperText={errors.imageUrl?.message}
        margin="normal"
        placeholder="https://example.com/image.jpg"
      />

      <FormControlLabel
        control={<Checkbox {...register('isPrivate')} />}
        label="Private Atlas"
      />

      <Box sx={{ mt: 2 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          fullWidth
        >
          {loading ? 'Creating...' : 'Create Atlas'}
        </Button>
      </Box>
    </Box>
  );
}
```

---

## 🚀 Advanced Features

### Custom Hooks for Entity Management

Create `src/hooks/useEntity.ts`:

```typescript
import { useState, useEffect } from 'react';
import { EntityAPI } from '@/lib/api';

export function useEntity<T>(entityType: string, id: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadEntity();
  }, [entityType, id]);

  const loadEntity = async () => {
    try {
      setLoading(true);
      const result = await EntityAPI.get<T>(entityType, id);
      setData(result.data || null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => loadEntity();

  return { data, loading, error, refresh };
}

export function useEntityList<T>(entityType: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadEntities();
  }, [entityType]);

  const loadEntities = async () => {
    try {
      setLoading(true);
      const result = await EntityAPI.list<T>(entityType);
      setData(result.data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => loadEntities();

  return { data, loading, error, refresh };
}

// Usage example
function AtlasDetail({ id }: { id: string }) {
  const { data: atlas, loading, error, refresh } = useEntity('atlas', id);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!atlas) return <div>Atlas not found</div>;

  return (
    <div>
      <h1>{atlas.title}</h1>
      <p>{atlas.description}</p>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

### Optimistic Updates

```typescript
import { useState } from 'react';
import { EntityAPI } from '@/lib/api';

function useOptimisticUpdate<T>(entityType: string) {
  const [items, setItems] = useState<T[]>([]);

  const updateItem = async (id: string, updates: Partial<T>) => {
    // Optimistically update UI
    setItems(prev =>
      prev.map(item =>
        (item as any).id === id ? { ...item, ...updates } : item
      )
    );

    try {
      // Send update to server
      await EntityAPI.update(entityType, id, updates);
    } catch (error) {
      // Revert on error
      console.error('Update failed, reverting:', error);
      // Reload from server
      const result = await EntityAPI.list<T>(entityType);
      setItems(result.data || []);
    }
  };

  const deleteItem = async (id: string) => {
    // Optimistically remove from UI
    const backup = items;
    setItems(prev => prev.filter(item => (item as any).id !== id));

    try {
      await EntityAPI.delete(entityType, id);
    } catch (error) {
      // Revert on error
      console.error('Delete failed, reverting:', error);
      setItems(backup);
    }
  };

  return { items, setItems, updateItem, deleteItem };
}
```

### Pagination Support

```typescript
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export class EntityAPIWithPagination extends EntityAPI {
  static async listPaginated<T>(
    entityType: string,
    params: PaginationParams = {}
  ) {
    const { page = 1, limit = 10, sortBy, order } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(sortBy && { sortBy }),
      ...(order && { order }),
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/entities/${entityType}?${queryParams}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Failed to fetch ${entityType}`);
    }

    return data;
  }
}

// Usage
const result = await EntityAPIWithPagination.listPaginated('atlas', {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  order: 'desc',
});
```

### Search and Filter

```typescript
export class EntityAPIWithSearch extends EntityAPI {
  static async search<T>(
    entityType: string,
    searchTerm: string,
    filters?: Record<string, any>
  ) {
    const queryParams = new URLSearchParams({
      q: searchTerm,
      ...filters,
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/entities/${entityType}/search?${queryParams}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Search failed');
    }

    return data;
  }
}

// Usage
const results = await EntityAPIWithSearch.search('atlas', 'javascript', {
  isPrivate: false,
  userId: 'user-id',
});
```

---

## 🛠️ Troubleshooting

### Issue: "Failed to fetch" or CORS errors

**Solution:** Make sure your API URL is correct and the server is running.

```typescript
// Check environment variable
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

// Test connection
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/entities/user`)
  .then(r => r.json())
  .then(data => console.log('API Response:', data))
  .catch(err => console.error('API Error:', err));
```

### Issue: "User ID is required" validation error

**Solution:** Make sure you're passing the authenticated user's ID to the form.

```typescript
import { useAuth } from '@/contexts/AuthContext';

function CreateEntityPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in first</div>;
  }

  return <AtlasForm userId={user.id} />;
}
```

### Issue: Success message shows "undefined"

**Solution:** Access the correct property path in the API response.

```typescript
// ❌ Wrong
const result = await response.json();
console.log(result.title); // undefined

// ✅ Correct
const result = await response.json();
console.log(result.data.title); // "My Atlas"
```

### Issue: Form validation not working

**Solution:** Make sure Zod schema matches your requirements.

```typescript
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1, 'Title is required'), // ✅ Required
  description: z.string().optional(), // ✅ Optional
  imageUrl: z.string().url().optional().or(z.literal('')), // ✅ Optional URL or empty
});
```

### Issue: TypeScript errors with form data

**Solution:** Use proper type inference from Zod schema.

```typescript
import { z } from 'zod';

const schema = z.object({
  title: z.string(),
  userId: z.string(),
});

// ✅ Infer type from schema
type FormData = z.infer<typeof schema>;

// Use in form
const { register, handleSubmit } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

---

## 💡 Best Practices

### 1. Always Validate User Input

```typescript
// Use Zod schemas for validation
const schema = z.object({
  title: z.string().min(1).max(255),
  email: z.string().email(),
  url: z.string().url().optional().or(z.literal('')),
});
```

### 2. Handle Loading States

```typescript
function CreateButton() {
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await EntityAPI.create('atlas', data);
    } finally {
      setLoading(false); // Always reset loading state
    }
  };

  return (
    <button disabled={loading}>
      {loading ? 'Creating...' : 'Create'}
    </button>
  );
}
```

### 3. Show User-Friendly Error Messages

```typescript
try {
  await EntityAPI.create('atlas', data);
} catch (error) {
  const message = error instanceof Error
    ? error.message
    : 'Something went wrong';

  // Show to user
  alert(message);
  // Or use a toast notification library
}
```

### 4. Use Environment Variables

```typescript
// ✅ Good - Uses environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ❌ Bad - Hardcoded URL
const API_URL = 'http://localhost:3000';
```

### 5. Clean Up Form After Success

```typescript
const onSubmit = async (data: FormData) => {
  try {
    await EntityAPI.create('atlas', data);
    reset(); // ✅ Clear form
    router.push('/atlases'); // ✅ Redirect
  } catch (error) {
    // Handle error
  }
};
```

### 6. Implement Proper Error Boundaries

```typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }

    return this.props.children;
  }
}
```

### 7. Use TypeScript for Type Safety

```typescript
// Define interfaces for your entities
interface Atlas {
  id: string;
  title: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Use in API calls
const result = await EntityAPI.get<Atlas>('atlas', id);
const atlas: Atlas = result.data; // ✅ Type-safe
```

---

## 🎯 Quick Implementation Checklist

- [ ] Set up `NEXT_PUBLIC_API_URL` in `.env.local`
- [ ] Install required dependencies (react-hook-form, zod, @hookform/resolvers)
- [ ] Create `src/lib/api.ts` with EntityAPI class
- [ ] Create Zod schemas for validation
- [ ] Create form components with React Hook Form
- [ ] Implement list views with data fetching
- [ ] Add loading and error states
- [ ] Test all CRUD operations
- [ ] Implement proper error handling
- [ ] Add TypeScript types for entities
- [ ] Test with real user authentication
- [ ] Deploy and test in production

---

## 🔗 Related Documentation

- [Frontend Authentication Guide](./FRONTEND_AUTH_IMPLEMENTATION_GUIDE.md)
- [Authentication API Documentation](./AUTHENTICATION_API.md)
- [Prisma Schema Reference](../prisma/schema.prisma)
- [CRUD Interface Documentation](./CRUD_INTERFACE.md)

---

## 📞 Need Help?

### Test Interfaces

- **CRUD Test Interface:** `http://localhost:3000/crud-interface`
- **Auth Test Interface:** `http://localhost:3000/auth-test.html`

### Common Issues

1. **API not responding:** Check if Express server is running on port 3001
2. **CORS errors:** Make sure you're using the Next.js proxy (`/api/entities/*`)
3. **Validation errors:** Check Zod schemas match your data structure
4. **TypeScript errors:** Ensure types are properly inferred from Zod schemas

---

**Happy Coding! 🚀**

