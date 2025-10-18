'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';

import '@xyflow/react/dist/style.css';

import type { Theme, SxProps } from '@mui/material/styles';
import type { Connection, Edge, EdgeChange, Node, NodeChange } from '@xyflow/react';

import { ReactFlow, Background, addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';

import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';

import { CustomAnimatedEdge } from './custom-edge';
import { FloatingTextInput } from './floating-text-input';
import { GlassNode } from './glass-node';
import { HexagonNode } from './hexagon-node';
import { LiquidGlassOverlay } from './liquid-glass-overlay';
import { NodeDialog } from './node-dialog';
import { NodeContextDrawer } from './node-context-drawer';
import { PathChatDrawer } from './path-chat-drawer';
import { Stackable, AvatarCard } from './stackable-avatars';
import { getLayoutedElements } from './dagre-layout';
import { GOALS, DEFAULT_GOAL, type Goal } from './goals-data';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

type Props = {
  sx?: SxProps<Theme>;
};

export function FlowView({ sx }: Props) {
  // Current goal state
  const [currentGoal, setCurrentGoal] = useState<Goal>(DEFAULT_GOAL);
  const [currentLayoutConfig, setCurrentLayoutConfig] = useState('organic');

  // Apply Dagre layout to current goal
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(
      currentGoal.nodes,
      currentGoal.edges,
      currentGoal.defaultConfig
    ),
    [currentGoal]
  );

  const [nodes, setNodes] = useState<Node[]>(layoutedNodes);
  const [edges, setEdges] = useState<Edge[]>(layoutedEdges);

  // Update nodes/edges when goal changes
  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges]);

  // Handle goal selection from text input
  const handleGoalSelect = useCallback((goalId: string) => {
    const goal = GOALS[goalId];
    if (goal) {
      console.log('Loading goal:', goal.name);
      setCurrentGoal(goal);
      setCurrentLayoutConfig('organic'); // Reset to default layout
    }
  }, []);

  // Function to switch between layout configs
  const switchLayout = useCallback((configName: string) => {
    const config = currentGoal.layoutConfigs[configName];
    if (config) {
      const { nodes: newNodes, edges: newEdges } = getLayoutedElements(
        currentGoal.nodes,
        currentGoal.edges,
        config
      );
      setNodes(newNodes);
      setEdges(newEdges);
      setCurrentLayoutConfig(configName);
    }
  }, [currentGoal]);

  // State for NodeDialog
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // State for avatar stack blur effect
  const [avatarStackOpen, setAvatarStackOpen] = useState(false);

  // State for PathChatDrawer
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

  // State for NodeContextDrawer
  const [contextDrawerOpen, setContextDrawerOpen] = useState(false);
  const [contextNode, setContextNode] = useState<Node | null>(null);

  // Define node types - memoized to prevent re-renders
  const nodeTypes = useMemo(() => ({ hexagon: HexagonNode, glass: GlassNode }), []);

  // Define edge types - memoized to prevent re-renders
  const edgeTypes = useMemo(() => ({ animated: CustomAnimatedEdge }), []);

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
              animationBounce: 0.3,
              animationDelay: 0,
              reverseAnimation: false,
              enableHoverAnimation: true,
              hoverAnimationType: 'redraw',
              hoverStrokeColor: '#6366f1',
              initialAnimation: true,
              // Artistic path options
              pathStyle: 'flowing',
              curviness: 0.5,
              complexity: 3,
            },
          },
          eds
        )
      ),
    []
  );

  // Handle node click - route to dialog or drawer based on node data
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const actionType = node.data?.actionType || 'dialog'; // Default to 'dialog'

    if (actionType === 'drawer') {
      // Open context drawer for nodes configured with actionType: 'drawer'
      setContextNode(node);
      setContextDrawerOpen(true);
    } else {
      // Open radial dialog for nodes configured with actionType: 'dialog' (or default)
      setSelectedNode(node);
      setDialogOpen(true);
    }
  }, []);

  // Handle dialog close
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    // Optional: Clear selected node after animation completes
    setTimeout(() => setSelectedNode(null), 500);
  }, []);

  // Handle context drawer close
  const handleCloseContextDrawer = useCallback(() => {
    setContextDrawerOpen(false);
    // Optional: Clear context node after animation completes
    setTimeout(() => setContextNode(null), 500);
  }, []);

  // Handle chat drawer
  const handleSendMessage = useCallback((message: string) => {
    console.log('Message sent:', message);
    setChatDrawerOpen(true);
  }, []);

  const handleCloseChatDrawer = useCallback(() => {
    setChatDrawerOpen(false);
  }, []);

  const renderContent = () => (
    <Box
      sx={[
        (theme) => ({
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
        }),
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
        panOnScrollMode="free"
        panOnScrollSpeed={1.3}
        zoomOnScroll={false}
        zoomOnPinch
        zoomOnDoubleClick
        minZoom={0.5}
        maxZoom={2}
        preventScrolling
        fitView
        fitViewOptions={{
          maxZoom: 0.75,
          minZoom: 0.75,
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
        defaultEdgeOptions={{
          type: 'animated',
          animated: false,
        }}
      >
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>

      {/* Current Goal Indicator - Top Left */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 10,
        }}
      >
        <Chip
          icon={<Iconify icon={currentGoal.icon || 'solar:target-bold'} width={20} />}
          label={currentGoal.name}
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 3,
            fontWeight: 600,
            fontSize: '0.875rem',
            px: 1,
            '& .MuiChip-icon': {
              color: 'primary.main',
            },
          }}
        />
      </Box>

      {/* Layout Switcher - Top Right */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          display: 'flex',
          gap: 1,
          flexDirection: 'column',
        }}
      >
        <Fab
          size="small"
          onClick={() => switchLayout('organic')}
          sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
          title="Organic Layout"
        >
          <Iconify icon="mdi:waves" />
        </Fab>
        <Fab
          size="small"
          onClick={() => switchLayout('clean')}
          sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
          title="Clean Layout"
        >
          <Iconify icon="mdi:align-horizontal-center" />
        </Fab>
        <Fab
          size="small"
          onClick={() => switchLayout('dramatic')}
          sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
          title="Dramatic Layout"
        >
          <Iconify icon="mdi:chart-timeline-variant" />
        </Fab>
        <Fab
          size="small"
          onClick={() => switchLayout('grouped')}
          sx={{ bgcolor: 'info.main', '&:hover': { bgcolor: 'info.dark' } }}
          title="Grouped Layout"
        >
          <Iconify icon="mdi:group" />
        </Fab>
        <Fab
          size="small"
          onClick={() => switchLayout('strict')}
          sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
          title="Strict Layout"
        >
          <Iconify icon="mdi:format-align-justify" />
        </Fab>
      </Box>

      {/* Liquid Glass Overlay - appears when avatars are expanded */}
      <LiquidGlassOverlay
        open={avatarStackOpen}
        onClick={() => setAvatarStackOpen(false)}
        noiseFrequency={0.005}
        distortionStrength={0}
      />

      {/* Container for all bottom elements */}
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
        {/* Floating button - Bottom Left */}
        <Fab
          color="primary"
          aria-label="open radial timeline"
          sx={{
            position: 'absolute',
            bottom: 104,
            left: 0,
            zIndex: 11,
          }}
          onClick={() => {
            setSelectedNode({ id: 'fab-button', data: { label: 'Radial Timeline' } } as Node);
            setDialogOpen(true);
          }}
        >
          <Iconify icon="lucide:loader" width={24} />
        </Fab>

        {/* Floating Text Input */}
        <Box sx={{ width: '100%' }}>
          <FloatingTextInput
            onSend={handleSendMessage}
            onGoalSelect={handleGoalSelect}
          />
        </Box>

        {/* Stackable Avatar Component - Bottom Right */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 104,
            right: 0,
            zIndex: 11,
          }}
        >
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
            <AvatarCard avatarIndex={6} />
            <AvatarCard avatarIndex={7} />
          </Stackable>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {renderContent()}

      {/* NodeDialog with React Portal - renders outside React Flow */}
      <NodeDialog
        node={selectedNode}
        open={dialogOpen}
        onClose={handleCloseDialog}
      />

      {/* NodeContextDrawer - opens from left with transparent background */}
      <NodeContextDrawer
        node={contextNode}
        open={contextDrawerOpen}
        onClose={handleCloseContextDrawer}
      />

      {/* PathChatDrawer - opens from right with transparent background */}
      <PathChatDrawer
        open={chatDrawerOpen}
        onClose={handleCloseChatDrawer}
      />
    </>
  );
}

