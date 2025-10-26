# 🔌 Socket.IO Frontend Integration Guide

**For External Frontend Projects**

This guide explains how to connect your frontend application (React, Vue, Angular, vanilla JS, etc.) to the Socket.IO real-time chat backend.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Backend Configuration](#backend-configuration)
3. [Installation](#installation)
4. [Authentication](#authentication)
5. [Connection Setup](#connection-setup)
6. [Event Handling](#event-handling)
7. [TypeScript Support](#typescript-support)
8. [Framework Examples](#framework-examples)
9. [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Start

### Backend Endpoint

**WebSocket URL**: `ws://localhost:3001` (development)
**Production URL**: `wss://your-backend-domain.com`

### Required Information

- **JWT Token**: Obtained from `/api/auth/login` endpoint
- **Conversation ID**: From `/api/conversations` endpoint
- **Socket.IO Client**: Version 4.7.2 or higher

---

## 🔧 Backend Configuration

### CORS Settings

The backend is configured to accept connections from:
- `http://localhost:3000`
- `http://localhost:3001`
- Custom frontend URL (set via `FRONTEND_URL` environment variable)

**To add your frontend domain:**

Set the `FRONTEND_URL` environment variable on the backend:
```bash
# Backend .env file
FRONTEND_URL=https://your-frontend-domain.com
```

The backend Socket.IO server is configured with:
```typescript
cors: {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL || 'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST'],
}
```

---

## 📦 Installation

### NPM/Yarn

```bash
# NPM
npm install socket.io-client

# Yarn
yarn add socket.io-client

# PNPM
pnpm add socket.io-client
```

### CDN (Vanilla JavaScript)

```html
<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
```

---

## 🔐 Authentication

### Step 1: Get JWT Token

First, authenticate with the backend to get a JWT token:

```javascript
const NEXT_PUBLIC_API_URL = '{process.env.NEXT_PUBLIC_API_URL}/api';

async function login(email, password) {
  const response = await fetch(`${NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (data.success) {
    return data.token; // JWT token
  }

  throw new Error(data.error);
}

// Usage
const token = await login('alice@example.com', 'password123');
```

### Step 2: Connect with Token

Use the JWT token to authenticate the Socket.IO connection:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: token, // JWT token from login
  },
});
```

---

## 🔌 Connection Setup

### Basic Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: yourJWTToken,
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

// Connection events
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

### Connection Confirmation

The server sends a confirmation event when connected:

```javascript
socket.on('connected', (data) => {
  console.log('Server confirmed connection:', data);
  // data = { userId: '...', socketId: '...' }
});
```

---

## 📡 Event Handling

### Join a Conversation

Before receiving messages, join the conversation room:

```javascript
const conversationId = 'your-conversation-id';

socket.emit('join-conversation', conversationId);
```

### Leave a Conversation

```javascript
socket.emit('leave-conversation', conversationId);
```

### Receive New Messages

```javascript
socket.on('new-message', (data) => {
  console.log('New message:', data);

  // data structure:
  // {
  //   message: {
  //     id: string,
  //     content: string,
  //     conversationId: string,
  //     senderId: string,
  //     senderType: 'USER' | 'AI_AGENT',
  //     senderName: string,
  //     sequence: number,
  //     createdAt: Date,
  //     updatedAt: Date,
  //     isDeleted: boolean,
  //     parentMessageId: string | null,
  //     referencedBasisId: string | null,
  //   },
  //   conversationId: string
  // }

  // Add message to your UI
  addMessageToUI(data.message);
});
```

### Typing Indicators

**Send typing start:**
```javascript
socket.emit('typing-start', conversationId);
```

**Send typing stop:**
```javascript
socket.emit('typing-stop', conversationId);
```

**Receive typing events:**
```javascript
socket.on('user-typing', (data) => {
  console.log(`${data.name} is typing...`);
  // data = { userId: string, name: string, conversationId: string }

  showTypingIndicator(data.name);
});

socket.on('user-stopped-typing', (data) => {
  console.log(`User stopped typing`);
  // data = { userId: string, conversationId: string }

  hideTypingIndicator(data.userId);
});
```

### Message Updates

```javascript
socket.on('message-updated', (data) => {
  console.log('Message updated:', data);
  updateMessageInUI(data.message);
});

socket.on('message-deleted', (data) => {
  console.log('Message deleted:', data);
  // data = { messageId: string, conversationId: string }
  removeMessageFromUI(data.messageId);
});
```

### Error Handling

```javascript
socket.on('error', (data) => {
  console.error('Socket error:', data);
  // data = { message: string, code?: string, details?: any }

  showErrorToUser(data.message);
});
```

---

## 📝 Complete Event Reference

### Client → Server Events

| Event | Parameters | Description |
|-------|-----------|-------------|
| `join-conversation` | `conversationId: string` | Join a conversation room |
| `leave-conversation` | `conversationId: string` | Leave a conversation room |
| `typing-start` | `conversationId: string` | User started typing |
| `typing-stop` | `conversationId: string` | User stopped typing |

### Server → Client Events

| Event | Data | Description |
|-------|------|-------------|
| `connected` | `{ userId, socketId }` | Connection confirmed |
| `new-message` | `MessageEventData` | New message in conversation |
| `message-updated` | `MessageEventData` | Message was edited |
| `message-deleted` | `{ messageId, conversationId }` | Message was deleted |
| `user-typing` | `{ userId, name, conversationId }` | User is typing |
| `user-stopped-typing` | `{ userId, conversationId }` | User stopped typing |
| `error` | `{ message, code?, details? }` | Error occurred |

---

## 🎯 TypeScript Support

### Type Definitions

Create a types file in your frontend project:

```typescript
// types/socket.ts

export interface SocketMessage {
  id: string;
  content: string;
  conversationId: string;
  senderId: string;
  senderType: 'USER' | 'AI_AGENT';
  senderName?: string;
  sequence: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  isDeleted: boolean;
  parentMessageId?: string | null;
  referencedBasisId?: string | null;
}

export interface MessageEventData {
  message: SocketMessage;
  conversationId: string;
}

export interface TypingEventData {
  userId: string;
  name: string;
  conversationId: string;
}

export interface MessageDeletedEventData {
  messageId: string;
  conversationId: string;
}

export interface SocketErrorData {
  message: string;
  code?: string;
  details?: any;
}

export interface ClientToServerEvents {
  'join-conversation': (conversationId: string) => void;
  'leave-conversation': (conversationId: string) => void;
  'typing-start': (conversationId: string) => void;
  'typing-stop': (conversationId: string) => void;
}

export interface ServerToClientEvents {
  'connected': (data: { userId: string; socketId: string }) => void;
  'new-message': (data: MessageEventData) => void;
  'message-updated': (data: MessageEventData) => void;
  'message-deleted': (data: MessageDeletedEventData) => void;
  'user-typing': (data: TypingEventData) => void;
  'user-stopped-typing': (data: { userId: string; conversationId: string }) => void;
  'error': (data: SocketErrorData) => void;
}
```

### Typed Socket Connection

```typescript
import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from './types/socket';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const socket: TypedSocket = io('http://localhost:3001', {
  auth: { token: yourJWTToken },
});

// Now you get full TypeScript autocomplete and type checking!
socket.on('new-message', (data) => {
  // data is typed as MessageEventData
  console.log(data.message.content);
});

socket.emit('join-conversation', conversationId);
// TypeScript will error if you pass wrong parameters
```

---

## 🎨 Framework Examples

### React Example

```typescript
// hooks/useSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { MessageEventData } from '../types/socket';

export function useSocket(token: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:3001', {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('Connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected');
      setConnected(false);
    });

    newSocket.on('new-message', (data: MessageEventData) => {
      setMessages(prev => [...prev, data.message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const joinConversation = (conversationId: string) => {
    socket?.emit('join-conversation', conversationId);
  };

  const leaveConversation = (conversationId: string) => {
    socket?.emit('leave-conversation', conversationId);
  };

  const sendTyping = (conversationId: string) => {
    socket?.emit('typing-start', conversationId);
  };

  return {
    socket,
    connected,
    messages,
    joinConversation,
    leaveConversation,
    sendTyping,
  };
}
```

**Usage in Component:**

```typescript
// components/Chat.tsx
import { useSocket } from '../hooks/useSocket';

export function Chat({ token, conversationId }: Props) {
  const { connected, messages, joinConversation, sendTyping } = useSocket(token);

  useEffect(() => {
    if (connected && conversationId) {
      joinConversation(conversationId);
    }
  }, [connected, conversationId]);

  return (
    <div>
      <div>Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</div>
      <div>
        {messages.map(msg => (
          <div key={msg.id}>{msg.content}</div>
        ))}
      </div>
      <input
        onInput={() => sendTyping(conversationId)}
        placeholder="Type a message..."
      />
    </div>
  );
}
```

---

### Vue 3 Example

```typescript
// composables/useSocket.ts
import { ref, onMounted, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';

export function useSocket(token: string) {
  const socket = ref<Socket | null>(null);
  const connected = ref(false);
  const messages = ref<any[]>([]);

  onMounted(() => {
    socket.value = io('http://localhost:3001', {
      auth: { token },
    });

    socket.value.on('connect', () => {
      connected.value = true;
    });

    socket.value.on('disconnect', () => {
      connected.value = false;
    });

    socket.value.on('new-message', (data) => {
      messages.value.push(data.message);
    });
  });

  onUnmounted(() => {
    socket.value?.disconnect();
  });

  const joinConversation = (conversationId: string) => {
    socket.value?.emit('join-conversation', conversationId);
  };

  return {
    socket,
    connected,
    messages,
    joinConversation,
  };
}
```

---

### Vanilla JavaScript Example

```javascript
// socket-client.js
class ChatSocket {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.socket = null;
    this.connected = false;
  }

  async connect(token) {
    this.socket = io(this.apiUrl, {
      auth: { token },
    });

    this.socket.on('connect', () => {
      console.log('Connected');
      this.connected = true;
      this.onConnect?.();
    });

    this.socket.on('new-message', (data) => {
      this.onMessage?.(data.message);
    });

    this.socket.on('user-typing', (data) => {
      this.onTyping?.(data);
    });
  }

  joinConversation(conversationId) {
    this.socket?.emit('join-conversation', conversationId);
  }

  sendTyping(conversationId) {
    this.socket?.emit('typing-start', conversationId);
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

// Usage
const chat = new ChatSocket('http://localhost:3001');

chat.onConnect = () => {
  console.log('Ready!');
  chat.joinConversation('conv-123');
};

chat.onMessage = (message) => {
  console.log('New message:', message);
  // Update UI
};

chat.onTyping = (data) => {
  console.log(`${data.name} is typing...`);
};

// Connect with token
const token = await login('user@example.com', 'password');
chat.connect(token);
```

---

## 🐛 Troubleshooting

### Connection Refused

**Problem**: `connect_error: Error: xhr poll error`

**Solutions**:
1. Check backend is running: `curl http://localhost:3001/api/health`
2. Verify CORS configuration includes your frontend URL
3. Check firewall/network settings

### Authentication Failed

**Problem**: `connect_error: Invalid or expired token`

**Solutions**:
1. Verify JWT token is valid
2. Check token hasn't expired
3. Ensure token is passed in `auth.token` field

```javascript
// Correct
io('http://localhost:3001', {
  auth: { token: yourToken }  // ✅
});

// Incorrect
io('http://localhost:3001', {
  token: yourToken  // ❌
});
```

### Messages Not Received

**Problem**: Not receiving `new-message` events

**Solutions**:
1. Ensure you've joined the conversation room:
   ```javascript
   socket.emit('join-conversation', conversationId);
   ```

2. Check you're listening for the event:
   ```javascript
   socket.on('new-message', (data) => {
     console.log(data);
   });
   ```

3. Verify conversation ID is correct

### CORS Errors

**Problem**: `Access-Control-Allow-Origin` error

**Solution**: Add your frontend URL to backend environment variables:
```bash
# Backend .env
FRONTEND_URL=https://your-frontend.com
```

---

## ✅ Integration Checklist

- [ ] Install `socket.io-client` package
- [ ] Get JWT token from `/api/auth/login`
- [ ] Create Socket.IO connection with token
- [ ] Handle connection/disconnection events
- [ ] Join conversation room before receiving messages
- [ ] Listen for `new-message` events
- [ ] Implement typing indicators
- [ ] Handle errors gracefully
- [ ] Test reconnection scenarios
- [ ] Add TypeScript types (if using TypeScript)
- [ ] Test with multiple users
- [ ] Verify CORS configuration

---

## 📚 Additional Resources

- **Backend Event Types**: `lib/socket/socket-events.ts`
- **Reference Implementation**: `public/socket-manager.js`
- **Socket.IO Client Docs**: https://socket.io/docs/v4/client-api/
- **Phase 1 Complete Guide**: `SOCKET_IO_PHASE1_COMPLETE.md`
- **Quick Start Guide**: `SOCKET_IO_QUICK_START.md`

---

**Ready to integrate!** Your frontend can now connect to the real-time chat backend. 🚀

