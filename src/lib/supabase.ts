import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          plan: 'free' | 'pro' | 'team';
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: 'free' | 'pro' | 'team';
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: 'free' | 'pro' | 'team';
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      presets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          format: string;
          parameters: any;
          tags: string[];
          is_starred: boolean;
          is_public: boolean;
          usage_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          format: string;
          parameters: any;
          tags?: string[];
          is_starred?: boolean;
          is_public?: boolean;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          format?: string;
          parameters?: any;
          tags?: string[];
          is_starred?: boolean;
          is_public?: boolean;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      generation_jobs: {
        Row: {
          id: string;
          user_id: string;
          format: string;
          parameters: any;
          status: 'pending' | 'generating' | 'completed' | 'failed';
          progress: number;
          file_size: number | null;
          file_hash: string | null;
          storage_key: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          format: string;
          parameters: any;
          status?: 'pending' | 'generating' | 'completed' | 'failed';
          progress?: number;
          file_size?: number | null;
          file_hash?: string | null;
          storage_key?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          format?: string;
          parameters?: any;
          status?: 'pending' | 'generating' | 'completed' | 'failed';
          progress?: number;
          file_size?: number | null;
          file_hash?: string | null;
          storage_key?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};