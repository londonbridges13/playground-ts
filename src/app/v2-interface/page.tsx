'use client';

import { useState, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import { ReactFlow, ReactFlowProvider, Background, BackgroundVariant } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  UnrollingCanvas,
  CanvasReveal,
  CircularNode,
  UNROLL_ANGLES,
  UNROLL_MODES,
  type UnrollingItem,
} from 'src/sections/v2-interface';
import { SmoothCursor } from 'src/components/ui/smooth-cursor';

// ----------------------------------------------------------------------

// Node types for React Flow
const nodeTypes = {
  circular: CircularNode,
};

// Center node positioned at the center of the viewport
const INITIAL_NODES: Node[] = [
  {
    id: 'center-node',
    type: 'circular',
    position: { x: 0, y: 0 }, // Will be centered via fitView or manual calculation
    data: {
      label: 'Focus',
      description: 'Start here',
      size: 140,
      backgroundColor: '#1a1a2e',
      borderColor: 'rgba(255, 255, 255, 0.3)',
      textColor: '#ffffff',
    },
  },
];

// Dormant flag - set to true to enable unrolling animations
const ENABLE_UNROLLING = false;

export default function V2InterfacePage() {
  // Unrolling state (dormant - will activate later)
  const [items, setItems] = useState<UnrollingItem[]>([]);
  const [angle, setAngle] = useState(UNROLL_ANGLES.ANGLED);
  const [mode, setMode] = useState(UNROLL_MODES.SINGLE);

  // Memoize node types to prevent re-renders
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  // Center the node in the viewport
  const [nodes] = useState<Node[]>(() => {
    // Calculate center position (accounting for node size)
    const nodeSize = 140;
    const centerX = (typeof window !== 'undefined' ? window.innerWidth : 1920) / 2 - nodeSize / 2;
    const centerY = (typeof window !== 'undefined' ? window.innerHeight : 1080) / 2 - nodeSize / 2;

    return INITIAL_NODES.map((node) => ({
      ...node,
      position: { x: centerX, y: centerY },
    }));
  });

  // Dormant handlers - will activate later
  const handleAnimationComplete = useCallback((itemId: string) => {
    console.log(`Item ${itemId} finished unrolling`);
  }, []);

  const handleRevealComplete = useCallback(() => {
    console.log('Canvas reveal complete!');
  }, []);

  return (
    <ReactFlowProvider>
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          position: 'relative',
          cursor: 'none',
          '& *': {
            cursor: 'none !important',
          },
        }}
      >
        <SmoothCursor />

        <CanvasReveal
          enabled={ENABLE_UNROLLING}
          duration={2.0}
          delay={0.2}
          onRevealComplete={handleRevealComplete}
        >
          {/* React Flow Canvas */}
          <ReactFlow
            nodes={nodes}
            edges={[]}
            nodeTypes={memoizedNodeTypes}
            panOnScroll
            panOnScrollMode="free"
            panOnScrollSpeed={1.3}
            zoomOnScroll={false}
            zoomOnPinch
            zoomOnDoubleClick
            minZoom={0.5}
            maxZoom={2}
            preventScrolling
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(150, 150, 150, 0.5)" />
          </ReactFlow>

          {/* Three.js Unrolling Overlay (dormant) */}
          <UnrollingCanvas
            items={items}
            defaultAngle={angle}
            defaultMode={mode}
            onItemAnimationComplete={handleAnimationComplete}
          />
        </CanvasReveal>
      </Box>
    </ReactFlowProvider>
  );
}

