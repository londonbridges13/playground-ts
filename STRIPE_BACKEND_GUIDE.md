# Stripe Backend Implementation Guide

## Overview

This guide explains how to implement the three Stripe endpoints required by the frontend.

---

## 1. Create Checkout Session

**Endpoint:** `POST /api/stripe/create-checkout-session`

**Purpose:** Creates a Stripe checkout session and returns the URL

**Request Body:**
```json
{
  "userId": "user-123",
  "priceId": "prod_TiiUs9yFaOkIvk"
}
```

**Response:**
```json
{
  "sessionUrl": "https://checkout.stripe.com/pay/cs_test_..."
}
```

**Implementation Steps:**

1. Validate userId and priceId
2. Fetch user from database
3. Create Stripe checkout session:
```javascript
const session = await stripe.checkout.sessions.create({
  customer_email: user.email,
  line_items: [
    {
      price: priceId,
      quantity: 1,
    },
  ],
  mode: 'subscription',
  success_url: `${process.env.FRONTEND_URL}/checkout/success`,
  cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
  metadata: {
    userId: userId,
  },
});
```
4. Return `{ sessionUrl: session.url }`

---

## 2. Create Portal Session

**Endpoint:** `POST /api/stripe/create-portal-session`

**Purpose:** Creates a Stripe customer portal session for managing subscriptions

**Request Body:**
```json
{
  "userId": "user-123"
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

**Implementation:**
```javascript
const session = await stripe.billingPortal.sessions.create({
  customer: stripeCustomerId,
  return_url: `${process.env.FRONTEND_URL}/v3-interface`,
});
return { url: session.url };
```

---

## 3. Get Subscription Status

**Endpoint:** `GET /api/stripe/subscription-status?userId=user-123`

**Purpose:** Fetches current subscription status for a user

**Response:**
```json
{
  "subscriptionStatus": "active",
  "currentPeriodEnd": "2026-02-03T12:00:00Z",
  "planName": "Explorer Pass"
}
```

**Implementation:**
```javascript
// Get user's Stripe customer ID
const user = await User.findById(userId);
const stripeCustomerId = user.stripeCustomerId;

// Get active subscriptions
const subscriptions = await stripe.subscriptions.list({
  customer: stripeCustomerId,
  status: 'active',
  limit: 1,
});

if (subscriptions.data.length === 0) {
  return { subscriptionStatus: 'inactive' };
}

const subscription = subscriptions.data[0];
return {
  subscriptionStatus: 'active',
  currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  planName: 'Explorer Pass',
};
```

---

## Webhook Setup

Configure Stripe webhooks to handle subscription events:

**Events to listen for:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Webhook Handler:**
```javascript
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      // Update user subscription status in database
      break;
    case 'customer.subscription.deleted':
      // Mark subscription as cancelled
      break;
  }

  res.json({received: true});
});
```

---

## Environment Variables

Add to your backend `.env`:
```
STRIPE_SECRET_KEY=sk_test_... # Get from Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_... # Get from Stripe Dashboard
FRONTEND_URL=http://localhost:8083
```

---

## Database Schema

Add to your User model:
```javascript
{
  stripeCustomerId: String,
  subscriptionStatus: String, // 'active', 'inactive', 'cancelled'
  subscriptionId: String,
  currentPeriodEnd: Date,
}
```

---

## Testing

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires auth: `4000 0025 0000 3155`

---

## Production Checklist

- [ ] Add production Stripe keys to environment
- [ ] Update success/cancel URLs to production domain
- [ ] Configure webhook endpoint in Stripe dashboard
- [ ] Test with real payment flow
- [ ] Set up email notifications for subscription events
- [ ] Add subscription status to user profile UI

