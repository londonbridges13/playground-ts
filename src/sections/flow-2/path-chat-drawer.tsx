'use client';

import { useEffect } from 'react';

import { m } from 'motion/react';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import CloseIcon from '@mui/icons-material/Close';

// ----------------------------------------------------------------------

type PathChatDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function PathChatDrawer({ open, onClose }: PathChatDrawerProps) {
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
        Path Chat
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
      <Typography variant="body1" color="text.secondary">
        Chat content will appear here...
      </Typography>

      {/* Placeholder for chat messages */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
        }}
      >
        {/* Add your chat messages here */}
      </Box>
    </Box>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: { invisible: true }, // Transparent background
        paper: {
          sx: {
            width: 1,
            maxWidth: 480,
            bgcolor: 'background.paper',
            boxShadow: '-40px 40px 80px -8px rgba(0, 0, 0, 0.24)',
          },
        },
      }}
    >
      <m.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {renderHeader()}
        {renderContent()}
      </m.div>
    </Drawer>
  );
}

