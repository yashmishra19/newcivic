// ============================================================================
// CIVIC AI & CLOUD INTEGRATION API SERVICE
// Consolidated from C:\Users\SHREE\Desktop\krrish\src\apiService.js & services
// ============================================================================

import { analyzeCivicImage, isGeminiConfigured, AiCivicAnalysisResult } from './aiService';
import { uploadImageToCloudinary, isCloudinaryConfigured } from './cloudinaryService';
import { getLiveLocationWithAddress, LiveLocationData } from './locationService';
import { CivicIssue } from '../types';

export {
  analyzeCivicImage,
  isGeminiConfigured,
  uploadImageToCloudinary,
  isCloudinaryConfigured,
  getLiveLocationWithAddress,
};

export interface FullPipelineResult {
  imageUrl: string;
  location: LiveLocationData;
  aiAnalysis: AiCivicAnalysisResult;
}

export type PipelineStep = 'idle' | 'uploading' | 'geocoding' | 'analyzing' | 'completed' | 'error';

/**
 * Orchestrates the full AI dispatch pipeline:
 * Step 1: Upload image to Cloudinary (or local object preview)
 * Step 2: Acquire live GPS coordinates and resolve road address via Nominatim
 * Step 3: Classify hazard with Gemini Vision Multimodal AI
 */
export async function executeAiTriagePipeline(
  file: File | Blob,
  onStepProgress?: (step: PipelineStep, stepNumber: number, label: string) => void
): Promise<FullPipelineResult> {
  try {
    // Step 1: Media storage upload
    onStepProgress?.('uploading', 1, 'Uploading high-resolution evidence...');
    const imageUrl = await uploadImageToCloudinary(file);

    // Step 2: Geolocation & Reverse address mapping
    onStepProgress?.('geocoding', 2, 'Locking GPS coordinates & resolving road address...');
    const location = await getLiveLocationWithAddress();

    // Step 3: Multimodal Vision AI triage
    onStepProgress?.('analyzing', 3, 'Running Gemini Vision AI hazard detection...');
    const aiAnalysis = await analyzeCivicImage(file);

    onStepProgress?.('completed', 4, 'Incident triage complete!');

    return {
      imageUrl,
      location,
      aiAnalysis,
    };
  } catch (error: any) {
    onStepProgress?.('error', 0, error?.message || 'Pipeline failed');
    throw error;
  }
}

/**
 * Helper to construct a complete CivicIssue object from the pipeline output
 */
export function buildCivicIssueFromPipeline(
  title: string,
  userDescription: string,
  pipelineData: FullPipelineResult
): CivicIssue {
  const { imageUrl, location, aiAnalysis } = pipelineData;

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    id: `issue-${Date.now()}`,
    title: title.trim() || `${aiAnalysis.categoryLabel} on ${location.address.split(',')[0]}`,
    category: aiAnalysis.category,
    severity: aiAnalysis.severity,
    status: 'reported',
    description: userDescription.trim() || aiAnalysis.summary,
    location: {
      address: location.address,
      neighborhood: location.neighborhood,
      lat: location.lat,
      lng: location.lng,
      jurisdiction: aiAnalysis.location?.jurisdiction || 'Public',
    },
    reportedAt: 'Just now',
    reportedBy: {
      name: 'Alex Rivera (You)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      badge: 'AI-Verified Citizen',
    },
    imageUrl: imageUrl,
    upvotes: 1,
    hasUpvoted: true,
    assignedDepartment: aiAnalysis.department,
    estimatedFixTime: aiAnalysis.severity === 'critical' ? 'Urgent (12 - 24 hrs)' : 'Standard (2 - 4 days)',
    timeline: [
      {
        id: `t-${Date.now()}-1`,
        status: 'Reported',
        title: 'Incident Submitted with Verified Photo Evidence',
        description: `Geo-tagged coordinates (${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}) recorded.`,
        timestamp: 'Just now',
        actor: 'Alex Rivera',
        actorRole: 'citizen',
      },
      {
        id: `t-${Date.now()}-2`,
        status: 'AI Triage',
        title: `AI Vision Assessment: ${aiAnalysis.recommendedPriority}`,
        description: `${aiAnalysis.summary} (Confidence: ${aiAnalysis.confidence}%)`,
        timestamp: 'Just now',
        actor: 'Gemini Vision AI Engine',
        actorRole: 'system',
      },
      {
        id: `t-${Date.now()}-3`,
        status: 'Dispatched',
        title: `Routing to ${aiAnalysis.department}`,
        description: `Automated work ticket generated with estimated cost ${aiAnalysis.estimatedRepairCost || 'N/A'}.`,
        timestamp: 'Just now',
        actor: 'Civic Dispatch Hub',
        actorRole: 'city_agent',
      },
    ],
    comments: [],
    aiAnalysis: {
      detectedHazard: aiAnalysis.summary,
      confidence: aiAnalysis.confidence,
      recommendedPriority: aiAnalysis.recommendedPriority,
      estimatedRepairCost: aiAnalysis.estimatedRepairCost,
    },
  };
}
