import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface UserSubscription {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export function useSubscription(userId?: string) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [userId]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanFromSubscription = (subscription: UserSubscription | null): 'free' | 'pro' | 'team' => {
    if (!subscription || subscription.subscription_status !== 'active') {
      return 'free';
    }

    // Map price IDs to plans
    switch (subscription.price_id) {
      case 'price_1S1nwZGpfQmRXU63C31m4AhF':
        return 'pro';
      default:
        return 'free';
    }
  };

  return {
    subscription,
    loading,
    refetch: fetchSubscription,
    plan: getPlanFromSubscription(subscription),
  };
}