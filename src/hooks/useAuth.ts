import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  plan: 'free' | 'pro' | 'team';
  stripe_customer_id: string | null;
  daily_usage: number;
  last_usage_reset: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    
    // First try to get existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      // Create a default profile if fetch fails
      setProfile({
        id: userId,
        plan: 'free',
        stripe_customer_id: null,
        daily_usage: 0,
        last_usage_reset: new Date().toISOString().split('T')[0],
      });
      setLoading(false);
      return;
    }

    if (existingProfile) {
      setProfile(existingProfile);
      setLoading(false);
      return;
    }

    // Profile doesn't exist, create one
    const newProfile = {
      id: userId,
      plan: 'free' as const,
      daily_usage: 0,
      last_usage_reset: new Date().toISOString().split('T')[0],
    };

    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .maybeSingle();

    if (createError) {
      console.error('Error creating profile:', createError);
      // Use default profile if creation fails
      setProfile({
        id: userId,
        plan: 'free',
        stripe_customer_id: null,
        daily_usage: 0,
        last_usage_reset: new Date().toISOString().split('T')[0],
      });
    } else {
      setProfile(createdProfile);
    }
    
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signInWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };
  const incrementDailyUsage = async () => {
    if (!user || !profile) return false;

    const today = new Date().toISOString().split('T')[0];
    const needsReset = profile.last_usage_reset !== today;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          daily_usage: needsReset ? 1 : profile.daily_usage + 1,
          last_usage_reset: today,
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      return true;
    } catch (error) {
      console.error('Error updating usage:', error);
      return false;
    }
  };

  const getDailyLimit = () => {
    if (!profile) return 10; // Guest users
    return profile.plan === 'free' ? 50 : Infinity;
  };

  const getMaxFileSize = () => {
    if (!profile) return 10 * 1024 * 1024; // 10MB for guests
    return profile.plan === 'free' ? 100 * 1024 * 1024 : 5 * 1024 * 1024 * 1024; // 100MB vs 5GB
  };

  const canGenerate = () => {
    const limit = getDailyLimit();
    const usage = profile?.daily_usage || 0;
    return limit === Infinity || usage < limit;
  };

  return {
    user,
    profile,
    loading,
    signInWithGoogle,
    signInWithGitHub,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    incrementDailyUsage,
    getDailyLimit,
    getMaxFileSize,
    canGenerate,
    isAuthenticated: !!user,
  };
}