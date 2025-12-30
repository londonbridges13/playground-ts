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
  applyEdgeChanges,
  addEdge,
  ConnectionLineType,
  ConnectionMode,
} from '@xyflow/react';
import type { Node, Edge, NodeChange, EdgeChange, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import Box from '@mui/material/Box';

import { toast, Snackbar } from 'src/components/snackbar';
import { migrateFocusInterface, needsMigration, getInterfaceVersion, CURRENT_SCHEMA_VERSION } from 'src/utils/focus-interface-migration';
import { BlurReveal, BlurFade, HyperText, TextGenerateEffect } from 'src/components/animate';
import { useAuthContext } from 'src/auth/hooks';
import { focusInterfaceAPI } from 'src/lib/api/focus-interface';
import { useRouter, usePathname } from 'src/routes/hooks';

import { CanvasContainer } from './components/canvas-container';
import { SmoothCursor } from './components/smooth-cursor';
import { FloatingTextInput } from './components/floating-text-input';
import { FloatingChatView } from './components/floating-chat-view';
import { FloatingNodeForm } from './components/floating-node-form';
import { RecordingWaveform } from './components/recording-waveform';
import { InteractiveGridPattern, calculateHoveredSquare } from './components/interactive-grid-pattern';
import { V3AppStoreDialog } from './components/v3-appstore-dialog';
import { LoadInterfaceDialog } from './components/load-interface-dialog';
import { SearchDrawer } from './components/search-drawer';
import { EditFocusDialog } from './components/edit-focus-dialog';
import { DeleteFocusDialog } from './components/delete-focus-dialog';
import { RenameSnackbar } from './components/rename-snackbar';
import { CreateNodeSnackbar } from './components/create-node-snackbar';
import { RequestLoadingSnackbar } from './components/request-loading-snackbar';
import { ResponseSnackbar } from './components/response-snackbar';
import { ApprovalSnackbar } from './components/approval-snackbar';
import { ObjectCreatedSnackbar } from './components/object-created-snackbar';
import { RequestErrorSnackbar } from './components/request-error-snackbar';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import {
  CircularNode,
  HexagonNode,
  RectangleNode,
  DiamondNode,
  OvalNode,
  PillNode,
  TriangleNode,
  PentagonNode,
  OctagonNode,
  StarNode,
  CloudNode,
} from './nodes';
import { PulseButtonEdge, HandDrawnEdge, SmartPulseButtonEdge } from './edges';
import { useCenteredNodes, useAudioAnalyzer, useRequest, useFocus, useUpdateFocus, useConnectNodes, useDisconnectNodes, useFocusEdgeSocket, useNodePositionSync, useFocusPositionSocket, useDeleteBasis, useDeleteFocus, useRemoveBasisFromFocus, useFocusRequestSocket } from './hooks';
import type { CreatedBasis } from './hooks';
import { V3InterfaceProvider, useV3Interface } from './context';
import { STYLE_PRESETS, MESH_GRADIENT_PRESETS } from './types';
import type { V3InterfaceProps, BackgroundType, NodeFormData } from './types';

// Node types - defined outside component, memoized
const nodeTypes = {
  circular: CircularNode,
  hexagon: HexagonNode,
  rectangle: RectangleNode,
  diamond: DiamondNode,
  oval: OvalNode,
  pill: PillNode,
  triangle: TriangleNode,
  pentagon: PentagonNode,
  octagon: OctagonNode,
  star: StarNode,
  cloud: CloudNode,
};

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
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);
  const memoizedEdgeTypes = useMemo(() => edgeTypes, []);
  const containerRef = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  const { getViewport } = reactFlowInstance;

  // V3 Interface Context - Focus, Context, Request state
  const { focus, context, isLoading: isSubmitting, setFocus, setContext, setInterface } = useV3Interface();
  const { submitRequest } = useRequest();

  // Focus loading hook (2.6)
  const { loadFocus, loading: focusLoading } = useFocus();

  // Auth context for user ID
  const { user } = useAuthContext();

  // Router for navigation
  const router = useRouter();
  const pathname = usePathname();

  // Update nodes when baseCenteredNodes changes
  useEffect(() => {
    setNodes(baseCenteredNodes);
  }, [baseCenteredNodes]);

  // Hook for updating focus
  const { updateFocus, loading: updateFocusLoading } = useUpdateFocus();

  // Hook for auto-saving node positions (Task 4.1)
  const { queuePositionUpdate, forceSave: forceSavePositions } = useNodePositionSync({
    focusId: focus?.id || null,
    debounceMs: 500,
    onSaveComplete: (updated, failed) => {
      if (failed > 0) {
        console.warn(`[useNodePositionSync] ${failed} position updates failed`);
      }
    },
    onSaveError: (error) => {
      console.error('[useNodePositionSync] Save error:', error);
    },
  });

  // Handle node changes (dragging, selecting, etc.) with position auto-save
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Apply changes to local state first
      setNodes((nds) => applyNodeChanges(changes, nds));

      // Queue position updates when drag ends (Task 4.1)
      changes.forEach((change) => {
        if (
          change.type === 'position' &&
          'position' in change &&
          change.position &&
          'dragging' in change &&
          !change.dragging // Only save when drag ends
        ) {
          queuePositionUpdate(change.id, change.position);
        }
      });
    },
    [queuePositionUpdate]
  );

  // Handle edge changes (deletion, selection, etc.)
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // Hooks for connecting/disconnecting nodes (Task 4)
  const { connectNodes, loading: connectLoading } = useConnectNodes();
  const { disconnectByEdgeId, loading: disconnectLoading } = useDisconnectNodes();

  // Hooks for deleting focus/basis (Task 4.2)
  const { deleteBasis, loading: deleteBasisLoading } = useDeleteBasis();
  const { deleteFocus, loading: deleteFocusLoading } = useDeleteFocus();
  const { removeBasisFromFocus, loading: removeBasisLoading } = useRemoveBasisFromFocus();

  // Handle new connections between nodes
  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      // Default edge styling
      const edgeData = {
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
      };

      // Optimistically add edge to local state
      const tempEdgeId = `temp-${connection.source}-${connection.target}-${Date.now()}`;
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: tempEdgeId,
            type: 'smartPulseButton',
            data: edgeData,
          },
          eds
        )
      );

      // If we have a focus ID, persist to backend
      if (focus?.id) {
        try {
          const result = await connectNodes(focus.id, {
            sourceNodeId: connection.source,
            targetNodeId: connection.target,
            sourceHandle: connection.sourceHandle || undefined,
            targetHandle: connection.targetHandle || undefined,
            edgeType: 'smartPulseButton',
            relationship: {
              type: 'sequence',
              direction: 'forward',
            },
            styling: {
              strokeColor: edgeData.strokeColor,
              strokeWidth: edgeData.strokeWidth,
            },
          });

          if (result) {
            // Replace temp edge with the real edge from backend
            setEdges((eds) =>
              eds.map((e) =>
                e.id === tempEdgeId
                  ? { ...e, id: result.id, data: { ...e.data, ...result.data } }
                  : e
              )
            );
            console.log('[onConnect] Edge persisted to backend:', result.id);
          }
        } catch (err) {
          console.error('[onConnect] Failed to persist edge:', err);
          // Keep the local edge even if backend fails - user can retry
          toast.error('Failed to save connection', {
            description: 'The connection was created locally but could not be saved to the server.',
          });
        }
      }
    },
    [focus?.id, connectNodes]
  );

  // State for App Store dialog
  const [appStoreDialogOpen, setAppStoreDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // State for Load Interface dialog
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);

  // State for Edit Focus dialog
  const [editFocusDialogOpen, setEditFocusDialogOpen] = useState(false);

  // State for Delete Focus dialog (Task 4.2)
  const [deleteFocusDialogOpen, setDeleteFocusDialogOpen] = useState(false);

  // Socket hook for real-time edge updates (Task 4)
  useFocusEdgeSocket({
    focusId: focus?.id || null,
    onEdgeConnected: useCallback((edge: { id: string; source: string; target: string; type?: string; data?: Record<string, unknown> }) => {
      console.log('[useFocusEdgeSocket] Edge connected from socket:', edge);
      // Add edge if it doesn't already exist (avoid duplicates from our own actions)
      setEdges((eds) => {
        const exists = eds.some((e) => e.id === edge.id);
        if (exists) return eds;
        return [...eds, {
          ...edge,
          type: edge.type || 'smartPulseButton',
          data: edge.data || {
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
        }];
      });
    }, []),
    onEdgeDisconnected: useCallback((edgeId: string) => {
      console.log('[useFocusEdgeSocket] Edge disconnected from socket:', edgeId);
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    }, []),
    onEdgeUpdated: useCallback((edge: { id: string; source: string; target: string; type?: string; data?: Record<string, unknown> }) => {
      console.log('[useFocusEdgeSocket] Edge updated from socket:', edge);
      setEdges((eds) => eds.map((e) => e.id === edge.id ? { ...e, ...edge } : e));
    }, []),
  });

  // Socket hook for real-time node position updates from other users (Task 4.1)
  useFocusPositionSocket({
    focusId: focus?.id || null,
    onPositionsUpdated: useCallback((positions: Array<{ nodeId: string; position: { x: number; y: number } }>) => {
      console.log('[useFocusPositionSocket] Positions updated from socket:', positions);
      setNodes((nds) =>
        nds.map((node) => {
          const update = positions.find((p) => p.nodeId === node.id);
          if (update) {
            return { ...node, position: update.position };
          }
          return node;
        })
      );
    }, []),
  });

  // Handle node double-click to open App Store dialog
  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setAppStoreDialogOpen(true);
  }, []);

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
  // State for "New Focus" label (shows for 3 seconds after creating new focus)
  const [showNewFocusLabel, setShowNewFocusLabel] = useState(false);
  const newFocusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State for rename snackbar (shows after creating new focus)
  const [renameSnackbar, setRenameSnackbar] = useState<{
    open: boolean;
    focusId: string;
    currentTitle: string;
  }>({ open: false, focusId: '', currentTitle: '' });

  // State for Focus Request snackbars (Task 3)
  const [showLoadingSnackbar, setShowLoadingSnackbar] = useState(false);
  const [showResponseSnackbar, setShowResponseSnackbar] = useState(false);
  const [showApprovalSnackbar, setShowApprovalSnackbar] = useState(false);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [currentCreatedBasis, setCurrentCreatedBasis] = useState<CreatedBasis | null>(null);
  const [showObjectCreatedSnackbar, setShowObjectCreatedSnackbar] = useState(false);
  const [lastRequestInput, setLastRequestInput] = useState<string>('');

  // Focus Request Socket Hook (Task 3)
  const {
    connected: requestSocketConnected,
    requestState,
    pendingBatch,
    createdBases,
    sendRequest: sendFocusRequest,
    approveBatch,
    rejectBatch,
    resetRequestState,
    clearPendingBatch,
    clearCreatedBases,
  } = useFocusRequestSocket({
    focusId: focus?.id || null,
    onRequestStarted: () => {
      setShowLoadingSnackbar(true);
      setShowResponseSnackbar(false);
      setShowErrorSnackbar(false);
    },
    onRequestProgress: () => {
      // Loading snackbar updates automatically via requestState
    },
    onRequestComplete: (data) => {
      setShowLoadingSnackbar(false);
      setShowResponseSnackbar(true);
      if (data.batchId) {
        // Will show approval snackbar when change-batch-pending arrives
      }
    },
    onRequestError: () => {
      setShowLoadingSnackbar(false);
      setShowErrorSnackbar(true);
    },
    onBatchPending: () => {
      setShowApprovalSnackbar(true);
    },
    onBatchApproved: () => {
      setShowApprovalSnackbar(false);
      toast.success('Changes applied successfully');
    },
    onBasisCreated: (data) => {
      setCurrentCreatedBasis({
        id: data.basis.id,
        title: data.basis.title,
        description: data.basis.description,
        entityType: data.basis.entityType,
        metadata: data.basis.metadata,
        focusId: data.focusId,
        timestamp: data.timestamp,
      });
      setShowObjectCreatedSnackbar(true);
    },
  });

  // State for create node snackbar (shows when "n" + Enter is pressed)
  const [createNodeSnackbarOpen, setCreateNodeSnackbarOpen] = useState(false);

  // State for floating chat view
  const [chatOpen, setChatOpen] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState<string | null>(null);

  // State for search drawer
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);

  // State for loaded focus data (for copy functionality)
  const [loadedFocusData, setLoadedFocusData] = useState<{
    focus: import('./hooks/use-focus').FocusData;
    interface: import('src/types/focus-interface').FocusInterface | null;
  } | null>(null);

  // State for floating node form
  const [nodeFormOpen, setNodeFormOpen] = useState(false);
  const [nodeFormMode, setNodeFormMode] = useState<'create' | 'edit'>('create');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingNodeData, setEditingNodeData] = useState<Partial<NodeFormData> | null>(null);

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

  // State for load interface mode (activated by "l/ " command)
  const [loadModeActive, setLoadModeActive] = useState(false);
  // Ref for load mode timeout
  const loadModeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Audio analyzer for voice-reactive waveform
  const { audioLevels, start: startAudioAnalyzer, stop: stopAudioAnalyzer } = useAudioAnalyzer({
    bandCount: 32,
    updateInterval: 50,
  });

  // Speech recognition for live transcription
  const {
    transcript,
    interimTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Ref for auto-scrolling transcript display
  const transcriptScrollRef = useRef<HTMLDivElement>(null);

  // Combine transcript + interimTranscript without doubling or gaps
  const displayTranscript = useMemo(() => {
    const trimmedInterim = interimTranscript?.trim() || '';

    // If no interim, just show transcript
    if (!trimmedInterim) return transcript || '';

    // If no transcript yet, show interim
    if (!transcript) return trimmedInterim;

    // If transcript already ends with this interim content, don't add it (prevents doubling)
    if (transcript.toLowerCase().endsWith(trimmedInterim.toLowerCase())) {
      return transcript;
    }

    // Combine them: finalized + in-progress
    return `${transcript} ${trimmedInterim}`;
  }, [transcript, interimTranscript]);

  // Auto-scroll to bottom when transcript updates
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [displayTranscript]);

  // Debug: Log browser support status on mount
  useEffect(() => {
    console.log('[SpeechRecognition] Browser supports speech recognition:', browserSupportsSpeechRecognition);
  }, [browserSupportsSpeechRecognition]);

  // Debug: Log listening state changes
  useEffect(() => {
    console.log('[SpeechRecognition] Listening state:', listening);
  }, [listening]);

  // Log transcript to console when it changes during recording
  useEffect(() => {
    if (transcript) {
      console.log('[Transcription]', transcript);
    }
  }, [transcript]);

  // Log interim transcript for real-time feedback
  useEffect(() => {
    if (interimTranscript) {
      console.log('[Transcription - interim]', interimTranscript);
    }
  }, [interimTranscript]);

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

  // Handle closing the chat view
  const handleChatClose = useCallback(() => {
    setChatOpen(false);
    setInitialChatMessage(null);
  }, []);

  // Handle opening the node form (create mode)
  const handleOpenNodeForm = useCallback(() => {
    setNodeFormMode('create');
    setEditingNodeId(null);
    setEditingNodeData(null);
    setNodeFormOpen(true);
  }, []);

  // Handle quick node creation (opens snackbar for title input)
  const handleQuickCreateNode = useCallback(() => {
    setCreateNodeSnackbarOpen(true);
  }, []);

  // Handle saving a quick-created node (from CreateNodeSnackbar)
  const handleQuickCreateNodeSave = useCallback(async (title: string): Promise<boolean> => {
    const { screenToFlowPosition } = reactFlowInstance;

    // Get the center of the current viewport
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const flowPosition = screenToFlowPosition({ x: centerX, y: centerY });

    // If we have a focus ID, call the API to persist the node
    if (focus?.id) {
      try {
        const result = await focusInterfaceAPI.addNode(focus.id, {
          title,
          entityType: 'custom',
          metadata: {
            shape: 'hexagon',
          },
          position: flowPosition,
        });

        const newNode: Node = {
          id: result.data.basis.id,
          type: 'hexagon',
          position: flowPosition,
          data: {
            label: title,
            index: nodes.length,
            backgroundImage: '/magic-mg1.png',
            patternOverlay: null,
            grainAmount: 25,
            grainBlendMode: 'overlay',
            borderWidth: 5,
            textColor: '#ffffff',
            showFloatingHandles: true,
            handleSize: 16,
            handleColor: '#d1d5db',
            handleOffset: 10,
            hasCheckbox: false,
            checked: false,
            basisId: result.data.basis.id,
          },
        };

        setNodes((currentNodes) => [...currentNodes, newNode]);
        toast.success(`Node "${title}" created!`);
        return true;
      } catch (error) {
        console.error('Error creating node:', error);
        toast.error('Failed to create node');
        return false;
      }
    } else {
      // No focus ID - create node locally only
      const newNode: Node = {
        id: `hexagon-${Date.now()}`,
        type: 'hexagon',
        position: flowPosition,
        data: {
          label: title,
          index: nodes.length,
          backgroundImage: '/magic-mg1.png',
          patternOverlay: null,
          grainAmount: 25,
          grainBlendMode: 'overlay',
          borderWidth: 5,
          textColor: '#ffffff',
          showFloatingHandles: true,
          handleSize: 16,
          handleColor: '#d1d5db',
          handleOffset: 10,
          hasCheckbox: false,
          checked: false,
        },
      };

      setNodes((currentNodes) => [...currentNodes, newNode]);
      toast.success(`Node "${title}" created!`);
      return true;
    }
  }, [reactFlowInstance, focus?.id, nodes.length, setNodes]);

  // Handle closing the node form
  const handleCloseNodeForm = useCallback(() => {
    setNodeFormOpen(false);
    setNodeFormMode('create');
    setEditingNodeId(null);
    setEditingNodeData(null);
  }, []);

  // Handle opening the node form in edit mode (for FloatingNodeForm)
  const handleEditNode = useCallback((node: Node) => {
    setNodeFormMode('edit');
    setEditingNodeId(node.id);
    setEditingNodeData({
      label: (node.data?.label as string) || '',
      content: node.data?.content || null,
      backgroundImage: (node.data?.backgroundImage as string) || null,
      patternOverlay: (node.data?.patternOverlay as string) || null,
      shape: (node.type as NodeFormData['shape']) || 'hexagon',
      hasCheckbox: (node.data?.hasCheckbox as boolean) || false,
      checked: (node.data?.checked as boolean) || false,
      textColor: (node.data?.textColor as string) || '#ffffff',
    });
    setNodeFormOpen(true);
  }, []);

  // Handle saving node from App Store dialog (in-place editing)
  // Returns the updated node so the dialog can update its local state
  const handleSaveNodeFromDialog = useCallback((nodeId: string, formData: NodeFormData): Node => {
    let updatedNode: Node | null = null;

    setNodes((currentNodes) =>
      currentNodes.map((n) => {
        if (n.id === nodeId) {
          updatedNode = {
            ...n,
            type: formData.shape,
            data: {
              ...n.data,
              label: formData.label,
              content: formData.content,
              backgroundImage: formData.backgroundImage || n.data?.backgroundImage || '/magic-mg1.png',
              patternOverlay: formData.patternOverlay ?? n.data?.patternOverlay ?? null,
              hasCheckbox: formData.hasCheckbox ?? n.data?.hasCheckbox ?? false,
              checked: formData.hasCheckbox ? (n.data?.checked ?? false) : false,
            },
          };
          return updatedNode;
        }
        return n;
      })
    );

    toast.success(`Node "${formData.label}" updated!`);

    // Return the updated node (or create one if somehow not found)
    return updatedNode || {
      id: nodeId,
      type: formData.shape,
      position: { x: 0, y: 0 },
      data: {
        label: formData.label,
        content: formData.content,
        backgroundImage: formData.backgroundImage || '/magic-mg1.png',
        patternOverlay: formData.patternOverlay ?? null,
        hasCheckbox: formData.hasCheckbox ?? false,
        checked: false,
      },
    };
  }, []);

  // Handle updating edge data from App Store dialog
  const handleUpdateEdge = useCallback((edgeId: string, data: { strokeColor?: string; strokeWidth?: number; buttonBgColor?: string }) => {
    setEdges((currentEdges) =>
      currentEdges.map((edge) =>
        edge.id === edgeId
          ? {
              ...edge,
              data: {
                ...edge.data,
                ...data,
              },
            }
          : edge
      )
    );
  }, []);

  // Handle deleting edge from App Store dialog
  const handleDeleteEdge = useCallback(async (edgeId: string) => {
    // Optimistically remove edge from local state
    const previousEdges = edges;
    setEdges((currentEdges) => currentEdges.filter((edge) => edge.id !== edgeId));

    // If we have a focus ID, persist to backend
    if (focus?.id) {
      try {
        const result = await disconnectByEdgeId(focus.id, edgeId);
        if (result) {
          console.log('[handleDeleteEdge] Edge deleted from backend:', result);
          toast.success('Connection deleted');
        } else {
          // Rollback on failure
          setEdges(previousEdges);
          toast.error('Failed to delete connection');
        }
      } catch (err) {
        console.error('[handleDeleteEdge] Failed to delete edge:', err);
        // Rollback on error
        setEdges(previousEdges);
        toast.error('Failed to delete connection', {
          description: 'Could not remove the connection from the server.',
        });
      }
    } else {
      // No focus ID, just show success for local deletion
      toast.success('Connection deleted');
    }
  }, [focus?.id, disconnectByEdgeId, edges]);

  // Handle deleting a basis permanently (Task 4.2)
  const handleDeleteBasis = useCallback(async (basisId: string) => {
    // Optimistically remove node and connected edges
    const previousNodes = nodes;
    const previousEdges = edges;
    setNodes((nds) => nds.filter((n) => n.id !== basisId && n.data?.basisId !== basisId));
    setEdges((eds) => eds.filter((e) => e.source !== basisId && e.target !== basisId));

    try {
      const result = await deleteBasis(basisId);
      if (result) {
        console.log('[handleDeleteBasis] Basis deleted:', result);
        toast.success('Basis deleted', {
          description: `Severed ${result.severedConnections.focusBases} focus connections`,
        });
      } else {
        // Rollback on failure
        setNodes(previousNodes);
        setEdges(previousEdges);
        toast.error('Failed to delete basis');
      }
    } catch (err) {
      console.error('[handleDeleteBasis] Error:', err);
      setNodes(previousNodes);
      setEdges(previousEdges);
      toast.error('Failed to delete basis');
    }
  }, [nodes, edges, deleteBasis]);

  // Handle removing a basis from focus (Task 4.2)
  const handleRemoveFromFocus = useCallback(async (basisId: string) => {
    if (!focus?.id) {
      toast.error('No focus selected');
      return;
    }

    // Optimistically remove node and connected edges
    const previousNodes = nodes;
    const previousEdges = edges;
    setNodes((nds) => nds.filter((n) => n.id !== basisId && n.data?.basisId !== basisId));
    setEdges((eds) => eds.filter((e) => e.source !== basisId && e.target !== basisId));

    try {
      const result = await removeBasisFromFocus(focus.id, basisId);
      if (result) {
        console.log('[handleRemoveFromFocus] Basis removed:', result);
        toast.success('Node removed from focus', {
          description: `Removed ${result.removedEdges} connections`,
        });
      } else {
        // Rollback on failure
        setNodes(previousNodes);
        setEdges(previousEdges);
        toast.error('Failed to remove node');
      }
    } catch (err) {
      console.error('[handleRemoveFromFocus] Error:', err);
      setNodes(previousNodes);
      setEdges(previousEdges);
      toast.error('Failed to remove node');
    }
  }, [focus?.id, nodes, edges, removeBasisFromFocus]);

  // Keyboard shortcut to open node form (press 'n' key)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Press 'n' to open node form
      if (event.key === 'n' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        setNodeFormOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle creating or editing a node from the form
  const handleCreateNode = useCallback(async (formData: NodeFormData, nodeId?: string) => {
    // If nodeId is provided, we're editing an existing node
    if (nodeId) {
      setNodes((currentNodes) =>
        currentNodes.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                type: formData.shape, // Allow changing shape
                data: {
                  ...n.data,
                  label: formData.label,
                  content: formData.content,
                  backgroundImage: formData.backgroundImage || n.data?.backgroundImage || '/magic-mg1.png',
                  patternOverlay: formData.patternOverlay ?? n.data?.patternOverlay ?? null,
                  hasCheckbox: formData.hasCheckbox ?? n.data?.hasCheckbox ?? false,
                  checked: formData.hasCheckbox ? (n.data?.checked ?? false) : false,
                  textColor: formData.textColor || n.data?.textColor || '#ffffff',
                },
              }
            : n
        )
      );
      toast.success(`Node "${formData.label}" updated!`);
      return;
    }

    // Creating a new node
    const { screenToFlowPosition } = reactFlowInstance;

    // Get the center of the current viewport
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Convert screen center to flow position
    const flowPosition = screenToFlowPosition({ x: centerX, y: centerY });

    // If we have a focus ID, call the API to persist the node
    if (focus?.id) {
      try {
        // Serialize content to string for API (JSONContent -> string)
        const description = formData.content
          ? (typeof formData.content === 'string'
              ? formData.content
              : JSON.stringify(formData.content))
          : undefined;

        const result = await focusInterfaceAPI.addNode(focus.id, {
          title: formData.label,
          description,
          entityType: 'custom', // Default to custom, could map from shape
          metadata: {
            shape: formData.shape,
            backgroundImage: formData.backgroundImage,
            patternOverlay: formData.patternOverlay,
            hasCheckbox: formData.hasCheckbox,
            textColor: formData.textColor,
          },
          position: flowPosition,
        });

        // Create the node using the returned basis ID
        const newNode: Node = {
          id: result.data.basis.id, // Use the basis ID from API
          type: formData.shape,
          position: flowPosition,
          data: {
            label: formData.label,
            content: formData.content,
            index: nodes.length,
            backgroundImage: formData.backgroundImage || '/magic-mg1.png',
            patternOverlay: formData.patternOverlay || null,
            grainAmount: 25,
            grainBlendMode: 'overlay',
            borderWidth: 5,
            textColor: formData.textColor || '#ffffff',
            showFloatingHandles: true,
            handleSize: 16,
            handleColor: '#d1d5db',
            handleOffset: 10,
            hasCheckbox: formData.hasCheckbox || false,
            checked: false,
            // Store basis reference for future updates
            basisId: result.data.basis.id,
          },
        };

        setNodes((currentNodes) => [...currentNodes, newNode]);
        toast.success(`Node "${formData.label}" created and saved!`);
      } catch (error) {
        console.error('Failed to add node via API:', error);
        toast.error('Failed to save node', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } else {
      // No focus ID - create node locally only (original behavior)
      const newNode: Node = {
        id: `${formData.shape}-${Date.now()}`,
        type: formData.shape,
        position: flowPosition,
        data: {
          label: formData.label,
          content: formData.content,
          index: nodes.length,
          backgroundImage: formData.backgroundImage || '/magic-mg1.png',
          patternOverlay: formData.patternOverlay || null,
          grainAmount: 25,
          grainBlendMode: 'overlay',
          borderWidth: 5,
          textColor: formData.textColor || '#ffffff',
          showFloatingHandles: true,
          handleSize: 16,
          handleColor: '#d1d5db',
          handleOffset: 10,
          hasCheckbox: formData.hasCheckbox || false,
          checked: false,
        },
      };

      setNodes((currentNodes) => [...currentNodes, newNode]);
      toast.success(`Node "${formData.label}" created!`);
    }
  }, [nodes.length, reactFlowInstance, focus?.id]);

  // Handle checkbox toggle on a node
  const handleNodeCheckboxChange = useCallback((nodeId: string, checked: boolean) => {
    setNodes((currentNodes) =>
      currentNodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                checked,
              },
            }
          : n
      )
    );
  }, []);

  // Handle blank canvas - create a new Focus via API and clear canvas
  const handleBlankCanvas = useCallback(async () => {
    try {
      // Get user ID
      const userId = user?.id;
      if (!userId) {
        toast.error('Please sign in to create a new focus', {
          action: {
            label: 'Sign In',
            onClick: () => {
              router.push(`/test-login?returnTo=${encodeURIComponent(pathname)}`);
            },
          },
        });
        return;
      }

      // Create new focus via API
      const result = await focusInterfaceAPI.createFocus({
        title: 'New Focus',
        description: 'A fresh canvas to build your focus',
        userId,
        goalIcon: 'solar:target-bold',
      });

      // Clear canvas
      setNodes([]);
      setEdges([]);
      setChatOpen(false);
      setNodeFormOpen(false);

      // Update V3Interface context with new focus (silent to avoid duplicate toast)
      setFocus(result.focus, { silent: true });

      // Create context for this new focus session (enables socket-based requests)
      setContext({
        id: `ctx-${result.focus.id}-${Date.now()}`,
        title: result.focus.title || 'New Focus',
        description: result.focus.description || undefined,
        activeBases: [], // New focus has no bases yet
        metadata: {},
        isActive: true,
        focusId: result.focus.id,
        userId: user?.id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Show "New Focus" label for 3 seconds
      // Clear any existing timeout
      if (newFocusTimeoutRef.current) {
        clearTimeout(newFocusTimeoutRef.current);
      }
      setShowNewFocusLabel(true);
      newFocusTimeoutRef.current = setTimeout(() => {
        setShowNewFocusLabel(false);
      }, 3000);

      // Show rename snackbar to allow user to rename the focus
      setRenameSnackbar({
        open: true,
        focusId: result.focus?.id || '',
        currentTitle: result.focus?.title || 'New Focus',
      });
    } catch (error) {
      console.error('Error creating focus:', error);
      toast.error('Failed to create focus', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [user?.id, setFocus, setContext, router, pathname]);

  // Handle save interface - export nodes and edges as JSON to clipboard (v2.0 schema)
  const handleSaveInterface = useCallback(() => {
    const interfaceData = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      viewport: reactFlowInstance.getViewport(),
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        width: node.width,
        height: node.height,
        zIndex: node.zIndex,
        parentId: node.parentId,
        data: {
          ...node.data,
          basisId: node.data?.basisId ?? null,
        },
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        type: edge.type,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        data: {
          ...edge.data,
          relationship: edge.data?.relationship ?? null,
        },
      })),
    };

    const jsonString = JSON.stringify(interfaceData, null, 2);

    navigator.clipboard
      .writeText(jsonString)
      .then(() => {
        toast.success('Interface saved', {
          description: 'JSON copied to clipboard',
        });
      })
      .catch(() => {
        console.log('Interface JSON:', jsonString);
        toast.info('Interface exported', {
          description: 'Check console for JSON output',
        });
      });
  }, [nodes, edges, reactFlowInstance]);

  // Handle open load dialog
  const handleOpenLoadDialog = useCallback(() => {
    setLoadDialogOpen(true);
  }, []);

  // Handle copy focus data to clipboard
  const handleCopyFocusData = useCallback(() => {
    if (!loadedFocusData) {
      toast.warning('No focus data loaded', {
        description: 'Load a focus first to copy its data',
      });
      return;
    }

    const focusDataJson = JSON.stringify(loadedFocusData, null, 2);
    navigator.clipboard.writeText(focusDataJson).then(() => {
      toast.success('Focus data copied!', {
        description: `Copied ${loadedFocusData.focus.title} data to clipboard`,
      });
      console.log('[CopyFocusData] Copied to clipboard:', focusDataJson);
    }).catch((err) => {
      console.error('[CopyFocusData] Failed to copy:', err);
      toast.error('Failed to copy focus data');
    });
  }, [loadedFocusData]);

  // Handle open edit focus dialog
  const handleOpenEditFocusDialog = useCallback(() => {
    if (!focus?.id) {
      toast.warning('No focus loaded', {
        description: 'Load a focus first to edit it',
      });
      return;
    }
    setEditFocusDialogOpen(true);
  }, [focus?.id]);

  // Handle open delete focus dialog (Task 4.2)
  const handleOpenDeleteFocusDialog = useCallback(() => {
    if (!focus?.id) {
      toast.warning('No focus loaded', {
        description: 'Load a focus first to delete it',
      });
      return;
    }
    setDeleteFocusDialogOpen(true);
  }, [focus?.id]);

  // Handle save focus (title and description)
  const handleSaveFocus = useCallback(async (
    focusId: string,
    newTitle: string,
    newDescription: string
  ): Promise<boolean> => {
    try {
      const result = await updateFocus(focusId, {
        title: newTitle,
        description: newDescription,
      });

      if (result) {
        // Update context with new values
        setFocus({
          id: result.id,
          title: result.title,
          description: result.description || undefined,
          userId: result.userId,
        });

        toast.success('Focus updated', {
          description: `"${result.title}" saved successfully`,
        });
        return true;
      }
      toast.error('Failed to update focus');
      return false;
    } catch (err) {
      console.error('[handleSaveFocus] Error:', err);
      toast.error('Failed to update focus');
      return false;
    }
  }, [updateFocus, setFocus]);

  // Handle rename focus (title only) - used by RenameSnackbar
  const handleRenameFocus = useCallback(async (
    focusId: string,
    newTitle: string
  ): Promise<boolean> => {
    try {
      const result = await updateFocus(focusId, { title: newTitle });

      if (result) {
        // Update context with new title (silent to avoid duplicate toast - we show "Focus renamed" below)
        setFocus({
          id: result.id,
          title: result.title,
          description: result.description || undefined,
          userId: result.userId,
        }, { silent: true });

        toast.success('Focus renamed', {
          description: newTitle,
        });
        return true;
      }
      toast.error('Failed to rename focus');
      return false;
    } catch (err) {
      console.error('[handleRenameFocus] Error:', err);
      toast.error('Failed to rename focus');
      return false;
    }
  }, [updateFocus, setFocus]);

  // Handle delete focus (Task 4.2)
  const handleDeleteFocus = useCallback(async (
    focusId: string,
    deleteBases: boolean
  ): Promise<void> => {
    try {
      const result = await deleteFocus(focusId, { deleteBases });

      if (result) {
        toast.success('Focus deleted', {
          description: deleteBases
            ? `Deleted focus and ${result.deletedBases?.count || 0} bases`
            : 'Focus deleted successfully',
        });

        // Clear the current focus and navigate away
        setFocus(null);
        setNodes([]);
        setEdges([]);
        setDeleteFocusDialogOpen(false);

        // Navigate to home or focuses list
        router.push('/v3-interface');
      } else {
        throw new Error('Failed to delete focus');
      }
    } catch (err) {
      console.error('[handleDeleteFocus] Error:', err);
      throw err; // Re-throw to let dialog handle the error
    }
  }, [deleteFocus, setFocus, router]);

  // Handle load mode activation (when user types "l/ ")
  const handleLoadModeActivated = useCallback(() => {
    // Clear any existing timeout
    if (loadModeTimeoutRef.current) {
      clearTimeout(loadModeTimeoutRef.current);
      loadModeTimeoutRef.current = null;
    }

    setLoadModeActive(true);

    // Auto-hide after 15 seconds if user doesn't paste
    loadModeTimeoutRef.current = setTimeout(() => {
      setLoadModeActive(false);
    }, 15000);
  }, []);

  // Handle load interface from JSON
  const handleLoadInterface = useCallback(
    (jsonString: string) => {
      try {
        const rawData = JSON.parse(jsonString);

        // Migrate to v2.0 schema if needed
        const wasMigrated = needsMigration(rawData);
        const originalVersion = getInterfaceVersion(rawData);
        const data = migrateFocusInterface(rawData);

        // Load nodes
        if (data.nodes && Array.isArray(data.nodes)) {
          setNodes(data.nodes);
        }

        // Load edges
        if (data.edges && Array.isArray(data.edges)) {
          setEdges(data.edges);
        }

        // Optionally restore viewport
        if (data.viewport) {
          reactFlowInstance.setViewport(data.viewport);
        }

        // Deactivate load mode
        setLoadModeActive(false);
        if (loadModeTimeoutRef.current) {
          clearTimeout(loadModeTimeoutRef.current);
          loadModeTimeoutRef.current = null;
        }

        const migrationNote = wasMigrated
          ? ` (migrated from v${originalVersion} to v${CURRENT_SCHEMA_VERSION})`
          : '';

        toast.success('Interface loaded', {
          description: `Loaded ${data.nodes?.length || 0} nodes and ${data.edges?.length || 0} edges${migrationNote}`,
        });
      } catch (err) {
        toast.error('Failed to load interface', {
          description: err instanceof Error ? err.message : 'Invalid JSON',
        });
      }
    },
    [reactFlowInstance]
  );

  // Handle sending a message - triggers shine effect on all nodes and opens chat view
  // Also handles JSON paste when in load mode
  const handleSendMessage = useCallback((message: string) => {
    const trimmed = message.trim();

    // Check if it looks like JSON (for load mode or auto-detect)
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        // Check if it has nodes array (interface JSON structure)
        if (parsed.nodes && Array.isArray(parsed.nodes)) {
          handleLoadInterface(trimmed);
          return; // Don't proceed with normal message handling
        }
      } catch {
        // Not valid JSON, continue as normal message
      }
    }

    // Normal message handling
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
  }, [TRANSITION_STEPS, handleLoadInterface]);

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
    console.log('[handleMicClick] Current status:', recordingStatus, 'Browser supports:', browserSupportsSpeechRecognition);

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
      // Start speech recognition for live transcription
      resetTranscript();
      console.log('[handleMicClick] Starting speech recognition...');
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    } else if (recordingStatus === 'recording') {
      // Pause recording - use HyperText transition and stop audio analyzer
      setRecordingRevealing(false);
      setRecordingText('Paused');
      setRecordingStatus('paused');
      stopAudioAnalyzer();
      // Stop speech recognition
      console.log('[handleMicClick] Stopping speech recognition...');
      SpeechRecognition.stopListening();
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
      // Resume speech recognition
      console.log('[handleMicClick] Resuming speech recognition...');
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    }
  }, [recordingStatus, startAudioAnalyzer, stopAudioAnalyzer, resetTranscript, browserSupportsSpeechRecognition]);

  // Handle when paused fade-out is complete - reset to idle
  const handlePausedFadeComplete = useCallback(() => {
    setRecordingStatus('idle');
    setTriggerPausedFade(false);
    setRecordingText('Recording ...');
    stopAudioAnalyzer();
    // Ensure speech recognition is stopped
    SpeechRecognition.stopListening();
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
      {/* <SmoothCursor /> */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={memoizedNodeTypes}
        edgeTypes={memoizedEdgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        connectionLineType={ConnectionLineType.Bezier}
        connectionLineStyle={{ stroke: 'rgba(158, 122, 255, 0.8)', strokeWidth: 2.5 }}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={40}
        defaultEdgeOptions={{ type: 'smartPulseButton' }}
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

      {/* Search FAB - Upper Left */}
      <IconButton
        onClick={() => setSearchDrawerOpen(true)}
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 100,
          bgcolor: 'background.paper',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            bgcolor: 'background.paper',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        <Iconify icon="hugeicons:sidebar-left" width={20} />
      </IconButton>

      {/* New Focus FAB - Below Search FAB */}
      <IconButton
        onClick={handleBlankCanvas}
        sx={{
          position: 'fixed',
          top: 60,
          left: 16,
          zIndex: 100,
          width: 32,
          height: 32,
          minWidth: 32,
          backgroundImage: 'url(/mesh/magic7.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '2px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        <Iconify icon="mingcute:add-line" width={20} sx={{ color: '#ffffff' }} />
      </IconButton>

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
        {/* New Focus state: Shows for 3 seconds after creating new focus */}
        {showNewFocusLabel && (
          <BlurReveal duration={600} blur={6} sx={{ mb: 1.5, ml: 1 }}>
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
                New Focus: {focus?.id}
              </Box>
              <Box
                component="span"
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#17A0EF',
                  animation: 'popIn 0.3s ease-out forwards',
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
                }}
              />
            </Box>
          </BlurReveal>
        )}

        {/* Working state: BlurReveal with indicator inside */}
        {status === 'working' && !showNewFocusLabel && (
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

        {/* Live transcription display - above recording label and waveform */}
        {displayTranscript && recordingStatus === 'recording' && (
          <Box
            ref={transcriptScrollRef}
            sx={{
              mb: 1.5,
              width: '100%',
              maxHeight: 120,
              overflowY: 'auto',
              overflowX: 'hidden',
              // Hide scrollbar but keep functionality
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              // Fade gradient at top for scroll effect when content overflows
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 100%)',
            }}
          >
            {/* Animated transcript with TextGenerateEffect */}
            <TextGenerateEffect
              words={displayTranscript}
              filter
              duration={0.3}
              sx={{
                fontSize: '0.875rem',
                color: '#d1d5db',
                letterSpacing: '0.01em',
                lineHeight: 1.6,
              }}
            />
          </Box>
        )}

        {/* Recording Status Label - above input */}
        {/* Stable wrapper for waveform positioning */}
        {recordingStatus !== 'idle' && (
          <Box sx={{ position: 'relative', width: '100%', mb: 1.5, ml: 1, pr: 1 }}>
            {/* Recording indicator wrapper */}
            <Box sx={{ minHeight: 24 }}>
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
            </Box>

            {/* SINGLE waveform instance - always positioned to the right of stable wrapper */}
            <RecordingWaveform
              isAnimating={recordingStatus === 'recording'}
              isFading={recordingStatus === 'fading'}
              audioLevels={audioLevels}
            />
          </Box>
        )}

        {/* Load Mode Label - above input */}
        {loadModeActive && (
          <Box sx={{ position: 'relative', width: '100%', mb: 1.5, ml: 1, pr: 1 }}>
            <BlurReveal duration={600} blur={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'rgb(140, 84, 241)',
                  }}
                />
                <Box
                  component="span"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.9375rem',
                    color: '#6b7280',
                    letterSpacing: '0.02em',
                  }}
                >
                  Load Interface Activated...
                </Box>
              </Box>
            </BlurReveal>
          </Box>
        )}

        <FloatingTextInput
          onSend={handleSendMessage}
          onMicClick={handleMicClick}
          onCreateNode={handleOpenNodeForm}
          onQuickCreateNode={handleQuickCreateNode}
          onBlankCanvas={handleBlankCanvas}
          onSaveInterface={handleSaveInterface}
          onLoadInterface={handleOpenLoadDialog}
          onLoadModeActivated={handleLoadModeActivated}
          onCopyFocusData={handleCopyFocusData}
          onEditFocus={handleOpenEditFocusDialog}
          recordingStatus={recordingStatus}
          // V3 Context props for request submission
          context={context ? {
            id: context.id,
            title: context.title,
            activeBases: context.activeBases,
          } : null}
          focusId={focus?.id}
          focusTitle={focus?.title}
          isSubmitting={isSubmitting || requestState.isProcessing}
          onSubmitRequest={async (input, options) => {
            console.log('[V3Interface] ========== onSubmitRequest CALLED ==========');
            console.log('[V3Interface] Input:', input);
            console.log('[V3Interface] Research Enabled:', options?.researchEnabled ?? false);
            console.log('[V3Interface] Focus ID:', focus?.id);
            console.log('[V3Interface] Context:', context ? { id: context.id, title: context.title, activeBases: context.activeBases } : null);
            console.log('[V3Interface] Socket Connected:', requestSocketConnected);
            console.log('[V3Interface] ================================================');

            // Store input for potential retry
            setLastRequestInput(input);

            // Use socket-based request if connected, otherwise fall back to REST
            if (requestSocketConnected && focus?.id) {
              console.log('[V3Interface] Using SOCKET-based request');
              const ack = await sendFocusRequest(input, {
                researchEnabled: options?.researchEnabled ?? false,
                requestType: 'AI_GENERATION',
              });
              console.log('[V3Interface] Socket request ACK:', ack);
              if (!ack.success) {
                toast.error(ack.error || 'Failed to send request');
              }
            } else {
              console.log('[V3Interface] Using REST-based request (fallback)');
              console.log('[V3Interface] Reason: requestSocketConnected=', requestSocketConnected, 'focus?.id=', focus?.id);
              // Fallback to existing REST-based request
              submitRequest({ input });
            }
          }}
        />

        {/* Floating Chat View */}
        <FloatingChatView
          open={chatOpen}
          onClose={handleChatClose}
          initialMessage={initialChatMessage}
          contextTitle="V3 Interface"
          contextSubtitle="localhost"
        />

        {/* Floating Node Form */}
        <FloatingNodeForm
          open={nodeFormOpen}
          onClose={handleCloseNodeForm}
          onSave={handleCreateNode}
          mode={nodeFormMode}
          editNodeId={editingNodeId || undefined}
          initialData={editingNodeData || undefined}
        />
      </Box>

      {/* Snackbar Toast Container - Bottom Right Corner */}
      <Snackbar position="bottom-right" />

      {/* App Store Dialog */}
      <V3AppStoreDialog
        open={appStoreDialogOpen}
        node={selectedNode}
        edges={edges}
        allNodes={nodes}
        focusId={focus?.id}
        onClose={() => setAppStoreDialogOpen(false)}
        onStartChat={(node) => {
          setAppStoreDialogOpen(false);
          setInitialChatMessage(`Tell me about "${node.data?.label || 'this node'}"`);
          setChatOpen(true);
        }}
        onSaveNode={handleSaveNodeFromDialog}
        onUpdateEdge={handleUpdateEdge}
        onDeleteEdge={handleDeleteEdge}
        onDeleteBasis={handleDeleteBasis}
        onRemoveFromFocus={handleRemoveFromFocus}
      />

      {/* Load Interface Dialog */}
      <LoadInterfaceDialog
        open={loadDialogOpen}
        onClose={() => setLoadDialogOpen(false)}
        onLoad={handleLoadInterface}
      />

      {/* Search Drawer */}
      <SearchDrawer
        open={searchDrawerOpen}
        onClose={() => setSearchDrawerOpen(false)}
        onNewFocus={handleBlankCanvas}
        onSelectFocus={async (selectedFocus) => {
          // Log all data about the selected focus
          console.log('[SearchDrawer] ========== SELECTED FOCUS ==========');
          console.log('[SearchDrawer] Full Focus Object:', selectedFocus);
          console.log('[SearchDrawer] Focus ID:', selectedFocus.id);
          console.log('[SearchDrawer] Focus Title:', selectedFocus.title);
          console.log('[SearchDrawer] Focus Description:', selectedFocus.description);
          console.log('[SearchDrawer] Focus Image URL:', selectedFocus.imageUrl);
          console.log('[SearchDrawer] Focus Created At:', selectedFocus.createdAt);
          console.log('[SearchDrawer] Focus Updated At:', selectedFocus.updatedAt);
          console.log('[SearchDrawer] Focus Bases Count:', selectedFocus.basesCount);
          console.log('[SearchDrawer] =====================================');

          // Set basic focus info immediately (optimistic)
          setFocus({
            id: selectedFocus.id,
            title: selectedFocus.title,
            description: selectedFocus.description || undefined,
            userId: '',
          });

          // Load full focus data and interface via API (2.6)
          const result = await loadFocus(selectedFocus.id);

          if (result) {
            // ========== DETAILED FOCUS DATA LOGGING ==========
            console.log('\n');
            console.log('╔══════════════════════════════════════════════════════════════╗');
            console.log('║                    FOCUS DATA FROM API                       ║');
            console.log('╚══════════════════════════════════════════════════════════════╝');
            console.log('\n📋 FOCUS METADATA:');
            console.log('  ID:', result.focus.id);
            console.log('  Title:', result.focus.title);
            console.log('  Description:', result.focus.description);
            console.log('  Image URL:', result.focus.imageUrl);
            console.log('  User ID:', result.focus.userId);
            console.log('  Atlas ID:', result.focus.atlasId);
            console.log('  Path ID:', result.focus.pathId);
            console.log('  Created:', result.focus.createdAt);
            console.log('  Updated:', result.focus.updatedAt);
            console.log('\n👤 USER:');
            console.log('  ', result.focus.user);
            console.log('\n📦 METADATA:');
            console.log('  ', JSON.stringify(result.focus.metadata, null, 2));
            console.log('\n🔗 BASES (' + result.focus.bases.length + '):');
            result.focus.bases.forEach((base, i) => {
              console.log(`  [${i}] ${base.basis.title} (${base.basis.entityType})`);
              console.log(`      ID: ${base.basisId}`);
              console.log(`      Position: ${JSON.stringify(base.position)}`);
            });
            console.log('\n🎨 INTERFACE:');
            if (result.interface) {
              console.log('  Goal:', result.interface.goal);
              console.log('  Nodes:', result.interface.nodes?.length || 0);
              console.log('  Edges:', result.interface.edges?.length || 0);
              console.log('\n  📍 NODES DETAIL:');
              result.interface.nodes?.forEach((node, i) => {
                console.log(`    [${i}] ${node.type} - "${node.data?.label}"`);
                console.log(`        ID: ${node.id}`);
                console.log(`        Position: ${JSON.stringify(node.position)}`);
                console.log(`        Data:`, node.data);
              });
            } else {
              console.log('  (No interface data)');
            }
            console.log('\n📄 FULL FOCUS OBJECT (JSON):');
            console.log(JSON.stringify(result.focus, null, 2));
            console.log('\n📄 FULL INTERFACE OBJECT (JSON):');
            console.log(JSON.stringify(result.interface, null, 2));
            console.log('══════════════════════════════════════════════════════════════\n');
            // ========== END DETAILED LOGGING ==========

            // Store loaded focus data for copy functionality
            setLoadedFocusData(result);

            // Update focus state
            setFocus({
              id: result.focus.id,
              title: result.focus.title,
              description: result.focus.description || undefined,
              userId: result.focus.userId,
            });

            // Create context for this focus session (enables socket-based requests)
            setContext({
              id: `ctx-${result.focus.id}-${Date.now()}`,
              title: result.focus.title,
              description: result.focus.description || undefined,
              activeBases: result.focus.bases.map((b) => b.basisId),
              metadata: {},
              isActive: true,
              focusId: result.focus.id,
              userId: result.focus.userId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });

            // Load interface nodes and edges into React Flow
            if (result.interface) {
              const { nodes: loadedNodes, edges: loadedEdges } = result.interface;

              if (loadedNodes && Array.isArray(loadedNodes)) {
                // Create a map of basisId -> basis for quick lookup
                const basisMap = new Map<string, typeof result.focus.bases[0]['basis']>();
                result.focus.bases.forEach((base) => {
                  basisMap.set(base.basisId, base.basis);
                });

                // Enrich nodes with basis metadata (backgroundImage, patternOverlay, etc.)
                const enrichedNodes = loadedNodes.map((node) => {
                  const basisId = node.data?.basisId;
                  const basis = basisId ? basisMap.get(basisId) : null;

                  if (basis?.metadata) {
                    const metadata = basis.metadata as Record<string, unknown>;
                    console.log(`[SearchDrawer] Enriching node ${node.id} with basis metadata:`, metadata);

                    return {
                      ...node,
                      data: {
                        ...node.data,
                        // Merge basis metadata into node data (basis takes precedence)
                        backgroundImage: metadata.backgroundImage || node.data?.backgroundImage,
                        patternOverlay: metadata.patternOverlay || node.data?.patternOverlay,
                        hasCheckbox: metadata.hasCheckbox ?? node.data?.hasCheckbox,
                        textColor: metadata.textColor || node.data?.textColor,
                        // Preserve other node data properties
                      },
                    };
                  }
                  return node;
                });

                console.log('[SearchDrawer] Loading enriched nodes:', enrichedNodes.length);
                setNodes(enrichedNodes as Node[]);
              }

              if (loadedEdges && Array.isArray(loadedEdges)) {
                console.log('[SearchDrawer] Loading edges:', loadedEdges.length);
                setEdges(loadedEdges as Edge[]);
              }

              // Fit view after loading
              setTimeout(() => {
                reactFlowInstance.fitView({ padding: 0.2 });
              }, 100);

              toast.success('Focus loaded', {
                description: `Loaded ${loadedNodes?.length || 0} nodes and ${loadedEdges?.length || 0} edges`,
              });
            } else {
              // No interface data - clear canvas
              console.log('[SearchDrawer] No interface data, clearing canvas');
              setNodes([]);
              setEdges([]);
            }
          } else {
            toast.error('Failed to load focus');
          }
        }}
        onSelectBasis={(selectedBasis) => {
          // Log all data about the selected basis
          console.log('[SearchDrawer] ========== SELECTED BASIS ==========');
          console.log('[SearchDrawer] Full Basis Object:', selectedBasis);
          console.log('[SearchDrawer] Basis ID:', selectedBasis.id);
          console.log('[SearchDrawer] Basis Title:', selectedBasis.title);
          console.log('[SearchDrawer] Basis Description:', selectedBasis.description);
          console.log('[SearchDrawer] Basis Entity Type:', selectedBasis.entityType);
          console.log('[SearchDrawer] Basis Source Entity ID:', selectedBasis.sourceEntityId);
          console.log('[SearchDrawer] Basis Created At:', selectedBasis.createdAt);
          console.log('[SearchDrawer] Basis Updated At:', selectedBasis.updatedAt);
          console.log('[SearchDrawer] =====================================');

          // TODO: Handle basis selection (e.g., add to context, navigate, etc.)
        }}
      />

      {/* Edit Focus Dialog */}
      <EditFocusDialog
        open={editFocusDialogOpen}
        onClose={() => setEditFocusDialogOpen(false)}
        focusId={focus?.id || null}
        currentTitle={focus?.title || ''}
        currentDescription={focus?.description || ''}
        onSave={handleSaveFocus}
        onDelete={handleOpenDeleteFocusDialog}
        isLoading={updateFocusLoading}
      />

      {/* Delete Focus Dialog (Task 4.2) */}
      <DeleteFocusDialog
        open={deleteFocusDialogOpen}
        focusTitle={focus?.title || ''}
        focusId={focus?.id || ''}
        onClose={() => setDeleteFocusDialogOpen(false)}
        onConfirm={handleDeleteFocus}
        loading={deleteFocusLoading}
      />

      {/* Rename Snackbar - shows after creating new focus */}
      <RenameSnackbar
        open={renameSnackbar.open}
        focusId={renameSnackbar.focusId}
        currentTitle={renameSnackbar.currentTitle}
        onClose={() => setRenameSnackbar({ open: false, focusId: '', currentTitle: '' })}
        onSave={handleRenameFocus}
      />

      {/* Create Node Snackbar - shows when "n" + Enter is pressed */}
      <CreateNodeSnackbar
        open={createNodeSnackbarOpen}
        onClose={() => setCreateNodeSnackbarOpen(false)}
        onSave={handleQuickCreateNodeSave}
      />

      {/* Focus Request Snackbars (Task 3) */}
      <RequestLoadingSnackbar
        open={showLoadingSnackbar}
        stage={requestState.stage}
        progress={requestState.progress}
        message={requestState.message}
        onClose={() => setShowLoadingSnackbar(false)}
      />

      <ResponseSnackbar
        open={showResponseSnackbar}
        response={requestState.response}
        duration={requestState.duration}
        hasBatch={!!pendingBatch}
        onClose={() => {
          setShowResponseSnackbar(false);
          resetRequestState();
        }}
        onViewBatch={() => {
          setShowResponseSnackbar(false);
          setShowApprovalSnackbar(true);
        }}
      />

      <ApprovalSnackbar
        open={showApprovalSnackbar && !!pendingBatch}
        batchId={pendingBatch?.batchId || ''}
        changes={pendingBatch?.changes || []}
        onApprove={async (batchId) => {
          const ack = await approveBatch(batchId);
          if (ack.success) {
            setShowApprovalSnackbar(false);
          } else {
            toast.error(ack.error || 'Failed to approve changes');
          }
        }}
        onReject={async (batchId, reason) => {
          const ack = await rejectBatch(batchId, reason);
          if (ack.success) {
            setShowApprovalSnackbar(false);
            toast.info('Changes rejected');
          } else {
            toast.error(ack.error || 'Failed to reject changes');
          }
        }}
        onClose={() => {
          setShowApprovalSnackbar(false);
          clearPendingBatch();
        }}
      />

      <ObjectCreatedSnackbar
        open={showObjectCreatedSnackbar}
        basis={currentCreatedBasis}
        onClose={() => {
          setShowObjectCreatedSnackbar(false);
          setCurrentCreatedBasis(null);
        }}
        onViewBasis={(basisId) => {
          // Find the node and open its dialog
          const node = nodes.find((n) => n.id === basisId);
          if (node) {
            setSelectedNode(node);
            setAppStoreDialogOpen(true);
          }
          setShowObjectCreatedSnackbar(false);
          setCurrentCreatedBasis(null);
        }}
      />

      <RequestErrorSnackbar
        open={showErrorSnackbar}
        error={requestState.error}
        recoverable={requestState.recoverable}
        onClose={() => {
          setShowErrorSnackbar(false);
          resetRequestState();
        }}
        onRetry={async () => {
          setShowErrorSnackbar(false);
          if (lastRequestInput && focus?.id) {
            const ack = await sendFocusRequest(lastRequestInput, {
              researchEnabled: false,
              requestType: 'AI_GENERATION',
            });
            if (!ack.success) {
              toast.error(ack.error || 'Retry failed');
            }
          }
        }}
      />
    </CanvasContainer>
  );
}

export function V3InterfaceView(props: V3InterfaceProps) {
  return (
    <V3InterfaceProvider>
      <ReactFlowProvider>
        <V3InterfaceViewInner {...props} />
      </ReactFlowProvider>
    </V3InterfaceProvider>
  );
}

