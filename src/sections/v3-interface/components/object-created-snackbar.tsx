'use client';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';

import type { IconifyProps } from 'src/components/iconify';

import { Iconify } from 'src/components/iconify';

import type { CreatedBasis } from '../hooks/use-focus-request-socket';

// ============================================================================
// Types
// ============================================================================

interface ObjectCreatedSnackbarProps {
  open: boolean;
  basis: CreatedBasis | null;
  onClose: () => void;
  onViewBasis?: (basisId: string) => void;
}

// Entity type icon mapping
const ENTITY_TYPE_ICONS: Record<string, string> = {
  custom: 'solar:widget-bold',
  milestone: 'solar:flag-bold',
  horizon: 'solar:sun-fog-bold',
  pathway: 'solar:route-bold',
  atlas: 'solar:map-bold',
  story: 'solar:book-bold',
  insight: 'solar:lightbulb-bolt-bold',
  step: 'solar:stairs-bold',
  polarity: 'solar:yin-yang-bold',
  path: 'solar:routing-2-bold',
  discovery: 'solar:compass-bold',
  archetype: 'solar:user-circle-bold',
};

// ============================================================================
// Component
// ============================================================================

export function ObjectCreatedSnackbar({
  open,
  basis,
  onClose,
  onViewBasis,
}: ObjectCreatedSnackbarProps) {
  if (!basis) return null;

  const entityIcon = ENTITY_TYPE_ICONS[basis.entityType] || 'solar:widget-bold';

  const handleClick = () => {
    if (onViewBasis) {
      onViewBasis(basis.id);
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{ right: 16, bottom: 16, left: 'auto' }}
    >
      <Paper
        elevation={0}
        onClick={handleClick}
        sx={(theme) => ({
          width: 340,
          maxWidth: '90vw',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          borderRadius: 2,
          boxShadow: theme.vars.customShadows.z8,
          backgroundColor: theme.vars.palette.background.paper,
          cursor: onViewBasis ? 'pointer' : 'default',
          transition: theme.transitions.create(['box-shadow', 'transform'], {
            duration: theme.transitions.duration.short,
          }),
          '&:hover': onViewBasis
            ? {
                boxShadow: theme.vars.customShadows.z16,
                transform: 'translateY(-2px)',
              }
            : {},
        })}
      >
        {/* Icon container */}
        <Box
          sx={(theme) => ({
            width: 48,
            height: 48,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1.5,
            backgroundColor: varAlpha(theme.vars.palette.success.mainChannel, 0.08),
            color: theme.vars.palette.success.main,
          })}
        >
          <Iconify icon={entityIcon as IconifyProps['icon']} width={24} />
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
            <Typography
              variant="subtitle2"
              sx={(theme) => ({
                fontWeight: theme.typography.fontWeightSemiBold,
                color: theme.vars.palette.text.primary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              })}
            >
              {basis.title}
            </Typography>
            <Chip
              label={basis.entityType}
              size="small"
              color="success"
              variant="soft"
              sx={{ fontSize: '0.65rem', height: 18, textTransform: 'capitalize' }}
            />
          </Box>
          {basis.description && (
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
              {basis.description}
            </Typography>
          )}
          <Typography
            variant="caption"
            sx={(theme) => ({
              color: theme.vars.palette.success.main,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 0.5,
            })}
          >
            <Iconify icon={'solar:check-circle-bold' as IconifyProps['icon']} width={12} />
            Created successfully
          </Typography>
        </Box>

        {/* Close button */}
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          sx={{ ml: 'auto', alignSelf: 'flex-start' }}
        >
          <Iconify icon={'mingcute:close-line' as IconifyProps['icon']} width={18} />
        </IconButton>
      </Paper>
    </Snackbar>
  );
}

