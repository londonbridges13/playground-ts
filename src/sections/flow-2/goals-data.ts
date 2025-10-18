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
};

// Helper functions
export const getGoal = (goalId: string): Goal | undefined => GOALS[goalId];
export const getGoalIds = (): string[] => Object.keys(GOALS);
export const DEFAULT_GOAL = GOALS.startup;
