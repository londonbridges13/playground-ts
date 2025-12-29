'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface DeleteFocusDialogProps {
  open: boolean;
  focusTitle: string;
  focusId: string;
  onClose: () => void;
  onConfirm: (focusId: string, deleteBases: boolean) => Promise<void>;
  loading?: boolean;
}

export function DeleteFocusDialog({
  open,
  focusTitle,
  focusId,
  onClose,
  onConfirm,
  loading = false,
}: DeleteFocusDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const [deleteBases, setDeleteBases] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmValid = confirmText.trim().toLowerCase() === focusTitle.trim().toLowerCase();

  const handleConfirm = useCallback(async () => {
    if (!isConfirmValid) return;
    
    setError(null);
    try {
      await onConfirm(focusId, deleteBases);
      // Reset state on success
      setConfirmText('');
      setDeleteBases(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete focus');
    }
  }, [isConfirmValid, focusId, deleteBases, onConfirm]);

  const handleClose = useCallback(() => {
    if (loading) return;
    setConfirmText('');
    setDeleteBases(false);
    setError(null);
    onClose();
  }, [loading, onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'rgba(20, 20, 25, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#fff' }}>
        <Iconify icon="solar:trash-bin-trash-bold" width={24} sx={{ color: '#ef4444' }} />
        Delete Focus
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          This action cannot be undone. This will permanently delete the focus
          <strong> &quot;{focusTitle}&quot;</strong> and remove all associated data.
        </Alert>

        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
          To confirm, type <strong style={{ color: '#fff' }}>{focusTitle}</strong> below:
        </Typography>

        <TextField
          fullWidth
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={focusTitle}
          disabled={loading}
          autoFocus
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              color: '#fff',
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
              '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
              '&.Mui-focused fieldset': { borderColor: '#ef4444' },
            },
          }}
        />

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={deleteBases}
                onChange={(e) => setDeleteBases(e.target.checked)}
                disabled={loading}
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  '&.Mui-checked': { color: '#ef4444' },
                }}
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>
                  Also delete all associated bases
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  This will permanently delete all nodes/bases linked to this focus
                </Typography>
              </Box>
            }
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!isConfirmValid || loading}
          startIcon={loading ? <CircularProgress size={16} /> : <Iconify icon="solar:trash-bin-trash-bold" />}
          sx={{
            bgcolor: '#ef4444',
            '&:hover': { bgcolor: '#dc2626' },
            '&.Mui-disabled': { bgcolor: 'rgba(239, 68, 68, 0.3)' },
          }}
        >
          {loading ? 'Deleting...' : 'Delete Focus'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

