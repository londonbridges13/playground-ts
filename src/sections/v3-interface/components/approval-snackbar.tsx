'use client';

import { useState } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Chip from '@mui/material/Chip';

import type { IconifyProps } from 'src/components/iconify';

import { Iconify } from 'src/components/iconify';

import type { ProposedChange } from 'src/types/socket';

// ============================================================================
// Types
// ============================================================================

interface ApprovalSnackbarProps {
  open: boolean;
  batchId: string;
  changes: ProposedChange[];
  onApprove: (batchId: string) => Promise<void>;
  onReject: (batchId: string, reason?: string) => Promise<void>;
  onClose: () => void;
}

// Operation color mapping
const OPERATION_COLORS: Record<string, 'success' | 'warning' | 'error'> = {
  CREATE: 'success',
  UPDATE: 'warning',
  DELETE: 'error',
};

const OPERATION_ICONS: Record<string, string> = {
  CREATE: 'solar:add-circle-bold',
  UPDATE: 'solar:pen-bold',
  DELETE: 'solar:trash-bin-trash-bold',
};

// ============================================================================
// Component
// ============================================================================

export function ApprovalSnackbar({
  open,
  batchId,
  changes,
  onApprove,
  onReject,
  onClose,
}: ApprovalSnackbarProps) {
  const [expanded, setExpanded] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(batchId);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await onReject(batchId);
    } finally {
      setIsRejecting(false);
    }
  };

  const isLoading = isApproving || isRejecting;

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{ right: 16, bottom: 16, left: 'auto' }}
    >
      <Paper
        elevation={0}
        sx={(theme) => ({
          width: 380,
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
            backgroundColor: varAlpha(theme.vars.palette.warning.mainChannel, 0.08),
          })}
        >
          {/* Warning icon */}
          <Box
            sx={(theme) => ({
              width: 40,
              height: 40,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1.5,
              backgroundColor: varAlpha(theme.vars.palette.warning.mainChannel, 0.16),
              color: theme.vars.palette.warning.main,
            })}
          >
            <Iconify icon={'solar:shield-warning-bold' as IconifyProps['icon']} width={22} />
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
              Review Proposed Changes
            </Typography>
            <Typography
              variant="caption"
              sx={(theme) => ({
                color: theme.vars.palette.text.secondary,
              })}
            >
              {changes.length} change{changes.length !== 1 ? 's' : ''} pending approval
            </Typography>
          </Box>

          {/* Expand/Close */}
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
        </Box>

        {/* Changes list (collapsed by default) */}
        <Collapse in={expanded} timeout="auto">
          <Box
            sx={(theme) => ({
              maxHeight: 200,
              overflowY: 'auto',
              borderBottom: `1px solid ${theme.vars.palette.divider}`,
            })}
          >
            {changes.map((change) => (
              <Box
                key={change.id}
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  borderBottom: `1px solid ${theme.vars.palette.divider}`,
                  '&:last-child': { borderBottom: 'none' },
                })}
              >
                <Iconify
                  icon={(OPERATION_ICONS[change.operation] || 'solar:document-bold') as IconifyProps['icon']}
                  width={18}
                  sx={(theme) => ({
                    color: theme.vars.palette[OPERATION_COLORS[change.operation] || 'info'].main,
                  })}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      fontWeight: theme.typography.fontWeightMedium,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    })}
                  >
                    {change.proposedData.title}
                  </Typography>
                  {change.proposedData.description && (
                    <Typography
                      variant="caption"
                      sx={(theme) => ({
                        color: theme.vars.palette.text.secondary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      })}
                    >
                      {change.proposedData.description}
                    </Typography>
                  )}
                </Box>
                <Chip
                  label={change.operation}
                  size="small"
                  color={OPERATION_COLORS[change.operation] || 'default'}
                  sx={{ fontSize: '0.65rem', height: 20 }}
                />
              </Box>
            ))}
          </Box>
        </Collapse>

        {/* Action buttons */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.5,
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={handleReject}
            disabled={isLoading}
            startIcon={
              isRejecting ? (
                <Iconify icon={'svg-spinners:ring-resize' as IconifyProps['icon']} width={16} />
              ) : (
                <Iconify icon={'solar:close-circle-bold' as IconifyProps['icon']} width={16} />
              )
            }
            sx={{ flex: 1 }}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={handleApprove}
            disabled={isLoading}
            startIcon={
              isApproving ? (
                <Iconify icon={'svg-spinners:ring-resize' as IconifyProps['icon']} width={16} />
              ) : (
                <Iconify icon={'solar:check-circle-bold' as IconifyProps['icon']} width={16} />
              )
            }
            sx={{ flex: 1 }}
          >
            Approve All
          </Button>
        </Box>
      </Paper>
    </Snackbar>
  );
}

