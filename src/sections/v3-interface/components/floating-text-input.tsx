'use client';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import TextField from '@mui/material/TextField';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import MicNoneIcon from '@mui/icons-material/MicNone';
import { m } from 'framer-motion';

import type { IconifyProps } from 'src/components/iconify';

import { Iconify } from 'src/components/iconify';

// Placeholder for goals - can be extended to fetch from API
const GOALS: Record<string, { id: string; name: string; icon?: string; description?: string }> = {};
const getGoalIds = () => Object.keys(GOALS);

export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'fading';

// Context info for request submission
export interface FloatingTextInputContext {
  id: string;
  title?: string;
  activeBases: string[];
}

// Options passed to onSubmitRequest
export interface SubmitRequestOptions {
  researchEnabled?: boolean;
}

type FloatingTextInputProps = {
  onSend?: (message: string) => void;
  onGoalSelect?: (goalId: string) => void;
  onMicClick?: () => void;
  onCreateNode?: () => void;
  onQuickCreateNode?: () => void; // NEW: "n" + Enter triggers quick node creation snackbar
  onBlankCanvas?: () => void;
  onSaveInterface?: () => void;
  onLoadInterface?: () => void;
  onLoadModeActivated?: () => void;
  onCopyFocusData?: () => void;
  onEditFocus?: () => void;
  onSubscribe?: () => void;
  recordingStatus?: RecordingStatus;
  currentGoalId?: string;
  // NEW: Context and Focus info for request submission
  context?: FloatingTextInputContext | null;
  focusId?: string | null;
  focusTitle?: string | null;
  isSubmitting?: boolean;
  onSubmitRequest?: (input: string, options?: SubmitRequestOptions) => void;
};

