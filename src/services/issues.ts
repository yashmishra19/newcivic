import { supabase } from '../lib/supabase';
import { CivicIssue } from '../types';

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

export async function insertIssue(issueData: any) {
  const { data, error } = await supabase
    .from('issues')
    .insert([issueData])
    .select();

  if (error) {
    console.error('Insert error:', error);
    throw error;
  }
  return data;
}