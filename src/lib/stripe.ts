import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export const stripe = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export async function createCheckoutSession(
  priceId: string,
  mode: 'payment' | 'subscription' = 'subscription'
) {
  if (!stripePublishableKey) {
    throw new Error('Stripe publishable key is missing. Please add VITE_STRIPE_PUBLISHABLE_KEY to your environment variables.');
  }

  if (!stripe) {
    throw new Error('Failed to initialize Stripe. Please check your Stripe publishable key.');
  }

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.access_token) {
      throw new Error('User not authenticated');
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Supabase URL is missing. Please add VITE_SUPABASE_URL to your environment variables.');
    }

    const apiUrl = `${supabaseUrl}/functions/v1/stripe-checkout`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_id: priceId,
        mode,
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/pricing`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const { sessionId } = await response.json();
    
    const stripeInstance = await stripe;
    
    if (!stripeInstance) {
      throw new Error('Failed to load Stripe instance');
    }

    const { error } = await stripeInstance.redirectToCheckout({
      sessionId,
    });

    if (error) {
      console.error('Stripe checkout error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}