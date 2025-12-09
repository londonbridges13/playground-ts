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
import { InteractiveGridPattern, calculateHoveredSquare } from './components/interactive-grid-pattern';
import { CircularNode, HexagonNode, RectangleNode } from './nodes';
import { PulseButtonEdge, HandDrawnEdge, SmartPulseButtonEdge } from './edges';
import { useCenteredNodes } from './hooks/use-centered-nodes';
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

        <FloatingTextInput onSend={handleSendMessage} />

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

