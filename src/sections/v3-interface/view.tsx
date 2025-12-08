'use client';

import { useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  PanOnScrollMode,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CanvasContainer } from './components/canvas-container';
import { SmoothCursor } from './components/smooth-cursor';
import { CircularNode, HexagonNode, RectangleNode } from './nodes';
import { useCenteredNodes } from './hooks/use-centered-nodes';
import { STYLE_PRESETS, MESH_GRADIENT_PRESETS } from './types';
import type { V3InterfaceProps } from './types';

// Node types - defined outside component, memoized
const nodeTypes = { circular: CircularNode, hexagon: HexagonNode, rectangle: RectangleNode };

// Demo nodes showcasing different style presets
const DEFAULT_NODES: Node[] = [
  // Center: Mesh Gradient with Grain (main showcase)
  {
    id: 'center-node',
    type: 'circular',
    position: { x: 0, y: 0 },
    data: {
      label: 'Focus',
      description: 'Mesh + Grain',
      size: 180,
      meshGradient: true,
      meshColors: MESH_GRADIENT_PRESETS.aurora,
      meshSpeed: 0.8,
      meshAmplitude: 60,
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      borderColor: 'rgba(255, 255, 255, 0.5)',
      glowEnabled: true,
      glowColor: 'rgba(167, 139, 250, 0.3)',
      glowIntensity: 'medium',
      entranceAnimation: 'pop',
      idleAnimation: 'breathe',
      hoverAnimation: 'scale',
      index: 0,
    },
  },
  // Top-left: Ocean Mesh with heavy grain
  {
    id: 'ocean-node',
    type: 'circular',
    position: { x: -280, y: -220 },
    data: {
      label: 'Ocean',
      description: '50% grain',
      size: 130,
      meshGradient: true,
      meshColors: MESH_GRADIENT_PRESETS.ocean,
      meshSpeed: 1.2,
      meshAmplitude: 40,
      grainAmount: 50,
      grainBlendMode: 'soft-light',
      borderWidth: 5,
      borderColor: 'rgba(255, 255, 255, 0.5)',
      entranceAnimation: 'scale',
      idleAnimation: 'none',
      index: 1,
    },
  },
  // Top-right: Sunset Mesh with subtle grain
  {
    id: 'sunset-node',
    type: 'circular',
    position: { x: 280, y: -220 },
    data: {
      label: 'Sunset',
      description: '15% grain',
      size: 130,
      meshGradient: true,
      meshColors: MESH_GRADIENT_PRESETS.sunset,
      meshSpeed: 0.6,
      meshAmplitude: 70,
      grainAmount: 15,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      borderColor: 'rgba(255, 255, 255, 0.5)',
      entranceAnimation: 'fade',
      hoverAnimation: 'lift',
      index: 2,
    },
  },
  // Bottom-left: Cosmic Mesh with no grain
  {
    id: 'cosmic-node',
    type: 'circular',
    position: { x: -280, y: 220 },
    data: {
      label: 'Cosmic',
      description: 'No grain',
      size: 130,
      meshGradient: true,
      meshColors: MESH_GRADIENT_PRESETS.cosmic,
      meshSpeed: 1.0,
      meshAmplitude: 50,
      grainAmount: 0,
      borderWidth: 5,
      borderColor: 'rgba(255, 255, 255, 0.5)',
      glowEnabled: true,
      glowColor: 'rgba(116, 0, 184, 0.3)',
      glowIntensity: 'subtle',
      entranceAnimation: 'float',
      idleAnimation: 'none',
      index: 3,
    },
  },
  // Bottom-right: Light Rays (Divine)
  {
    id: 'divine-node',
    type: 'circular',
    position: { x: 280, y: 220 },
    data: {
      label: 'Divine',
      description: 'Light rays',
      size: 140,
      backgroundColor: '#ffffff',
      textColor: '#1a1a2e',
      lightRays: true,
      lightRaysCount: 9,
      lightRaysColor: 'rgba(255, 180, 50, 0.7)',
      lightRaysBlur: 20,
      lightRaysSpeed: 10,
      borderWidth: 5,
      borderColor: 'rgba(255, 255, 255, 0.5)',
      entranceAnimation: 'scale',
      idleAnimation: 'breathe',
      index: 4,
    },
  },
  // Far right: Light Rays (Cool Blue)
  {
    id: 'aurora-rays-node',
    type: 'circular',
    position: { x: 0, y: 350 },
    data: {
      label: 'Aurora',
      description: 'Blue rays',
      size: 130,
      backgroundColor: '#ffffff',
      textColor: '#1a1a2e',
      lightRays: true,
      lightRaysCount: 12,
      lightRaysColor: 'rgba(50, 150, 255, 0.7)',
      lightRaysBlur: 25,
      lightRaysSpeed: 12,
      lightRaysLength: '120%',
      borderWidth: 5,
      borderColor: 'rgba(255, 255, 255, 0.5)',
      entranceAnimation: 'float',
      hoverAnimation: 'scale',
      index: 5,
    },
  },
  // ============================================
  // HEXAGON NODES with mesh gradients
  // ============================================
  // Hexagon: Emerald (Forest mesh)
  {
    id: 'hex-emerald',
    type: 'hexagon',
    position: { x: -450, y: 0 },
    data: {
      label: 'Emerald',
      index: 6,
      meshGradient: true,
      meshColors: MESH_GRADIENT_PRESETS.forest,
      meshSpeed: 0.9,
      meshAmplitude: 55,
      grainAmount: 20,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      borderColor: 'rgba(255, 255, 255, 0.5)',
      textColor: '#ffffff',
    },
  },
  // Hexagon: Ruby (Fire mesh)
  {
    id: 'hex-ruby',
    type: 'hexagon',
    position: { x: 450, y: 0 },
    data: {
      label: 'Ruby',
      index: 7,
      meshGradient: true,
      meshColors: MESH_GRADIENT_PRESETS.fire,
      meshSpeed: 1.1,
      meshAmplitude: 65,
      grainAmount: 15,
      grainBlendMode: 'soft-light',
      borderWidth: 5,
      borderColor: 'rgba(255, 255, 255, 0.5)',
      textColor: '#ffffff',
    },
  },
  // Hexagon: Sapphire (Ocean mesh)
  {
    id: 'hex-sapphire',
    type: 'hexagon',
    position: { x: -450, y: 350 },
    data: {
      label: 'Sapphire',
      index: 8,
      meshGradient: true,
      meshColors: MESH_GRADIENT_PRESETS.ocean,
      meshSpeed: 0.8,
      meshAmplitude: 50,
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      borderColor: 'rgba(255, 255, 255, 0.5)',
      textColor: '#ffffff',
    },
  },
  // Hexagon: Amethyst (Cosmic mesh)
  {
    id: 'hex-amethyst',
    type: 'hexagon',
    position: { x: 450, y: 350 },
    data: {
      label: 'Amethyst',
      index: 9,
      meshGradient: true,
      meshColors: MESH_GRADIENT_PRESETS.cosmic,
      meshSpeed: 1.0,
      meshAmplitude: 60,
      grainAmount: 18,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      borderColor: 'rgba(255, 255, 255, 0.5)',
      textColor: '#ffffff',
    },
  },
  // Hexagon: Marble (Bauhaus style)
  {
    id: 'hex-marble',
    type: 'hexagon',
    position: { x: 0, y: -350 },
    data: {
      label: 'Marble',
      index: 10,
      marbleBackground: true,
      marbleBaseColor: '#b5f4bc',
      marbleAccent1: '#fff19e',
      marbleAccent2: '#ffdc8a',
      grainAmount: 50,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#1a1a2e',
    },
  },
  // Hexagon: Magic (Image background)
  {
    id: 'hex-magic',
    type: 'hexagon',
    position: { x: -200, y: 550 },
    data: {
      label: 'Magic',
      index: 11,
      backgroundImage: '/magic-mg1.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // Hexagon: Magic 2 (Image background)
  {
    id: 'hex-magic-2',
    type: 'hexagon',
    position: { x: 200, y: 550 },
    data: {
      label: 'Magic 2',
      index: 12,
      backgroundImage: '/magic-mg2.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // ============================================
  // RECTANGLE NODES
  // ============================================
  // Rectangle: Magic 2 (Image background)
  {
    id: 'rect-magic',
    type: 'rectangle',
    position: { x: 0, y: 750 },
    data: {
      label: 'Magic Rect',
      index: 13,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/magic-mg2.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
];

function V3InterfaceViewInner({ initialNodes = DEFAULT_NODES, initialEdges = [] }: V3InterfaceProps) {
  const centeredNodes = useCenteredNodes(initialNodes);
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  return (
    <CanvasContainer>
      <SmoothCursor />
      <ReactFlow
        nodes={centeredNodes}
        edges={initialEdges}
        nodeTypes={memoizedNodeTypes}
        panOnScroll
        panOnScrollMode={PanOnScrollMode.Free}
        panOnScrollSpeed={1.3}
        zoomOnScroll={false}
        zoomOnPinch
        zoomOnDoubleClick
        minZoom={0.5}
        maxZoom={2}
        preventScrolling
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(150, 150, 150, 0.5)"
        />
      </ReactFlow>
    </CanvasContainer>
  );
}

export function V3InterfaceView(props: V3InterfaceProps) {
  return (
    <ReactFlowProvider>
      <V3InterfaceViewInner {...props} />
    </ReactFlowProvider>
  );
}