export function FloatingTextInput({
  onSend,
  onGoalSelect,
  onMicClick,
  onCreateNode,
  onQuickCreateNode,
  onBlankCanvas,
  onSaveInterface,
  onLoadInterface,
  onLoadModeActivated,
  onCopyFocusData,
  onEditFocus,
  onSubscribe,
  recordingStatus = 'idle',
  currentGoalId,
  context,
  focusId,
  focusTitle,
  isSubmitting = false,
  onSubmitRequest,
}: FloatingTextInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [goalMenuAnchor, setGoalMenuAnchor] = useState<null | HTMLElement>(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);
  const moreMenuOpen = Boolean(moreMenuAnchor);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [showShine, setShowShine] = useState(false);
  const [researchEnabled, setResearchEnabled] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const goalMenuOpen = Boolean(goalMenuAnchor);

  // Detect "l/ " command for load interface mode
  useEffect(() => {
    if (inputValue.toLowerCase() === 'l/ ') {
      setInputValue(''); // Clear the input
      onLoadModeActivated?.(); // Notify parent to show label and enable load mode
    }
  }, [inputValue, onLoadModeActivated]);

  // Detect "g/" command
  useEffect(() => {
    if (inputValue.startsWith('g/')) {
      // Open goal menu
      if (textareaRef.current && !goalMenuOpen) {
        setGoalMenuAnchor(textareaRef.current);
      }

      // Extract goal name after "g/"
      const goalQuery = inputValue.slice(2).toLowerCase();

      // Auto-select if exact match or partial match
      const matchingGoal = getGoalIds().find(id => id.startsWith(goalQuery));
      if (matchingGoal && goalQuery.length > 0) {
        setSelectedGoalId(matchingGoal);
      } else if (goalQuery.length === 0) {
        setSelectedGoalId(getGoalIds()[0]); // Select first goal when just "g/"
      }
    } else {
      // Close menu if "g/" is removed
      if (goalMenuOpen) {
        setGoalMenuAnchor(null);
        setSelectedGoalId(null);
      }
    }
  }, [inputValue, goalMenuOpen]);

  const handleSend = () => {
    const trimmedInput = inputValue.trim().toLowerCase();

    // Quick command: "n" for new node
    if (trimmedInput === 'n') {
      console.log('[FloatingTextInput] Quick create node command');
      setInputValue('');
      setShowShine(true);
      onQuickCreateNode?.();
      return;
    }

    // Quick command: "f" for new focus
    if (trimmedInput === 'f') {
      console.log('[FloatingTextInput] Quick create focus command');
      setInputValue('');
      setShowShine(true);
      onBlankCanvas?.();
      return;
    }

    if (inputValue.trim() && !isSubmitting) {
      // Check if it's a goal command
      if (inputValue.startsWith('g/')) {
        const goalQuery = inputValue.slice(2).toLowerCase();
        const goalId = selectedGoalId || getGoalIds().find(id => id === goalQuery);

        if (goalId && onGoalSelect) {
          console.log('Loading goal:', goalId);
          onGoalSelect(goalId);
          setInputValue('');
          setGoalMenuAnchor(null);
          setSelectedGoalId(null);
          setShowShine(true); // Trigger shine effect
          return;
        }
      }

      // If we have context and onSubmitRequest, use that for API requests
      if (onSubmitRequest && focusId && context) {
        console.log('Submitting request with context:', { focusId, contextId: context.id, input: inputValue, researchEnabled });
        onSubmitRequest(inputValue, { researchEnabled });
        setInputValue('');
        setShowShine(true);
        return;
      }

      // Fallback to regular message handling (for backwards compatibility)
      console.log('Send clicked:', inputValue);
      onSend?.(inputValue);
      setInputValue('');
      setShowShine(true); // Trigger shine effect
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    // Navigate goal menu with arrow keys
    if (goalMenuOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const goalIds = getGoalIds();
        const currentIndex = selectedGoalId ? goalIds.indexOf(selectedGoalId) : -1;

        if (e.key === 'ArrowDown') {
          const nextIndex = (currentIndex + 1) % goalIds.length;
          setSelectedGoalId(goalIds[nextIndex]);
          setInputValue(`g/${goalIds[nextIndex]}`);
        } else {
          const prevIndex = currentIndex <= 0 ? goalIds.length - 1 : currentIndex - 1;
          setSelectedGoalId(goalIds[prevIndex]);
          setInputValue(`g/${goalIds[prevIndex]}`);
        }
      }

      // Escape to close menu
      if (e.key === 'Escape') {
        setGoalMenuAnchor(null);
        setSelectedGoalId(null);
        setInputValue('');
      }
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Check if the click target is a button or inside a button
    const target = e.target as HTMLElement;
    if (!target.closest('button')) {
      textareaRef.current?.focus();
    }
  };

  const handleGoalMenuClose = () => {
    setGoalMenuAnchor(null);
    setSelectedGoalId(null);
  };

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoalId(goalId);
    handleGoalMenuClose();

    // Immediately load the goal
    if (onGoalSelect) {
      console.log('Loading goal:', goalId);
      onGoalSelect(goalId);
      setInputValue('');
    }
  };

  const handleMoreMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMoreMenuAnchor(event.currentTarget);
  };

  const handleMoreMenuClose = () => {
    setMoreMenuAnchor(null);
  };

  const handleCreateNodeClick = () => {
    handleMoreMenuClose();
    onCreateNode?.();
  };

  const handleBlankCanvasClick = () => {
    handleMoreMenuClose();
    onBlankCanvas?.();
  };

  const handleSaveInterfaceClick = () => {
    handleMoreMenuClose();
    onSaveInterface?.();
  };

  const handleLoadInterfaceClick = () => {
    handleMoreMenuClose();
    onLoadInterface?.();
  };

  const handleCopyFocusDataClick = () => {
    handleMoreMenuClose();
    onCopyFocusData?.();
  };

  const handleEditFocusClick = () => {
    handleMoreMenuClose();
    onEditFocus?.();
  };

  const handleSubscribeClick = () => {
    handleMoreMenuClose();
    onSubscribe?.();
  };

  return (
    <Box
      onClick={handleContainerClick}
      sx={{
        position: 'relative',
        width: '100%',
        bgcolor: '#fafafa',
        borderRadius: '24px',
          p: 2,
          cursor: 'text',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Shine effect overlay */}
      <m.div
        initial={{ x: '-100%' }}
        animate={showShine ? { x: '200%' } : { x: '-100%' }}
        transition={{
          duration: 0.8,
          ease: 'easeInOut',
        }}
        onAnimationComplete={() => {
          if (showShine) setShowShine(false);
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />



      {/* Row 1: Search icon + Text input */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
        <SearchIcon sx={{ fontSize: 20, color: '#9ca3af', mt: 0.5, flexShrink: 0 }} />
        <TextField
          inputRef={textareaRef}
          multiline
          fullWidth
          placeholder="Ask anything..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: '1rem',
              color: '#374151',
              padding: 0,
              margin: 0,
              minHeight: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              '& textarea': {
                resize: 'none',
                overflow: 'hidden !important',
                minHeight: '24px !important',
                maxHeight: '160px',
                padding: 0,
                margin: 0,
                lineHeight: 1.5,
              },
              '& textarea::placeholder': {
                color: '#9ca3af',
                opacity: 1,
              },
            },
          }}
          sx={{
            '& .MuiInputBase-root': {
              padding: 0,
              margin: 0,
            },
          }}
        />
      </Box>

      {/* Goal Selection Menu */}
      <Menu
        anchorEl={goalMenuAnchor}
        open={goalMenuOpen}
        onClose={handleGoalMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              mt: -1,
              minWidth: 320,
              maxWidth: 420,
              borderRadius: '12px',
              boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary">
            Select a Goal
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Use arrow keys to navigate, Enter to select
          </Typography>
        </Box>

        {getGoalIds().map((goalId) => {
          const goal = GOALS[goalId];
          return (
            <MenuItem
              key={goalId}
              selected={goalId === selectedGoalId}
              onClick={() => handleGoalSelect(goalId)}
              sx={{
                py: 1.5,
                px: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.lighter',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon>
                <Iconify icon={(goal.icon || 'solar:target-bold') as IconifyProps['icon']} width={28} />
              </ListItemIcon>
              <ListItemText
                primary={goal.name}
                secondary={goal.description}
                primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9375rem' }}
                secondaryTypographyProps={{ variant: 'caption', fontSize: '0.75rem' }}
              />
            </MenuItem>
          );
        })}
      </Menu>

      {/* Row 2: Bottom toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left side: Add tabs or files button + More options */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            sx={{
              px: 1.5,
              py: 0.5,
              fontSize: '0.8125rem',
              fontWeight: 400,
              color: '#6b7280',
              bgcolor: 'transparent',
              border: '1px solid #e0e0e0',
              borderRadius: '20px',
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                borderColor: '#d0d0d0',
              },
            }}
          >
            Add tabs or files
          </Button>

          <IconButton
            size="small"
            onClick={handleMoreMenuOpen}
            sx={{
              p: 0.5,
              color: '#9ca3af',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
            aria-label="More options"
          >
            <MoreHorizIcon sx={{ fontSize: 20 }} />
          </IconButton>

          {/* Web Research Toggle */}
          <Tooltip title={researchEnabled ? 'Web research enabled' : 'Enable web research'}>
            <IconButton
              size="small"
              onClick={() => setResearchEnabled(!researchEnabled)}
              sx={{
                p: 0.5,
                color: researchEnabled ? '#3b82f6' : '#9ca3af',
                bgcolor: researchEnabled ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                '&:hover': {
                  bgcolor: researchEnabled ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0, 0, 0, 0.04)',
                },
              }}
              aria-label={researchEnabled ? 'Disable web research' : 'Enable web research'}
            >
              <Iconify icon={'solar:global-bold' as IconifyProps['icon']} width={20} />
            </IconButton>
          </Tooltip>

          {/* More Options Menu */}
          <Menu
            anchorEl={moreMenuAnchor}
            open={moreMenuOpen}
            onClose={handleMoreMenuClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            slotProps={{
              paper: {
                sx: {
                  mt: -1,
                  minWidth: 200,
                  borderRadius: '12px',
                  boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
                },
              },
            }}
          >
            <MenuItem onClick={handleCreateNodeClick}>
              <ListItemIcon>
                <Iconify icon="solar:add-circle-bold" width={20} />
              </ListItemIcon>
              <ListItemText primary="Create Node v1" />
            </MenuItem>
            <MenuItem onClick={handleBlankCanvasClick}>
              <ListItemIcon>
                <Iconify icon="solar:restart-bold" width={20} />
              </ListItemIcon>
              <ListItemText primary="New Focus" />
            </MenuItem>
            <MenuItem onClick={handleSaveInterfaceClick}>
              <ListItemIcon>
                <Iconify icon="solar:diskette-bold" width={20} />
              </ListItemIcon>
              <ListItemText primary="Save Interface" />
            </MenuItem>
            <MenuItem onClick={handleLoadInterfaceClick}>
              <ListItemIcon>
                <Iconify icon="solar:upload-bold" width={20} />
              </ListItemIcon>
              <ListItemText primary="Load Interface" />
            </MenuItem>
            <MenuItem onClick={handleCopyFocusDataClick}>
              <ListItemIcon>
                <Iconify icon="solar:copy-bold" width={20} />
              </ListItemIcon>
              <ListItemText primary="Copy Focus Data" />
            </MenuItem>
            <MenuItem onClick={handleEditFocusClick} disabled={!focusId}>
              <ListItemIcon>
                <Iconify icon="solar:pen-bold" width={20} />
              </ListItemIcon>
              <ListItemText primary="Edit Focus" />
            </MenuItem>
            <MenuItem onClick={handleSubscribeClick}>
              <ListItemIcon>
                <Iconify icon="solar:credit-card-bold" width={20} />
              </ListItemIcon>
              <ListItemText primary="Subscribe to Pro" />
            </MenuItem>
          </Menu>
        </Box>

        {/* Right side: Mic + Send button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={onMicClick}
            sx={{
              p: 0.75,
              color: recordingStatus === 'recording' ? '#EF4444' : '#9ca3af',
              bgcolor: recordingStatus !== 'idle' && recordingStatus !== 'fading' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
              '&:hover': {
                bgcolor: recordingStatus !== 'idle' && recordingStatus !== 'fading' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 0, 0, 0.04)',
              },
            }}
            aria-label={recordingStatus === 'recording' ? 'Stop recording' : 'Voice input'}
          >
            {recordingStatus === 'recording' ? (
              <Iconify icon="hugeicons:stop" sx={{ fontSize: 16, opacity: 0.6 }} />
            ) : (
              <MicNoneIcon sx={{ fontSize: 22 }} />
            )}
          </IconButton>

          <IconButton
            size="small"
            onClick={handleSend}
            sx={{
              bgcolor: 'transparent',
              border: '1px solid #e0e0e0',
              borderRadius: '50%',
              p: 0.75,
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                borderColor: '#d0d0d0',
              },
            }}
            aria-label="Send message"
          >
            <ArrowUpwardIcon sx={{ fontSize: 18, color: '#6b7280' }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

