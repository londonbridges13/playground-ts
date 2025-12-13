'use client';

import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export interface LoadInterfaceDialogProps {
  open: boolean;
  onClose: () => void;
  onLoad: (jsonData: string) => void;
}

export function LoadInterfaceDialog({ open, onClose, onLoad }: LoadInterfaceDialogProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLoad = useCallback(() => {
    try {
      // Validate JSON
      const parsed = JSON.parse(jsonInput);

      // Basic validation
      if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
        throw new Error('Invalid format: missing nodes array');
      }

      setError(null);
      onLoad(jsonInput);
      setJsonInput('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  }, [jsonInput, onLoad, onClose]);

  const handleClose = useCallback(() => {
    setJsonInput('');
    setError(null);
    onClose();
  }, [onClose]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9998,
            }}
          />
          {/* Dialog */}
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
            }}
          >
            <Box
              sx={{
                width: 520,
                maxHeight: '80vh',
                bgcolor: 'white',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Iconify icon="solar:upload-bold" width={24} sx={{ color: '#6366f1' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Load Interface
                  </Typography>
                </Box>
                <IconButton onClick={handleClose} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Content */}
              <Box sx={{ p: 3, flex: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Paste the JSON interface data below to load nodes, edges, and their configurations.
                </Typography>
                <TextField
                  multiline
                  fullWidth
                  rows={12}
                  placeholder='{"version": "1.0", "nodes": [...], "edges": [...]}'
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setError(null);
                  }}
                  error={!!error}
                  helperText={error}
                  sx={{
                    '& .MuiInputBase-root': {
                      fontFamily: 'monospace',
                      fontSize: '0.8125rem',
                    },
                  }}
                />
              </Box>

              {/* Footer */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  p: 2,
                  borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                  justifyContent: 'flex-end',
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  sx={{ borderRadius: 2, color: '#6b7280', borderColor: '#d1d5db' }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleLoad}
                  disabled={!jsonInput.trim()}
                  startIcon={<Iconify icon="solar:upload-bold" width={18} />}
                  sx={{
                    borderRadius: 2,
                    bgcolor: '#6366f1',
                    '&:hover': { bgcolor: '#4f46e5' },
                  }}
                >
                  Load Interface
                </Button>
              </Box>
            </Box>
          </m.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

