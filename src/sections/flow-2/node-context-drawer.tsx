'use client';

import { useEffect } from 'react';

import { m } from 'motion/react';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import CloseIcon from '@mui/icons-material/Close';

import type { Node } from '@xyflow/react';

// ----------------------------------------------------------------------

type NodeContextDrawerProps = {
  node: Node | null;
  open: boolean;
  onClose: () => void;
};

export function NodeContextDrawer({ node, open, onClose }: NodeContextDrawerProps) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const renderHeader = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {node?.data?.label || 'Node Context'}
      </Typography>
      <IconButton onClick={onClose} size="small">
        <CloseIcon />
      </IconButton>
    </Box>
  );

  const renderContent = () => (
    <Box
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Node ID: {node?.id}
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        Node Type: {node?.type}
      </Typography>

      {/* Placeholder for node context content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
        }}
      >
        <Typography variant="body1">
          Node context and details will appear here...
        </Typography>
        {/* Add your node-specific content here */}
      </Box>
    </Box>
  );

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: { invisible: true }, // Transparent background
        paper: {
          sx: {
            width: 1,
            maxWidth: 480,
            bgcolor: 'background.paper',
            boxShadow: '40px 40px 80px -8px rgba(0, 0, 0, 0.24)',
          },
        },
      }}
    >
      <m.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {renderHeader()}
        {renderContent()}
      </m.div>
    </Drawer>
  );
}

