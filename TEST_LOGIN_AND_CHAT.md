# Test Login and Chat Flow

## 🚀 Quick Start

### Step 1: Open Browser Console
1. Go to: `http://localhost:8083/focus-test/`
2. Press `F12` or `Cmd+Option+I` to open DevTools
3. Go to **Console** tab

### Step 2: Run Login Command

Copy and paste this into the console:

```javascript
// Import the auth API
import { authAPI } from '/src/lib/api/auth.ts';

// Login with alice@example.com
const result = await authAPI.login('alice@example.com', 'password123');

console.log('✅ Login successful!');
console.log('Token:', result.token);
console.log('User:', result.user);
```

### Step 3: Verify Token is Stored

Check that the token was saved:

```javascript
// Check sessionStorage
const token = sessionStorage.getItem('jwt_access_token');
console.log('Token in sessionStorage:', token);
```

### Step 4: Refresh Page

After login, refresh the page:
```javascript
window.location.reload();
```

### Step 5: Open Chat Drawer

1. Look for the chat icon or button
2. Click to open the chat drawer
3. Watch the console for logs:
   - `[PathChatDrawer] Starting conversation initialization...`
   - `[conversationAPI] Starting conversation with options:`
   - `[useSocket] Creating socket connection to:`
   - `[useSocket] Connected! Socket ID:`

### Step 6: Test Sending a Message

1. Type a message in the input field
2. Press Enter or click Send
3. Watch console for:
   - `[PathChatDrawer] Sending message:`
   - `[useSocket] Emitting send-message:`

---

## 🔍 Expected Console Output

After login:
```
[authAPI] Logging in with email: alice@example.com
[authAPI] Login response: {accessToken: "eyJ...", user: {...}}
[authAPI] Token stored in sessionStorage
✅ Login successful!
```

After opening chat drawer:
```
[PathChatDrawer] Starting conversation initialization...
[conversationAPI] Starting conversation with options: {title: "Chat - ..."}
[conversationAPI] Response status: 200
[PathChatDrawer] Conversation created with ID: conv-123
[useSocket] Creating socket connection to: ws://localhost:3001
[useSocket] Connected! Socket ID: socket-id-123
[PathChatDrawer] Joining conversation: conv-123
[useSocket] Emitting join-conversation: conv-123
```

---

## ⚠️ Troubleshooting

### "Login failed" error
- Check backend is running on `http://localhost:3001`
- Verify user exists: `alice@example.com` / `password123`
- Check `NEXT_PUBLIC_API_URL` is set in `.env.local`

### "No token in sessionStorage"
- Check the login response in console
- Verify backend returned `accessToken` field

### Socket not connecting
- Check token is stored in sessionStorage
- Verify backend Socket.IO server is running
- Check CORS settings on backend

### Conversation not created
- Check API response in console
- Verify `/api/conversations/start` endpoint exists on backend
- Check JWT token is valid

---

## 📝 Alternative: Use cURL

If you prefer to test from terminal:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'
```

Then manually store the token:
```javascript
sessionStorage.setItem('jwt_access_token', 'YOUR_TOKEN_HERE');
window.location.reload();
```

---

## ✅ Success Checklist

- [ ] Login successful with alice@example.com
- [ ] Token stored in sessionStorage
- [ ] Chat drawer opens
- [ ] Conversation created
- [ ] Socket connected
- [ ] Can type in input field
- [ ] Can send messages
- [ ] Messages appear in chat


