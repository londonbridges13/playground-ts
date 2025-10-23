import type { Node, Edge } from '@xyflow/react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface StaggerStrategy {
  name: string;
  calculate: (node: Node, context: StaggerContext) => { x: number; y: number };
}

export interface StaggerContext {
  nodes: Node[];
  edges: Edge[];
  baseAmount: number;
  isHorizontal: boolean;
  dagrePosition: { x: number; y: number };
  nodeWidth: number;
  nodeHeight: number;
}

export interface LayoutConfig {
  dagre: {
    direction: 'TB' | 'BT' | 'LR' | 'RL';
    nodeSpacing: number;
    rankSpacing: number;
    align?: 'UL' | 'UR' | 'DL' | 'DR';
  };
  stagger: {
    enabled: boolean;
    baseAmount: number;
    strategies: Array<{
      name: string;
      weight: number;
      config?: Record<string, any>;
    }>;
  };
  nodeOverrides?: Record<string, {
    staggerMultiplier?: number;
    fixedPosition?: { x: number; y: number };
    lockAxis?: 'x' | 'y' | 'both';
  }>;
}

export interface StrategyWeight {
  strategy: StaggerStrategy;
  weight: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

export const seededRandom = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
};

export const calculateNodeDepth = (nodes: Node[], edges: Edge[]): Map<string, number> => {
  const depthMap = new Map<string, number>();
  const childrenMap = new Map<string, string[]>();
  
  // Build adjacency list
  edges.forEach(edge => {
    if (!childrenMap.has(edge.source)) {
      childrenMap.set(edge.source, []);
    }
    childrenMap.get(edge.source)!.push(edge.target);
  });
  
  // Find root nodes (nodes with no incoming edges)
  const hasIncoming = new Set(edges.map(e => e.target));
  const roots = nodes.filter(n => !hasIncoming.has(n.id));
  
  // BFS to calculate depth
  const queue: Array<{ id: string; depth: number }> = 
    roots.map(r => ({ id: r.id, depth: 0 }));
  
  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    depthMap.set(id, depth);
    
    const children = childrenMap.get(id) || [];
    children.forEach(childId => {
      queue.push({ id: childId, depth: depth + 1 });
    });
  }
  
  return depthMap;
};

export const calculateNodeDegree = (nodes: Node[], edges: Edge[]) => {
  const degreeMap = new Map<string, { in: number; out: number; total: number }>();
  
  nodes.forEach(node => {
    degreeMap.set(node.id, { in: 0, out: 0, total: 0 });
  });
  
  edges.forEach(edge => {
    const source = degreeMap.get(edge.source)!;
    const target = degreeMap.get(edge.target)!;
    
    source.out += 1;
    source.total += 1;
    target.in += 1;
    target.total += 1;
  });
  
  return degreeMap;
};

export const groupNodesByRank = (nodes: Node[], edges: Edge[]) => {
  const depthMap = calculateNodeDepth(nodes, edges);
  const rankGroups = new Map<number, string[]>();
  
  depthMap.forEach((depth, nodeId) => {
    if (!rankGroups.has(depth)) {
      rankGroups.set(depth, []);
    }
    rankGroups.get(depth)!.push(nodeId);
  });
  
  return { depthMap, rankGroups };
};

// ============================================================================
// Stagger Strategies
// ============================================================================

export const depthStrategy: StaggerStrategy = {
  name: 'depth',
  calculate: (node, context) => {
    const depthMap = calculateNodeDepth(context.nodes, context.edges);
    const depth = depthMap.get(node.id) || 0;
    const amount = context.baseAmount * (1 + depth * 0.2);
    
    return {
      x: context.isHorizontal ? (seededRandom(node.id + 'x') - 0.5) * amount * 0.2 : 0,
      y: context.isHorizontal ? (seededRandom(node.id) - 0.5) * amount * 2 : 0,
    };
  },
};

