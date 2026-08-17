import { supabase } from '../lib/supabase';

export async function getIncidents() {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('reported_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPriorityIncidents() {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .in('priority', ['critical', 'high'])
    .order('reported_at', { ascending: false })
    .limit(5);

  if (error) throw error;
  return data;
}