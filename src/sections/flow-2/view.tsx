'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Node, Edge, NodeChange, EdgeChange, Connection } from '@xyflow/react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';

import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { HexagonNode } from './hexagon-node';
import { CustomAnimatedEdge } from './custom-edge';
import { NodeDialog } from './node-dialog';
import { Stackable, AvatarCard } from './stackable-avatars';

// ----------------------------------------------------------------------

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'hexagon',
    position: { x: -145, y: -75.33 },
    data: { label: 'Node 1', opacity: 1 }
  },
  {
    id: '2',
    type: 'hexagon',
    position: { x: 429.80, y: -52.41 },
    data: { label: 'Node 2', opacity: 1 }
  },
  {
    id: '3',
    type: 'hexagon',
    position: { x: 200, y: 200 },
    data: { label: 'Node 3', opacity: 1 }
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    sourceHandle: 'right',
    targetHandle: 'left',
    type: 'animated',
    data: {
      strokeColor: '#000000',
      strokeWidth: 2,
      animationDuration: 3,
      animationBounce: 0.3,
      animationDelay: 0,
      reverseAnimation: false,
      enableHoverAnimation: false,
      hoverAnimationType: 'redraw',
      hoverStrokeColor: '#4f46e5',
      initialAnimation: true,
      useStaticPath: false,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
    },
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    sourceHandle: 'right',
    targetHandle: 'left',
    type: 'animated',
    data: {
      strokeColor: '#10b981',
      strokeWidth: 2,
      animationDuration: 2,
      animationBounce: 0.3,
      animationDelay: 0,
      reverseAnimation: false,
      enableHoverAnimation: false,
      hoverAnimationType: 'redraw',
      hoverStrokeColor: '#34d399',
      initialAnimation: true,
      useStaticPath: false,
      lineType: 'artistic',
      curvature: 0.3,
      edgePadding: 50,
    },
  },
];

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function FlowView({ title = 'Flow', description, sx }: Props) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // State for NodeDialog
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Define node types - memoized to prevent re-renders
  const nodeTypes = useMemo(() => ({ hexagon: HexagonNode }), []);

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

  // Handle node click to open Radial Timeline
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setDialogOpen(true);
  }, []);

  // Handle dialog close
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    // Optional: Clear selected node after animation completes
    setTimeout(() => setSelectedNode(null), 500);
  }, []);

  const renderContent = () => (
    <Box
      sx={[
        (theme) => ({
          mt: 5,
          width: 1,
          height: 600,
          borderRadius: 2,
          border: `solid 1px ${theme.vars.palette.divider}`,
          overflow: 'hidden',
          position: 'relative',
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
        fitView
        defaultEdgeOptions={{
          type: 'animated',
          animated: false,
        }}
      >
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>

      {/* Floating button - Bottom Left */}
      <Fab
        color="primary"
        aria-label="open radial timeline"
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 10,
        }}
        onClick={() => {
          setSelectedNode({ id: 'fab-button', data: { label: 'Radial Timeline' } } as Node);
          setDialogOpen(true);
        }}
      >
        <Iconify icon="lucide:loader" width={24} />
      </Fab>

      {/* Stackable Avatar Component - Bottom Right */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        zIndex: 10
      }}>
        <Stackable visibleWhenCollapsed={3} itemSpacing={3}>
          <AvatarCard avatarIndex={1} />
          <AvatarCard avatarIndex={2} />
          <AvatarCard avatarIndex={3} />
          <AvatarCard avatarIndex={4} />
          <AvatarCard avatarIndex={5} />
          <AvatarCard avatarIndex={6} />
          <AvatarCard avatarIndex={7} />
        </Stackable>
      </div>
    </Box>
  );

  return (
    <>
      <DashboardContent maxWidth="xl">
        <Typography variant="h4"> {title} </Typography>
        {description && <Typography sx={{ mt: 1 }}> {description} </Typography>}

        {renderContent()}
      </DashboardContent>

      {/* NodeDialog with React Portal - renders outside React Flow */}
      <NodeDialog
        node={selectedNode}
        open={dialogOpen}
        onClose={handleCloseDialog}
      />
    </>
  );
}

