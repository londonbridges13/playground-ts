// src/types/entities.ts
// Entity type definitions for all 13 entity types

// ----------------------------------------------------------------------
// Entity Type Names
// ----------------------------------------------------------------------

export type EntityTypeName =
  | 'atlas'
  | 'path'
  | 'milestone'
  | 'horizon'
  | 'pathway'
  | 'story'
  | 'insight'
  | 'archetype'
  | 'polarity'
  | 'steps'
  | 'basis'
  | 'focus'
  | 'discovery';

// ----------------------------------------------------------------------
// Base Entity (auto-generated fields)
// ----------------------------------------------------------------------

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------
// Primary Entities
// ----------------------------------------------------------------------

// Atlas
export interface Atlas extends BaseEntity {
  title: string;
  slug?: string;
  description?: string;
  initLog?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  isPrivate: boolean;
  artificial: boolean;
  userId: string;
  focusId?: string;
}

export interface AtlasCreateInput {
  title: string;
  userId: string;
  description?: string;
  initLog?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  isPrivate?: boolean;
  artificial?: boolean;
  focusId?: string;
}

export interface AtlasUpdateInput {
  title?: string;
  description?: string;
  initLog?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  isPrivate?: boolean;
  artificial?: boolean;
  focusId?: string;
}

// Path
export interface Path extends BaseEntity {
  title: string;
  slug?: string;
  description?: string;
  initLog?: string;
  imageUrl?: string;
  active: boolean;
  isPrivate: boolean;
  isComplete: boolean;
  isReproduced: boolean;
  userId: string;
  activeAtlasId?: string;
  initialAtlasId?: string;
  focusId?: string;
}

