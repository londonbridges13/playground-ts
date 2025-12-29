'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import InputBase from '@mui/material/InputBase';

import { Iconify } from 'src/components/iconify';

// ============================================================================
// Types
// ============================================================================

type SaveStatus = 'idle' | 'saving' | 'success';

// ============================================================================
// Types
// ============================================================================

interface RenameSnackbarProps {
  open: boolean;
  focusId: string;
  currentTitle: string;
  onClose: () => void;
  onSave: (focusId: string, newTitle: string) => Promise<boolean>;
}

// ============================================================================
// Component
// ============================================================================

export function RenameSnackbar({
  open,
  focusId,
  currentTitle,
  onClose,
  onSave,
}: RenameSnackbarProps) {
  const [value, setValue] = useState(currentTitle);
  const [isTyping, setIsTyping] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [timeRemaining, setTimeRemaining] = useState(7000);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when snackbar opens
  useEffect(() => {
    if (open) {
      setValue(currentTitle);
      setIsTyping(false);
      setSaveStatus('idle');
      setTimeRemaining(7000);
    }
  }, [open, currentTitle]);

  // Auto-focus and select text on open
  useEffect(() => {
    if (open && inputRef.current) {
      // Small delay to ensure the snackbar is rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open]);

  // 7-second timer that pauses when typing or saving
  useEffect(() => {
    if (!open || isTyping || saveStatus !== 'idle') return undefined;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 100) {
          onClose();
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [open, isTyping, saveStatus, onClose]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
    }
  }, [isTyping]);

  const handleSave = useCallback(async () => {
    const trimmedValue = value.trim();

    // If empty or unchanged, just close
    if (!trimmedValue || trimmedValue === currentTitle) {
      onClose();
      return;
    }

    setSaveStatus('saving');
    try {
      const success = await onSave(focusId, trimmedValue);
      if (success) {
        // Show success state briefly before closing
        setSaveStatus('success');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setSaveStatus('idle');
      }
    } catch {
      setSaveStatus('idle');
    }
  }, [value, currentTitle, focusId, onSave, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  }, [handleSave, onClose]);

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        right: 16,
        bottom: 16,
        left: 'auto',
      }}
    >
      <Paper
        elevation={0}
        sx={(theme) => ({
          width: 300,
          minHeight: 52,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 0.5,
          pr: 1.5,
          borderRadius: 1.5,
          boxShadow: theme.vars.customShadows.z8,
          backgroundColor: theme.vars.palette.background.paper,
          // Keyframes for the loading spinner
          '@keyframes rotate': {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(360deg)' },
          },
        })}
      >
        {/* Icon container - changes based on save status */}
        <Box
          sx={(theme) => ({
            width: 48,
            height: 48,
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
            // Dynamic colors based on status
            ...(saveStatus === 'success'
              ? {
                  backgroundColor: varAlpha(theme.vars.palette.success.mainChannel, 0.08),
                  color: theme.vars.palette.success.main,
                }
              : {
                  backgroundColor: varAlpha(theme.vars.palette.info.mainChannel, 0.08),
                  color: theme.vars.palette.info.main,
                }),
          })}
        >
          {/* Idle: Pen icon */}
          {saveStatus === 'idle' && <Iconify icon="solar:pen-bold" width={24} />}

          {/* Saving: Conic gradient spinner (matching existing snackbar) */}
          {saveStatus === 'saving' && (
            <Box
              sx={(theme) => ({
                width: 24,
                height: 24,
                borderRadius: '50%',
                animation: 'rotate 3s infinite linear',
                background: `conic-gradient(transparent, ${varAlpha(theme.vars.palette.text.disabledChannel, 0.64)})`,
              })}
            />
          )}

          {/* Success: Green checkmark */}
          {saveStatus === 'success' && (
            <Iconify icon="solar:check-circle-bold" width={24} />
          )}
        </Box>

        {/* Content area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.25, minWidth: 0 }}>
          <Box
            component="span"
            sx={(theme) => ({
              fontSize: theme.typography.pxToRem(13),
              fontWeight: theme.typography.fontWeightMedium,
              lineHeight: 20 / 13,
              color: theme.vars.palette.text.primary,
            })}
          >
            New Focus Created:
          </Box>
          <InputBase
            inputRef={inputRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter focus name..."
            disabled={saveStatus !== 'idle'}
            sx={(theme) => ({
              fontSize: theme.typography.pxToRem(13),
              lineHeight: 18 / 13,
              color: theme.vars.palette.text.secondary,
              '& .MuiInputBase-input': {
                p: 0,
                '&::placeholder': {
                  opacity: 0.64,
                },
              },
            })}
          />
        </Box>
      </Paper>
    </Snackbar>
  );
}

