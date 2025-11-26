// Entity Form Schemas
// Zod validation schemas for all 13 entity types

import * as z from 'zod';

// ----------------------------------------------------------------------
// Helper schemas
// ----------------------------------------------------------------------

const optionalUrl = z.string().url().optional().or(z.literal(''));
const optionalString = z.string().optional().or(z.literal(''));

// ----------------------------------------------------------------------
// 1. Atlas Schema
// ----------------------------------------------------------------------

export const AtlasSchema = z.object({
  // Essential
  title: z.string().min(1, 'Title is required'),
  userId: z.string().min(1, 'User ID is required'),
  // Optional
  description: optionalString,
  initLog: optionalString,
  imageUrl: optionalUrl,
  coverImageUrl: optionalUrl,
  isPrivate: z.boolean().default(false),
  artificial: z.boolean().default(false),
  focusId: optionalString,
});

export type AtlasFormData = z.infer<typeof AtlasSchema>;

// ----------------------------------------------------------------------
// 2. Path Schema
// ----------------------------------------------------------------------

export const PathSchema = z.object({
  // Essential
  title: z.string().min(1, 'Title is required'),
  userId: z.string().min(1, 'User ID is required'),
  // Optional
  description: optionalString,
  initLog: optionalString,
  imageUrl: optionalUrl,
  active: z.boolean().default(true),
  isPrivate: z.boolean().default(false),
  isComplete: z.boolean().default(false),
  isReproduced: z.boolean().default(false),
  activeAtlasId: optionalString,
  initialAtlasId: optionalString,
  focusId: optionalString,
});

export type PathFormData = z.infer<typeof PathSchema>;

// ----------------------------------------------------------------------
// 3. Milestone Schema
// ----------------------------------------------------------------------

export const MilestoneSchema = z.object({
  // Essential
  title: z.string().min(1, 'Title is required'),
  // Optional
  description: optionalString,
  initLog: optionalString,
  imageUrl: optionalUrl,
  active: z.boolean().default(true),
  isPrivate: z.boolean().default(false),
  isComplete: z.boolean().default(false),
  isEssential: z.boolean().default(false),
  isAdjacent: z.boolean().default(false),
  artificial: z.boolean().default(false),
  horizonId: optionalString,
  atlasId: optionalString,
  pathId: optionalString,
  focusId: optionalString,
});

export type MilestoneFormData = z.infer<typeof MilestoneSchema>;

// ----------------------------------------------------------------------
// 4. Horizon Schema
// ----------------------------------------------------------------------

export const HorizonSchema = z.object({
  // Essential
  title: z.string().min(1, 'Title is required'),
  // Optional
  description: optionalString,
  initLog: optionalString,
  imageUrl: optionalUrl,
  active: z.boolean().default(true),
  isPrivate: z.boolean().default(false),
  artificial: z.boolean().default(false),
  atlasId: optionalString,
  pathId: optionalString,
  initialAtlasId: optionalString,
  initialPathId: optionalString,
  focusId: optionalString,
});

export type HorizonFormData = z.infer<typeof HorizonSchema>;

// ----------------------------------------------------------------------
// 5. Pathway Schema
// ----------------------------------------------------------------------

export const PathwaySchema = z.object({
  // Essential
  title: z.string().min(1, 'Title is required'),
  // Optional
  description: optionalString,
  initLog: optionalString,
  imageUrl: optionalUrl,
  active: z.boolean().default(true),
  isPrivate: z.boolean().default(false),
  isComplete: z.boolean().default(false),
  artificial: z.boolean().default(false),
  deadline: z.date().optional().nullable(),
  timeEstimate: z.number().optional().nullable(),
  pathId: optionalString,
  atlasId: optionalString,
  initialAtlasId: optionalString,
  initialMilestoneId: optionalString,
  initialHorizonId: optionalString,
  focusId: optionalString,
});

export type PathwayFormData = z.infer<typeof PathwaySchema>;

// ----------------------------------------------------------------------
// 6. Story Schema
// ----------------------------------------------------------------------

export const ChapterSchema = z.object({
  title: z.string().min(1, 'Chapter title is required'),
  content: optionalString,
  order: z.number().min(0, 'Order must be 0 or greater'),
});

export const StorySchema = z.object({
  // Essential
  title: z.string().min(1, 'Title is required'),
  // Optional
  description: optionalString,
  userId: optionalString,
  atlasId: optionalString,
  focusId: optionalString,
  chapters: z.array(ChapterSchema).optional(),
});

export type StoryFormData = z.infer<typeof StorySchema>;

// ----------------------------------------------------------------------
// 7. Insight Schema
// ----------------------------------------------------------------------

export const InsightSchema = z.object({
  // Essential
  title: z.string().min(1, 'Title is required'),
  atlasId: z.string().min(1, 'Atlas is required'),
  // Optional
  description: optionalString,
  explanation: optionalString,
  artificial: z.boolean().default(false),
  userId: optionalString,
  focusId: optionalString,
});

