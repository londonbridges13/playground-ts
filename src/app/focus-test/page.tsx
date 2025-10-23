// src/app/focus-test/page.tsx
'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { CONFIG } from 'src/global-config';
import { FocusInterfaceView } from 'src/sections/focus-interface';

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
 *
 * Note: FocusInterfaceView now handles all dialogs/drawers internally via URL parameters.
 * Click on nodes to see the new dialog system in action!
 */
export default function FocusTestPage() {
  // Test Focus ID from backend
  const testFocusId = 'cmh3inmsa00072gdtkwiherjh';

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

      {/* Visualization - FocusInterfaceView includes ReactFlowProvider internally */}
      <Box sx={{ flex: 1 }}>
        <FocusInterfaceView focusId={testFocusId} />
      </Box>
    </Box>
  );
}

