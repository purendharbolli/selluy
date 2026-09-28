import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://uxmoahxrzvxqzuvbmvwx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_MfxInnFBDCL0KZvEGB7Geg_454G_ibU';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseAnonKey !== 'your-anon-public-key'
  );
};

// Fallback client to prevent crashing when credentials are not yet entered
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://mock-instance.supabase.co', 'mock-anon-key');