export const degreeStrategy: StaggerStrategy = {
  name: 'degree',
  calculate: (node, context) => {
    const degreeMap = calculateNodeDegree(context.nodes, context.edges);
    const degree = degreeMap.get(node.id)!;
    const amount = context.baseAmount * (1 / (1 + degree.total * 0.3));
    
    return {
      x: context.isHorizontal ? (seededRandom(node.id + 'x') - 0.5) * amount * 0.2 : 0,
      y: context.isHorizontal ? (seededRandom(node.id) - 0.5) * amount * 2 : 0,
    };
  },
};

export const typeStrategy: StaggerStrategy = {
  name: 'type',
  calculate: (node, context) => {
    const typeMultipliers: Record<string, number> = {
      hexagon: 1.0,
      glass: 0.5,
    };
    const mult = typeMultipliers[node.type as string] || 1.0;
    const amount = context.baseAmount * mult;
    
    return {
      x: context.isHorizontal ? (seededRandom(node.id + 'x') - 0.5) * amount * 0.2 : 0,
      y: context.isHorizontal ? (seededRandom(node.id) - 0.5) * amount * 2 : 0,
    };
  },
};

export const siblingStrategy: StaggerStrategy = {
  name: 'sibling',
  calculate: (node, context) => {
    const { depthMap, rankGroups } = groupNodesByRank(context.nodes, context.edges);
    const depth = depthMap.get(node.id) || 0;
    const siblings = rankGroups.get(depth) || [];
    const siblingIndex = siblings.indexOf(node.id);
    const siblingCount = siblings.length;
    
    let yValue = 0;
    if (siblingCount > 1) {
      const step = (context.baseAmount * 2) / (siblingCount - 1);
      yValue = -context.baseAmount + (siblingIndex * step);
    }
    
    return {
      x: 0,
      y: context.isHorizontal ? yValue : 0,
    };
  },
};

export const noStaggerStrategy: StaggerStrategy = {
  name: 'none',
  calculate: () => ({ x: 0, y: 0 }),
};

export const randomStrategy: StaggerStrategy = {
  name: 'random',
  calculate: (node, context) => ({
    x: context.isHorizontal ? (seededRandom(node.id + 'x') - 0.5) * context.baseAmount * 0.4 : 0,
    y: context.isHorizontal ? (seededRandom(node.id) - 0.5) * context.baseAmount * 2 : 0,
  }),
};

// ============================================================================
// Strategy Registry
// ============================================================================

export class StaggerStrategyRegistry {
  private strategies = new Map<string, StaggerStrategy>();
  
  register(strategy: StaggerStrategy) {
    this.strategies.set(strategy.name, strategy);
  }
  
  get(name: string): StaggerStrategy | undefined {
    return this.strategies.get(name);
  }
  
  list(): string[] {
    return Array.from(this.strategies.keys());
  }
}

// Global registry
export const strategyRegistry = new StaggerStrategyRegistry();
strategyRegistry.register(depthStrategy);
strategyRegistry.register(degreeStrategy);
strategyRegistry.register(typeStrategy);
strategyRegistry.register(siblingStrategy);
strategyRegistry.register(noStaggerStrategy);
strategyRegistry.register(randomStrategy);

// ============================================================================
// Strategy Combiner
// ============================================================================

export const combineStrategies = (
  node: Node,
  context: StaggerContext,
  strategies: StrategyWeight[]
): { x: number; y: number } => {
  const totalWeight = strategies.reduce((sum, s) => sum + s.weight, 0);
  
  let finalX = 0;
  let finalY = 0;
  
  strategies.forEach(({ strategy, weight }) => {
    const offset = strategy.calculate(node, context);
    const normalizedWeight = weight / totalWeight;
    finalX += offset.x * normalizedWeight;
    finalY += offset.y * normalizedWeight;
  });
  
  return { x: finalX, y: finalY };
};

