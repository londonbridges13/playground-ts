# Stripe Testing Guide

## Frontend Testing

### 1. Verify Menu Option

1. Start the dev server: `npm run dev`
2. Navigate to `/v3-interface`
3. Click the "More" menu (three dots)
4. Verify "Subscribe to Pro" option appears with credit card icon

### 2. Test Dialog Opening

1. Click "Subscribe to Pro"
2. Verify the checkout dialog opens with:
   - Title: "Upgrade to Explorer Pass"
   - Price: "$9.99/month"
   - "Subscribe Now" button
   - "Cancel" button

### 3. Test Dialog Closing

1. Click "Cancel" button
2. Verify dialog closes smoothly

---

## Backend Testing

### 1. Mock Endpoint Testing

Before implementing real Stripe integration, test with mock endpoints:

```bash
# Test create-checkout-session
curl -X POST http://localhost:3001/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","priceId":"prod_TiiUs9yFaOkIvk"}'

# Expected response:
# {"sessionUrl":"https://checkout.stripe.com/..."}
```

### 2. Stripe Test Cards

Use these test card numbers in Stripe checkout:

| Card | Number | Use Case |
|------|--------|----------|
| Visa | 4242 4242 4242 4242 | Successful payment |
| Visa | 4000 0000 0000 0002 | Payment declined |
| Visa | 4000 0025 0000 3155 | Requires authentication |
| Visa | 4000 0000 0000 0069 | Expired card |

**Expiry:** Any future date (e.g., 12/25)
**CVC:** Any 3 digits (e.g., 123)

### 3. Test Success Flow

1. Click "Subscribe to Pro"
2. Click "Subscribe Now"
3. Use test card `4242 4242 4242 4242`
4. Complete checkout
5. Verify redirect to `/checkout/success`
6. Verify auto-redirect to `/v3-interface` after 5 seconds

### 4. Test Cancel Flow

1. Click "Subscribe to Pro"
2. Click "Subscribe Now"
3. Click "Back" or close the checkout
4. Verify redirect to `/checkout/cancel`
5. Click "Back to Dashboard"
6. Verify redirect to `/v3-interface`

---

## Stripe Dashboard Testing

### 1. View Test Payments

1. Go to https://dashboard.stripe.com/test/payments
2. Look for recent payment attempts
3. Verify metadata includes userId

### 2. View Test Customers

1. Go to https://dashboard.stripe.com/test/customers
2. Verify customer was created with correct email
3. Check subscription status

### 3. View Test Subscriptions

1. Go to https://dashboard.stripe.com/test/subscriptions
2. Verify subscription created with correct plan
3. Check billing cycle dates

---

## Common Issues & Solutions

### Issue: "Missing user ID or price ID"
**Solution:** Ensure user is logged in and environment variables are set

### Issue: Checkout dialog doesn't open
**Solution:** Check browser console for errors, verify onSubscribe handler is connected

### Issue: Redirect to Stripe fails
**Solution:** Verify backend endpoint returns valid sessionUrl

### Issue: Success page doesn't auto-redirect
**Solution:** Check browser console, verify `/v3-interface` route exists

---

## Integration Checklist

- [ ] Frontend menu option displays correctly
- [ ] Dialog opens/closes smoothly
- [ ] Dialog styling matches v3 interface
- [ ] Backend endpoints implemented
- [ ] Test payment succeeds
- [ ] Test payment fails gracefully
- [ ] Success page displays and redirects
- [ ] Cancel page displays and redirects
- [ ] Subscription status endpoint works
- [ ] Customer portal endpoint works
- [ ] Webhooks configured and tested
- [ ] Production keys added to environment

---

## Debugging Tips

### Enable Stripe Logging
```javascript
// In your backend
stripe.setApiVersion('2024-04-10');
stripe.setMaxNetworkRetries(2);
```

### Check Network Requests
1. Open DevTools → Network tab
2. Filter by "stripe" or "api"
3. Check request/response payloads

### View Stripe Logs
1. Go to https://dashboard.stripe.com/logs
2. Filter by endpoint
3. Check for errors

### Test Webhook Locally
Use Stripe CLI:
```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
stripe trigger payment_intent.succeeded
```

