'use client';

import { useState } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

import type { IconifyProps } from 'src/components/iconify';

import { Iconify } from 'src/components/iconify';

// ============================================================================
// Types
// ============================================================================

interface RequestErrorSnackbarProps {
  open: boolean;
  error: string | null;
  recoverable: boolean;
  onClose: () => void;
  onRetry?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function RequestErrorSnackbar({
  open,
  error,
  recoverable,
  onClose,
  onRetry,
}: RequestErrorSnackbarProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{ right: 16, bottom: 16, left: 'auto' }}
    >
      <Paper
        elevation={0}
        sx={(theme) => ({
          width: 360,
          maxWidth: '90vw',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          boxShadow: theme.vars.customShadows.z8,
          backgroundColor: theme.vars.palette.background.paper,
          overflow: 'hidden',
        })}
      >
        {/* Header */}
        <Box
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            backgroundColor: varAlpha(theme.vars.palette.error.mainChannel, 0.08),
          })}
        >
          {/* Error icon */}
          <Box
            sx={(theme) => ({
              width: 40,
              height: 40,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1.5,
              backgroundColor: varAlpha(theme.vars.palette.error.mainChannel, 0.16),
              color: theme.vars.palette.error.main,
            })}
          >
            <Iconify icon={'solar:danger-bold' as IconifyProps['icon']} width={22} />
          </Box>

          {/* Title */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={(theme) => ({
                fontWeight: theme.typography.fontWeightSemiBold,
                color: theme.vars.palette.text.primary,
              })}
            >
              Request Failed
            </Typography>
            <Typography
              variant="caption"
              sx={(theme) => ({
                color: theme.vars.palette.text.secondary,
              })}
            >
              {recoverable ? 'You can try again' : 'Please try a different request'}
            </Typography>
          </Box>

          {/* Close button */}
          <IconButton size="small" onClick={onClose}>
            <Iconify icon={'mingcute:close-line' as IconifyProps['icon']} width={18} />
          </IconButton>
        </Box>

        {/* Error message */}
        <Box sx={{ px: 1.5, py: 1.5 }}>
          <Typography
            variant="body2"
            sx={(theme) => ({
              color: theme.vars.palette.text.secondary,
              lineHeight: 1.6,
              backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
              borderRadius: 1,
              p: 1.5,
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              wordBreak: 'break-word',
            })}
          >
            {error || 'An unknown error occurred'}
          </Typography>
        </Box>

        {/* Action buttons */}
        {recoverable && onRetry && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              pb: 1.5,
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={onClose}
              sx={{ flex: 1 }}
            >
              Dismiss
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={handleRetry}
              disabled={isRetrying}
              startIcon={
                isRetrying ? (
                  <Iconify icon={'svg-spinners:ring-resize' as IconifyProps['icon']} width={16} />
                ) : (
                  <Iconify icon={'solar:refresh-bold' as IconifyProps['icon']} width={16} />
                )
              }
              sx={{ flex: 1 }}
            >
              Retry
            </Button>
          </Box>
        )}
      </Paper>
    </Snackbar>
  );
}

