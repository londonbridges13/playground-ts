'use client';

import { useMemo } from 'react';
import type { Node } from '@xyflow/react';

interface UseCenteredNodesOptions {
  nodeSize?: number;
}

export function useCenteredNodes(
  nodes: Node[],
  options: UseCenteredNodesOptions = {}
): Node[] {
  const { nodeSize = 140 } = options;

  return useMemo(() => {
    if (typeof window === 'undefined') return nodes;

    const centerX = window.innerWidth / 2 - nodeSize / 2;
    const centerY = window.innerHeight / 2 - nodeSize / 2;

    return nodes.map((node, index) => {
      if (index === 0) {
        return { ...node, position: { x: centerX, y: centerY } };
      }
      return node;
    });
  }, [nodes, nodeSize]);
}

