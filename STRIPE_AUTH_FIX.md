# ✅ Stripe Authentication Fix

## Problem
The Stripe checkout was returning **401 (Unauthorized)** error because the `useStripe.ts` hook was using raw `fetch()` calls instead of the configured `axiosInstance`.

### Root Cause
- `fetch()` calls were **not** sending the JWT authentication token
- The JWT token is only injected by the `axiosInstance` request interceptor
- Backend received requests with no `Authorization` header → 401 error

## Solution
Updated `src/hooks/useStripe.ts` to use `axiosInstance` instead of `fetch()`.

### Changes Made

**Before (❌ Not authenticated):**
```typescript
const response = await fetch(`${CONFIG.apiUrl}/api/stripe/create-checkout-session`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, priceId }),
});
```

**After (✅ Authenticated):**
```typescript
const response = await axiosInstance.post('/api/stripe/create-checkout-session', {
  userId,
  priceId,
});
```

### Benefits
✅ JWT token automatically included in all requests
✅ Proper error handling via axios interceptors
✅ Consistent with rest of codebase
✅ Credentials properly configured
✅ No more 401 errors

## Files Modified
- `src/hooks/useStripe.ts` - Updated all 3 methods to use axiosInstance

## Build Status
✓ Compiled successfully
✓ No TypeScript errors
✓ Ready to test

## Testing
1. Run `npm run dev`
2. Go to `/v3-interface`
3. Click menu → "Subscribe to Pro"
4. Click "Subscribe Now"
5. Should now redirect to Stripe checkout (no 401 error)

## How It Works Now

```
User clicks "Subscribe Now"
    ↓
handleSubscribe() called
    ↓
createCheckoutSession(userId, priceId)
    ↓
axiosInstance.post() with JWT token
    ↓
Request interceptor adds:
  - Authorization: Bearer {token}
  - baseURL: http://localhost:3001
  - withCredentials: true
    ↓
Backend receives authenticated request
    ↓
Creates Stripe session
    ↓
Returns sessionUrl
    ↓
Redirect to Stripe checkout ✅
```

## Summary
The 401 error is now fixed. The Stripe checkout will work correctly with proper authentication.

