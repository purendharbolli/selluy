/**
 * SELLUY DEVELOPMENT ONLY SEED SCRIPT
 * 
 * WARNING: This script is exclusively for local development testing in an isolated staging environment.
 * NEVER run this against production or expose mock data to customer views.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uxmoahxrzvxqzuvbmvwx.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MfxInnFBDCL0KZvEGB7Geg_454G_ibU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDevSeed() {
  console.log('Running isolated dev test verification...');
  const { data: categories } = await supabase.from('categories').select('id, name');
  console.log('Existing categories in database:', categories);
}

if (process.env.NODE_ENV === 'development') {
  runDevSeed().catch(console.error);
}
