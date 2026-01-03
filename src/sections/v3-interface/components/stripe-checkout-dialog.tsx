'use client';

import { useState } from 'react';
import { m } from 'framer-motion';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useStripe } from 'src/hooks/useStripe';

interface StripeCheckoutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function StripeCheckoutDialog({ open, onClose }: StripeCheckoutDialogProps) {
  const { createCheckoutSession } = useStripe();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentUrl = window.location.origin;
      const successUrl = `${currentUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${currentUrl}/checkout/cancel`;

      await createCheckoutSession(successUrl, cancelUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create checkout session';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
      }}
    >
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
            Upgrade to Explorer Pass
          </Typography>

          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Get unlimited access to all features and priority support.
          </Typography>

          <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(102, 126, 234, 0.1)', borderRadius: '12px' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              $9.99
              <Typography component="span" variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                /month
              </Typography>
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Billed monthly. Cancel anytime.
            </Typography>
          </Box>

          {error && (
            <Typography
              variant="body2"
              sx={{ mb: 2, p: 1.5, bgcolor: 'error.lighter', color: 'error.main', borderRadius: '8px' }}
            >
              {error}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={handleSubscribe}
            disabled={loading}
            sx={{
              py: 1.5,
              fontSize: '16px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
              },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Subscribe Now'}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={onClose}
            disabled={loading}
            sx={{ mt: 1.5 }}
          >
            Cancel
          </Button>
        </Box>
      </m.div>
    </Dialog>
  );
}

