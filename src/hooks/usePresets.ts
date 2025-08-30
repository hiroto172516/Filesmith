import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { FileFormat } from '../components/FileGenerator';

export interface Preset {
  id: string;
  user_id: string;
  name: string;
  description: string;
  format: FileFormat;
  parameters: Record<string, any>;
  tags: string[];
  is_starred: boolean;
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export function usePresets(userId?: string) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchPresets();
    } else {
      setPresets([]);
      setLoading(false);
    }
  }, [userId]);

  const fetchPresets = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('presets')
        .select('*')
        .or(`user_id.eq.${userId},is_public.eq.true`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching presets:', error);
      } else {
        setPresets(data || []);
      }
    } catch (error) {
      console.error('Error in fetchPresets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPreset = async (preset: Omit<Preset, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'usage_count'>) => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('presets')
        .insert({
          ...preset,
          user_id: userId,
          usage_count: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating preset:', error);
        return null;
      }

      setPresets(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error in createPreset:', error);
      return null;
    }
  };

  const updatePreset = async (id: string, updates: Partial<Preset>) => {
    try {
      const { data, error } = await supabase
        .from('presets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating preset:', error);
        return null;
      }

      setPresets(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (error) {
      console.error('Error in updatePreset:', error);
      return null;
    }
  };

  const deletePreset = async (id: string) => {
    try {
      const { error } = await supabase
        .from('presets')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting preset:', error);
        return false;
      }

      setPresets(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (error) {
      console.error('Error in deletePreset:', error);
      return false;
    }
  };

  const incrementUsage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('presets')
        .update({ usage_count: supabase.sql`usage_count + 1` })
        .eq('id', id);

      if (error) {
        console.error('Error incrementing usage:', error);
      }
    } catch (error) {
      console.error('Error in incrementUsage:', error);
    }
  };

  return {
    presets,
    loading,
    createPreset,
    updatePreset,
    deletePreset,
    incrementUsage,
    refetch: fetchPresets,
  };
}