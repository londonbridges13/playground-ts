'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'sonner';
import { authAPI } from 'src/lib/api/auth';
import { useAuthContext } from 'src/auth/hooks';

export default function TestLoginPage() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/focus-test/';

  // Get checkUserSession from AuthContext to refresh auth state after login
  const { checkUserSession } = useAuthContext();

  const [email, setEmail] = useState('alice@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[TestLoginPage] Attempting login...');

      const result = await authAPI.login(email, password);

      console.log('[TestLoginPage] Login successful!');
      console.log('[TestLoginPage] Token:', result.token);
      console.log('[TestLoginPage] User:', result.user);

      setToken(result.token);
      setUser(result.user);

      // Refresh AuthContext so user is available in other components
      if (checkUserSession) {
        console.log('[TestLoginPage] Refreshing AuthContext...');
        await checkUserSession();
        console.log('[TestLoginPage] AuthContext refreshed!');
      }

      toast.success('Login successful! Token stored in sessionStorage');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      console.error('[TestLoginPage] Login error:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToChat = () => {
    window.location.href = returnTo;
  };

  const handleCheckToken = () => {
    const storedToken = sessionStorage.getItem('jwt_access_token');
    if (storedToken) {
      console.log('[TestLoginPage] Token in sessionStorage:', storedToken);
      toast.success('Token found in sessionStorage!');
    } else {
      console.log('[TestLoginPage] No token in sessionStorage');
      toast.error('No token in sessionStorage');
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 500,
        mx: 'auto',
        mt: 8,
        p: 4,
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        🔐 Test Login
      </Typography>

      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Login with test credentials to get JWT token for Socket.IO chat
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {token && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ✅ Login successful! Token stored in sessionStorage
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          disabled={loading}
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          disabled={loading}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleLogin}
          disabled={loading}
          sx={{ position: 'relative' }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </Button>

        <Button
          variant="outlined"
          size="large"
          onClick={handleCheckToken}
          disabled={loading}
        >
          Check Token in Storage
        </Button>

        <Button
          variant="soft"
          size="large"
          onClick={handleNavigateToChat}
          disabled={!token}
        >
          Continue to {returnTo === '/focus-test/' ? 'Chat' : returnTo}
        </Button>
      </Box>

      {user && (
        <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            User Info:
          </Typography>
          <Typography variant="body2">
            <strong>ID:</strong> {user.id}
          </Typography>
          <Typography variant="body2">
            <strong>Email:</strong> {user.email}
          </Typography>
          <Typography variant="body2">
            <strong>Name:</strong> {user.displayName}
          </Typography>
          <Typography variant="body2">
            <strong>Role:</strong> {user.role || 'N/A'}
          </Typography>
        </Box>
      )}

      {token && (
        <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            JWT Token (first 50 chars):
          </Typography>
          <Typography
            variant="body2"
            sx={{
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
            }}
          >
            {token.substring(0, 50)}...
          </Typography>
        </Box>
      )}
    </Box>
  );
}

