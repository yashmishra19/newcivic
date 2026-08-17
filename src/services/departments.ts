import { supabase } from '../lib/supabase';

export async function getDepartments() {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name');

  console.log('Departments data:', data);
  console.log('Departments error:', error);

  if (error) throw error;
  return data;
}