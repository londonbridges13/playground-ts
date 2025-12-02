'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import '@xyflow/react/dist/style.css';

import type { Theme, SxProps } from '@mui/material/styles';
import type { Connection, Edge, EdgeChange, Node, NodeChange } from '@xyflow/react';

import {
  ReactFlow,
  Background,
  BackgroundVariant,
  PanOnScrollMode,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';

import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import {
  HexagonNode,
  GlassNode,
  AppStoreNode,
  CustomAnimatedEdge,
  NodeDialog,
  NodeContextDrawer,
  PathChatDrawer,
  AppStoreCardDialog,
} from 'src/sections/focus-interface';

import { LiquidGlassOverlay } from 'src/sections/focus-interface/liquid-glass-overlay';
import { Stackable, AvatarCard } from 'src/sections/focus-interface/stackable-avatars';
import { getLayoutedElements } from 'src/sections/focus-interface/dagre-layout';

import { PlaygroundFloatingTextInput } from './floating-text-input';
import {
  PLAYGROUND_GOALS,
  DEFAULT_PLAYGROUND_GOAL,
  getPlaygroundGoalIds,
  type PlaygroundGoal,
} from './playground-data';

// ----------------------------------------------------------------------

type Props = {
  sx?: SxProps<Theme>;
};

function PlaygroundViewInner({ sx }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fitView } = useReactFlow();

  // Current goal state
  const [currentGoal, setCurrentGoal] = useState<PlaygroundGoal>(DEFAULT_PLAYGROUND_GOAL);

  // Node/Edge state
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Dialog states (synced with URL)
  const dialogNodeId = searchParams.get('dialog');
  const dialogType = searchParams.get('type');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAppStoreOpen, setIsAppStoreOpen] = useState(false);

  // UI states
  const [avatarStackOpen, setAvatarStackOpen] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState('');

  // Apply layout when goal changes
  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      currentGoal.nodes.map((node, index) => ({
        ...node,
        data: {
          ...node.data,
          index,
          isExiting: false,
          exitAnimationType: 'slide',
        },
      })),
      currentGoal.edges,
      currentGoal.defaultConfig
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // Fit view after layout
    setTimeout(() => fitView({ padding: 0.2, maxZoom: 0.75 }), 100);
  }, [currentGoal, fitView]);

  // Sync dialog state with URL
  useEffect(() => {
    if (dialogNodeId && dialogType === 'dialog') {
      setIsDialogOpen(true);
    } else if (dialogNodeId && dialogType === 'drawer') {
      setIsDrawerOpen(true);
    } else if (dialogNodeId && dialogType === 'appstore') {
      setIsAppStoreOpen(true);
    }

    if (!dialogNodeId) {
      setIsDialogOpen(false);
      setIsDrawerOpen(false);
      setIsAppStoreOpen(false);
    }
  }, [dialogNodeId, dialogType]);

  // Node types
  const nodeTypes = useMemo(
    () => ({
      hexagon: HexagonNode,
      glass: GlassNode,
      appstore: AppStoreNode,
    }),
    []
  );

  // Edge types
  const edgeTypes = useMemo(() => ({ animated: CustomAnimatedEdge }), []);

  // Handlers
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'animated',
            data: {
              strokeColor: '#4f46e5',
              strokeWidth: 3,
              animationDuration: 1.5,
              enableHoverAnimation: true,
              hoverAnimationType: 'redraw',
              initialAnimation: true,
              lineType: 'curved',
              curvature: 0.3,
            },
          },
          eds
        )
      ),
    []
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const actionType = (node.data?.actionType as string) || 'dialog';
      const params = new URLSearchParams(searchParams);
      params.set('dialog', node.id);
      params.set('type', actionType);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setTimeout(() => router.push('?', { scroll: false }), 300);
  }, [router]);

  const handleCloseContextDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => router.push('?', { scroll: false }), 300);
  }, [router]);

  const handleCloseAppStoreDialog = useCallback(() => {
    setIsAppStoreOpen(false);
    setTimeout(() => router.push('?', { scroll: false }), 300);
  }, [router]);

  const handleCloseChatDrawer = useCallback(() => {
    setChatDrawerOpen(false);
    setInitialChatMessage('');
  }, []);

  const handleSendMessage = useCallback((message: string) => {
    setInitialChatMessage(message);
    setChatDrawerOpen(true);
  }, []);

  const handleGoalSelect = useCallback(
    (goalId: string) => {
      const goal = PLAYGROUND_GOALS[goalId];
      if (goal) {
        setCurrentGoal(goal);
      }
    },
    []
  );

  return (
    <Box
      sx={[
        {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        panOnScroll
        panOnScrollMode={PanOnScrollMode.Free}
        panOnScrollSpeed={1.3}
        zoomOnScroll={false}
        zoomOnPinch
        zoomOnDoubleClick
        minZoom={0.3}
        maxZoom={2}
        preventScrolling
        fitView
        fitViewOptions={{ maxZoom: 0.75, minZoom: 0.5 }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
        defaultEdgeOptions={{ type: 'animated', animated: false }}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>

      {/* Current Goal Indicator - Top Left */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
        <Chip
          icon={<Iconify icon={(currentGoal.icon || 'solar:box-minimalistic-bold') as any} width={20} />}
          label={currentGoal.name}
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 3,
            fontWeight: 600,
            fontSize: '0.875rem',
            px: 1,
            '& .MuiChip-icon': { color: 'primary.main' },
          }}
        />
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
          {currentGoal.description}
        </Typography>
      </Box>

      {/* Goal Switcher - Top Right */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 1 }}>
        {getPlaygroundGoalIds().map((goalId) => {
          const goal = PLAYGROUND_GOALS[goalId];
          const isActive = currentGoal.id === goalId;
          return (
            <Chip
              key={goalId}
              icon={<Iconify icon={(goal.icon || 'solar:flag-bold') as any} width={18} />}
              label={goal.name}
              onClick={() => handleGoalSelect(goalId)}
              variant={isActive ? 'filled' : 'outlined'}
              color={isActive ? 'primary' : 'default'}
              sx={{ cursor: 'pointer', fontWeight: isActive ? 600 : 400 }}
            />
          );
        })}
      </Box>

      {/* Liquid Glass Overlay */}
      <LiquidGlassOverlay
        open={avatarStackOpen}
        onClick={() => setAvatarStackOpen(false)}
        noiseFrequency={0.005}
        distortionStrength={0}
      />

      {/* Bottom Container */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: 700,
          zIndex: 10,
        }}
      >
        {/* FAB - Radial Timeline */}
        <Fab
          color="primary"
          aria-label="open radial timeline"
          sx={{ position: 'absolute', bottom: 104, left: 0, zIndex: 11 }}
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            params.set('dialog', 'fab-button');
            params.set('type', 'dialog');
            router.push(`?${params.toString()}`, { scroll: false });
          }}
        >
          <Iconify icon={'solar:restart-bold' as any} width={24} />
        </Fab>

        {/* Floating Text Input */}
        <Box sx={{ width: '100%' }}>
          <PlaygroundFloatingTextInput
            onSend={handleSendMessage}
            onGoalSelect={handleGoalSelect}
            currentGoalId={currentGoal.id}
          />
        </Box>

        {/* Stackable Avatars */}
        <Box sx={{ position: 'absolute', bottom: 104, right: 0, zIndex: 11 }}>
          <Stackable
            visibleWhenCollapsed={3}
            itemSpacing={3}
            open={avatarStackOpen}
            onOpenChange={setAvatarStackOpen}
          >
            <AvatarCard avatarIndex={1} />
            <AvatarCard avatarIndex={2} />
            <AvatarCard avatarIndex={3} />
            <AvatarCard avatarIndex={4} />
            <AvatarCard avatarIndex={5} />
          </Stackable>
        </Box>
      </Box>

      {/* Dialogs */}
      {dialogNodeId && dialogType === 'dialog' && (
        <NodeDialog
          node={
            nodes.find((n) => n.id === dialogNodeId) ||
            ({ id: dialogNodeId, position: { x: 0, y: 0 }, data: { label: 'Radial Timeline' } } as Node)
          }
          open={isDialogOpen}
          onClose={handleCloseDialog}
        />
      )}

      {dialogNodeId && dialogType === 'drawer' && (
        <NodeContextDrawer
          node={nodes.find((n) => n.id === dialogNodeId) || null}
          open={isDrawerOpen}
          onClose={handleCloseContextDrawer}
        />
      )}

      {dialogNodeId &&
        dialogType === 'appstore' &&
        (() => {
          const node = nodes.find((n) => n.id === dialogNodeId);
          const nodeWithLayoutId = node
            ? {
                ...node,
                data: { ...node.data, useLayoutId: true, layoutTimestamp: Date.now() },
              }
            : null;
          return (
            <AppStoreCardDialog
              key={dialogNodeId}
              open={isAppStoreOpen}
              node={nodeWithLayoutId}
              onClose={handleCloseAppStoreDialog}
            />
          );
        })()}

      <PathChatDrawer
        open={chatDrawerOpen}
        onClose={handleCloseChatDrawer}
        initialMessage={initialChatMessage}
      />
    </Box>
  );
}

// Wrapper with ReactFlowProvider
export function PlaygroundView(props: Props) {
  return (
    <ReactFlowProvider>
      <PlaygroundViewInner {...props} />
    </ReactFlowProvider>
  );
}

