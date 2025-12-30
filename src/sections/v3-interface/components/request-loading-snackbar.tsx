'use client';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';

import type { IconifyProps } from 'src/components/iconify';

import { Iconify } from 'src/components/iconify';

import type { FocusRequestStage } from 'src/types/socket';

// ============================================================================
// Types
// ============================================================================

interface RequestLoadingSnackbarProps {
  open: boolean;
  stage: FocusRequestStage | null;
  progress: number;
  message: string | null;
  onClose?: () => void;
}

// Stage display configuration
const STAGE_CONFIG: Record<FocusRequestStage, { label: string; icon: string }> = {
  STARTED: { label: 'Starting...', icon: 'solar:play-bold' },
  CLASSIFYING: { label: 'Classifying request...', icon: 'solar:tag-bold' },
  RESEARCHING: { label: 'Researching...', icon: 'solar:magnifer-bold' },
  ROUTING: { label: 'Routing to AI...', icon: 'solar:routing-bold' },
  EXECUTING: { label: 'Executing...', icon: 'solar:cpu-bolt-bold' },
  FINALIZING: { label: 'Finalizing...', icon: 'solar:check-read-bold' },
  COMPLETE: { label: 'Complete!', icon: 'solar:check-circle-bold' },
  ERROR: { label: 'Error', icon: 'solar:danger-bold' },
};

// ============================================================================
// Component
// ============================================================================

export function RequestLoadingSnackbar({
  open,
  stage,
  progress,
  message,
  onClose,
}: RequestLoadingSnackbarProps) {
  const stageConfig = stage ? STAGE_CONFIG[stage] : STAGE_CONFIG.STARTED;
  const isComplete = stage === 'COMPLETE';
  const isError = stage === 'ERROR';

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{ right: 16, bottom: 16, left: 'auto' }}
    >
      <Paper
        elevation={0}
        sx={(theme) => ({
          width: 320,
          minHeight: 72,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          p: 1.5,
          borderRadius: 2,
          boxShadow: theme.vars.customShadows.z8,
          backgroundColor: theme.vars.palette.background.paper,
          '@keyframes rotate': {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(360deg)' },
          },
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.5 },
          },
        })}
      >
        {/* Header row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Icon container */}
          <Box
            sx={(theme) => ({
              width: 40,
              height: 40,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1.5,
              position: 'relative',
              overflow: 'hidden',
              transition: theme.transitions.create(['background-color', 'color'], {
                duration: theme.transitions.duration.short,
              }),
              ...(isComplete
                ? {
                    backgroundColor: varAlpha(theme.vars.palette.success.mainChannel, 0.08),
                    color: theme.vars.palette.success.main,
                  }
                : isError
                  ? {
                      backgroundColor: varAlpha(theme.vars.palette.error.mainChannel, 0.08),
                      color: theme.vars.palette.error.main,
                    }
                  : {
                      backgroundColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                      color: theme.vars.palette.primary.main,
                    }),
            })}
          >
            {/* Loading spinner for non-complete states */}
            {!isComplete && !isError && (
              <Box
                sx={(theme) => ({
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'inherit',
                  animation: 'rotate 2s infinite linear',
                  background: `conic-gradient(transparent 270deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.3)})`,
                })}
              />
            )}
            <Iconify
              icon={stageConfig.icon as IconifyProps['icon']}
              width={20}
              sx={{
                position: 'relative',
                zIndex: 1,
                animation: !isComplete && !isError ? 'pulse 1.5s infinite ease-in-out' : 'none',
              }}
            />
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={(theme) => ({
                fontWeight: theme.typography.fontWeightSemiBold,
                color: theme.vars.palette.text.primary,
              })}
            >
              {stageConfig.label}
            </Typography>
            {message && (
              <Typography
                variant="caption"
                sx={(theme) => ({
                  color: theme.vars.palette.text.secondary,
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                })}
              >
                {message}
              </Typography>
            )}
          </Box>

          {/* Close button (only for complete/error states) */}
          {(isComplete || isError) && onClose && (
            <IconButton size="small" onClick={onClose} sx={{ ml: 'auto' }}>
              <Iconify icon={'mingcute:close-line' as IconifyProps['icon']} width={18} />
            </IconButton>
          )}
        </Box>

        {/* Progress bar */}
        {!isComplete && !isError && (
          <LinearProgress
            variant={progress > 0 ? 'determinate' : 'indeterminate'}
            value={progress}
            sx={(theme) => ({
              height: 4,
              borderRadius: 2,
              backgroundColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
              },
            })}
          />
        )}

        {/* Progress percentage */}
        {!isComplete && !isError && progress > 0 && (
          <Typography
            variant="caption"
            sx={(theme) => ({
              color: theme.vars.palette.text.disabled,
              textAlign: 'right',
              fontSize: '0.7rem',
            })}
          >
            {Math.round(progress)}%
          </Typography>
        )}
      </Paper>
    </Snackbar>
  );
}

