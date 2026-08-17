import { supabase } from './supabase';

export async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from('citizens')
    .select('count')
    .limit(1);

  if (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }

  console.log('✅ Supabase connected successfully!', data);
  return true;
}