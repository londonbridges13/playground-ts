// src/sections/focus-interface/example-page.tsx
'use client';

/**
 * Example usage of FocusInterfaceView
 * 
 * To use this in your app:
 * 1. Create a page at: src/app/focus/[id]/page.tsx
 * 2. Import and use this component or copy the pattern
 */

import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { FocusInterfaceView } from './view';
import { NodeDetailDialog } from './components/node-detail-dialog';

// ----------------------------------------------------------------------

interface FocusInterfacePageProps {
  focusId: string;
}

export function FocusInterfacePage({ focusId }: FocusInterfacePageProps) {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const handleNodeClick = (nodeId: string, nodeData: any) => {
    setSelectedNode(nodeData);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <Paper
        sx={{
          width: 320,
          borderRight: 1,
          borderColor: 'divider',
          p: 2,
          overflowY: 'auto',
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Focus Interface
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Visualizing focus: {focusId}
        </Typography>
        {/* Add your controls here */}
      </Paper>

      {/* Visualization */}
      <Box sx={{ flex: 1 }}>
        <ReactFlowProvider>
          <FocusInterfaceView focusId={focusId} onNodeClick={handleNodeClick} />
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

