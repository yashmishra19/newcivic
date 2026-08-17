import { supabase } from '../lib/supabase';

export async function getCitizens() {
  const { data, error } = await supabase
    .from('citizens')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}