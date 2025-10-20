'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import '@xyflow/react/dist/style.css';

import type { Theme, SxProps } from '@mui/material/styles';
import type { Connection, Edge, EdgeChange, Node, NodeChange } from '@xyflow/react';

import { ReactFlow, Background, addEdge, applyEdgeChanges, applyNodeChanges, ReactFlowProvider, useReactFlow } from '@xyflow/react';

import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';

import { CustomAnimatedEdge } from './custom-edge';
import { FloatingTextInput } from './floating-text-input';
import { GlassNode } from './glass-node';
import { HexagonNode } from './hexagon-node';
import { AppStoreNode } from './appstore-node';
import { LiquidGlassOverlay } from './liquid-glass-overlay';
import { NodeDialog } from './node-dialog';
import { NodeContextDrawer } from './node-context-drawer';
import { PathChatDrawer } from './path-chat-drawer';
import { AppStoreCardDialog } from './appstore-card-dialog';
import { Stackable, AvatarCard } from './stackable-avatars';
import { getLayoutedElements } from './dagre-layout';
import { GOALS, DEFAULT_GOAL, type Goal } from './goals-data';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

type Props = {
  sx?: SxProps<Theme>;
};

function FlowViewInner({ sx }: Props) {
  const { screenToFlowPosition } = useReactFlow();
  // Current goal state
  const [currentGoal, setCurrentGoal] = useState<Goal>(DEFAULT_GOAL);
  const [currentLayoutConfig, setCurrentLayoutConfig] = useState('organic');
  const [isTransitioning, setIsTransitioning] = useState(false);

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
    if (!isTransitioning) {
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, [layoutedNodes, layoutedEdges, isTransitioning]);

  // Handle goal selection from text input with animation
  const handleGoalSelect = useCallback((goalId: string) => {
    const goal = GOALS[goalId];
    if (goal) {
      console.log('Loading goal:', goal.name);
      setIsTransitioning(true);

      // Randomly choose exit animation type
      const exitAnimationType = Math.random() > 0.5 ? 'slide' : 'shuffle';

      // Calculate exit animation duration dynamically
      // Max stagger delay (nodeIndex * 0.1) + animation duration
      const nodeCount = currentGoal.nodes.length;
      const maxStaggerDelay = (nodeCount - 1) * 0.1 * 1000; // Convert to ms
      const animationDuration = exitAnimationType === 'shuffle' ? 800 : 600; // Shuffle is longer
      const totalExitTime = maxStaggerDelay + animationDuration;

      // Mark all current nodes and edges as exiting to trigger exit animation
      setNodes(prevNodes =>
        prevNodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            isExiting: true,
            exitAnimationType: exitAnimationType,
            useLayoutId: false,  // Disable layoutId during goal transitions to prevent conflicts
          }
        }))
      );

      setEdges(prevEdges =>
        prevEdges.map(edge => ({
          ...edge,
          data: {
            ...edge.data,
            isExiting: true,
            exitAnimationType: exitAnimationType
          }
        }))
      );

      // Wait for exit animations to complete before switching goal
      setTimeout(() => {
        setCurrentGoal(goal);
        setCurrentLayoutConfig('organic'); // Reset to default layout
        setIsTransitioning(false);
      }, totalExitTime);
    }
  }, [currentGoal]);

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

  // Query parameter routing for dialogs
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get dialog state from URL query parameters
  const dialogNodeId = searchParams.get('dialog');
  const dialogType = searchParams.get('type');

  // Local state to control dialog open props for smooth exit animations
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAppStoreOpen, setIsAppStoreOpen] = useState(false);

  // State for avatar stack blur effect
  const [avatarStackOpen, setAvatarStackOpen] = useState(false);

  // State for PathChatDrawer
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

  // Sync local state with URL parameters for smooth animations
  useEffect(() => {
    if (dialogNodeId && dialogType === 'dialog') {
      setIsDialogOpen(true);
    } else if (dialogNodeId && dialogType === 'drawer') {
      setIsDrawerOpen(true);
    } else if (dialogNodeId && dialogType === 'appstore') {
      setIsAppStoreOpen(true);
    }

    // Reset all dialog states when URL has no dialog parameter
    if (!dialogNodeId) {
      setIsDialogOpen(false);
      setIsDrawerOpen(false);
      setIsAppStoreOpen(false);
    }
  }, [dialogNodeId, dialogType]);

  // Define node types - memoized to prevent re-renders
  const nodeTypes = useMemo(() => ({
    hexagon: HexagonNode,
    glass: GlassNode,
    appstore: AppStoreNode
  }), []);

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

  // Handle node click - update URL query parameters based on node data
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const actionType = node.data?.actionType || 'dialog'; // Default to 'dialog'

    if (actionType === 'appstore') {
      // STEP 1: Capture the screen position of the node element for morphing animation
      const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
      const rect = nodeElement?.getBoundingClientRect();
      const screenPosition = rect ? {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      } : null;

      // STEP 2: Enable layoutId and store screen position on the clicked node
      // This must happen before opening the dialog for the shared element transition to work
      setNodes(prevNodes =>
        prevNodes.map(n =>
          n.id === node.id
            ? {
                ...n,
                data: {
                  ...n.data,
                  useLayoutId: true,
                  layoutTimestamp: Date.now()
                },
                _screenPosition: screenPosition
              }
            : n
        )
      );

      // STEP 3: Small delay to ensure layoutId is applied before dialog opens
      // This gives React a chance to re-render the node with layoutId
      requestAnimationFrame(() => {
        // Navigate using query parameters
        const params = new URLSearchParams(searchParams);
        params.set('dialog', node.id);
        params.set('type', 'appstore');
        router.push(`?${params.toString()}`, { scroll: false });
      });
    } else {
      // Navigate using query parameters for drawer and dialog
      const params = new URLSearchParams(searchParams);
      params.set('dialog', node.id);
      params.set('type', actionType);
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, router]);

  // Handle dialog close - trigger exit animation, then navigate
  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);  // Trigger exit animation
    setTimeout(() => {
      router.back();  // Navigate after animation completes
    }, 300);  // Match NodeDialog exit animation duration
  }, [router]);

  // Handle context drawer close - trigger exit animation, then navigate
  const handleCloseContextDrawer = useCallback(() => {
    setIsDrawerOpen(false);  // Trigger exit animation
    setTimeout(() => {
      router.back();  // Navigate after animation completes
    }, 300);  // Match Drawer exit animation duration
  }, [router]);

  // Handle AppStore card dialog close - trigger exit animation, then navigate
  const handleCloseAppStoreDialog = useCallback(() => {
    setIsAppStoreOpen(false);  // Trigger exit animation

    setTimeout(() => {
      router.back();  // Navigate after animation completes
    }, 500);  // Match the closeSpring animation duration

    // STEP 3: Disable layoutId after exit animation completes
    // This runs in parallel with router.back(), not nested
    setTimeout(() => {
      setNodes(prevNodes =>
        prevNodes.map(n =>
          n.data?.actionType === 'appstore'
            ? { ...n, data: { ...n.data, useLayoutId: false } }
            : n
        )
      );
    }, 500);  // Same timing as router.back() to ensure layoutId stays active during animation
  }, [router]);

  // Handle chat drawer
  const handleSendMessage = useCallback((message: string) => {
    console.log('Message sent:', message);
    setChatDrawerOpen(true);
  }, []);

  const handleCloseChatDrawer = useCallback(() => {
    setChatDrawerOpen(false);
  }, []);

  // Handle drag over - required to allow drop
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop on canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      // Get the node data from the drag event
      const data = event.dataTransfer.getData('application/reactflow');
      if (!data) return;

      const nodeData = JSON.parse(data);

      // Convert screen position to flow position
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Create new node
      const newNode: Node = {
        id: `node-${Date.now()}`, // Generate unique ID
        type: nodeData.type,
        position,
        data: {
          label: nodeData.label,
          opacity: 1,
          index: nodes.length, // For animation stagger
        },
      };

      // Add node to the flow
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, nodes.length]
  );

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
        onDrop={onDrop}
        onDragOver={onDragOver}
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
            const params = new URLSearchParams(searchParams);
            params.set('dialog', 'fab-button');
            params.set('type', 'dialog');
            router.push(`?${params.toString()}`, { scroll: false });
          }}
        >
          <Iconify icon="lucide:loader" width={24} />
        </Fab>

        {/* Floating Text Input */}
        <Box sx={{ width: '100%' }}>
          <FloatingTextInput
            onSend={handleSendMessage}
            onGoalSelect={handleGoalSelect}
            currentGoalId={currentGoal.id}
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

      {/* Conditionally render dialogs based on URL query parameters */}
      {dialogNodeId && dialogType === 'dialog' && (
        <NodeDialog
          node={nodes.find(n => n.id === dialogNodeId) ||
                { id: dialogNodeId, data: { label: 'Radial Timeline' } } as Node}
          open={isDialogOpen}
          onClose={handleCloseDialog}
        />
      )}

      {dialogNodeId && dialogType === 'drawer' && (
        <NodeContextDrawer
          node={nodes.find(n => n.id === dialogNodeId) || null}
          open={isDrawerOpen}
          onClose={handleCloseContextDrawer}
        />
      )}

      {dialogNodeId && dialogType === 'appstore' && (() => {
        const node = nodes.find(n => n.id === dialogNodeId);

        // Prepare node with layoutId for animation
        const nodeWithLayoutId = node ? {
          ...node,
          data: {
            ...node.data,
            useLayoutId: true,
            layoutTimestamp: Date.now()
          }
        } : null;

        return (
          <AppStoreCardDialog
            key={dialogNodeId}
            open={isAppStoreOpen}
            node={nodeWithLayoutId}
            onClose={handleCloseAppStoreDialog}
          />
        );
      })()}

      {/* PathChatDrawer - opens from right with transparent background */}
      <PathChatDrawer
        open={chatDrawerOpen}
        onClose={handleCloseChatDrawer}
      />
    </>
  );
}

// Wrapper component with ReactFlowProvider
export function FlowView(props: Props) {
  return (
    <ReactFlowProvider>
      <FlowViewInner {...props} />
    </ReactFlowProvider>
  );
}

