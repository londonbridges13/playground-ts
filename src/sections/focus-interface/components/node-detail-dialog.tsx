// src/sections/focus-interface/components/node-detail-dialog.tsx
'use client';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

// ----------------------------------------------------------------------

interface NodeDetailDialogProps {
  open: boolean;
  onClose: () => void;
  nodeData: any;
}

export function NodeDetailDialog({ open, onClose, nodeData }: NodeDetailDialogProps) {
  if (!nodeData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{nodeData.label}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {nodeData.description && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2">{nodeData.description}</Typography>
            </Box>
          )}

          {nodeData.importance && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Importance
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={nodeData.importance * 10}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
                <Typography variant="body2">{nodeData.importance}/10</Typography>
              </Box>
            </Box>
          )}

          {nodeData.stage && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Stage
              </Typography>
              <Typography variant="body2">{nodeData.stage}</Typography>
            </Box>
          )}

          {nodeData.category && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Category
              </Typography>
              <Typography variant="body2">{nodeData.category}</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

