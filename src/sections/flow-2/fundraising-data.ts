import type { Node, Edge } from '@xyflow/react';
import type { LayoutConfig } from './layout-strategies';

// ============================================================================
// $1M Fundraising Journey - 7 Milestones
// ============================================================================

export const fundraisingNodes: Node[] = [
  {
    id: 'idea',
    type: 'hexagon',
    position: { x: 0, y: 0 }, // Will be calculated by Dagre
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

export const fundraisingEdges: Edge[] = [
  {
    id: 'e-idea-mvp',
    source: 'idea',
    target: 'mvp',
    type: 'animated',
    data: {
      strokeColor: '#3b82f6', // Blue
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
      strokeColor: '#8b5cf6', // Purple
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
      strokeColor: '#10b981', // Green
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
      strokeColor: '#f59e0b', // Amber
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
      strokeColor: '#ec4899', // Pink
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
    id: 'e-revenue-seriesa',
    source: 'revenue',
    target: 'series-a-ready',
    type: 'animated',
    data: {
      strokeColor: '#06b6d4', // Cyan
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
// Layout Configurations
// ============================================================================

export const fundraisingLayoutConfigs: Record<string, LayoutConfig> = {
  // Organic layout with depth-based stagger
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
    nodeOverrides: {
      // Keep critical milestones more centered
      'product-market-fit': {
        staggerMultiplier: 0.5,
      },
      'series-a-ready': {
        staggerMultiplier: 0.5,
      },
    },
  },

  // Clean layout with minimal stagger
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

  // Dramatic stagger for visual impact
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

  // Sibling-focused for clear progression
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

  // No stagger - pure Dagre alignment
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
};

// Default config for fundraising
export const defaultFundraisingConfig = fundraisingLayoutConfigs.organic;

