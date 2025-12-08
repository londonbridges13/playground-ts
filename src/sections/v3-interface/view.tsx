'use client';

import { useMemo, useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  PanOnScrollMode,
  useReactFlow,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Box from '@mui/material/Box';

import { CanvasContainer } from './components/canvas-container';
import { SmoothCursor } from './components/smooth-cursor';
import { AnimatedList, NotificationItem } from './components/animated-list';
import { InteractiveGridPattern, calculateHoveredSquare } from './components/interactive-grid-pattern';
import { CircularNode, HexagonNode, RectangleNode } from './nodes';
import { useCenteredNodes } from './hooks/use-centered-nodes';
import { STYLE_PRESETS, MESH_GRADIENT_PRESETS } from './types';
import type { V3InterfaceProps, BackgroundType } from './types';

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
  // ============================================
  // MAGIC BORDER DEMO NODES
  // ============================================
  // Rectangle with Magic Border
  {
    id: 'rect-magic-border',
    type: 'rectangle',
    position: { x: -250, y: 750 },
    data: {
      label: 'Magic Border',
      index: 14,
      width: 180,
      height: 100,
      borderRadius: 20,
      backgroundColor: '#1a1a2e',
      magicBorder: true,
      magicGradientSize: 200,
      magicGradientFrom: '#9E7AFF',
      magicGradientTo: '#FE8BBB',
      borderWidth: 3,
      textColor: '#ffffff',
    },
  },
  // Hexagon with Magic Border
  {
    id: 'hex-magic-border',
    type: 'hexagon',
    position: { x: 0, y: 550 },
    data: {
      label: 'Magic Hex',
      index: 15,
      meshGradient: true,
      meshColors: MESH_GRADIENT_PRESETS.aurora,
      meshSpeed: 0.8,
      meshAmplitude: 50,
      grainAmount: 20,
      magicBorder: true,
      magicGradientSize: 200,
      magicGradientFrom: '#00D9FF',
      magicGradientTo: '#FF00E5',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
  // Circular with Magic Border
  {
    id: 'circle-magic-border',
    type: 'circular',
    position: { x: 250, y: 750 },
    data: {
      label: 'Magic',
      description: 'Hover me!',
      size: 120,
      meshGradient: true,
      meshColors: MESH_GRADIENT_PRESETS.cosmic,
      meshSpeed: 1.0,
      meshAmplitude: 50,
      grainAmount: 15,
      magicBorder: true,
      magicGradientSize: 180,
      magicGradientFrom: '#FFD700',
      magicGradientTo: '#FF6B6B',
      borderWidth: 3,
      entranceAnimation: 'scale',
      index: 16,
    },
  },
];

function V3InterfaceViewInner({
  initialNodes = DEFAULT_NODES,
  initialEdges = [],
  backgroundType = 'dots',
  gridSquareSize = 40,
}: V3InterfaceProps) {
  const centeredNodes = useCenteredNodes(initialNodes);
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);
  const containerRef = useRef<HTMLDivElement>(null);
  const { getViewport } = useReactFlow();

  // State for hovered grid square
  const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);

  // Handle mouse move on the pane to detect which grid square is hovered
  const handlePaneMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (backgroundType !== 'interactive-grid' || !containerRef.current) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const viewport = getViewport();
      const squareIndex = calculateHoveredSquare(
        event.clientX,
        event.clientY,
        rect,
        viewport,
        gridSquareSize
      );
      setHoveredSquare(squareIndex);
    },
    [backgroundType, getViewport, gridSquareSize]
  );

  // Clear hover when mouse leaves the pane
  const handlePaneMouseLeave = useCallback(() => {
    setHoveredSquare(null);
  }, []);

  // Render the appropriate background based on backgroundType
  const renderBackground = () => {
    switch (backgroundType) {
      case 'interactive-grid':
        return (
          <InteractiveGridPattern
            squareSize={gridSquareSize}
            strokeColor="rgba(150, 150, 150, 0.3)"
            hoverFillColor="rgba(150, 150, 150, 0.15)"
            hoveredSquare={hoveredSquare}
          />
        );
      case 'lines':
        return (
          <Background
            variant={BackgroundVariant.Lines}
            gap={gridSquareSize}
            color="rgba(150, 150, 150, 0.3)"
          />
        );
      case 'cross':
        return (
          <Background
            variant={BackgroundVariant.Cross}
            gap={gridSquareSize}
            color="rgba(150, 150, 150, 0.3)"
          />
        );
      case 'dots':
      default:
        return (
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="rgba(150, 150, 150, 1)"
          />
        );
    }
  };

  // Sample notifications for the animated list
  const notifications = [
    {
      name: 'Node Created',
      description: 'Emerald hexagon added to canvas',
      icon: '✨',
      color: '#00C9A7',
      time: 'just now',
    },
    {
      name: 'Connection Made',
      description: 'Linked Focus to Ocean node',
      icon: '🔗',
      color: '#FFB800',
      time: '2m ago',
    },
    {
      name: 'Style Applied',
      description: 'Magic border enabled on Ruby',
      icon: '🎨',
      color: '#FF3D71',
      time: '5m ago',
    },
    {
      name: 'Mesh Gradient',
      description: 'Aurora colors applied to center',
      icon: '🌈',
      color: '#9E7AFF',
      time: '8m ago',
    },
  ];

  return (
    <CanvasContainer ref={containerRef}>
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
        onPaneMouseMove={handlePaneMouseMove}
        onPaneMouseLeave={handlePaneMouseLeave}
      >
        {renderBackground()}
      </ReactFlow>

      {/* Animated List - Lower Right Corner */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 320,
          maxHeight: 400,
          overflow: 'hidden',
          zIndex: 100,
          pointerEvents: 'none',
        }}
      >
        <AnimatedList delay={1500}>
          {notifications.map((notification, idx) => (
            <NotificationItem
              key={idx}
              name={notification.name}
              description={notification.description}
              icon={notification.icon}
              color={notification.color}
              time={notification.time}
            />
          ))}
        </AnimatedList>
      </Box>
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