export interface PathCreateInput {
  title: string;
  userId: string;
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

export interface PathUpdateInput {
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

// Milestone
export interface Milestone extends BaseEntity {
  title: string;
  slug?: string;
  description?: string;
  initLog?: string;
  imageUrl?: string;
  active: boolean;
  isPrivate: boolean;
  isComplete: boolean;
  isEssential: boolean;
  isAdjacent: boolean;
  artificial: boolean;
  horizonId?: string;
  atlasId?: string;
  pathId?: string;
  focusId?: string;
}

export interface MilestoneCreateInput {
  title: string;
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
  focusId?: string;
}

export interface MilestoneUpdateInput {
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
  focusId?: string;
}

// Horizon
export interface Horizon extends BaseEntity {
  title: string;
  description?: string;
  initLog?: string;
  imageUrl?: string;
  active: boolean;
  isPrivate: boolean;
  artificial: boolean;
  atlasId?: string;
  pathId?: string;
  initialAtlasId?: string;
  initialPathId?: string;
  focusId?: string;
}

export interface HorizonCreateInput {
  title: string;
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

export interface HorizonUpdateInput {
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

// Pathway
export interface Pathway extends BaseEntity {
  title: string;
  slug?: string;
  description?: string;
  initLog?: string;
  imageUrl?: string;
  active: boolean;
  isPrivate: boolean;
  isComplete: boolean;
  artificial: boolean;
  deadline?: string;
  timeEstimate?: number;
  pathId?: string;
  atlasId?: string;
  initialAtlasId?: string;
  initialMilestoneId?: string;
  initialHorizonId?: string;
  focusId?: string;
}

export interface PathwayCreateInput {
  title: string;
  description?: string;
  initLog?: string;
  imageUrl?: string;
  active?: boolean;
  isPrivate?: boolean;
  isComplete?: boolean;
  artificial?: boolean;
  deadline?: string;
  timeEstimate?: number;
  pathId?: string;
  atlasId?: string;
  initialAtlasId?: string;
  initialMilestoneId?: string;
  initialHorizonId?: string;
  focusId?: string;
}

export interface PathwayUpdateInput {
  title?: string;
  description?: string;
  initLog?: string;
  imageUrl?: string;
  active?: boolean;
  isPrivate?: boolean;
  isComplete?: boolean;
  artificial?: boolean;
  deadline?: string;
  timeEstimate?: number;
  pathId?: string;
  atlasId?: string;
  initialAtlasId?: string;
  initialMilestoneId?: string;
  initialHorizonId?: string;
  focusId?: string;
}

// ----------------------------------------------------------------------
// Content Entities
// ----------------------------------------------------------------------

// Story
export interface Story extends BaseEntity {
  title: string;
  description?: string;
  userId?: string;
  atlasId?: string;
  focusId?: string;
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  content?: string;
  order: number;
}

export interface StoryCreateInput {
  title: string;
  description?: string;
  userId?: string;
  atlasId?: string;
  focusId?: string;
  chapters?: Omit<Chapter, 'id'>[];
}

export interface StoryUpdateInput {
  title?: string;
  description?: string;
  userId?: string;
  atlasId?: string;
  focusId?: string;
}

// Insight
export interface Insight extends BaseEntity {
  title: string;
  description?: string;
  content?: string;
  userId?: string;
  atlasId: string;
  focusId?: string;
}

export interface InsightCreateInput {
  title: string;
  atlasId: string;
  description?: string;
  content?: string;
  userId?: string;
  focusId?: string;
}

export interface InsightUpdateInput {
  title?: string;
  description?: string;
  content?: string;
  userId?: string;
  atlasId?: string;
  focusId?: string;
}

// Archetype
export interface Archetype extends BaseEntity {
  name: string;
  description?: string;
  traits?: string[];
  userId?: string;
  atlasId: string;
  focusId?: string;
}

export interface ArchetypeCreateInput {
  name: string;
  atlasId: string;
  description?: string;
  traits?: string[];
  userId?: string;
  focusId?: string;
}

export interface ArchetypeUpdateInput {
  name?: string;
  description?: string;
  traits?: string[];
  userId?: string;
  atlasId?: string;
  focusId?: string;
}

// Polarity
export interface Polarity extends BaseEntity {
  title: string;
  description?: string;
  userId?: string;
  atlasId?: string;
  focusId?: string;
  powerLaws?: PowerLaw[];
  keyConsiderations?: KeyConsideration[];
  questionsToExplore?: QuestionToExplore[];
}

export interface PowerLaw {
  title: string;
  description?: string;
}

export interface KeyConsideration {
  title: string;
  description?: string;
}

export interface QuestionToExplore {
  question: string;
}

export interface PolarityCreateInput {
  title: string;
  description?: string;
  userId?: string;
  atlasId?: string;
  focusId?: string;
  powerLaws?: PowerLaw[];
  keyConsiderations?: KeyConsideration[];
  questionsToExplore?: QuestionToExplore[];
}

export interface PolarityUpdateInput {
  title?: string;
  description?: string;
  userId?: string;
  atlasId?: string;
  focusId?: string;
  powerLaws?: PowerLaw[];
  keyConsiderations?: KeyConsideration[];
  questionsToExplore?: QuestionToExplore[];
}

// Steps
export interface Steps extends BaseEntity {
  title: string;
  order: number;
  description?: string;
  content?: string;
  isComplete: boolean;
  userId?: string;
  pathwayId?: string;
  milestoneId?: string;
  focusId?: string;
}

export interface StepsCreateInput {
  title: string;
  order: number;
  description?: string;
  content?: string;
  isComplete?: boolean;
  userId?: string;
  pathwayId?: string;
  milestoneId?: string;
  focusId?: string;
}

export interface StepsUpdateInput {
  title?: string;
  order?: number;
  description?: string;
  content?: string;
  isComplete?: boolean;
  userId?: string;
  pathwayId?: string;
  milestoneId?: string;
  focusId?: string;
}

// ----------------------------------------------------------------------
// System Entities
// ----------------------------------------------------------------------

// Basis Entity Type
export type BasisEntityType =
  | 'milestone'
  | 'horizon'
  | 'pathway'
  | 'atlas'
  | 'story'
  | 'insight'
  | 'step'
  | 'polarity'
  | 'path'
  | 'steps'
  | 'archetype'
  | 'focus'
  | 'discovery'
  | 'conversation'
  | 'custom';

// Basis
export interface Basis extends BaseEntity {
  title: string;
  entityType: BasisEntityType;
  metadata: Record<string, unknown>;
  description?: string;
  userId: string;
  focusId?: string;
}

export interface BasisCreateInput {
  title: string;
  entityType: BasisEntityType;
  metadata: Record<string, unknown>;
  userId: string;
  description?: string;
  focusId?: string;
}

export interface BasisUpdateInput {
  title?: string;
  entityType?: BasisEntityType;
  metadata?: Record<string, unknown>;
  description?: string;
  focusId?: string;
}

// Focus
export interface Focus extends BaseEntity {
  title: string;
  interface: Record<string, unknown>;
  description?: string;
  userId: string;
  atlasId?: string;
  pathId?: string;
}

export interface FocusCreateInput {
  title: string;
  interface: Record<string, unknown>;
  userId: string;
  description?: string;
  atlasId?: string;
  pathId?: string;
}

export interface FocusUpdateInput {
  title?: string;
  interface?: Record<string, unknown>;
  description?: string;
  atlasId?: string;
  pathId?: string;
}

// Discovery
export interface Discovery extends BaseEntity {
  title: string;
  description?: string;
  content?: string;
  userId?: string;
  atlasId?: string;
  focusId?: string;
}

export interface DiscoveryCreateInput {
  title: string;
  description?: string;
  content?: string;
  userId?: string;
  atlasId?: string;
  focusId?: string;
}

export interface DiscoveryUpdateInput {
  title?: string;
  description?: string;
  content?: string;
  userId?: string;
  atlasId?: string;
  focusId?: string;
}

// ----------------------------------------------------------------------
// API Response Types
// ----------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ----------------------------------------------------------------------
// Entity Type Map (for generic typing)
// ----------------------------------------------------------------------

export interface EntityTypeMap {
  atlas: Atlas;
  path: Path;
  milestone: Milestone;
  horizon: Horizon;
  pathway: Pathway;
  story: Story;
  insight: Insight;
  archetype: Archetype;
  polarity: Polarity;
  steps: Steps;
  basis: Basis;
  focus: Focus;
  discovery: Discovery;
}
