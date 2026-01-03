'use client';

import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export const useStripe = () => {
  /**
   * Create a checkout session and redirect to Stripe
   */
  const createCheckoutSession = async (
    successUrl: string,
    cancelUrl: string
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/create-checkout-session`,
        {
          method: 'POST',
          credentials: 'include', // ← IMPORTANT: Send cookies with JWT token
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            successUrl,
            cancelUrl,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  };

  /**
   * Open Stripe Billing Portal for subscription management
   */
  const openBillingPortal = async (returnUrl: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/create-portal-session`,
        {
          method: 'POST',
          credentials: 'include', // ← IMPORTANT: Send cookies with JWT token
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            returnUrl,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to open billing portal');
      }

      const { url } = await response.json();

      // Redirect to Stripe Billing Portal
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Billing portal error:', error);
      throw error;
    }
  };

  /**
   * Get current subscription status
   */
  const getSubscriptionStatus = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/subscription`,
        {
          method: 'GET',
          credentials: 'include', // ← IMPORTANT: Send cookies with JWT token
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get subscription status');
      }

      const { subscription } = await response.json();
      return subscription;
    } catch (error) {
      console.error('Subscription status error:', error);
      throw error;
    }
  };

  return {
    createCheckoutSession,
    openBillingPortal,
    getSubscriptionStatus,
  };
};

