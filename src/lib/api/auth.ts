import axios from 'src/lib/axios';

// ============================================================================
// Auth API Client
// ============================================================================

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    photoURL?: string;
    role?: string;
  };
}

export const authAPI = {
  /**
   * Login with email and password
   * Returns JWT token and user info
   * Endpoint: POST /api/auth/login
   */
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    try {
      console.log('[authAPI] Logging in with email:', email);
      console.log('[authAPI] Endpoint: POST /api/auth/login');

      const res = await axios.post<LoginResponse>('/api/auth/login', {
        email,
        password,
      });

      console.log('[authAPI] Login response:', res.data);

      if (!res.data.token) {
        throw new Error('No token in response');
      }

      if (!res.data.success) {
        throw new Error(res.data.message || 'Login failed');
      }

      // Store token in sessionStorage
      sessionStorage.setItem('jwt_access_token', res.data.token);

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(res.data.user));

      console.log('[authAPI] ✅ Token stored in sessionStorage');
      console.log('[authAPI] User stored in localStorage');
      console.log('[authAPI] Token:', res.data.token);
      console.log('[authAPI] User:', res.data.user);

      return {
        token: res.data.token,
        user: res.data.user,
      };
    } catch (error) {
      console.error('[authAPI] ❌ Login failed:', error);
      throw error;
    }
  },
};

