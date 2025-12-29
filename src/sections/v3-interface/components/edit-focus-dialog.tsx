'use client';

import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ============================================================================
// Types
// ============================================================================

interface EditFocusDialogProps {
  open: boolean;
  onClose: () => void;
  focusId: string | null;
  currentTitle: string;
  currentDescription: string;
  onSave: (focusId: string, title: string, description: string) => Promise<boolean>;
  onDelete?: () => void;
  isLoading?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function EditFocusDialog({
  open,
  onClose,
  focusId,
  currentTitle,
  currentDescription,
  onSave,
  onDelete,
  isLoading = false,
}: EditFocusDialogProps) {
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when dialog opens with new values
  useEffect(() => {
    if (open) {
      setTitle(currentTitle);
      setDescription(currentDescription);
    }
  }, [open, currentTitle, currentDescription]);

  const handleSave = async () => {
    if (!focusId || !title.trim()) return;

    setIsSaving(true);
    try {
      const success = await onSave(focusId, title.trim(), description.trim());
      if (success) {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSave();
    }
  };

  const hasChanges = title !== currentTitle || description !== currentDescription;
  const canSave = title.trim().length > 0 && hasChanges && !isSaving && !isLoading;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: '#fafafa',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>Edit Focus</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            autoFocus
            required
            error={title.trim().length === 0}
            helperText={title.trim().length === 0 ? 'Title is required' : ''}
            disabled={isSaving || isLoading}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            multiline
            rows={3}
            placeholder="Optional description for this focus..."
            disabled={isSaving || isLoading}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        {onDelete ? (
          <Button
            color="error"
            onClick={() => {
              onClose();
              onDelete();
            }}
            disabled={isSaving}
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={18} />}
          >
            Delete Focus
          </Button>
        ) : (
          <Box />
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!canSave}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

