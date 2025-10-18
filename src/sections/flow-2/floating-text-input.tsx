'use client';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import TextField from '@mui/material/TextField';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import TuneIcon from '@mui/icons-material/Tune';

import { Iconify } from 'src/components/iconify';
import { GOALS, getGoalIds } from './goals-data';

// ----------------------------------------------------------------------

const models = [
  'Sonnet 4.5',
  'Sonnet 4',
  'Opus 4',
  'Haiku 4',
  'GPT-4',
  'GPT-3.5',
];

type FloatingTextInputProps = {
  onSend?: (message: string) => void;
  onGoalSelect?: (goalId: string) => void;
};

export function FloatingTextInput({ onSend, onGoalSelect }: FloatingTextInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState('Sonnet 4.5');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [goalMenuAnchor, setGoalMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuOpen = Boolean(anchorEl);
  const goalMenuOpen = Boolean(goalMenuAnchor);

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
    if (inputValue.trim()) {
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
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
          }
          return;
        }
      }

      // Regular message
      console.log('Send clicked:', inputValue);
      onSend?.(inputValue);
      setInputValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
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
    if (!(e.target as HTMLElement).closest('button')) {
      textareaRef.current?.focus();
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    handleMenuClose();
  };

  const handleGoalMenuClose = () => {
    setGoalMenuAnchor(null);
    setSelectedGoalId(null);
  };

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoalId(goalId);
    setInputValue(`g/${goalId}`);
    handleGoalMenuClose();

    // Immediately load the goal
    if (onGoalSelect) {
      console.log('Loading goal:', goalId);
      onGoalSelect(goalId);
      setInputValue('');
    }
  };

  return (
    <Box
      onClick={handleContainerClick}
      sx={{
        width: '100%',
        bgcolor: 'white',
        borderRadius: '16px',
        border: '1px solid #e0e0e0',
        p: 1.5,
        cursor: 'text',
        boxShadow: '0px 10px 20px 0px rgba(44, 42, 202, 0.2), 0px 5px 8px 0px rgba(218, 152, 235, 0.1)',
      }}
    >
      {/* Text input area */}
      <TextField
        inputRef={textareaRef}
        multiline
        fullWidth
        placeholder="Ask Anything... (type 'g/' for goals)"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        variant="standard"
        InputProps={{
          disableUnderline: true,
          sx: {
            fontSize: '1.125rem',
            color: '#374151',
            padding: 0,
            margin: 0,
            '& textarea': {
              resize: 'none',
              overflow: 'hidden !important',
              minHeight: '32px',
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
          mb: 0.5,
          '& .MuiInputBase-root': {
            padding: 0,
            margin: 0,
          },
        }}
      />

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
                <Iconify icon={goal.icon || 'solar:target-bold'} width={28} />
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

      {/* Bottom toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left side buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            sx={{
              p: 1,
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
            }}
            aria-label="Add"
          >
            <AddIcon sx={{ fontSize: 18, color: '#374151' }} />
          </IconButton>

          <IconButton
            size="small"
            sx={{
              p: 1,
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
            }}
            aria-label="Settings"
          >
            <TuneIcon sx={{ fontSize: 18, color: '#374151' }} />
          </IconButton>

          <IconButton
            size="small"
            sx={{
              p: 1,
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
            }}
            aria-label="Schedule"
          >
            <AccessTimeIcon sx={{ fontSize: 18, color: '#374151' }} />
          </IconButton>
        </Box>

        {/* Right side - model selector and send button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{
              px: 1.5,
              py: 0.75,
              color: '#374151',
              borderRadius: '8px',
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
            aria-label="Select model"
          >
            <Box component="span" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
              {selectedModel}
            </Box>
            <KeyboardArrowDownIcon sx={{ fontSize: 14 }} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            slotProps={{
              paper: {
                sx: {
                  mt: -1,
                  minWidth: 160,
                  borderRadius: '12px',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                },
              },
            }}
          >
            {models.map((model) => (
              <MenuItem
                key={model}
                selected={model === selectedModel}
                onClick={() => handleModelSelect(model)}
                sx={{
                  fontSize: '0.8125rem',
                  py: 0.75,
                  px: 1.5,
                  minHeight: 'auto',
                }}
              >
                {model}
              </MenuItem>
            ))}
          </Menu>

          <IconButton
            size="small"
            onClick={handleSend}
            sx={{
              bgcolor: '#fdba74',
              borderRadius: '8px',
              p: 1,
              '&:hover': {
                bgcolor: '#fb923c',
              },
            }}
            aria-label="Send message"
          >
            <ArrowUpwardIcon sx={{ fontSize: 20, color: 'white' }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

