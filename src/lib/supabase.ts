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
      user_tokens: {
        Row: {
          id: string;
          user_id: string;
          tokens_available: number;
          tokens_used: number;
          last_reset_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tokens_available?: number;
          tokens_used?: number;
          last_reset_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tokens_available?: number;
          tokens_used?: number;
          last_reset_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_history: {
        Row: {
          id: string;
          user_id: string;
          message: string;
          role: 'user' | 'assistant';
          tokens_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          message: string;
          role: 'user' | 'assistant';
          tokens_used?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          message?: string;
          role?: 'user' | 'assistant';
          tokens_used?: number;
          created_at?: string;
        };
      };
    };
  };
};
