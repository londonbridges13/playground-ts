import type { Node, Edge } from '@xyflow/react';
import type { LayoutConfig } from 'src/sections/focus-interface/layout-strategies';

// ============================================================================
// Goal Type Definition
// ============================================================================

export interface PlaygroundGoal {
  id: string;
  name: string;
  description: string;
  icon?: string;
  nodes: Node[];
  edges: Edge[];
  defaultConfig: LayoutConfig;
  layoutConfigs: Record<string, LayoutConfig>;
}

// ============================================================================
// Shared Layout Configurations
// ============================================================================

const createLayoutConfigs = (nodeOverrides?: Record<string, any>): Record<string, LayoutConfig> => ({
  organic: {
    dagre: {
      direction: 'LR',
      nodeSpacing: 140,
      rankSpacing: 220,
      align: 'UL',
    },
    stagger: {
      enabled: true,
      baseAmount: 45,
      strategies: [
        { name: 'depth', weight: 0.5 },
        { name: 'degree', weight: 0.3 },
        { name: 'type', weight: 0.2 },
      ],
    },
    nodeOverrides,
  },
  clean: {
    dagre: {
      direction: 'LR',
      nodeSpacing: 120,
      rankSpacing: 200,
    },
    stagger: {
      enabled: true,
      baseAmount: 25,
      strategies: [
        { name: 'depth', weight: 0.7 },
        { name: 'type', weight: 0.3 },
      ],
    },
  },
  strict: {
    dagre: {
      direction: 'LR',
      nodeSpacing: 100,
      rankSpacing: 180,
    },
    stagger: {
      enabled: false,
      baseAmount: 0,
      strategies: [],
    },
  },
});

// ============================================================================
// GOAL 1: All Components
// ============================================================================

const allComponentsNodes: Node[] = [
  // Hexagon Nodes
  {
    id: 'hex-dialog',
    type: 'hexagon',
    position: { x: 0, y: 0 },
    data: {
      label: 'Hexagon → Dialog',
      opacity: 1,
      actionType: 'dialog',
      description: 'Click to open Radial Timeline dialog',
      importance: 10,
      stage: 'Demo',
      index: 0,
    },
  },
  {
    id: 'hex-drawer',
    type: 'hexagon',
    position: { x: 0, y: 0 },
    data: {
      label: 'Hexagon → Drawer',
      opacity: 1,
      actionType: 'drawer',
      description: 'Click to open context drawer',
      importance: 8,
      stage: 'Demo',
      index: 1,
    },
  },
  // Glass Nodes
  {
    id: 'glass-dialog',
    type: 'glass',
    position: { x: 0, y: 0 },
    data: {
      label: 'Glass → Dialog',
      opacity: 1,
      actionType: 'dialog',
      description: 'Glass node with dialog action',
      stage: 'Interactive',
      index: 2,
    },
  },
  {
    id: 'glass-drawer',
    type: 'glass',
    position: { x: 0, y: 0 },
    data: {
      label: 'Glass → Drawer',
      opacity: 1,
      actionType: 'drawer',
      description: 'Glass node with drawer action',
      stage: 'Interactive',
      index: 3,
    },
  },
  // AppStore Nodes
  {
    id: 'appstore-1',
    type: 'appstore',
    position: { x: 0, y: 0 },
    data: {
      id: 'appstore-1',
      label: 'Productivity App',
      opacity: 1,
      actionType: 'appstore',
      description: 'App Store card with expansion animation',
      category: 'Productivity',
      amount: '$4.99',
      backgroundColor: '#814A0E',
      imageUrl: '/assets/images/cover/cover-1.webp',
      index: 4,
    },
  },
  {
    id: 'appstore-2',
    type: 'appstore',
    position: { x: 0, y: 0 },
    data: {
      id: 'appstore-2',
      label: 'Creative Suite',
      opacity: 1,
      actionType: 'appstore',
      description: 'Another App Store card example',
      category: 'Design',
      amount: '$9.99',
      backgroundColor: '#1E3A5F',
      imageUrl: '/assets/images/cover/cover-2.webp',
      index: 5,
    },
  },
];

