import type { Node, Edge } from '@xyflow/react';
import type { LayoutConfig } from './layout-strategies';

// ============================================================================
// Goal Type Definition
// ============================================================================

export interface Goal {
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
// Shared Layout Configurations Template
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
  dramatic: {
    dagre: {
      direction: 'LR',
      nodeSpacing: 150,
      rankSpacing: 250,
    },
    stagger: {
      enabled: true,
      baseAmount: 70,
      strategies: [
        { name: 'depth', weight: 0.4 },
        { name: 'degree', weight: 0.3 },
        { name: 'random', weight: 0.3 },
      ],
    },
  },
  grouped: {
    dagre: {
      direction: 'LR',
      nodeSpacing: 130,
      rankSpacing: 210,
    },
    stagger: {
      enabled: true,
      baseAmount: 55,
      strategies: [
        { name: 'sibling', weight: 0.6 },
        { name: 'type', weight: 0.4 },
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
// GOAL 1: Startup Fundraising ($1M)
// ============================================================================

const startupNodes: Node[] = [
  {
    id: 'idea',
    type: 'hexagon',
    position: { x: 0, y: 0 },
    data: {
      label: 'Idea Validation',
      opacity: 1,
      actionType: 'dialog',
      description: 'Validate product-market fit',
      amount: '$0',
      stage: 'Pre-seed',
      importance: 10,
      index: 0,
    }
  },
  {
    id: 'mvp',
    type: 'hexagon',
    position: { x: 0, y: 0 },
    data: {
      label: 'Build MVP',
      opacity: 1,
      actionType: 'drawer',
      description: 'Develop minimum viable product',
      amount: '$50K',
      stage: 'Pre-seed',
      importance: 9,
      index: 1,
    }
  },
  {
    id: 'early-users',
    type: 'hexagon',
    position: { x: 0, y: 0 },
    data: {
      label: 'First 100 Users',
      opacity: 1,
      actionType: 'dialog',
      description: 'Acquire early adopters',
      amount: '$100K',
      stage: 'Pre-seed',
      importance: 8,
      index: 2,
    }
  },
  {
    id: 'product-market-fit',
    type: 'glass',
    position: { x: 0, y: 0 },
    data: {
      label: 'Product-Market Fit',
      opacity: 1,
      actionType: 'drawer',
      description: 'Achieve strong retention metrics',
      amount: '$250K',
      stage: 'Seed',
      importance: 10,
      index: 3,
    }
  },
  {
    id: 'scale-team',
    type: 'hexagon',
    position: { x: 0, y: 0 },
    data: {
      label: 'Scale Team',
      opacity: 1,
      actionType: 'dialog',
      description: 'Hire key team members',
      amount: '$500K',
      stage: 'Seed',
      importance: 7,
      index: 4,
    }
  },
  {
    id: 'revenue',
    type: 'hexagon',
    position: { x: 0, y: 0 },
    data: {
      label: 'First Revenue',
      opacity: 1,
      actionType: 'drawer',
      description: 'Generate $10K MRR',
      amount: '$750K',
      stage: 'Seed',
      importance: 9,
      index: 5,
    }
  },
  {
    id: 'series-a-ready',
    type: 'glass',
    position: { x: 0, y: 0 },
    data: {
      label: 'Series A Ready',
      opacity: 1,
      actionType: 'dialog',
      description: 'Hit $1M ARR, ready for growth',
      amount: '$1M',
      stage: 'Series A',
      importance: 10,
      index: 6,
    }
  },
];

const startupEdges: Edge[] = [
  {
    id: 'e-idea-mvp',
    source: 'idea',
    target: 'mvp',
    type: 'animated',
    data: {
      strokeColor: '#3b82f6',
      strokeWidth: 2,
      animationDuration: 2.5,
      animationBounce: 0.3,
      animationDelay: 0,
      reverseAnimation: false,
      enableHoverAnimation: true,
      hoverAnimationType: 'redraw',
      hoverStrokeColor: '#60a5fa',
      initialAnimation: true,
      useStaticPath: false,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
    },
  },
  {
    id: 'e-mvp-users',
    source: 'mvp',
    target: 'early-users',
    type: 'animated',
    data: {
      strokeColor: '#8b5cf6',
      strokeWidth: 2,
      animationDuration: 2.5,
      animationBounce: 0.3,
      animationDelay: 0.3,
      reverseAnimation: false,
      enableHoverAnimation: true,
      hoverAnimationType: 'redraw',
      hoverStrokeColor: '#a78bfa',
      initialAnimation: true,
      useStaticPath: false,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
    },
  },
  {
    id: 'e-users-pmf',
    source: 'early-users',
    target: 'product-market-fit',
    type: 'animated',
    data: {
      strokeColor: '#10b981',
      strokeWidth: 3,
      animationDuration: 2.5,
      animationBounce: 0.3,
      animationDelay: 0.6,
      reverseAnimation: false,
      enableHoverAnimation: true,
      hoverAnimationType: 'redraw',
      hoverStrokeColor: '#34d399',
      initialAnimation: true,
      useStaticPath: false,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
    },
  },
  {
    id: 'e-pmf-team',
    source: 'product-market-fit',
    target: 'scale-team',
    type: 'animated',
    data: {
      strokeColor: '#f59e0b',
      strokeWidth: 2,
      animationDuration: 2.5,
      animationBounce: 0.3,
      animationDelay: 0.9,
      reverseAnimation: false,
      enableHoverAnimation: true,
      hoverAnimationType: 'redraw',
      hoverStrokeColor: '#fbbf24',
      initialAnimation: true,
      useStaticPath: false,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
    },
  },
  {
    id: 'e-team-revenue',
    source: 'scale-team',
    target: 'revenue',
    type: 'animated',
    data: {
      strokeColor: '#ec4899',
      strokeWidth: 2,
      animationDuration: 2.5,
      animationBounce: 0.3,
      animationDelay: 1.2,
      reverseAnimation: false,
      enableHoverAnimation: true,
      hoverAnimationType: 'redraw',
      hoverStrokeColor: '#f472b6',
      initialAnimation: true,
      useStaticPath: false,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
    },
  },
  {
    id: 'e-revenue-series-a',
    source: 'revenue',
    target: 'series-a-ready',
    type: 'animated',
    data: {
      strokeColor: '#06b6d4',
      strokeWidth: 3,
      animationDuration: 2.5,
      animationBounce: 0.3,
      animationDelay: 1.5,
      reverseAnimation: false,
      enableHoverAnimation: true,
      hoverAnimationType: 'redraw',
      hoverStrokeColor: '#22d3ee',
      initialAnimation: true,
      useStaticPath: false,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
    },
  },
];

// ============================================================================
// GOAL 2: Run a Marathon
// ============================================================================

const marathonNodes: Node[] = [
  {
    id: 'decide',
    type: 'hexagon',
    position: { x: 0, y: 0 },
    data: {
      label: 'Decide to Run',
      opacity: 1,
      actionType: 'dialog',
      description: 'Commit to the marathon goal',
      amount: 'Week 0',
      stage: 'Preparation',
      importance: 10,
      index: 0,
    }
  },
  {
    id: 'base-training',
    type: 'hexagon',
    position: { x: 0, y: 0 },
    data: {
      label: 'Base Training',
      opacity: 1,
      actionType: 'drawer',
      description: 'Build aerobic base (3-4 runs/week)',
      amount: 'Weeks 1-4',
      stage: 'Foundation',
      importance: 9,
      index: 1,
    }
  },
  {
    id: 'first-long-run',
    type: 'hexagon',
    position: { x: 0, y: 0 },
    data: {
      label: 'First Long Run',
      opacity: 1,
      actionType: 'dialog',
      description: 'Complete 10 miles',
      amount: 'Week 5',
      stage: 'Foundation',
      importance: 8,
      index: 2,
    }
  },
  {
    id: 'peak-training',
    type: 'glass',
    position: { x: 0, y: 0 },
    data: {
      label: 'Peak Training',
      opacity: 1,
      actionType: 'drawer',
      description: 'Hit 20-mile long runs',
      amount: 'Weeks 12-14',
      stage: 'Peak',
      importance: 10,
      index: 3,
    }
  },
  {
    id: 'taper',
    type: 'hexagon',
    position: { x: 0, y: 0 },
    data: {
      label: 'Taper Period',
      opacity: 1,
      actionType: 'dialog',
      description: 'Reduce mileage, rest up',
      amount: 'Weeks 15-16',
      stage: 'Recovery',
      importance: 8,
      index: 4,
    }
  },
  {
    id: 'race-day',
    type: 'glass',
    position: { x: 0, y: 0 },
    data: {
      label: 'Race Day!',
      opacity: 1,
      actionType: 'dialog',
      description: 'Complete 26.2 miles',
      amount: 'Week 16',
      stage: 'Achievement',
      importance: 10,
      index: 5,
    }
  },
];

const marathonEdges: Edge[] = [
  {
    id: 'e-decide-base',
    source: 'decide',
    target: 'base-training',
    type: 'animated',
    data: {
      strokeColor: '#3b82f6',
      strokeWidth: 2,
      animationDuration: 2.5,
      animationDelay: 0,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
      enableHoverAnimation: true,
      hoverAnimationType: 'redraw',
      hoverStrokeColor: '#60a5fa',
      initialAnimation: true,
    },
  },
  {
    id: 'e-base-long',
    source: 'base-training',
    target: 'first-long-run',
    type: 'animated',
    data: {
      strokeColor: '#8b5cf6',
      strokeWidth: 2,
      animationDuration: 2.5,
      animationDelay: 0.3,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
      enableHoverAnimation: true,
      hoverAnimationType: 'redraw',
      hoverStrokeColor: '#a78bfa',
      initialAnimation: true,
    },
  },
  {
    id: 'e-long-peak',
    source: 'first-long-run',
    target: 'peak-training',
    type: 'animated',
    data: {
      strokeColor: '#10b981',
      strokeWidth: 3,
      animationDuration: 2.5,
      animationDelay: 0.6,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
      enableHoverAnimation: true,
      hoverAnimationType: 'redraw',
      hoverStrokeColor: '#34d399',
      initialAnimation: true,
    },
  },
  {
    id: 'e-peak-taper',
    source: 'peak-training',
    target: 'taper',
    type: 'animated',
    data: {
      strokeColor: '#f59e0b',
      strokeWidth: 2,
      animationDuration: 2.5,
      animationDelay: 0.9,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
      enableHoverAnimation: true,
      hoverAnimationType: 'redraw',
      hoverStrokeColor: '#fbbf24',
      initialAnimation: true,
    },
  },
  {
    id: 'e-taper-race',
    source: 'taper',
    target: 'race-day',
    type: 'animated',
    data: {
      strokeColor: '#ec4899',
      strokeWidth: 3,
      animationDuration: 2.5,
      animationDelay: 1.2,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
      enableHoverAnimation: true,
      hoverAnimationType: 'redraw',
      hoverStrokeColor: '#f472b6',
      initialAnimation: true,
    },
  },
];

// ============================================================================
// GOAL 3: Build an App
// ============================================================================

const appNodes: Node[] = [
  {
    id: 'app-idea',
    type: 'hexagon',
    position: { x: 0, y: 0 },
    data: {
      label: 'App Idea',
      opacity: 1,
      actionType: 'dialog',
      description: 'Define the problem to solve',
      amount: 'Day 0',
      stage: 'Ideation',
      importance: 10,
      index: 0,
    }
  },
  {
    id: 'wireframes',
    type: 'hexagon',
    position: { x: 0, y: 0 },
    data: {
      label: 'Wireframes',
      opacity: 1,
      actionType: 'drawer',
      description: 'Design user flows and screens',
      amount: 'Week 1',
      stage: 'Design',
      importance: 8,
      index: 1,
    }
  },
  {
    id: 'prototype',
    type: 'hexagon',
    position: { x: 0, y: 0 },
    data: {
      label: 'Prototype',
      opacity: 1,
      actionType: 'dialog',
      description: 'Build clickable prototype',
      amount: 'Week 2',
      stage: 'Design',
      importance: 7,
      index: 2,
    }
  },
  {
    id: 'app-mvp',
    type: 'glass',
    position: { x: 0, y: 0 },
    data: {
      label: 'MVP Launch',
      opacity: 1,
      actionType: 'drawer',
      description: 'Ship minimum viable product',
      amount: 'Week 6',
      stage: 'Development',
      importance: 10,
      index: 3,
    }
  },
  {
    id: 'beta-testing',
    type: 'hexagon',
    position: { x: 0, y: 0 },
    data: {
      label: 'Beta Testing',
      opacity: 1,
      actionType: 'dialog',
      description: 'Get user feedback',
      amount: 'Week 8',
      stage: 'Testing',
      importance: 9,
      index: 4,
    }
  },
  {
    id: 'app-launch',
    type: 'glass',
    position: { x: 0, y: 0 },
    data: {
      label: 'Public Launch',
      opacity: 1,
      actionType: 'dialog',
      description: 'Release to app stores',
      amount: 'Week 12',
      stage: 'Launch',
      importance: 10,
      index: 5,
    }
  },
];

const appEdges: Edge[] = [
  {
    id: 'e-idea-wireframes',
    source: 'app-idea',
    target: 'wireframes',
    type: 'animated',
    data: {
      strokeColor: '#3b82f6',
      strokeWidth: 2,
      animationDuration: 2.5,
      animationDelay: 0,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
      enableHoverAnimation: true,
      initialAnimation: true,
    },
  },
  {
    id: 'e-wireframes-prototype',
    source: 'wireframes',
    target: 'prototype',
    type: 'animated',
    data: {
      strokeColor: '#8b5cf6',
      strokeWidth: 2,
      animationDuration: 2.5,
      animationDelay: 0.3,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
      enableHoverAnimation: true,
      initialAnimation: true,
    },
  },
  {
    id: 'e-prototype-mvp',
    source: 'prototype',
    target: 'app-mvp',
    type: 'animated',
    data: {
      strokeColor: '#10b981',
      strokeWidth: 3,
      animationDuration: 2.5,
      animationDelay: 0.6,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
      enableHoverAnimation: true,
      initialAnimation: true,
    },
  },
  {
    id: 'e-mvp-beta',
    source: 'app-mvp',
    target: 'beta-testing',
    type: 'animated',
    data: {
      strokeColor: '#f59e0b',
      strokeWidth: 2,
      animationDuration: 2.5,
      animationDelay: 0.9,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
      enableHoverAnimation: true,
      initialAnimation: true,
    },
  },
  {
    id: 'e-beta-launch',
    source: 'beta-testing',
    target: 'app-launch',
    type: 'animated',
    data: {
      strokeColor: '#ec4899',
      strokeWidth: 3,
      animationDuration: 2.5,
      animationDelay: 1.2,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
      enableHoverAnimation: true,
      initialAnimation: true,
    },
  },
];

// ============================================================================
// GOAL 4: Start a Magazine
// ============================================================================

const magazineNodes: Node[] = [
  {
    id: 'concept',
    type: 'hexagon',
    position: { x: 0, y: 0 },
    data: {
      label: 'Magazine Concept',
      opacity: 1,
      actionType: 'dialog',
      description: 'Define niche and audience',
      amount: 'Week 0',
      stage: 'Planning',
      importance: 10,
      index: 0,
    }
  },
  {
    id: 'editorial-plan',
    type: 'hexagon',
    position: { x: 0, y: 0 },
    data: {
      label: 'Editorial Plan',
      opacity: 1,
      actionType: 'drawer',
      description: 'Plan content themes and sections',
      amount: 'Week 1',
      stage: 'Planning',
      importance: 9,
      index: 1,
    }
  },
  {
    id: 'writers',
    type: 'hexagon',
    position: { x: 0, y: 0 },
    data: {
      label: 'Recruit Writers',
      opacity: 1,
      actionType: 'dialog',
      description: 'Build contributor network',
      amount: 'Week 2-3',
      stage: 'Team Building',
      importance: 8,
      index: 2,
    }
  },
  {
    id: 'content-creation',
    type: 'glass',
    position: { x: 0, y: 0 },
    data: {
      label: 'Create Content',
      opacity: 1,
      actionType: 'drawer',
      description: 'Write and edit articles',
      amount: 'Week 4-6',
      stage: 'Production',
      importance: 10,
      index: 3,
    }
  },
  {
    id: 'design',
    type: 'hexagon',
    position: { x: 0, y: 0 },
    data: {
      label: 'Design Layout',
      opacity: 1,
      actionType: 'dialog',
      description: 'Create visual identity',
      amount: 'Week 7',
      stage: 'Production',
      importance: 8,
      index: 4,
    }
  },
  {
    id: 'first-issue',
    type: 'glass',
    position: { x: 0, y: 0 },
    data: {
      label: 'First Release',
      opacity: 1,
      actionType: 'dialog',
      description: 'Publish inaugural issue',
      amount: 'Week 8',
      stage: 'Launch',
      importance: 10,
      index: 5,
    }
  },
];

const magazineEdges: Edge[] = [
  {
    id: 'e-concept-editorial',
    source: 'concept',
    target: 'editorial-plan',
    type: 'animated',
    data: {
      strokeColor: '#3b82f6',
      strokeWidth: 2,
      animationDuration: 2.5,
      animationDelay: 0,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
      enableHoverAnimation: true,
      initialAnimation: true,
    },
  },
  {
    id: 'e-editorial-writers',
    source: 'editorial-plan',
    target: 'writers',
    type: 'animated',
    data: {
      strokeColor: '#8b5cf6',
      strokeWidth: 2,
      animationDuration: 2.5,
      animationDelay: 0.3,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
      enableHoverAnimation: true,
      initialAnimation: true,
    },
  },
  {
    id: 'e-writers-content',
    source: 'writers',
    target: 'content-creation',
    type: 'animated',
    data: {
      strokeColor: '#10b981',
      strokeWidth: 3,
      animationDuration: 2.5,
      animationDelay: 0.6,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
      enableHoverAnimation: true,
      initialAnimation: true,
    },
  },
  {
    id: 'e-content-design',
    source: 'content-creation',
    target: 'design',
    type: 'animated',
    data: {
      strokeColor: '#f59e0b',
      strokeWidth: 2,
      animationDuration: 2.5,
      animationDelay: 0.9,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
      enableHoverAnimation: true,
      initialAnimation: true,
    },
  },
  {
    id: 'e-design-issue',
    source: 'design',
    target: 'first-issue',
    type: 'animated',
    data: {
      strokeColor: '#ec4899',
      strokeWidth: 3,
      animationDuration: 2.5,
      animationDelay: 1.2,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
      enableHoverAnimation: true,
      initialAnimation: true,
    },
  },
];

// ============================================================================
// Goals Registry
// ============================================================================

export const GOALS: Record<string, Goal> = {
  startup: {
    id: 'startup',
    name: 'Raise $1M for Startup',
    description: 'Journey from idea to Series A',
    icon: 'solar:rocket-2-bold',
    nodes: startupNodes,
    edges: startupEdges,
    defaultConfig: createLayoutConfigs({
      'product-market-fit': { staggerMultiplier: 0.5 },
      'series-a-ready': { staggerMultiplier: 0.5 },
    }).organic,
    layoutConfigs: createLayoutConfigs({
      'product-market-fit': { staggerMultiplier: 0.5 },
      'series-a-ready': { staggerMultiplier: 0.5 },
    }),
  },
  marathon: {
    id: 'marathon',
    name: 'Run a Marathon',
    description: '16-week training plan to 26.2 miles',
    icon: 'solar:running-round-bold',
    nodes: marathonNodes,
    edges: marathonEdges,
    defaultConfig: createLayoutConfigs({
      'peak-training': { staggerMultiplier: 0.5 },
      'race-day': { staggerMultiplier: 0.5 },
    }).organic,
    layoutConfigs: createLayoutConfigs({
      'peak-training': { staggerMultiplier: 0.5 },
      'race-day': { staggerMultiplier: 0.5 },
    }),
  },
  app: {
    id: 'app',
    name: 'Build an App',
    description: 'From idea to app store launch',
    icon: 'solar:smartphone-2-bold',
    nodes: appNodes,
    edges: appEdges,
    defaultConfig: createLayoutConfigs({
      'app-mvp': { staggerMultiplier: 0.5 },
      'app-launch': { staggerMultiplier: 0.5 },
    }).organic,
    layoutConfigs: createLayoutConfigs({
      'app-mvp': { staggerMultiplier: 0.5 },
      'app-launch': { staggerMultiplier: 0.5 },
    }),
  },
  magazine: {
    id: 'magazine',
    name: 'Start a Magazine',
    description: 'Create and publish first issue',
    icon: 'solar:book-2-bold',
    nodes: magazineNodes,
    edges: magazineEdges,
    defaultConfig: createLayoutConfigs({
      'content-creation': { staggerMultiplier: 0.5 },
      'first-issue': { staggerMultiplier: 0.5 },
    }).organic,
    layoutConfigs: createLayoutConfigs({
      'content-creation': { staggerMultiplier: 0.5 },
      'first-issue': { staggerMultiplier: 0.5 },
    }),
  },
  appstore: {
    id: 'appstore',
    name: 'App Store Apps',
    description: 'Showcase of app store-style cards',
    icon: 'solar:widget-5-bold',
    nodes: [
      {
        id: 'pizza-app',
        type: 'appstore',
        position: { x: 0, y: 0 },
        data: {
          label: 'Pizza Delivery',
          category: 'Food & Drink',
          actionType: 'appstore',
          backgroundColor: '#814A0E',
          imageUrl: '/assets/images/c.jpg',
          pointOfInterest: 80,
          opacity: 1,
          index: 0,
        }
      },
      {
        id: 'fitness-app',
        type: 'appstore',
        position: { x: 0, y: 0 },
        data: {
          label: 'Fitness Tracker',
          category: 'Health & Fitness',
          actionType: 'appstore',
          backgroundColor: '#5DBCD2',
          imageUrl: '/assets/images/a.jpg',
          pointOfInterest: 260,
          opacity: 1,
          index: 1,
        }
      },
      {
        id: 'music-app',
        type: 'appstore',
        position: { x: 0, y: 0 },
        data: {
          label: 'Music Studio',
          category: 'Music',
          actionType: 'appstore',
          backgroundColor: '#CC555B',
          imageUrl: '/assets/images/b.jpg',
          pointOfInterest: 260,
          opacity: 1,
          index: 2,
        }
      },
      {
        id: 'photo-app',
        type: 'appstore',
        position: { x: 0, y: 0 },
        data: {
          label: 'Photo Editor',
          category: 'Photo & Video',
          actionType: 'appstore',
          backgroundColor: '#FA6779',
          imageUrl: '/assets/images/d.jpg',
          pointOfInterest: 150,
          opacity: 1,
          index: 3,
        }
      },
      {
        id: 'travel-app',
        type: 'appstore',
        position: { x: 0, y: 0 },
        data: {
          label: 'Travel Guide',
          category: 'Travel',
          actionType: 'appstore',
          backgroundColor: '#8F986D',
          imageUrl: '/assets/images/g.jpg',
          pointOfInterest: 200,
          opacity: 1,
          index: 4,
        }
      },
    ],
    edges: [
      {
        id: 'e1',
        source: 'pizza-app',
        target: 'fitness-app',
        type: 'animated',
        data: {
          strokeColor: '#814A0E',
          strokeWidth: 2,
          animationDuration: 2.5,
          animationBounce: 0.3,
          animationDelay: 0,
          reverseAnimation: false,
          enableHoverAnimation: true,
          hoverAnimationType: 'redraw',
          hoverStrokeColor: '#A0522D',
          initialAnimation: true,
          useStaticPath: false,
          lineType: 'artistic',
          curvature: 0.3,
          edgePadding: 50,
        },
      },
      {
        id: 'e2',
        source: 'fitness-app',
        target: 'music-app',
        type: 'animated',
        data: {
          strokeColor: '#5DBCD2',
          strokeWidth: 2,
          animationDuration: 2.5,
          animationBounce: 0.3,
          animationDelay: 0.3,
          reverseAnimation: false,
          enableHoverAnimation: true,
          hoverAnimationType: 'redraw',
          hoverStrokeColor: '#7DD3E8',
          initialAnimation: true,
          useStaticPath: false,
          lineType: 'artistic',
          curvature: 0.3,
          edgePadding: 50,
        },
      },
      {
        id: 'e3',
        source: 'music-app',
        target: 'photo-app',
        type: 'animated',
        data: {
          strokeColor: '#CC555B',
          strokeWidth: 2,
          animationDuration: 2.5,
          animationBounce: 0.3,
          animationDelay: 0.6,
          reverseAnimation: false,
          enableHoverAnimation: true,
          hoverAnimationType: 'redraw',
          hoverStrokeColor: '#E67378',
          initialAnimation: true,
          useStaticPath: false,
          lineType: 'artistic',
          curvature: 0.3,
          edgePadding: 50,
        },
      },
      {
        id: 'e4',
        source: 'photo-app',
        target: 'travel-app',
        type: 'animated',
        data: {
          strokeColor: '#FA6779',
          strokeWidth: 2,
          animationDuration: 2.5,
          animationBounce: 0.3,
          animationDelay: 0.9,
          reverseAnimation: false,
          enableHoverAnimation: true,
          hoverAnimationType: 'redraw',
          hoverStrokeColor: '#FF8A99',
          initialAnimation: true,
          useStaticPath: false,
          lineType: 'artistic',
          curvature: 0.3,
          edgePadding: 50,
        },
      },
    ],
    defaultConfig: {
      dagre: {
        direction: 'LR',
        nodeSpacing: 200,
        rankSpacing: 350,
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
    },
    layoutConfigs: {
      organic: {
        dagre: {
          direction: 'LR',
          nodeSpacing: 200,
          rankSpacing: 350,
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
      },
      clean: {
        dagre: {
          direction: 'LR',
          nodeSpacing: 180,
          rankSpacing: 320,
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
      dramatic: {
        dagre: {
          direction: 'LR',
          nodeSpacing: 220,
          rankSpacing: 380,
        },
        stagger: {
          enabled: true,
          baseAmount: 70,
          strategies: [
            { name: 'depth', weight: 0.4 },
            { name: 'degree', weight: 0.3 },
            { name: 'random', weight: 0.3 },
          ],
        },
      },
      grouped: {
        dagre: {
          direction: 'LR',
          nodeSpacing: 190,
          rankSpacing: 340,
        },
        stagger: {
          enabled: true,
          baseAmount: 55,
          strategies: [
            { name: 'sibling', weight: 0.6 },
            { name: 'type', weight: 0.4 },
          ],
        },
      },
      strict: {
        dagre: {
          direction: 'LR',
          nodeSpacing: 160,
          rankSpacing: 300,
        },
        stagger: {
          enabled: false,
          baseAmount: 0,
          strategies: [],
        },
      },
    },
  },
  barista: {
    id: 'barista',
    name: 'Become a Master Barista',
    description: 'Journey from coffee novice to master barista',
    icon: 'solar:cup-hot-bold',
    nodes: [
      {
        id: 'coffee-basics',
        type: 'appstore',
        position: { x: 0, y: 0 },
        data: {
          label: 'Coffee Basics',
          category: 'Foundation',
          actionType: 'appstore',
          backgroundColor: '#814A0E',
          imageUrl: '/assets/images/c.jpg',
          pointOfInterest: 80,
          opacity: 1,
          index: 0,
        }
      },
      {
        id: 'espresso-mastery',
        type: 'appstore',
        position: { x: 0, y: 0 },
        data: {
          label: 'Espresso Mastery',
          category: 'Core Skills',
          actionType: 'appstore',
          backgroundColor: '#282F49',
          imageUrl: '/assets/images/h.jpg',
          pointOfInterest: 60,
          opacity: 1,
          index: 1,
        }
      },
      {
        id: 'milk-steaming',
        type: 'appstore',
        position: { x: 0, y: 0 },
        data: {
          label: 'Milk Steaming',
          category: 'Core Skills',
          actionType: 'appstore',
          backgroundColor: '#959684',
          imageUrl: '/assets/images/f.jpg',
          pointOfInterest: 120,
          opacity: 1,
          index: 2,
        }
      },
      {
        id: 'latte-art',
        type: 'appstore',
        position: { x: 0, y: 0 },
        data: {
          label: 'Latte Art',
          category: 'Advanced',
          actionType: 'appstore',
          backgroundColor: '#FA6779',
          imageUrl: '/assets/images/d.jpg',
          pointOfInterest: 150,
          opacity: 1,
          index: 3,
        }
      },
      {
        id: 'bean-knowledge',
        type: 'appstore',
        position: { x: 0, y: 0 },
        data: {
          label: 'Bean Knowledge',
          category: 'Theory',
          actionType: 'appstore',
          backgroundColor: '#AC7441',
          imageUrl: '/assets/images/e.jpg',
          pointOfInterest: 200,
          opacity: 1,
          index: 4,
        }
      },
      {
        id: 'brewing-methods',
        type: 'appstore',
        position: { x: 0, y: 0 },
        data: {
          label: 'Brewing Methods',
          category: 'Advanced',
          actionType: 'appstore',
          backgroundColor: '#8F986D',
          imageUrl: '/assets/images/g.jpg',
          pointOfInterest: 200,
          opacity: 1,
          index: 5,
        }
      },
      {
        id: 'customer-service',
        type: 'appstore',
        position: { x: 0, y: 0 },
        data: {
          label: 'Customer Service',
          category: 'Professional',
          actionType: 'appstore',
          backgroundColor: '#5DBCD2',
          imageUrl: '/assets/images/a.jpg',
          pointOfInterest: 260,
          opacity: 1,
          index: 6,
        }
      },
      {
        id: 'barista-certification',
        type: 'appstore',
        position: { x: 0, y: 0 },
        data: {
          label: 'Certification',
          category: 'Master Level',
          actionType: 'appstore',
          backgroundColor: '#CC555B',
          imageUrl: '/assets/images/b.jpg',
          pointOfInterest: 260,
          opacity: 1,
          index: 7,
        }
      },
    ],
    edges: [
      {
        id: 'e1',
        source: 'coffee-basics',
        target: 'espresso-mastery',
        type: 'animated',
        data: {
          strokeColor: '#814A0E',
          strokeWidth: 2,
          animationDuration: 2.5,
          animationBounce: 0.3,
          animationDelay: 0,
          reverseAnimation: false,
          enableHoverAnimation: true,
          hoverAnimationType: 'redraw',
          hoverStrokeColor: '#A0522D',
          initialAnimation: true,
          useStaticPath: false,
          lineType: 'artistic',
          curvature: 0.3,
          edgePadding: 50,
        },
      },
      {
        id: 'e2',
        source: 'coffee-basics',
        target: 'bean-knowledge',
        type: 'animated',
        data: {
          strokeColor: '#AC7441',
          strokeWidth: 2,
          animationDuration: 2.5,
          animationBounce: 0.3,
          animationDelay: 0.3,
          reverseAnimation: false,
          enableHoverAnimation: true,
          hoverAnimationType: 'redraw',
          hoverStrokeColor: '#C88A5A',
          initialAnimation: true,
          useStaticPath: false,
          lineType: 'artistic',
          curvature: 0.3,
          edgePadding: 50,
        },
      },
      {
        id: 'e3',
        source: 'espresso-mastery',
        target: 'milk-steaming',
        type: 'animated',
        data: {
          strokeColor: '#282F49',
          strokeWidth: 2,
          animationDuration: 2.5,
          animationBounce: 0.3,
          animationDelay: 0.6,
          reverseAnimation: false,
          enableHoverAnimation: true,
          hoverAnimationType: 'redraw',
          hoverStrokeColor: '#3D4563',
          initialAnimation: true,
          useStaticPath: false,
          lineType: 'artistic',
          curvature: 0.3,
          edgePadding: 50,
        },
      },
      {
        id: 'e4',
        source: 'milk-steaming',
        target: 'latte-art',
        type: 'animated',
        data: {
          strokeColor: '#959684',
          strokeWidth: 2,
          animationDuration: 2.5,
          animationBounce: 0.3,
          animationDelay: 0.9,
          reverseAnimation: false,
          enableHoverAnimation: true,
          hoverAnimationType: 'redraw',
          hoverStrokeColor: '#AFAC9D',
          initialAnimation: true,
          useStaticPath: false,
          lineType: 'artistic',
          curvature: 0.3,
          edgePadding: 50,
        },
      },
      {
        id: 'e5',
        source: 'bean-knowledge',
        target: 'brewing-methods',
        type: 'animated',
        data: {
          strokeColor: '#8F986D',
          strokeWidth: 2,
          animationDuration: 2.5,
          animationBounce: 0.3,
          animationDelay: 1.2,
          reverseAnimation: false,
          enableHoverAnimation: true,
          hoverAnimationType: 'redraw',
          hoverStrokeColor: '#A8B086',
          initialAnimation: true,
          useStaticPath: false,
          lineType: 'artistic',
          curvature: 0.3,
          edgePadding: 50,
        },
      },
      {
        id: 'e6',
        source: 'latte-art',
        target: 'customer-service',
        type: 'animated',
        data: {
          strokeColor: '#FA6779',
          strokeWidth: 2,
          animationDuration: 2.5,
          animationBounce: 0.3,
          animationDelay: 1.5,
          reverseAnimation: false,
          enableHoverAnimation: true,
          hoverAnimationType: 'redraw',
          hoverStrokeColor: '#FF8A99',
          initialAnimation: true,
          useStaticPath: false,
          lineType: 'artistic',
          curvature: 0.3,
          edgePadding: 50,
        },
      },
      {
        id: 'e7',
        source: 'brewing-methods',
        target: 'customer-service',
        type: 'animated',
        data: {
          strokeColor: '#5DBCD2',
          strokeWidth: 2,
          animationDuration: 2.5,
          animationBounce: 0.3,
          animationDelay: 1.8,
          reverseAnimation: false,
          enableHoverAnimation: true,
          hoverAnimationType: 'redraw',
          hoverStrokeColor: '#7DD3E8',
          initialAnimation: true,
          useStaticPath: false,
          lineType: 'artistic',
          curvature: 0.3,
          edgePadding: 50,
        },
      },
      {
        id: 'e8',
        source: 'customer-service',
        target: 'barista-certification',
        type: 'animated',
        data: {
          strokeColor: '#CC555B',
          strokeWidth: 3,
          animationDuration: 2.5,
          animationBounce: 0.3,
          animationDelay: 2.1,
          reverseAnimation: false,
          enableHoverAnimation: true,
          hoverAnimationType: 'redraw',
          hoverStrokeColor: '#E67378',
          initialAnimation: true,
          useStaticPath: false,
          lineType: 'artistic',
          curvature: 0.3,
          edgePadding: 50,
        },
      },
    ],
    defaultConfig: createLayoutConfigs({
      'latte-art': { staggerMultiplier: 0.5 },
      'barista-certification': { staggerMultiplier: 0.5 },
    }).organic,
    layoutConfigs: createLayoutConfigs({
      'latte-art': { staggerMultiplier: 0.5 },
      'barista-certification': { staggerMultiplier: 0.5 },
    }),
  },
};

// Helper functions
export const getGoal = (goalId: string): Goal | undefined => GOALS[goalId];
export const getGoalIds = (): string[] => Object.keys(GOALS);
export const DEFAULT_GOAL = GOALS.startup;
