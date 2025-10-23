import * as dagre from '@dagrejs/dagre';
import type { Node, Edge, Position } from '@xyflow/react';
import {
  strategyRegistry,
  combineStrategies,
  type LayoutConfig,
  type StaggerContext,
  type StrategyWeight
} from './layout-strategies';

// Get node dimensions based on node type
const getNodeDimensions = (node: Node): { width: number; height: number } => {
  if (node.type === 'appstore') {
    return { width: 240, height: 320 };
  }
  if (node.type === 'glass') {
    return { width: 200, height: 200 };
  }
  // Default hexagon dimensions
  return { width: 178, height: 174 };
};

export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  config: LayoutConfig
) => {
  const { dagre: dagreConfig, stagger: staggerConfig, nodeOverrides } = config;

  // Setup Dagre
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = dagreConfig.direction === 'LR' || dagreConfig.direction === 'RL';
  dagreGraph.setGraph({
    rankdir: dagreConfig.direction,
    nodesep: dagreConfig.nodeSpacing,
    ranksep: dagreConfig.rankSpacing,
    align: dagreConfig.align,
    marginx: 50,
    marginy: 50,
  });

  nodes.forEach((node) => {
    const dimensions = getNodeDimensions(node);
    dagreGraph.setNode(node.id, {
      width: dimensions.width,
      height: dimensions.height,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  // Apply layout with stagger
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const dimensions = getNodeDimensions(node);

    let xOffset = 0;
    let yOffset = 0;

    // Check for node-specific overrides
    const override = nodeOverrides?.[node.id];

    if (override?.fixedPosition) {
      return {
        ...node,
        position: override.fixedPosition,
      };
    }

    // Apply stagger strategies
    if (staggerConfig.enabled) {
      const context: StaggerContext = {
        nodes,
        edges,
        baseAmount: staggerConfig.baseAmount,
        isHorizontal,
        dagrePosition: { x: nodeWithPosition.x, y: nodeWithPosition.y },
        nodeWidth: dimensions.width,
        nodeHeight: dimensions.height,
      };

      // Get strategies from registry
      const strategyWeights: StrategyWeight[] = staggerConfig.strategies
        .map(s => ({
          strategy: strategyRegistry.get(s.name),
          weight: s.weight,
        }))
        .filter(s => s.strategy !== undefined) as StrategyWeight[];

      // Combine strategies
      const offset = combineStrategies(node, context, strategyWeights);

      // Apply node-specific multiplier
      const multiplier = override?.staggerMultiplier ?? 1.0;
      xOffset = offset.x * multiplier;
      yOffset = offset.y * multiplier;

      // Apply axis locks
      if (override?.lockAxis === 'x' || override?.lockAxis === 'both') {
        xOffset = 0;
      }
      if (override?.lockAxis === 'y' || override?.lockAxis === 'both') {
        yOffset = 0;
      }
    }

    return {
      ...node,
      targetPosition: (isHorizontal ? 'left' : 'top') as Position,
      sourcePosition: (isHorizontal ? 'right' : 'bottom') as Position,
      position: {
        x: nodeWithPosition.x - dimensions.width / 2 + xOffset,
        y: nodeWithPosition.y - dimensions.height / 2 + yOffset,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