const allComponentsEdges: Edge[] = [
  {
    id: 'e-hex-dialog-drawer',
    source: 'hex-dialog',
    target: 'hex-drawer',
    type: 'animated',
    data: {
      strokeColor: '#3b82f6',
      strokeWidth: 2,
      animationDuration: 2.5,
      animationBounce: 0.3,
      enableHoverAnimation: true,
      hoverAnimationType: 'redraw',
      hoverStrokeColor: '#60a5fa',
      initialAnimation: true,
      lineType: 'curved',
      curvature: 0.3,
    },
  },
  {
    id: 'e-hex-drawer-glass',
    source: 'hex-drawer',
    target: 'glass-dialog',
    type: 'animated',
    data: {
      strokeColor: '#8b5cf6',
      strokeWidth: 2,
      animationDuration: 2,
      animationBounce: 0.3,
      enableHoverAnimation: true,
      hoverAnimationType: 'pulse',
      hoverStrokeColor: '#a78bfa',
      initialAnimation: true,
      lineType: 'artistic',
      curvature: 0.4,
    },
  },
  {
    id: 'e-glass-dialog-drawer',
    source: 'glass-dialog',
    target: 'glass-drawer',
    type: 'animated',
    data: {
      strokeColor: '#10b981',
      strokeWidth: 3,
      animationDuration: 1.8,
      enableHoverAnimation: true,
      hoverAnimationType: 'float',
      initialAnimation: true,
      lineType: 'curved',
      curvature: 0.25,
    },
  },
  {
    id: 'e-glass-appstore1',
    source: 'glass-drawer',
    target: 'appstore-1',
    type: 'animated',
    data: {
      strokeColor: '#f59e0b',
      strokeWidth: 2,
      animationDuration: 2.2,
      enableHoverAnimation: true,
      hoverAnimationType: 'color',
      hoverStrokeColor: '#fbbf24',
      initialAnimation: true,
      lineType: 'artistic',
      curvature: 0.35,
    },
  },
  {
    id: 'e-appstore1-appstore2',
    source: 'appstore-1',
    target: 'appstore-2',
    type: 'animated',
    data: {
      strokeColor: '#ef4444',
      strokeWidth: 2,
      animationDuration: 2,
      enableHoverAnimation: true,
      hoverAnimationType: 'sequential',
      initialAnimation: true,
      lineType: 'curved',
      curvature: 0.3,
    },
  },
];

// ============================================================================
// GOAL 2: 18 Archetypes
// ============================================================================

const archetypeData = [
  { id: 'innocent', label: 'The Innocent', description: 'Optimistic, pure, seeks happiness', color: '#FBBF24' },
  { id: 'sage', label: 'The Sage', description: 'Wise, knowledgeable, seeks truth', color: '#6366F1' },
  { id: 'explorer', label: 'The Explorer', description: 'Adventurous, independent, seeks freedom', color: '#10B981' },
  { id: 'ruler', label: 'The Ruler', description: 'Authoritative, responsible, seeks control', color: '#8B5CF6' },
  { id: 'creator', label: 'The Creator', description: 'Innovative, artistic, seeks vision', color: '#EC4899' },
  { id: 'caregiver', label: 'The Caregiver', description: 'Nurturing, generous, seeks to help', color: '#14B8A6' },
  { id: 'magician', label: 'The Magician', description: 'Transformative, visionary, seeks power', color: '#7C3AED' },
  { id: 'hero', label: 'The Hero', description: 'Courageous, determined, seeks mastery', color: '#EF4444' },
  { id: 'outlaw', label: 'The Outlaw', description: 'Rebellious, disruptive, seeks liberation', color: '#F97316' },
  { id: 'lover', label: 'The Lover', description: 'Passionate, intimate, seeks connection', color: '#F43F5E' },
  { id: 'jester', label: 'The Jester', description: 'Playful, humorous, seeks enjoyment', color: '#FACC15' },
  { id: 'everyman', label: 'The Everyman', description: 'Relatable, authentic, seeks belonging', color: '#78716C' },
  { id: 'shadow', label: 'The Shadow', description: 'Hidden, repressed, seeks integration', color: '#1F2937' },
  { id: 'anima', label: 'The Anima', description: 'Feminine essence, intuition, creativity', color: '#A855F7' },
  { id: 'animus', label: 'The Animus', description: 'Masculine essence, logic, action', color: '#3B82F6' },
  { id: 'self', label: 'The Self', description: 'Wholeness, unity, seeks individuation', color: '#F59E0B' },
  { id: 'persona', label: 'The Persona', description: 'Social mask, adaptation, seeks acceptance', color: '#64748B' },
  { id: 'trickster', label: 'The Trickster', description: 'Cunning, boundary-crosser, seeks change', color: '#22C55E' },
];

