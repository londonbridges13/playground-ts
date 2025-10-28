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
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useFocusInterface } from 'src/hooks';

import { CustomAnimatedEdge } from './custom-edge';
import { FloatingTextInput } from './floating-text-input';
import { GlassNode } from './nodes/glass-node';
import { HexagonNode } from './nodes/hexagon-node';
import { AppStoreNode } from './nodes/appstore-node';
import { LiquidGlassOverlay } from './liquid-glass-overlay';
import { NodeDialog } from './node-dialog';
import { NodeContextDrawer } from './node-context-drawer';
import { PathChatDrawer } from './path-chat-drawer';
import { AppStoreCardDialog } from './appstore-card-dialog';
import { Stackable, AvatarCard } from './stackable-avatars';

// ----------------------------------------------------------------------

type Props = {
  focusId: string;
  sx?: SxProps<Theme>;
};

function FocusInterfaceViewInner({ focusId, sx }: Props) {
  const { screenToFlowPosition } = useReactFlow();
  const { focusInterface, loading, error } = useFocusInterface(focusId);

  // Transform API nodes to add animation properties
  const transformedNodes = useMemo(() => {
    if (!focusInterface?.nodes) return [];
    return focusInterface.nodes.map((node, index) => ({
      ...node,
      data: {
        ...node.data,
        index, // For stagger animations
        isExiting: false,
        exitAnimationType: 'slide',
      },
    }));
  }, [focusInterface]);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Update nodes/edges when API data loads
  useEffect(() => {
    if (transformedNodes.length > 0) {
      setNodes(transformedNodes);
    }
  }, [transformedNodes]);

  useEffect(() => {
    if (focusInterface?.edges) {
      setEdges(focusInterface.edges);
    }
  }, [focusInterface?.edges]);

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
  const [initialChatMessage, setInitialChatMessage] = useState<string | null>(null);

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
      // Capture screen position for morphing animation
      const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
      const rect = nodeElement?.getBoundingClientRect();
      const screenPosition = rect ? {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      } : null;

      // Enable layoutId and store screen position
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

      // Small delay to ensure layoutId is applied
      requestAnimationFrame(() => {
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

  // Handle dialog close
  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setTimeout(() => {
      router.back();
    }, 300);
  }, [router]);

  // Handle context drawer close
  const handleCloseContextDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      router.back();
    }, 300);
  }, [router]);

  // Handle AppStore card dialog close
  const handleCloseAppStoreDialog = useCallback(() => {
    setIsAppStoreOpen(false);

    setTimeout(() => {
      router.back();
    }, 500);

    setTimeout(() => {
      setNodes(prevNodes =>
        prevNodes.map(n =>
          n.data?.actionType === 'appstore'
            ? { ...n, data: { ...n.data, useLayoutId: false } }
            : n
        )
      );
    }, 500);
  }, [router]);

  // Handle chat drawer
  const handleSendMessage = useCallback((message: string) => {
    console.log('Message sent:', message);
    setInitialChatMessage(message);
    setChatDrawerOpen(true);
  }, []);

  const handleCloseChatDrawer = useCallback(() => {
    setChatDrawerOpen(false);
    setInitialChatMessage(null);
  }, []);

  // Handle drag over
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop on canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const data = event.dataTransfer.getData('application/reactflow');
      if (!data) return;

      const nodeData = JSON.parse(data);

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: nodeData.type,
        position,
        data: {
          label: nodeData.label,
          opacity: 1,
          index: nodes.length,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, nodes.length]
  );

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={48} />
          <Typography variant="body1" sx={{ mt: 2 }} color="text.secondary">
            Loading visualization...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="error" fontWeight="bold">
            Error
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }} color="text.secondary">
            {error}
          </Typography>
        </Box>
      </Box>
    );
  }

  // No data state
  if (!focusInterface) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No interface available
          </Typography>
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }} color="text.disabled">
            Generate an interface to visualize this Focus
          </Typography>
        </Box>
      </Box>
    );
  }

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
          icon={<Iconify icon={focusInterface.goal?.icon || 'solar:target-bold'} width={20} />}
          label={focusInterface.goal?.name || 'Focus'}
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
            onGoalSelect={() => {}}
            currentGoalId={focusId}
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
        initialMessage={initialChatMessage}
      />
    </>
  );
}

// Wrapper component with ReactFlowProvider
export function FocusInterfaceView(props: Props) {
  return (
    <ReactFlowProvider>
      <FocusInterfaceViewInner {...props} />
    </ReactFlowProvider>
  );
}
