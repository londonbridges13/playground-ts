import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/global-config';
import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

// ----------------------------------------------------------------------

// Define content endpoints that should use CONFIG.serverUrl (mock server)
// All other endpoints will use CONFIG.apiUrl (backend)
const CONTENT_ENDPOINTS = [
  '/api/chat',
  '/api/kanban',
  '/api/calendar',
  '/api/mail',
  '/api/post',
  '/api/product',
];

const axiosInstance = axios.create({
  baseURL: CONFIG.serverUrl, // Default to content server
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials will be set conditionally in the interceptor
});

// Request interceptor to switch baseURL for non-content endpoints and add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const url = config.url || '';

    // Check if this is a content endpoint
    const isContentEndpoint = CONTENT_ENDPOINTS.some(endpoint => url.startsWith(endpoint));

    if (!isContentEndpoint) {
      // Non-content endpoints (auth, entities, focus, etc.) use apiUrl with credentials
      config.baseURL = CONFIG.apiUrl;
      config.withCredentials = true;
    } else {
      // Content endpoints use serverUrl WITHOUT credentials to avoid CORS issues
      config.withCredentials = false;
    }

    // Add JWT token to all requests
    const token = sessionStorage.getItem(JWT_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[axios] Added JWT token to request');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('📡 Axios Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    const message = error?.response?.data?.message || error?.message || 'Something went wrong!';
    console.error('❌ Axios error:', {
      message,
      url: error?.config?.url,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async <T = unknown>(
  args: string | [string, AxiosRequestConfig]
): Promise<T> => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args, {}];

    const res = await axiosInstance.get<T>(url, config);

    return res.data;
  } catch (error) {
    console.error('Fetcher failed:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    signIn: '/api/auth/login',
    signUp: '/api/auth/register',
    session: '/api/auth/session',
    signOut: '/api/auth/signout',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  focus: {
    get: (id: string) => `/api/focus/${id}`,
    update: (id: string) => `/api/focus/${id}`,
    bases: (id: string) => `/api/focus/${id}/bases`,
    interface: (id: string) => `/api/focus/${id}/interface`,
    generateInterface: (id: string) => `/api/focus/${id}/generate-interface`,
    createWithInterface: '/api/focus/create-with-interface',
    addNode: (id: string) => `/api/focus/${id}/add-node`,
    // Edge connection endpoints
    connectNodes: (id: string) => `/api/focus/${id}/connect-nodes`,
    disconnectNodes: (id: string) => `/api/focus/${id}/disconnect-nodes`,
    updateEdge: (id: string, edgeId: string) => `/api/focus/${id}/edge/${edgeId}`,
    batchEdges: (id: string) => `/api/focus/${id}/edges/batch`,
    // Node position endpoints (Task 4.1)
    updateNodePositions: (id: string) => `/api/focus/${id}/nodes/positions`,
  },
  conversations: {
    start: '/api/conversations/start',
    list: '/api/conversations',
    details: (id: string) => `/api/conversations/${id}`,
    messages: (id: string) => `/api/conversations/${id}/messages`,
  },
  // Entity CRUD endpoints
  entities: {
    list: (type: string) => `/api/entities/${type}`,
    get: (type: string, id: string) => `/api/entities/${type}/${id}`,
    create: (type: string) => `/api/entities/${type}`,
    update: (type: string, id: string) => `/api/entities/${type}/${id}`,
    delete: (type: string, id: string) => `/api/entities/${type}/${id}`,
  },
} as const;
