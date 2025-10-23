// src/sections/focus-interface/view.tsx
'use client';

import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import type { Connection, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useFocusInterface } from 'src/hooks';
import { HexagonNode } from './nodes/hexagon-node';
import { GlassNode } from './nodes/glass-node';
import { AppStoreNode } from './nodes/appstore-node';

// ----------------------------------------------------------------------

const nodeTypes = {
  hexagon: HexagonNode,
  glass: GlassNode,
  appstore: AppStoreNode,
};

// ----------------------------------------------------------------------

interface FocusInterfaceViewProps {
  focusId: string;
  onNodeClick?: (nodeId: string, nodeData: any) => void;
  onEdgeClick?: (edgeId: string, edgeData: any) => void;
  editable?: boolean;
}

export function FocusInterfaceView({
  focusId,
  onNodeClick,
  onEdgeClick,
  editable = false,
}: FocusInterfaceViewProps) {
  const { focusInterface, loading, error } = useFocusInterface(focusId);
  const { fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Load interface data
  useEffect(() => {
    if (focusInterface) {
      setNodes(focusInterface.nodes);
      setEdges(focusInterface.edges);

      // Fit view after nodes are loaded
      setTimeout(() => fitView({ padding: 0.2 }), 100);
    }
  }, [focusInterface, setNodes, setEdges, fitView]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (editable) {
        setEdges((eds) => addEdge(params, eds));
      }
    },
    [setEdges, editable]
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: any) => {
      if (onNodeClick) {
        onNodeClick(node.id, node.data);
      }
    },
    [onNodeClick]
  );

  const handleEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      if (onEdgeClick) {
        onEdgeClick(edge.id, edge.data);
      }
    },
    [onEdgeClick]
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
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

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
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

  if (!focusInterface) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
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

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={editable ? onNodesChange : undefined}
        onEdgesChange={editable ? onEdgesChange : undefined}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        nodesDraggable={editable}
        nodesConnectable={editable}
        elementsSelectable
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'hexagon':
                return '#4F46E5';
              case 'glass':
                return '#10B981';
              case 'appstore':
                return '#F59E0B';
              default:
                return '#6B7280';
            }
          }}
        />

        {/* Goal Panel */}
        {focusInterface.goal && (
          <Panel position="top-left">
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              {focusInterface.goal.icon && (
                <Typography variant="h4">{focusInterface.goal.icon}</Typography>
              )}
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {focusInterface.goal.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {focusInterface.goal.description}
                </Typography>
              </Box>
            </Paper>
          </Panel>
        )}
      </ReactFlow>
    </Box>
  );
}