const archetypesNodes: Node[] = archetypeData.map((archetype, index) => ({
  id: archetype.id,
  type: index % 3 === 0 ? 'hexagon' : index % 3 === 1 ? 'glass' : 'appstore',
  position: { x: 0, y: 0 },
  data: {
    id: archetype.id,
    label: archetype.label,
    opacity: 1,
    actionType: index % 3 === 2 ? 'appstore' : index % 2 === 0 ? 'dialog' : 'drawer',
    description: archetype.description,
    importance: 10 - (index % 5),
    stage: `Archetype ${Math.floor(index / 6) + 1}`,
    category: 'Archetype',
    backgroundColor: archetype.color,
    imageUrl: `/assets/images/cover/cover-${(index % 24) + 1}.webp`,
    index,
  },
}));

// Create edges connecting archetypes in a meaningful pattern
const archetypesEdges: Edge[] = [
  // Core Self connections
  { id: 'e-self-shadow', source: 'self', target: 'shadow' },
  { id: 'e-self-persona', source: 'self', target: 'persona' },
  { id: 'e-self-anima', source: 'self', target: 'anima' },
  { id: 'e-self-animus', source: 'self', target: 'animus' },
  // Shadow integrations
  { id: 'e-shadow-outlaw', source: 'shadow', target: 'outlaw' },
  { id: 'e-shadow-trickster', source: 'shadow', target: 'trickster' },
  // Persona expressions
  { id: 'e-persona-everyman', source: 'persona', target: 'everyman' },
  { id: 'e-persona-ruler', source: 'persona', target: 'ruler' },
  // Anima connections
  { id: 'e-anima-lover', source: 'anima', target: 'lover' },
  { id: 'e-anima-caregiver', source: 'anima', target: 'caregiver' },
  { id: 'e-anima-creator', source: 'anima', target: 'creator' },
  // Animus connections
  { id: 'e-animus-hero', source: 'animus', target: 'hero' },
  { id: 'e-animus-explorer', source: 'animus', target: 'explorer' },
  { id: 'e-animus-sage', source: 'animus', target: 'sage' },
  // Other meaningful connections
  { id: 'e-innocent-sage', source: 'innocent', target: 'sage' },
  { id: 'e-hero-magician', source: 'hero', target: 'magician' },
  { id: 'e-jester-trickster', source: 'jester', target: 'trickster' },
  { id: 'e-creator-magician', source: 'creator', target: 'magician' },
].map((edge, index) => ({
  ...edge,
  type: 'animated',
  data: {
    strokeColor: archetypeData.find(a => a.id === edge.source)?.color || '#6366F1',
    strokeWidth: 2,
    animationDuration: 2 + (index % 3) * 0.5,
    animationBounce: 0.3,
    enableHoverAnimation: true,
    hoverAnimationType: ['redraw', 'pulse', 'float', 'color'][index % 4] as any,
    initialAnimation: true,
    lineType: index % 2 === 0 ? 'curved' : 'artistic',
    curvature: 0.25 + (index % 4) * 0.1,
  },
}));

// ============================================================================
// Goals Export
// ============================================================================

export const PLAYGROUND_GOALS: Record<string, PlaygroundGoal> = {
  'all-components': {
    id: 'all-components',
    name: 'All Components',
    description: 'Showcase of all node types, edges, and UI components',
    icon: 'solar:box-minimalistic-bold',
    nodes: allComponentsNodes,
    edges: allComponentsEdges,
    defaultConfig: createLayoutConfigs().organic,
    layoutConfigs: createLayoutConfigs(),
  },
  '18-archetypes': {
    id: '18-archetypes',
    name: '18 Archetypes',
    description: 'Jungian archetypes visualized as a connected network',
    icon: 'solar:users-group-rounded-bold',
    nodes: archetypesNodes,
    edges: archetypesEdges,
    defaultConfig: createLayoutConfigs().organic,
    layoutConfigs: createLayoutConfigs(),
  },
};

export const DEFAULT_PLAYGROUND_GOAL = PLAYGROUND_GOALS['all-components'];

export const getPlaygroundGoalIds = () => Object.keys(PLAYGROUND_GOALS);

