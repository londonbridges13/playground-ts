'use client';

import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  PanOnScrollMode,
  useReactFlow,
  applyNodeChanges,
} from '@xyflow/react';
import type { Node, Edge, NodeChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Box from '@mui/material/Box';

import { toast, Snackbar } from 'src/components/snackbar';
import { BlurReveal, BlurFade, HyperText } from 'src/components/animate';

import { CanvasContainer } from './components/canvas-container';
import { SmoothCursor } from './components/smooth-cursor';
import { FloatingTextInput } from './components/floating-text-input';
import { FloatingChatView } from './components/floating-chat-view';
import { RecordingWaveform } from './components/recording-waveform';
import { InteractiveGridPattern, calculateHoveredSquare } from './components/interactive-grid-pattern';
import { CircularNode, HexagonNode, RectangleNode } from './nodes';
import { PulseButtonEdge, HandDrawnEdge, SmartPulseButtonEdge } from './edges';
import { useCenteredNodes, useAudioAnalyzer } from './hooks';
import { STYLE_PRESETS, MESH_GRADIENT_PRESETS } from './types';
import type { V3InterfaceProps, BackgroundType } from './types';

// Node types - defined outside component, memoized
const nodeTypes = { circular: CircularNode, hexagon: HexagonNode, rectangle: RectangleNode };

// Edge types - defined outside component, memoized
const edgeTypes = {
  pulseButton: PulseButtonEdge,
  handDrawn: HandDrawnEdge,
  smartPulseButton: SmartPulseButtonEdge,
};

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
      showFloatingHandles: true,
      handleSize: 16,
      handleColor: '#d1d5db',
      handleOffset: 10,
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
      showFloatingHandles: true,
      handleSize: 16,
      handleColor: '#d1d5db',
      handleOffset: 10,
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
  // ============================================
  // MESH FOLDER MAGIC NODES - HEXAGONS
  // ============================================
  // Hexagon: Magic 3
  {
    id: 'hex-mesh-magic-3',
    type: 'hexagon',
    position: { x: -600, y: 1000 },
    data: {
      label: 'Magic 3',
      index: 17,
      backgroundImage: '/mesh/magic3.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // Hexagon: Magic 4
  {
    id: 'hex-mesh-magic-4',
    type: 'hexagon',
    position: { x: -400, y: 1000 },
    data: {
      label: 'Magic 4',
      index: 18,
      backgroundImage: '/mesh/magic4.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // Hexagon: Magic 5
  {
    id: 'hex-mesh-magic-5',
    type: 'hexagon',
    position: { x: -200, y: 1000 },
    data: {
      label: 'Magic 5',
      index: 19,
      backgroundImage: '/mesh/magic5.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // Hexagon: Magic 6
  {
    id: 'hex-mesh-magic-6',
    type: 'hexagon',
    position: { x: 0, y: 1000 },
    data: {
      label: 'Magic 6',
      index: 20,
      backgroundImage: '/mesh/magic6.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // Hexagon: Magic 7
  {
    id: 'hex-mesh-magic-7',
    type: 'hexagon',
    position: { x: 200, y: 1000 },
    data: {
      label: 'Magic 7',
      index: 21,
      backgroundImage: '/mesh/magic7.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // Hexagon: Magic 8
  {
    id: 'hex-mesh-magic-8',
    type: 'hexagon',
    position: { x: 400, y: 1000 },
    data: {
      label: 'Magic 8',
      index: 22,
      backgroundImage: '/mesh/magic8.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // Hexagon: Magic 9
  {
    id: 'hex-mesh-magic-9',
    type: 'hexagon',
    position: { x: 600, y: 1000 },
    data: {
      label: 'Magic 9',
      index: 23,
      backgroundImage: '/mesh/magic9.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // Hexagon: Magic 10
  {
    id: 'hex-mesh-magic-10',
    type: 'hexagon',
    position: { x: -500, y: 1200 },
    data: {
      label: 'Magic 10',
      index: 24,
      backgroundImage: '/mesh/magic10.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // Hexagon: Magic 11
  {
    id: 'hex-mesh-magic-11',
    type: 'hexagon',
    position: { x: -250, y: 1200 },
    data: {
      label: 'Magic 11',
      index: 25,
      backgroundImage: '/mesh/magic11.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // Hexagon: Magic 12
  {
    id: 'hex-mesh-magic-12',
    type: 'hexagon',
    position: { x: 0, y: 1200 },
    data: {
      label: 'Magic 12',
      index: 26,
      backgroundImage: '/mesh/magic12.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // ============================================
  // MESH FOLDER MAGIC NODES - RECTANGLES
  // ============================================
  // Rectangle: Magic 3
  {
    id: 'rect-mesh-magic-3',
    type: 'rectangle',
    position: { x: -600, y: 1450 },
    data: {
      label: 'Magic Rect 3',
      index: 27,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/mesh/magic3.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
  // Rectangle: Magic 4
  {
    id: 'rect-mesh-magic-4',
    type: 'rectangle',
    position: { x: -380, y: 1450 },
    data: {
      label: 'Magic Rect 4',
      index: 28,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/mesh/magic4.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
  // Rectangle: Magic 5
  {
    id: 'rect-mesh-magic-5',
    type: 'rectangle',
    position: { x: -160, y: 1450 },
    data: {
      label: 'Magic Rect 5',
      index: 29,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/mesh/magic5.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
  // Rectangle: Magic 6
  {
    id: 'rect-mesh-magic-6',
    type: 'rectangle',
    position: { x: 60, y: 1450 },
    data: {
      label: 'Magic Rect 6',
      index: 30,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/mesh/magic6.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
  // Rectangle: Magic 7
  {
    id: 'rect-mesh-magic-7',
    type: 'rectangle',
    position: { x: 280, y: 1450 },
    data: {
      label: 'Magic Rect 7',
      index: 31,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/mesh/magic7.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
  // Rectangle: Magic 8
  {
    id: 'rect-mesh-magic-8',
    type: 'rectangle',
    position: { x: 500, y: 1450 },
    data: {
      label: 'Magic Rect 8',
      index: 32,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/mesh/magic8.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
  // Rectangle: Magic 9
  {
    id: 'rect-mesh-magic-9',
    type: 'rectangle',
    position: { x: -500, y: 1600 },
    data: {
      label: 'Magic Rect 9',
      index: 33,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/mesh/magic9.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
  // Rectangle: Magic 10
  {
    id: 'rect-mesh-magic-10',
    type: 'rectangle',
    position: { x: -280, y: 1600 },
    data: {
      label: 'Magic Rect 10',
      index: 34,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/mesh/magic10.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
  // Rectangle: Magic 11
  {
    id: 'rect-mesh-magic-11',
    type: 'rectangle',
    position: { x: -60, y: 1600 },
    data: {
      label: 'Magic Rect 11',
      index: 35,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/mesh/magic11.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
  // Rectangle: Magic 12
  {
    id: 'rect-mesh-magic-12',
    type: 'rectangle',
    position: { x: 160, y: 1600 },
    data: {
      label: 'Magic Rect 12',
      index: 36,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/mesh/magic12.png',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
  // ============================================
  // PATTERN OVERLAY NODES - HEXAGONS
  // ============================================
  // Hexagon Pattern: Magic 3
  {
    id: 'hex-pattern-magic-3',
    type: 'hexagon',
    position: { x: -600, y: 1850 },
    data: {
      label: 'Pattern 3',
      index: 37,
      backgroundImage: '/mesh/magic3.png',
      patternOverlay: '/node-patterns/pattern-2.svg',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // Hexagon Pattern: Magic 4
  {
    id: 'hex-pattern-magic-4',
    type: 'hexagon',
    position: { x: -400, y: 1850 },
    data: {
      label: 'Pattern 4',
      index: 38,
      backgroundImage: '/mesh/magic4.png',
      patternOverlay: '/node-patterns/pattern-2.svg',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // Hexagon Pattern: Magic 5
  {
    id: 'hex-pattern-magic-5',
    type: 'hexagon',
    position: { x: -200, y: 1850 },
    data: {
      label: 'Pattern 5',
      index: 39,
      backgroundImage: '/mesh/magic5.png',
      patternOverlay: '/node-patterns/pattern-2.svg',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // Hexagon Pattern: Magic 6
  {
    id: 'hex-pattern-magic-6',
    type: 'hexagon',
    position: { x: 0, y: 1850 },
    data: {
      label: 'Pattern 6',
      index: 40,
      backgroundImage: '/mesh/magic6.png',
      patternOverlay: '/node-patterns/pattern-2.svg',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // Hexagon Pattern: Magic 7
  {
    id: 'hex-pattern-magic-7',
    type: 'hexagon',
    position: { x: 200, y: 1850 },
    data: {
      label: 'Pattern 7',
      index: 41,
      backgroundImage: '/mesh/magic7.png',
      patternOverlay: '/node-patterns/pattern-2.svg',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // Hexagon Pattern: Magic 8
  {
    id: 'hex-pattern-magic-8',
    type: 'hexagon',
    position: { x: 400, y: 1850 },
    data: {
      label: 'Pattern 8',
      index: 42,
      backgroundImage: '/mesh/magic8.png',
      patternOverlay: '/node-patterns/pattern-2.svg',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // Hexagon Pattern: Magic 9
  {
    id: 'hex-pattern-magic-9',
    type: 'hexagon',
    position: { x: 600, y: 1850 },
    data: {
      label: 'Pattern 9',
      index: 43,
      backgroundImage: '/mesh/magic9.png',
      patternOverlay: '/node-patterns/pattern-2.svg',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // Hexagon Pattern: Magic 10
  {
    id: 'hex-pattern-magic-10',
    type: 'hexagon',
    position: { x: -500, y: 2050 },
    data: {
      label: 'Pattern 10',
      index: 44,
      backgroundImage: '/mesh/magic10.png',
      patternOverlay: '/node-patterns/pattern-2.svg',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // Hexagon Pattern: Magic 11
  {
    id: 'hex-pattern-magic-11',
    type: 'hexagon',
    position: { x: -250, y: 2050 },
    data: {
      label: 'Pattern 11',
      index: 45,
      backgroundImage: '/mesh/magic11.png',
      patternOverlay: '/node-patterns/pattern-2.svg',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // Hexagon Pattern: Magic 12
  {
    id: 'hex-pattern-magic-12',
    type: 'hexagon',
    position: { x: 0, y: 2050 },
    data: {
      label: 'Pattern 12',
      index: 46,
      backgroundImage: '/mesh/magic12.png',
      patternOverlay: '/node-patterns/pattern-2.svg',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 5,
      textColor: '#ffffff',
    },
  },
  // ============================================
  // PATTERN OVERLAY NODES - RECTANGLES
  // ============================================
  // Rectangle Pattern: Magic 3
  {
    id: 'rect-pattern-magic-3',
    type: 'rectangle',
    position: { x: -600, y: 2300 },
    data: {
      label: 'Pattern Rect 3',
      index: 47,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/mesh/magic3.png',
      patternOverlay: '/node-patterns/pattern-2.svg',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
  // Rectangle Pattern: Magic 4
  {
    id: 'rect-pattern-magic-4',
    type: 'rectangle',
    position: { x: -380, y: 2300 },
    data: {
      label: 'Pattern Rect 4',
      index: 48,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/mesh/magic4.png',
      patternOverlay: '/node-patterns/pattern-2.svg',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
  // Rectangle Pattern: Magic 5
  {
    id: 'rect-pattern-magic-5',
    type: 'rectangle',
    position: { x: -160, y: 2300 },
    data: {
      label: 'Pattern Rect 5',
      index: 49,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/mesh/magic5.png',
      patternOverlay: '/node-patterns/pattern-2.svg',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
  // Rectangle Pattern: Magic 6
  {
    id: 'rect-pattern-magic-6',
    type: 'rectangle',
    position: { x: 60, y: 2300 },
    data: {
      label: 'Pattern Rect 6',
      index: 50,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/mesh/magic6.png',
      patternOverlay: '/node-patterns/pattern-2.svg',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
  // Rectangle Pattern: Magic 7
  {
    id: 'rect-pattern-magic-7',
    type: 'rectangle',
    position: { x: 280, y: 2300 },
    data: {
      label: 'Pattern Rect 7',
      index: 51,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/mesh/magic7.png',
      patternOverlay: '/node-patterns/pattern-2.svg',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
  // Rectangle Pattern: Magic 8
  {
    id: 'rect-pattern-magic-8',
    type: 'rectangle',
    position: { x: 500, y: 2300 },
    data: {
      label: 'Pattern Rect 8',
      index: 52,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/mesh/magic8.png',
      patternOverlay: '/node-patterns/pattern-2.svg',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
  // Rectangle Pattern: Magic 9
  {
    id: 'rect-pattern-magic-9',
    type: 'rectangle',
    position: { x: -500, y: 2450 },
    data: {
      label: 'Pattern Rect 9',
      index: 53,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/mesh/magic9.png',
      patternOverlay: '/node-patterns/pattern-2.svg',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
  // Rectangle Pattern: Magic 10
  {
    id: 'rect-pattern-magic-10',
    type: 'rectangle',
    position: { x: -280, y: 2450 },
    data: {
      label: 'Pattern Rect 10',
      index: 54,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/mesh/magic10.png',
      patternOverlay: '/node-patterns/pattern-2.svg',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
  // Rectangle Pattern: Magic 11
  {
    id: 'rect-pattern-magic-11',
    type: 'rectangle',
    position: { x: -60, y: 2450 },
    data: {
      label: 'Pattern Rect 11',
      index: 55,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/mesh/magic11.png',
      patternOverlay: '/node-patterns/pattern-2.svg',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
  // Rectangle Pattern: Magic 12
  {
    id: 'rect-pattern-magic-12',
    type: 'rectangle',
    position: { x: 160, y: 2450 },
    data: {
      label: 'Pattern Rect 12',
      index: 56,
      width: 200,
      height: 120,
      borderRadius: 16,
      backgroundImage: '/mesh/magic12.png',
      patternOverlay: '/node-patterns/pattern-2.svg',
      grainAmount: 25,
      grainBlendMode: 'overlay',
      borderWidth: 4,
      textColor: '#ffffff',
    },
  },
];

// Demo edges showcasing dotted button edge
const DEFAULT_EDGES: Edge[] = [
  {
    id: 'e-magic-to-magic2',
    source: 'hex-magic',
    target: 'hex-magic-2',
    sourceHandle: 'right',
    targetHandle: 'left',
    type: 'smartPulseButton',
    data: {
      strokeColor: 'rgba(158, 122, 255, 0.8)',
      strokeWidth: 2.5,
      dashArray: '6 8',
      buttonIcon: 'eva:link-2-fill',
      buttonSize: 30,
      buttonColor: '#ffffff',
      buttonBgColor: 'rgba(158, 122, 255, 0.9)',
      nodePadding: 20,
      gridRatio: 10,
      handleOffset: 10,
    },
  },
];

function V3InterfaceViewInner({
  initialNodes = DEFAULT_NODES,
  initialEdges = DEFAULT_EDGES,
  backgroundType = 'dots',
  gridSquareSize = 40,
}: V3InterfaceProps) {
  const baseCenteredNodes = useCenteredNodes(initialNodes);
  const [nodes, setNodes] = useState<Node[]>(baseCenteredNodes);
  const [edges] = useState<Edge[]>(initialEdges);
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);
  const memoizedEdgeTypes = useMemo(() => edgeTypes, []);
  const containerRef = useRef<HTMLDivElement>(null);
  const { getViewport } = useReactFlow();

  // Update nodes when baseCenteredNodes changes
  useEffect(() => {
    setNodes(baseCenteredNodes);
  }, [baseCenteredNodes]);

  // Handle node changes (dragging, selecting, etc.)
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  // State for hovered grid square
  const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);

  // State for status label: 'idle' | 'working' | 'transitioning' | 'done' | 'deleting'
  const [status, setStatus] = useState<'idle' | 'working' | 'transitioning' | 'done' | 'deleting'>('idle');
  // State to trigger deletion of "Done" text
  const [triggerDoneDelete, setTriggerDoneDelete] = useState(false);
  // Text for HyperText component
  const [statusText, setStatusText] = useState('Working...');
  // Current step in the transition sequence
  const transitionStepRef = useRef(0);

  // State for floating chat view
  const [chatOpen, setChatOpen] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState<string | null>(null);

  // State for recording status: 'idle' | 'recording' | 'paused' | 'fading'
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'paused' | 'fading'>('idle');
  // Text for recording HyperText component
  const [recordingText, setRecordingText] = useState('Recording ...');
  // Whether recording indicator is in initial reveal state
  const [recordingRevealing, setRecordingRevealing] = useState(false);
  // Trigger for paused fade-out
  const [triggerPausedFade, setTriggerPausedFade] = useState(false);
  // Ref for paused timeout
  const pausedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Audio analyzer for voice-reactive waveform
  const { audioLevels, start: startAudioAnalyzer, stop: stopAudioAnalyzer } = useAudioAnalyzer({
    bandCount: 32,
    updateInterval: 50,
  });

  // Intermediate text steps from "Researching ..." to "Done"
  // Uses random characters for shrinking transition
  const TRANSITION_STEPS = useMemo(() => {
    const generateRandomString = (length: number) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    const steps = ['Researching ...'];  // Start (16 chars)
    // Generate random strings from length 15 down to 4
    for (let len = 15; len >= 4; len--) {
      steps.push(generateRandomString(len));
    }
    steps.push('Done');  // End (4 chars)
    return steps;
  }, []);

  // Time between each step in milliseconds
  const STEP_DURATION = 150;

  // Handle sending a message - triggers shine effect on all nodes and opens chat view
  const handleSendMessage = useCallback((message: string) => {
    // Open the floating chat view with the initial message
    setInitialChatMessage(message);
    setChatOpen(true);

    // Reset states for new message
    setTriggerDoneDelete(false);
    setStatusText('Researching ...');
    transitionStepRef.current = 0;

    // Immediately show "Working..." label
    setStatus('working');

    // Trigger shine on all nodes
    setNodes(currentNodes =>
      currentNodes.map(n => ({
        ...n,
        data: { ...n.data, shine: true },
      }))
    );

    // Reset shine after animation completes
    setTimeout(() => {
      setNodes(currentNodes =>
        currentNodes.map(n => ({
          ...n,
          data: { ...n.data, shine: false },
        }))
      );
    }, 1000);

    // Delay toast by 1.5 seconds, then start transition sequence
    setTimeout(() => {
      toast.info('Message sent', { description: message });
      setStatus('transitioning');
      // Start stepping through intermediate texts
      transitionStepRef.current = 1;
      setStatusText(TRANSITION_STEPS[1]);
    }, 1500);
  }, [TRANSITION_STEPS]);

  // Handle closing the chat view
  const handleChatClose = useCallback(() => {
    setChatOpen(false);
    setInitialChatMessage(null);
  }, []);

  // Handle when HyperText completes each step - advance to next step
  const handleHyperTextComplete = useCallback(() => {
    const nextStep = transitionStepRef.current + 1;

    if (nextStep < TRANSITION_STEPS.length) {
      // Move to next intermediate step
      transitionStepRef.current = nextStep;
      setStatusText(TRANSITION_STEPS[nextStep]);
    } else {
      // All steps complete, we're at "Done"
      setStatus('done');
      // After a pause, start deleting
      setTimeout(() => {
        setStatus('deleting');
        setTriggerDoneDelete(true);
      }, 800);
    }
  }, [TRANSITION_STEPS]);

  // Handle when "Done" deletion is complete - reset to idle
  const handleDoneDeleteComplete = useCallback(() => {
    setStatus('idle');
    setTriggerDoneDelete(false);
    setStatusText('Working...');
  }, []);

  // Handle mic button click - toggle between recording states
  const handleMicClick = useCallback(() => {
    // Clear any existing paused timeout
    if (pausedTimeoutRef.current) {
      clearTimeout(pausedTimeoutRef.current);
      pausedTimeoutRef.current = null;
    }

    if (recordingStatus === 'idle' || recordingStatus === 'fading') {
      // Start recording - show with BlurReveal and start audio analyzer
      setTriggerPausedFade(false);
      setRecordingRevealing(true);
      setRecordingText('Recording ...');
      setRecordingStatus('recording');
      startAudioAnalyzer();
    } else if (recordingStatus === 'recording') {
      // Pause recording - use HyperText transition and stop audio analyzer
      setRecordingRevealing(false);
      setRecordingText('Paused');
      setRecordingStatus('paused');
      stopAudioAnalyzer();
      // Start 3-second timer to fade out
      pausedTimeoutRef.current = setTimeout(() => {
        setRecordingStatus('fading');
        setTriggerPausedFade(true);
      }, 3000);
    } else if (recordingStatus === 'paused') {
      // Resume recording - use HyperText transition and restart audio analyzer
      setRecordingRevealing(false);
      setRecordingText('Recording ...');
      setRecordingStatus('recording');
      startAudioAnalyzer();
    }
  }, [recordingStatus, startAudioAnalyzer, stopAudioAnalyzer]);

  // Handle when paused fade-out is complete - reset to idle
  const handlePausedFadeComplete = useCallback(() => {
    setRecordingStatus('idle');
    setTriggerPausedFade(false);
    setRecordingText('Recording ...');
    stopAudioAnalyzer();
  }, [stopAudioAnalyzer]);

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

  // Demo: Show sample toast notifications on mount
  useEffect(() => {
    // Stagger the toasts for demo effect
    const timeouts: NodeJS.Timeout[] = [];

    timeouts.push(
      setTimeout(() => {
        toast.success('Node Created', {
          description: 'Emerald hexagon added to canvas',
        });
      }, 1000)
    );

    timeouts.push(
      setTimeout(() => {
        toast.info('Connection Made', {
          description: 'Linked Focus to Ocean node',
        });
      }, 2500)
    );

    timeouts.push(
      setTimeout(() => {
        toast.warning('Style Applied', {
          description: 'Magic border enabled on Ruby',
        });
      }, 4000)
    );

    timeouts.push(
      setTimeout(() => {
        toast.message('Mesh Gradient', {
          description: 'Aurora colors applied to center',
        });
      }, 5500)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <CanvasContainer ref={containerRef}>
      <SmoothCursor />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={memoizedNodeTypes}
        edgeTypes={memoizedEdgeTypes}
        onNodesChange={onNodesChange}
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

      {/* Floating Text Input - Bottom Center */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 600,
          px: 2,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        {/* Status Label - above input */}
        {/* Working state: BlurReveal with indicator inside */}
        {status === 'working' && (
          <BlurReveal duration={800} blur={8} sx={{ mb: 1.5, ml: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="span"
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.9375rem',
                  color: '#9ca3af',
                  letterSpacing: '0.02em',
                }}
              >
                Researching ...
              </Box>
              <Box
                component="span"
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#17A0EF',
                  animation: 'popIn 0.3s ease-out forwards, pulse 1.2s ease-in-out 0.3s infinite',
                  '@keyframes popIn': {
                    '0%': {
                      transform: 'scale(0.4)',
                      opacity: 0,
                    },
                    '100%': {
                      transform: 'scale(1.15)',
                      opacity: 1,
                    },
                  },
                  '@keyframes pulse': {
                    '0%, 100%': {
                      transform: 'scale(1.15)',
                      opacity: 1,
                    },
                    '50%': {
                      transform: 'scale(0.85)',
                      opacity: 0.7,
                    },
                  },
                }}
              />
            </Box>
          </BlurReveal>
        )}

        {/* Transitioning/Done state: Persistent indicator with smooth color transition */}
        {(status === 'transitioning' || status === 'done') && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, ml: 1 }}>
            <HyperText
              duration={20}
              delay={0}
              animateOnHover={false}
              onAnimationComplete={status === 'transitioning' ? handleHyperTextComplete : undefined}
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.9375rem',
                color: '#9ca3af',
                letterSpacing: '0.02em',
              }}
            >
              {statusText}
            </HyperText>
            <Box
              component="span"
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: statusText === 'Done' ? '#4ADE80' : '#17A0EF',
                animation: statusText !== 'Done' ? 'pulse 1.2s ease-in-out infinite' : 'none',
                transition: 'background-color 0.5s ease',
                '@keyframes pulse': {
                  '0%, 100%': {
                    transform: 'scale(1.15)',
                    opacity: 1,
                  },
                  '50%': {
                    transform: 'scale(0.85)',
                    opacity: 0.7,
                  },
                },
              }}
            />
          </Box>
        )}

        {/* Deleting state: BlurFade with indicator inside */}
        {status === 'deleting' && (
          <BlurFade
            trigger={triggerDoneDelete}
            duration={500}
            blur={8}
            onComplete={handleDoneDeleteComplete}
            sx={{ mb: 1.5, ml: 1 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="span"
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.9375rem',
                  color: '#9ca3af',
                  letterSpacing: '0.02em',
                }}
              >
                Done
              </Box>
              <Box
                component="span"
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#4ADE80',
                }}
              />
            </Box>
          </BlurFade>
        )}

        {/* Recording Status Label - above input */}
        {/* Stable wrapper for waveform positioning */}
        {recordingStatus !== 'idle' && (
          <Box sx={{ position: 'relative', width: '100%', mb: 1.5, ml: 1, pr: 1, minHeight: 24 }}>
            {/* Initial recording state: BlurReveal with indicator on LEFT */}
            {recordingStatus === 'recording' && recordingRevealing && (
              <BlurReveal duration={800} blur={8} sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    component="span"
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: '#EF4444',
                      animation: 'popIn 0.3s ease-out forwards, pulse 1.2s ease-in-out 0.3s infinite',
                      '@keyframes popIn': {
                        '0%': {
                          transform: 'scale(0.4)',
                          opacity: 0,
                        },
                        '100%': {
                          transform: 'scale(1.15)',
                          opacity: 1,
                        },
                      },
                      '@keyframes pulse': {
                        '0%, 100%': {
                          transform: 'scale(1.15)',
                          opacity: 1,
                        },
                        '50%': {
                          transform: 'scale(0.85)',
                          opacity: 0.7,
                        },
                      },
                    }}
                  />
                  <Box
                    component="span"
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.9375rem',
                      color: '#9ca3af',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Recording ...
                  </Box>
                </Box>
              </BlurReveal>
            )}

            {/* Recording/Paused transitioning state: HyperText with indicator on LEFT */}
            {(recordingStatus === 'recording' || recordingStatus === 'paused') && !recordingRevealing && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  component="span"
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: recordingStatus === 'recording' ? '#EF4444' : '#9ca3af',
                    animation: recordingStatus === 'recording' ? 'pulse 1.2s ease-in-out infinite' : 'none',
                    transition: 'background-color 0.5s ease',
                    '@keyframes pulse': {
                      '0%, 100%': {
                        transform: 'scale(1.15)',
                        opacity: 1,
                      },
                      '50%': {
                        transform: 'scale(0.85)',
                        opacity: 0.7,
                      },
                    },
                  }}
                />
                <HyperText
                  duration={300}
                  delay={0}
                  animateOnHover={false}
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.9375rem',
                    color: '#9ca3af',
                    letterSpacing: '0.02em',
                  }}
                >
                  {recordingText}
                </HyperText>
              </Box>
            )}

            {/* Fading state: BlurFade for paused fade-out */}
            {recordingStatus === 'fading' && (
              <BlurFade
                trigger={triggerPausedFade}
                duration={500}
                blur={8}
                onComplete={handlePausedFadeComplete}
                sx={{ width: '100%' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    component="span"
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: '#9ca3af',
                    }}
                  />
                  <Box
                    component="span"
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.9375rem',
                      color: '#9ca3af',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Paused
                  </Box>
                </Box>
              </BlurFade>
            )}

            {/* SINGLE waveform instance - always positioned to the right of stable wrapper */}
            <RecordingWaveform
              isAnimating={recordingStatus === 'recording'}
              isFading={recordingStatus === 'fading'}
              audioLevels={audioLevels}
            />
          </Box>
        )}

        <FloatingTextInput
          onSend={handleSendMessage}
          onMicClick={handleMicClick}
          recordingStatus={recordingStatus}
        />

        {/* Floating Chat View */}
        <FloatingChatView
          open={chatOpen}
          onClose={handleChatClose}
          initialMessage={initialChatMessage}
          contextTitle="V3 Interface"
          contextSubtitle="localhost"
        />
      </Box>

      {/* Snackbar Toast Container - Bottom Right Corner */}
      <Snackbar position="bottom-right" />
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