export type InsightFormData = z.infer<typeof InsightSchema>;

// ----------------------------------------------------------------------
// 8. Archetype Schema
// ----------------------------------------------------------------------

const ArchetypeArrayItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: optionalString,
});

export const ArchetypeSchema = z.object({
  // Essential (uses 'name' not 'title')
  name: z.string().min(1, 'Name is required'),
  atlasId: z.string().min(1, 'Atlas is required'),
  // Optional
  description: optionalString,
  focusId: optionalString,
  // Nested arrays
  notions: z.array(ArchetypeArrayItemSchema.extend({ user: optionalString })).optional(),
  traits: z.array(ArchetypeArrayItemSchema).optional(),
  values: z.array(ArchetypeArrayItemSchema).optional(),
  motivations: z.array(ArchetypeArrayItemSchema).optional(),
  logs: z.array(ArchetypeArrayItemSchema).optional(),
  categories: z.array(ArchetypeArrayItemSchema).optional(),
  strengths: z.array(ArchetypeArrayItemSchema).optional(),
  flaws: z.array(ArchetypeArrayItemSchema).optional(),
});

export type ArchetypeFormData = z.infer<typeof ArchetypeSchema>;

// ----------------------------------------------------------------------
// 9. Polarity Schema
// ----------------------------------------------------------------------

export const PolaritySchema = z.object({
  // Essential
  title: z.string().min(1, 'Title is required'),
  // Optional
  description: optionalString,
  userId: optionalString,
  atlasId: optionalString,
  focusId: optionalString,
  // Nested arrays
  powerLaws: z.array(z.object({ title: z.string(), description: optionalString })).optional(),
  keyConsiderations: z.array(z.object({ title: z.string(), description: optionalString })).optional(),
  questionsToExplore: z.array(z.object({ question: z.string() })).optional(),
});

export type PolarityFormData = z.infer<typeof PolaritySchema>;

// ----------------------------------------------------------------------
// 10. Steps Schema
// ----------------------------------------------------------------------

export const StepsSchema = z.object({
  // Essential
  title: z.string().min(1, 'Title is required'),
  order: z.number().min(0, 'Order must be 0 or greater'),
  // Optional
  description: optionalString,
  isComplete: z.boolean().default(false),
  pathwayId: optionalString,
  milestoneId: optionalString,
  focusId: optionalString,
});

export type StepsFormData = z.infer<typeof StepsSchema>;

// ----------------------------------------------------------------------
// 11. Basis Schema
// ----------------------------------------------------------------------

export const entityTypeOptions = [
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
] as const;

export const BasisSchema = z.object({
  // Essential
  title: z.string().min(1, 'Title is required'),
  entityType: z.string().min(1, 'Entity type is required'),
  metadata: z.string().min(1, 'Metadata is required'), // JSON string
  userId: z.string().min(1, 'User ID is required'),
  // Optional
  description: optionalString,
  imageUrl: optionalUrl,
  sourceEntityId: optionalString,
  atlasId: optionalString,
  pathId: optionalString,
});

export type BasisFormData = z.infer<typeof BasisSchema>;

// ----------------------------------------------------------------------
// 12. Focus Schema
// ----------------------------------------------------------------------

export const layoutOptions = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
  { value: 'kanban', label: 'Kanban' },
  { value: 'timeline', label: 'Timeline' },
] as const;

export const viewModeOptions = [
  { value: 'compact', label: 'Compact' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'visual', label: 'Visual' },
] as const;

export const FocusSchema = z.object({
  // Essential
  title: z.string().min(1, 'Title is required'),
  interfaceLayout: z.string().min(1, 'Layout is required'),
  interfaceViewMode: z.string().min(1, 'View mode is required'),
  userId: z.string().min(1, 'User ID is required'),
  // Optional
  description: optionalString,
  imageUrl: optionalUrl,
  metadata: optionalString, // JSON string
  atlasId: optionalString,
  pathId: optionalString,
});

export type FocusFormData = z.infer<typeof FocusSchema>;

// ----------------------------------------------------------------------
// 13. Discovery Schema
// ----------------------------------------------------------------------

export const DiscoverySchema = z.object({
  // Essential
  title: z.string().min(1, 'Title is required'),
  // Optional
  description: optionalString,
  content: optionalString,
  pathId: optionalString,
  focusId: optionalString,
});

export type DiscoveryFormData = z.infer<typeof DiscoverySchema>;

// ----------------------------------------------------------------------
// Schema Map
// ----------------------------------------------------------------------

export const entitySchemas = {
  atlas: AtlasSchema,
  path: PathSchema,
  milestone: MilestoneSchema,
  horizon: HorizonSchema,
  pathway: PathwaySchema,
  story: StorySchema,
  insight: InsightSchema,
  archetype: ArchetypeSchema,
  polarity: PolaritySchema,
  steps: StepsSchema,
  basis: BasisSchema,
  focus: FocusSchema,
  discovery: DiscoverySchema,
} as const;

