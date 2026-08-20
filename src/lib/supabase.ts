import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'dummy_key';

if (supabaseUrl === 'https://dummy.supabase.co') {
  console.warn('Missing Supabase environment variables. Using dummy client.');
} else {
  console.warn(`
IMPORTANT: Please ensure the 'issues' table in Supabase has these RLS policies:
1. INSERT policy: Allow authenticated users to insert
   Target: authenticated | WITH CHECK: true
2. SELECT policy: Allow all users to read issues
   Target: public | USING: true
  `);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);