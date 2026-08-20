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

export async function createIssue(issue: CivicIssue) {
  // 1. Insert main issue row
  const { error: issueError } = await supabase
    .from('issues')
    .insert({
      id: issue.id,
      title: issue.title,
      category: issue.category,
      severity: issue.severity,
      status: issue.status,
      description: issue.description,
      address: issue.location.address,
      neighborhood: issue.location.neighborhood,
      latitude: issue.location.lat,
      longitude: issue.location.lng,
      reported_at: new Date().toISOString(),
      reported_by_name: issue.reportedBy.name,
      reported_by_avatar: issue.reportedBy.avatar,
      reported_by_badge: issue.reportedBy.badge || null,
      image_url: issue.imageUrl,
      resolved_image_url: issue.resolvedImageUrl || null,
      upvotes: issue.upvotes,
      assigned_department_id: issue.assignedDepartment,
      estimated_fix_time: issue.estimatedFixTime || null,
    });

  if (issueError) throw issueError;

  // 2. Insert AI Analysis row if present
  if (issue.aiAnalysis) {
    const { error: aiError } = await supabase
      .from('issue_ai_analysis')
      .insert({
        issue_id: issue.id,
        detected_hazard: issue.aiAnalysis.detectedHazard,
        confidence: issue.aiAnalysis.confidence,
        recommended_priority: issue.aiAnalysis.recommendedPriority,
        estimated_repair_cost: issue.aiAnalysis.estimatedRepairCost || null,
      });
    if (aiError) {
      console.warn('[issuesService] Failed to insert AI analysis details:', aiError);
    }
  }

  // 3. Insert initial timeline entries
  if (issue.timeline && issue.timeline.length > 0) {
    const timelineRows = issue.timeline.map((t) => ({
      id: t.id,
      issue_id: issue.id,
      status: t.status,
      title: t.title,
      description: t.description,
      timestamp: new Date().toISOString(),
      actor: t.actor,
      actor_role: t.actorRole,
    }));

    const { error: timelineError } = await supabase
      .from('issue_timeline')
      .insert(timelineRows);
    if (timelineError) {
      console.warn('[issuesService] Failed to insert initial timeline details:', timelineError);
    }
  }

  return issue;
}