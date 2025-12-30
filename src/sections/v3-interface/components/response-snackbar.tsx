'use client';

import { useState } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';

import type { IconifyProps } from 'src/components/iconify';

import { Iconify } from 'src/components/iconify';

// ============================================================================
// Types
// ============================================================================

interface ResponseSnackbarProps {
  open: boolean;
  response: string | null;
  duration?: number | null; // Processing time in ms
  hasBatch?: boolean; // If there are pending changes to approve
  onClose: () => void;
  onViewBatch?: () => void; // Navigate to batch approval
}

// ============================================================================
// Component
// ============================================================================

export function ResponseSnackbar({
  open,
  response,
  duration,
  hasBatch = false,
  onClose,
  onViewBatch,
}: ResponseSnackbarProps) {
  const [expanded, setExpanded] = useState(false);

  // Truncate response for preview
  const maxPreviewLength = 120;
  const isLongResponse = response && response.length > maxPreviewLength;
  const previewText = isLongResponse ? `${response.slice(0, maxPreviewLength)}...` : response;

  // Format duration
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
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
            borderBottom: expanded ? `1px solid ${theme.vars.palette.divider}` : 'none',
          })}
        >
          {/* Success icon */}
          <Box
            sx={(theme) => ({
              width: 40,
              height: 40,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1.5,
              backgroundColor: varAlpha(theme.vars.palette.success.mainChannel, 0.08),
              color: theme.vars.palette.success.main,
            })}
          >
            <Iconify icon={'solar:check-circle-bold' as IconifyProps['icon']} width={22} />
          </Box>

          {/* Title and duration */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={(theme) => ({
                fontWeight: theme.typography.fontWeightSemiBold,
                color: theme.vars.palette.text.primary,
              })}
            >
              Response Ready
            </Typography>
            {duration && (
              <Typography
                variant="caption"
                sx={(theme) => ({
                  color: theme.vars.palette.text.disabled,
                })}
              >
                Completed in {formatDuration(duration)}
              </Typography>
            )}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isLongResponse && (
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ color: 'text.secondary' }}
              >
                <Iconify
                  icon={(expanded ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold') as IconifyProps['icon']}
                  width={18}
                />
              </IconButton>
            )}
            <IconButton size="small" onClick={onClose}>
              <Iconify icon={'mingcute:close-line' as IconifyProps['icon']} width={18} />
            </IconButton>
          </Box>
        </Box>

        {/* Response content */}
        <Box sx={{ px: 1.5, pb: 1.5, pt: expanded ? 1.5 : 0 }}>
          <Collapse in={!expanded} timeout="auto">
            <Typography
              variant="body2"
              sx={(theme) => ({
                color: theme.vars.palette.text.secondary,
                lineHeight: 1.6,
              })}
            >
              {previewText}
            </Typography>
          </Collapse>

          <Collapse in={expanded} timeout="auto">
            <Typography
              variant="body2"
              sx={(theme) => ({
                color: theme.vars.palette.text.secondary,
                lineHeight: 1.6,
                maxHeight: 200,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
              })}
            >
              {response}
            </Typography>
          </Collapse>
        </Box>

        {/* Batch notification */}
        {hasBatch && (
          <Box
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1,
              backgroundColor: varAlpha(theme.vars.palette.info.mainChannel, 0.08),
              borderTop: `1px solid ${theme.vars.palette.divider}`,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: varAlpha(theme.vars.palette.info.mainChannel, 0.12),
              },
            })}
            onClick={onViewBatch}
          >
            <Iconify
              icon={'solar:document-add-bold' as IconifyProps['icon']}
              width={18}
              sx={(theme) => ({ color: theme.vars.palette.info.main })}
            />
            <Typography
              variant="caption"
              sx={(theme) => ({
                color: theme.vars.palette.info.main,
                fontWeight: theme.typography.fontWeightMedium,
              })}
            >
              AI proposed changes — Click to review
            </Typography>
            <Iconify
              icon={'solar:arrow-right-bold' as IconifyProps['icon']}
              width={16}
              sx={(theme) => ({ color: theme.vars.palette.info.main, ml: 'auto' })}
            />
          </Box>
        )}
      </Paper>
    </Snackbar>
  );
}

