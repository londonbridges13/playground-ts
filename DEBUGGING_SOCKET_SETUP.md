# Socket.IO Chat Debugging Guide

## 🔍 What We've Added for Debugging

All console logs are now prefixed with `[component-name]` for easy filtering:

### Console Log Prefixes:
- `[PathChatDrawer]` - Chat drawer component logs
- `[useSocket]` - Socket.IO hook logs
- `[conversationAPI]` - Conversation API calls

---

## 🚀 How to Debug

### Step 1: Open Browser DevTools
1. Go to: `http://localhost:8083/focus-test/`
2. Press `F12` or `Cmd+Option+I` to open DevTools
3. Go to **Console** tab

### Step 2: Open the Chat Drawer
- Click the chat icon or trigger the drawer to open

### Step 3: Watch the Console Logs

You should see logs in this order:

```
[PathChatDrawer] Skipping init - open: false token: true
[PathChatDrawer] Starting conversation initialization...
[PathChatDrawer] No conversation ID, creating new one...
[conversationAPI] Starting conversation with options: {title: "Chat - 1/26/2025"}
[conversationAPI] Endpoint: /api/conversations/start
[conversationAPI] Response status: 200
[conversationAPI] Response data: {success: true, data: {id: "conv-123"}, ...}
[PathChatDrawer] Conversation created with ID: conv-123
[useSocket] Init effect - token: true socketRef.current: false
[useSocket] Creating socket connection to: ws://localhost:3001
[useSocket] Socket instance created: socket-id-123
[useSocket] Connected! Socket ID: socket-id-123
[PathChatDrawer] Join effect - conversationId: conv-123 connected: true
[PathChatDrawer] Joining conversation: conv-123
[useSocket] Emitting join-conversation: conv-123
```

---

## 🔧 Configuration Check

### Current Setup:
- **Frontend URL**: `http://localhost:8083/focus-test/`
- **API URL**: Set via `NEXT_PUBLIC_API_URL` environment variable
- **Socket URL**: Derived from API URL (http → ws)

### What You Need:

1. **Check your `.env.local` file** for:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

2. **Backend must be running** on the URL specified in `NEXT_PUBLIC_API_URL`

3. **Backend Socket.IO server** must be listening on the same URL

---

## 🐛 Common Issues & Solutions

### Issue 1: "Socket connection to: ws://undefined"
**Problem**: `NEXT_PUBLIC_API_URL` is not set
**Solution**: Add to `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Issue 2: "Failed to start conversation"
**Problem**: API endpoint not responding
**Solution**: 
- Check backend is running
- Verify `POST /api/conversations/start` endpoint exists
- Check JWT token is valid

### Issue 3: Socket connects but no "join-conversation" emitted
**Problem**: `conversationId` is null
**Solution**: Check conversation API response in console

### Issue 4: Input field still not active
**Problem**: Check if `conversationId` is being set
**Solution**: Look for this log:
```
[PathChatDrawer] Conversation created with ID: conv-123
```

---

## 📋 What to Check in Console

1. **Is drawer opening?**
   - Look for: `[PathChatDrawer] Starting conversation initialization...`

2. **Is API being called?**
   - Look for: `[conversationAPI] Starting conversation with options:`

3. **Is API responding?**
   - Look for: `[conversationAPI] Response status: 200`

4. **Is conversation ID created?**
   - Look for: `[PathChatDrawer] Conversation created with ID:`

5. **Is socket connecting?**
   - Look for: `[useSocket] Connected! Socket ID:`

6. **Is conversation being joined?**
   - Look for: `[useSocket] Emitting join-conversation:`

---

## 🎯 Next Steps

1. **Set `NEXT_PUBLIC_API_URL` in `.env.local`**
2. **Restart the dev server** (`npm run dev`)
3. **Open the chat drawer**
4. **Check console logs** and share what you see
5. **Type in the input field** - it should now be active!

---

## 📝 Notes

- Input field is **no longer disabled** - removed the condition
- All socket events are logged
- All API calls are logged
- All state changes are logged

This should help identify exactly where the issue is!

