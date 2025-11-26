# Entity CRUD API Implementation Guide

## 🎯 Overview

This guide documents how to connect the frontend to the backend Entity CRUD API using `NEXT_PUBLIC_API_URL`.

**Backend URL:** `process.env.NEXT_PUBLIC_API_URL` (default: `http://localhost:3000`)

**Supported Entities:**
- **Primary:** Atlas, Path, Milestone, Horizon, Pathway
- **Content:** Story, Insight, Archetype, Polarity, Steps
- **System:** Basis, Focus, Discovery

---

## 📁 File Structure

```
src/
├── lib/
│   ├── axios.ts              # Axios instance + entity endpoints
│   └── api/
│       └── entities.ts       # Entity CRUD API client
├── types/
│   └── entities.ts           # Entity type definitions
└── hooks/
    └── use-entity.ts         # React hooks for entities
```

---

## 🔧 Configuration

### Environment Variables

```bash
# .env or .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Axios Configuration

The axios instance in `src/lib/axios.ts` is already configured with:
- Base URL from `CONFIG.serverUrl` (reads `NEXT_PUBLIC_API_URL`)
- JWT token interceptor (adds `Authorization: Bearer ${token}`)
- Error handling interceptor

---

## 📋 API Endpoints

All entities follow the same RESTful pattern:

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List All | GET | `/api/entities/{entity}` |
| Get One | GET | `/api/entities/{entity}/{id}` |
| Create | POST | `/api/entities/{entity}` |
| Update | PUT | `/api/entities/{entity}/{id}` |
| Delete | DELETE | `/api/entities/{entity}/{id}` |

### Entity Endpoints Reference

| Entity | Endpoint | Essential Fields |
|--------|----------|------------------|
| Atlas | `/api/entities/atlas` | `title`, `userId` |
| Path | `/api/entities/path` | `title`, `userId` |
| Milestone | `/api/entities/milestone` | `title` |
| Horizon | `/api/entities/horizon` | `title` |
| Pathway | `/api/entities/pathway` | `title` |
| Story | `/api/entities/story` | `title` |
| Insight | `/api/entities/insight` | `title`, `atlasId` |
| Archetype | `/api/entities/archetype` | `name`, `atlasId` |
| Polarity | `/api/entities/polarity` | `title` |
| Steps | `/api/entities/steps` | `title`, `order` |
| Basis | `/api/entities/basis` | `title`, `entityType`, `metadata`, `userId` |
| Focus | `/api/entities/focus` | `title`, `interface`, `userId` |
| Discovery | `/api/entities/discovery` | `title` |

---

## 🚀 Usage Examples

### Import the API Client

```typescript
import { entityAPI } from 'src/lib/api/entities';
```

### List Entities

```typescript
// List all atlases
const atlases = await entityAPI.list<Atlas>('atlas');

// List all paths
const paths = await entityAPI.list<Path>('path');
```

### Get Single Entity

```typescript
// Get atlas by ID
const atlas = await entityAPI.get<Atlas>('atlas', 'atlas-id-here');
```

### Create Entity

```typescript
// Create atlas (requires title + userId)
const newAtlas = await entityAPI.create<Atlas>('atlas', {
  title: 'My Learning Journey',
  userId: 'user-id-here',
  description: 'Optional description',
});

// Create milestone (requires only title)
const newMilestone = await entityAPI.create<Milestone>('milestone', {
  title: 'Complete React Tutorial',
  horizonId: 'horizon-id', // optional parent
});

// Create steps (requires title + order)
const newStep = await entityAPI.create<Steps>('steps', {
  title: 'Install Dependencies',
  order: 1,
  pathwayId: 'pathway-id',
});
```

### Update Entity

```typescript
// Update atlas
const updated = await entityAPI.update<Atlas>('atlas', 'atlas-id', {
  title: 'Updated Title',
  description: 'New description',
});
```

### Delete Entity

```typescript
// Delete atlas
await entityAPI.delete('atlas', 'atlas-id');
```

---

## 🪝 React Hooks

### useEntityList Hook

```typescript
import { useEntityList } from 'src/hooks/use-entity';

function AtlasList() {
  const { data, loading, error, refetch } = useEntityList<Atlas>('atlas');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.map(atlas => (
        <li key={atlas.id}>{atlas.title}</li>
      ))}
    </ul>
  );
}
```

### useEntity Hook

```typescript
import { useEntity } from 'src/hooks/use-entity';

function AtlasDetail({ id }: { id: string }) {
  const { data, loading, error } = useEntity<Atlas>('atlas', id);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <h1>{data?.title}</h1>;
}
```

---

## 🧪 Testing

### Test 1: Browser Console

```javascript
// After logging in, test in browser console:
const token = sessionStorage.getItem('jwt_access_token');

fetch('http://localhost:3001/api/entities/atlas', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(console.log);
```

### Test 2: cURL Commands

```bash
# List atlases
curl http://localhost:3001/api/entities/atlas \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create atlas
curl -X POST http://localhost:3001/api/entities/atlas \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Atlas", "userId": "user-id"}'

# Get single atlas
curl http://localhost:3001/api/entities/atlas/ATLAS_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update atlas
curl -X PUT http://localhost:3001/api/entities/atlas/ATLAS_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'

# Delete atlas
curl -X DELETE http://localhost:3001/api/entities/atlas/ATLAS_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⚠️ Important Notes

1. **Authentication**: JWT token is automatically added via axios interceptor
2. **Backend URL**: Ensure backend is running on the configured port (default: 3001)
3. **Entity-Specific Requirements**:
   - `Atlas`, `Path`, `Basis`, `Focus` require `userId`
   - `Insight`, `Archetype` require `atlasId`
   - `Archetype` uses `name` instead of `title`
   - `Steps` requires `order` field

---

## 📚 Related Documentation

- [Backend Entity CRUD API Spec](../FRONTEND_MANUAL_ENTITY_CRUD_API.md)
- [Axios Configuration](../../src/lib/axios.ts)
- [Entity Types](../../src/types/entities.ts)

