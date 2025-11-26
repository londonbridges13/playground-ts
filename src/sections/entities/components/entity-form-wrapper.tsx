'use client';

import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

// ----------------------------------------------------------------------

interface EntityFormWrapperProps {
  title: string;
  essentialFields: ReactNode;
  optionalFields?: ReactNode;
  isSubmitting?: boolean;
  onSubmit: () => void;
  submitLabel?: string;
}

export function EntityFormWrapper({
  title,
  essentialFields,
  optionalFields,
  isSubmitting = false,
  onSubmit,
  submitLabel = 'Create',
}: EntityFormWrapperProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3 }}>
          {title}
        </Typography>

        {/* Essential Fields Section */}
        <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
          Essential Fields *
        </Typography>
        <Stack spacing={2.5}>{essentialFields}</Stack>

        {optionalFields && (
          <>
            <Divider sx={{ my: 3 }} />

            {/* Optional Fields Section */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Optional Fields
            </Typography>
            <Stack spacing={2.5}>{optionalFields}</Stack>
          </>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button type="button" variant="outlined" color="inherit" disabled={isSubmitting}>
            Reset
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

