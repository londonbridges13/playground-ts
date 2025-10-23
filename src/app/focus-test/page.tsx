// src/app/focus-test/page.tsx
'use client';

import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { CONFIG } from 'src/global-config';
import { FocusInterfaceView, NodeDetailDialog } from 'src/sections/focus-interface';

// ----------------------------------------------------------------------

/**
 * Test page for Focus Interface visualization
 * Using test Focus ID: cmh3inmsa00072gdtkwiherjh
 *
 * Focus Details:
 * - Title: Learn TypeScript Fundamentals
 * - Description: A comprehensive learning path for mastering TypeScript
 * - Goal: TypeScript Mastery 🎯
 * - Nodes: 5 (TypeScript Basics, Advanced Types, Generics, Decorators, TypeScript Project)
 * - Edges: 4 connections
 */
export default function FocusTestPage() {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Test Focus ID from backend
  const testFocusId = 'cmh3inmsa00072gdtkwiherjh';

  const handleNodeClick = (nodeId: string, nodeData: any) => {
    console.log('Node clicked:', nodeId, nodeData);
    setSelectedNode(nodeData);
  };

  const handleEdgeClick = (edgeId: string, edgeData: any) => {
    console.log('Edge clicked:', edgeId, edgeData);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Focus Interface Test
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Focus ID: {testFocusId}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => window.open(`${CONFIG.serverUrl}/api/focus/${testFocusId}/interface`, '_blank')}
        >
          View API Response
        </Button>
      </Paper>

      {/* Visualization */}
      <Box sx={{ flex: 1 }}>
        <ReactFlowProvider>
          <FocusInterfaceView
            focusId={testFocusId}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
          />
        </ReactFlowProvider>
      </Box>

      {/* Node Detail Dialog */}
      <NodeDetailDialog
        open={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        nodeData={selectedNode}
      />
    </Box>
  );
}

