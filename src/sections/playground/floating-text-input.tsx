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

import { PLAYGROUND_GOALS, getPlaygroundGoalIds } from './playground-data';

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
  currentGoalId?: string;
};

export function PlaygroundFloatingTextInput({ onSend, onGoalSelect, currentGoalId }: FloatingTextInputProps) {
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
      const matchingGoal = getPlaygroundGoalIds().find(id => id.startsWith(goalQuery));
      if (matchingGoal && goalQuery.length > 0) {
        setSelectedGoalId(matchingGoal);
      } else if (goalQuery.length === 0) {
        setSelectedGoalId(getPlaygroundGoalIds()[0]); // Select first goal when just "g/"
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
        const goalId = selectedGoalId || getPlaygroundGoalIds().find(id => id === goalQuery);

        if (goalId && onGoalSelect) {
          console.log('Loading goal:', goalId);
          onGoalSelect(goalId);
          setInputValue('');
          setGoalMenuAnchor(null);
          setSelectedGoalId(null);
          return;
        }
      }

      // Regular message
      console.log('Send clicked:', inputValue);
      onSend?.(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGoalSelect = (goalId: string) => {
    if (onGoalSelect) {
      onGoalSelect(goalId);
    }
    setInputValue('');
    setGoalMenuAnchor(null);
    setSelectedGoalId(null);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: 6,
        overflow: 'hidden',
      }}
    >
      {/* Input area */}
      <Box sx={{ p: 1.5, pb: 0 }}>
        <TextField
          inputRef={textareaRef}
          fullWidth
          multiline
          minRows={1}
          maxRows={6}
          placeholder="Type a message or 'g/' to switch goals..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: '0.9375rem',
              lineHeight: 1.5,
              '& textarea': {
                padding: 0,
              },
            },
          }}
          sx={{
            '& .MuiInputBase-root': {
              padding: 0,
            },
          }}
        />
      </Box>

      {/* Goal selection menu */}
      <Menu
        anchorEl={goalMenuAnchor}
        open={goalMenuOpen}
        onClose={() => {
          setGoalMenuAnchor(null);
          setSelectedGoalId(null);
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 280,
              maxHeight: 300,
              mt: -1,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Switch Goal
          </Typography>
        </Box>
        <Divider />

        {getPlaygroundGoalIds().map((goalId) => {
          const goal = PLAYGROUND_GOALS[goalId];
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
                <Iconify icon={(goal.icon || 'solar:flag-bold') as any} width={28} />
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
          px: 1.5,
          py: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <AddIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <AccessTimeIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <TuneIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
              {selectedModel}
            </Typography>
            <KeyboardArrowDownIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            {models.map((model) => (
              <MenuItem
                key={model}
                selected={model === selectedModel}
                onClick={() => {
                  setSelectedModel(model);
                  setAnchorEl(null);
                }}
              >
                {model}
              </MenuItem>
            ))}
          </Menu>

          <IconButton
            size="small"
            onClick={handleSend}
            disabled={!inputValue.trim()}
            sx={{
              bgcolor: inputValue.trim() ? 'primary.main' : 'action.disabledBackground',
              color: inputValue.trim() ? 'primary.contrastText' : 'action.disabled',
              '&:hover': {
                bgcolor: inputValue.trim() ? 'primary.dark' : 'action.disabledBackground',
              },
            }}
          >
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

