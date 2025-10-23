'use client';

import { useEffect } from 'react';

import { m } from 'motion/react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

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
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        px: 2,
        py: 2,
        borderBottom: '1px solid',
        borderColor: (theme) => theme.palette.divider,
        backdropFilter: 'saturate(150%) blur(20px)',
        backgroundColor: (theme) =>
          varAlpha(theme.vars.palette.background.paperChannel, 0.9),
        justifyContent: 'space-between',
      }}
    >
      {/* Left: Close Button */}
      <Tooltip title="Close">
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
      </Tooltip>

      {/* Center: Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, flex: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
          sx={{
            fontSize: '0.875rem',
            color: 'text.secondary',
            borderColor: 'divider',
            textTransform: 'none',
          }}
        >
          Copy ID
        </Button>
        <Button
          size="small"
          variant="outlined"
          endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
          sx={{
            fontSize: '0.875rem',
            color: 'text.secondary',
            borderColor: 'divider',
            textTransform: 'none',
          }}
        >
          Node Details
        </Button>
      </Box>

      {/* Right: Navigation Buttons */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Tooltip title="Previous">
          <IconButton
            size="small"
            sx={{
              color: 'text.secondary',
              bgcolor: 'action.hover',
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Next">
          <IconButton
            size="small"
            sx={{
              color: 'text.secondary',
              bgcolor: 'action.hover',
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  const renderContent = () => (
    <Box
      sx={{
        px: 3,
        pt: 3,
        pb: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {/* Image Section */}
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          pt: 2,
        }}
      >
        <Box
          component="img"
          src="https://nextuipro.nyc3.cdn.digitaloceanspaces.com/components-images/places/san-francisco.png"
          alt="Node visualization"
          sx={{
            aspectRatio: '1 / 1',
            width: '100%',
            height: 300,
            objectFit: 'cover',
            borderRadius: 2,
            filter: 'blur(0px)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)',
              filter: 'blur(0px)',
            },
          }}
        />
      </Box>

      {/* Node Title */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {node?.data?.label || 'Node Context'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ID: {node?.id} • Type: {node?.type}
        </Typography>
      </Box>

      {/* Node Details Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Date/Time Info */}
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <Box
            sx={{
              flexShrink: 0,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              textAlign: 'center',
              width: 44,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                fontSize: '0.75rem',
                bgcolor: 'action.hover',
                py: 0.5,
                color: 'text.secondary',
              }}
            >
              Nov
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '0.875rem',
                height: 24,
                color: 'text.secondary',
              }}
            >
              19
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Tuesday, November 19
            </Typography>
            <Typography variant="body2" color="text.secondary">
              5:00 PM - 9:00 PM PST
            </Typography>
          </Box>
        </Box>

        {/* Location Info */}
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              width: 44,
              height: 44,
              flexShrink: 0,
            }}
          >
            <svg
              style={{ color: 'currentColor' }}
              height="20"
              viewBox="0 0 16 16"
              width="20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g
                fill="none"
                fillRule="evenodd"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              >
                <path d="M2 6.854C2 11.02 7.04 15 8 15s6-3.98 6-8.146C14 3.621 11.314 1 8 1S2 3.62 2 6.854" />
                <path d="M9.5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
              </g>
            </svg>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography
              component="a"
              href="https://www.google.com/maps/place/555+California+St,+San+Francisco,+CA+94103"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontWeight: 500,
                fontSize: '0.875rem',
                color: 'text.primary',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              555 California St suite 500
              <OpenInNewIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              San Francisco, California
            </Typography>
          </Box>
        </Box>

        {/* Node Properties */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Properties
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip label={`Type: ${node?.type}`} size="small" variant="outlined" />
            <Chip label={`Action: ${node?.data?.actionType || 'N/A'}`} size="small" variant="outlined" />
            {node?.data?.opacity !== undefined && (
              <Chip label={`Opacity: ${node.data.opacity}`} size="small" variant="outlined" />
            )}
          </Box>
        </Box>

        {/* About Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            About this node
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              This node is part of your flow diagram. You can interact with it by clicking, dragging, or connecting it to other nodes.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Node properties and behaviors can be customized through the data object. The current action type determines what happens when you click on this node.
            </Typography>
          </Box>
        </Box>

        {/* Additional Info */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Created by
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 80 80" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                <mask id="r9j" maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="80">
                  <rect width="80" height="80" rx="160" fill="#FFFFFF"></rect>
                </mask>
                <g mask="url(#r9j)">
                  <rect width="80" height="80" fill="#f8fcc1"></rect>
                  <path filter="url(#filter_r9j)" d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z" fill="#1693a7" transform="translate(-2 2) rotate(-266 40 40) scale(1.5)"></path>
                  <path filter="url(#filter_r9j)" d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z" fill="#cc0c39" transform="translate(7 7) rotate(39 40 40) scale(1.5)" style={{ mixBlendMode: 'overlay' }}></path>
                </g>
                <defs>
                  <filter id="filter_r9j" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
                    <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
                    <feGaussianBlur stdDeviation="7" result="effect1_foregroundBlur"></feGaussianBlur>
                  </filter>
                </defs>
              </svg>
            </Box>
            <Typography variant="body2" color="text.secondary">
              User
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
        paper: {
          sx: {
            width: 1,
            maxWidth: 480,
            m: 2,
            borderRadius: 2,
            maxHeight: 'calc(100vh - 32px)',
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
        style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
      >
        {renderHeader()}
        {renderContent()}
      </m.div>
    </Drawer>
  );
}

