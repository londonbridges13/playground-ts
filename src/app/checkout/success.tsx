'use client';

import { useEffect } from 'react';
import { useRouter } from 'src/routes/hooks';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { m } from 'framer-motion';

export default function CheckoutSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push('/v3-interface');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <m.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            textAlign: 'center',
            p: 4,
            bgcolor: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            maxWidth: 500,
          }}
        >
          <m.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          >
            <CheckCircleIcon
              sx={{
                fontSize: 80,
                color: 'success.main',
                mb: 2,
              }}
            />
          </m.div>

          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Payment Successful!
          </Typography>

          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            Your subscription is now active. You have unlimited access to all features.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/v3-interface')}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
              },
            }}
          >
            Go to Dashboard
          </Button>

          <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
            Redirecting in 5 seconds...
          </Typography>
        </Box>
      </m.div>
    </Box>
  );
}

