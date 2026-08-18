import { supabase } from '../lib/supabase';

export async function getIssues() {
  const { data, error } = await supabase
    .from('issues')
    .select(`
      *,
      issue_ai_analysis(*),
      issue_timeline(*),
      issue_comments(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}