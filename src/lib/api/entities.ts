// src/lib/api/entities.ts
// Entity CRUD API Client

import type { EntityTypeName, ApiResponse } from 'src/types/entities';

import axios, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

/**
 * Get the plural form of an entity type name
 */
function getPluralName(entityType: EntityTypeName): string {
  const pluralMap: Record<EntityTypeName, string> = {
    atlas: 'atlases',
    path: 'paths',
    milestone: 'milestones',
    horizon: 'horizons',
    pathway: 'pathways',
    story: 'stories',
    insight: 'insights',
    archetype: 'archetypes',
    polarity: 'polarities',
    steps: 'steps',
    basis: 'bases',
    focus: 'focuses',
    discovery: 'discoveries',
  };
  return pluralMap[entityType] || `${entityType}s`;
}

/**
 * Generic Entity CRUD API Client
 * Uses the existing axios instance with JWT authentication
 */
export const entityAPI = {
  /**
   * List all entities of a given type
   */
  async list<T>(entityType: EntityTypeName): Promise<T[]> {
    const { entities } = await this.listWithRaw<T>(entityType);
    return entities;
  },

  /**
   * List all entities of a given type - returns both entities and raw response
   */
  async listWithRaw<T>(entityType: EntityTypeName): Promise<{ entities: T[]; rawResponse: any }> {
    const url = endpoints.entities.list(entityType);
    const fullUrl = `${axios.defaults.baseURL || ''}${url}`;
    const pluralName = getPluralName(entityType);

    try {
      console.log(`[entityAPI] Listing ${entityType}...`);
      console.log(`[entityAPI] URL: ${fullUrl}`);

      const res = await axios.get(url);

      console.log(`[entityAPI] Response status: ${res.status}`);
      console.log(`[entityAPI] Response data:`, res.data);
      console.log(`[entityAPI] Response data type:`, typeof res.data);
      console.log(`[entityAPI] Is array:`, Array.isArray(res.data));

      // Handle different response structures
      let entities: T[];

      if (Array.isArray(res.data)) {
        // Response is directly an array
        entities = res.data;
      } else if (res.data?.data?.[pluralName] && Array.isArray(res.data.data[pluralName])) {
        // Response is { success, data: { atlases: [...], total, limit, offset } }
        console.log(`[entityAPI] Found entities at res.data.data.${pluralName}`);
        entities = res.data.data[pluralName];
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        // Response is { success, data: [...] }
        entities = res.data.data;
      } else if (res.data?.[pluralName] && Array.isArray(res.data[pluralName])) {
        // Response is { atlases: [...] } without success wrapper
        console.log(`[entityAPI] Found entities at res.data.${pluralName}`);
        entities = res.data[pluralName];
      } else if (res.data?.success === false) {
        throw new Error(res.data.error || `Failed to fetch ${entityType}`);
      } else {
        console.warn(`[entityAPI] Unexpected response structure:`, res.data);
        console.warn(`[entityAPI] Looked for: res.data.data.${pluralName}, res.data.data (array), res.data.${pluralName}`);
        entities = [];
      }

      console.log(`[entityAPI] Found ${entities.length} ${entityType} items`);
      return { entities, rawResponse: res.data };
    } catch (error: any) {
      const status = error?.response?.status || 'unknown';
      const message = error?.response?.data?.message || error?.message || 'Unknown error';
      const errorDetails = `[${status}] ${message} - URL: ${fullUrl}`;

      console.error(`[entityAPI] Error listing ${entityType}:`);
      console.error(`[entityAPI] Status: ${status}`);
      console.error(`[entityAPI] URL: ${fullUrl}`);
      console.error(`[entityAPI] Message: ${message}`);

      throw new Error(errorDetails);
    }
  },

  /**
   * Get single entity by ID
   */
  async get<T>(entityType: EntityTypeName, id: string): Promise<T> {
    try {
      console.log(`[entityAPI] Getting ${entityType}/${id}...`);
      const res = await axios.get<ApiResponse<T>>(endpoints.entities.get(entityType, id));

      if (!res.data.success) {
        throw new Error(res.data.error || `Failed to fetch ${entityType}`);
      }

      return res.data.data!;
    } catch (error) {
      console.error(`[entityAPI] Error getting ${entityType}/${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new entity
   */
  async create<T, TInput = Partial<T>>(entityType: EntityTypeName, payload: TInput): Promise<T> {
    const url = endpoints.entities.create(entityType);
    const fullUrl = `${axios.defaults.baseURL || ''}${url}`;

    try {
      console.log(`[entityAPI] Creating ${entityType}...`);
      console.log(`[entityAPI] URL: ${fullUrl}`);
      console.log(`[entityAPI] Payload:`, payload);

      const res = await axios.post<ApiResponse<T>>(url, payload);

      if (!res.data.success) {
        throw new Error(res.data.error || `Failed to create ${entityType}`);
      }

      console.log(`[entityAPI] Created ${entityType}:`, res.data.data);
      return res.data.data!;
    } catch (error: any) {
      const status = error?.response?.status || 'unknown';
      const message = error?.response?.data?.message || error?.message || 'Unknown error';
      const errorDetails = `[${status}] ${message} - URL: ${fullUrl}`;

      console.error(`[entityAPI] Error creating ${entityType}:`);
      console.error(`[entityAPI] Status: ${status}`);
      console.error(`[entityAPI] URL: ${fullUrl}`);
      console.error(`[entityAPI] Message: ${message}`);
      console.error(`[entityAPI] Full error:`, error);

      throw new Error(errorDetails);
    }
  },

  /**
   * Update existing entity
   */
  async update<T, TInput = Partial<T>>(
    entityType: EntityTypeName,
    id: string,
    payload: TInput
  ): Promise<T> {
    try {
      console.log(`[entityAPI] Updating ${entityType}/${id}...`, payload);
      const res = await axios.put<ApiResponse<T>>(
        endpoints.entities.update(entityType, id),
        payload
      );

      if (!res.data.success) {
        throw new Error(res.data.error || `Failed to update ${entityType}`);
      }

      console.log(`[entityAPI] Updated ${entityType}:`, res.data.data);
      return res.data.data!;
    } catch (error) {
      console.error(`[entityAPI] Error updating ${entityType}/${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete entity
   */
  async delete(entityType: EntityTypeName, id: string): Promise<void> {
    try {
      console.log(`[entityAPI] Deleting ${entityType}/${id}...`);
      const res = await axios.delete<ApiResponse<void>>(endpoints.entities.delete(entityType, id));

      if (!res.data.success) {
        throw new Error(res.data.error || `Failed to delete ${entityType}`);
      }

      console.log(`[entityAPI] Deleted ${entityType}/${id}`);
    } catch (error) {
      console.error(`[entityAPI] Error deleting ${entityType}/${id}:`, error);
      throw error;
    }
  },
};

// ----------------------------------------------------------------------
// Type-safe entity-specific helpers
// ----------------------------------------------------------------------

import type {
  Atlas,
  AtlasCreateInput,
  AtlasUpdateInput,
  Path,
  PathCreateInput,
  PathUpdateInput,
  Milestone,
  MilestoneCreateInput,
  MilestoneUpdateInput,
  Horizon,
  HorizonCreateInput,
  HorizonUpdateInput,
  Pathway,
  PathwayCreateInput,
  PathwayUpdateInput,
  Story,
  StoryCreateInput,
  StoryUpdateInput,
  Insight,
  InsightCreateInput,
  InsightUpdateInput,
  Archetype,
  ArchetypeCreateInput,
  ArchetypeUpdateInput,
  Polarity,
  PolarityCreateInput,
  PolarityUpdateInput,
  Steps,
  StepsCreateInput,
  StepsUpdateInput,
  Basis,
  BasisCreateInput,
  BasisUpdateInput,
  Focus,
  FocusCreateInput,
  FocusUpdateInput,
  Discovery,
  DiscoveryCreateInput,
  DiscoveryUpdateInput,
} from 'src/types/entities';

// Atlas API
export const atlasAPI = {
  list: () => entityAPI.list<Atlas>('atlas'),
  get: (id: string) => entityAPI.get<Atlas>('atlas', id),
  create: (data: AtlasCreateInput) => entityAPI.create<Atlas, AtlasCreateInput>('atlas', data),
  update: (id: string, data: AtlasUpdateInput) =>
    entityAPI.update<Atlas, AtlasUpdateInput>('atlas', id, data),
  delete: (id: string) => entityAPI.delete('atlas', id),
};

// Path API
export const pathAPI = {
  list: () => entityAPI.list<Path>('path'),
  get: (id: string) => entityAPI.get<Path>('path', id),
  create: (data: PathCreateInput) => entityAPI.create<Path, PathCreateInput>('path', data),
  update: (id: string, data: PathUpdateInput) =>
    entityAPI.update<Path, PathUpdateInput>('path', id, data),
  delete: (id: string) => entityAPI.delete('path', id),
};

// Milestone API
export const milestoneAPI = {
  list: () => entityAPI.list<Milestone>('milestone'),
  get: (id: string) => entityAPI.get<Milestone>('milestone', id),
  create: (data: MilestoneCreateInput) =>
    entityAPI.create<Milestone, MilestoneCreateInput>('milestone', data),
  update: (id: string, data: MilestoneUpdateInput) =>
    entityAPI.update<Milestone, MilestoneUpdateInput>('milestone', id, data),
  delete: (id: string) => entityAPI.delete('milestone', id),
};

// Horizon API
export const horizonAPI = {
  list: () => entityAPI.list<Horizon>('horizon'),
  get: (id: string) => entityAPI.get<Horizon>('horizon', id),
  create: (data: HorizonCreateInput) =>
    entityAPI.create<Horizon, HorizonCreateInput>('horizon', data),
  update: (id: string, data: HorizonUpdateInput) =>
    entityAPI.update<Horizon, HorizonUpdateInput>('horizon', id, data),
  delete: (id: string) => entityAPI.delete('horizon', id),
};

// Pathway API
export const pathwayAPI = {
  list: () => entityAPI.list<Pathway>('pathway'),
  get: (id: string) => entityAPI.get<Pathway>('pathway', id),
  create: (data: PathwayCreateInput) =>
    entityAPI.create<Pathway, PathwayCreateInput>('pathway', data),
  update: (id: string, data: PathwayUpdateInput) =>
    entityAPI.update<Pathway, PathwayUpdateInput>('pathway', id, data),
  delete: (id: string) => entityAPI.delete('pathway', id),
};

// Story API
export const storyAPI = {
  list: () => entityAPI.list<Story>('story'),
  get: (id: string) => entityAPI.get<Story>('story', id),
  create: (data: StoryCreateInput) => entityAPI.create<Story, StoryCreateInput>('story', data),
  update: (id: string, data: StoryUpdateInput) =>
    entityAPI.update<Story, StoryUpdateInput>('story', id, data),
  delete: (id: string) => entityAPI.delete('story', id),
};

// Insight API
export const insightAPI = {
  list: () => entityAPI.list<Insight>('insight'),
  get: (id: string) => entityAPI.get<Insight>('insight', id),
  create: (data: InsightCreateInput) =>
    entityAPI.create<Insight, InsightCreateInput>('insight', data),
  update: (id: string, data: InsightUpdateInput) =>
    entityAPI.update<Insight, InsightUpdateInput>('insight', id, data),
  delete: (id: string) => entityAPI.delete('insight', id),
};

// Archetype API
export const archetypeAPI = {
  list: () => entityAPI.list<Archetype>('archetype'),
  get: (id: string) => entityAPI.get<Archetype>('archetype', id),
  create: (data: ArchetypeCreateInput) =>
    entityAPI.create<Archetype, ArchetypeCreateInput>('archetype', data),
  update: (id: string, data: ArchetypeUpdateInput) =>
    entityAPI.update<Archetype, ArchetypeUpdateInput>('archetype', id, data),
  delete: (id: string) => entityAPI.delete('archetype', id),
};

// Polarity API
export const polarityAPI = {
  list: () => entityAPI.list<Polarity>('polarity'),
  get: (id: string) => entityAPI.get<Polarity>('polarity', id),
  create: (data: PolarityCreateInput) =>
    entityAPI.create<Polarity, PolarityCreateInput>('polarity', data),
  update: (id: string, data: PolarityUpdateInput) =>
    entityAPI.update<Polarity, PolarityUpdateInput>('polarity', id, data),
  delete: (id: string) => entityAPI.delete('polarity', id),
};

// Steps API
export const stepsAPI = {
  list: () => entityAPI.list<Steps>('steps'),
  get: (id: string) => entityAPI.get<Steps>('steps', id),
  create: (data: StepsCreateInput) => entityAPI.create<Steps, StepsCreateInput>('steps', data),
  update: (id: string, data: StepsUpdateInput) =>
    entityAPI.update<Steps, StepsUpdateInput>('steps', id, data),
  delete: (id: string) => entityAPI.delete('steps', id),
};

// Basis API
export const basisAPI = {
  list: () => entityAPI.list<Basis>('basis'),
  get: (id: string) => entityAPI.get<Basis>('basis', id),
  create: (data: BasisCreateInput) => entityAPI.create<Basis, BasisCreateInput>('basis', data),
  update: (id: string, data: BasisUpdateInput) =>
    entityAPI.update<Basis, BasisUpdateInput>('basis', id, data),
  delete: (id: string) => entityAPI.delete('basis', id),
};

// Focus API (entity CRUD, not interface)
export const focusAPI = {
  list: () => entityAPI.list<Focus>('focus'),
  get: (id: string) => entityAPI.get<Focus>('focus', id),
  create: (data: FocusCreateInput) => entityAPI.create<Focus, FocusCreateInput>('focus', data),
  update: (id: string, data: FocusUpdateInput) =>
    entityAPI.update<Focus, FocusUpdateInput>('focus', id, data),
  delete: (id: string) => entityAPI.delete('focus', id),
};

// Discovery API
export const discoveryAPI = {
  list: () => entityAPI.list<Discovery>('discovery'),
  get: (id: string) => entityAPI.get<Discovery>('discovery', id),
  create: (data: DiscoveryCreateInput) =>
    entityAPI.create<Discovery, DiscoveryCreateInput>('discovery', data),
  update: (id: string, data: DiscoveryUpdateInput) =>
    entityAPI.update<Discovery, DiscoveryUpdateInput>('discovery', id, data),
  delete: (id: string) => entityAPI.delete('discovery', id),
};

