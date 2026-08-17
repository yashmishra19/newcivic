// ============================================================================
// AI SERVICE - GEMINI VISION + OPENSTREETMAP (OSM) GEOLOCATION & JURISDICTION
// ============================================================================

import { IssueCategory, IssueSeverity } from '../types';

export interface LocationGeoData {
  latitude: number;
  longitude: number;
  address: string;
  neighborhood?: string;
  jurisdiction: 'Public' | 'Private';
  raw?: any;
}

export interface AiCivicAnalysisResult {
  verified: boolean;
  category: IssueCategory;
  categoryLabel: string;
  severity: IssueSeverity;
  severityScore: number; // 1 to 5
  summary: string;
  department: string;
  confidence: number;
  recommendedPriority: string;
  estimatedRepairCost?: string;
  location: LocationGeoData;
  rawResponse?: any;
  suggestedTitle?: string;
}

// Convert File / Blob to Base64 string for Gemini API
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const res = reader.result as string;
      const base64Data = res.split(',')[1] || '';
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
}

// Check if Gemini API Key is configured in environment
export function isGeminiConfigured(): boolean {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  return !!(apiKey && apiKey !== 'your_key_here' && apiKey.trim().length > 10);
}

// 1. Get user's latitude & longitude using browser Geolocation API
export function getUserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('[AI Service] Geolocation not supported by device/browser. Using default coordinates.');
      resolve({ latitude: 19.0234, longitude: 72.8567 }); // Fallback default (e.g. Mumbai Metro / Downtown)
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.warn('[AI Service] Geolocation permission or timeout error. Using localized fallback:', error.message);
        resolve({ latitude: 19.0234, longitude: 72.8567 });
      },
      {
        timeout: 6000,
        enableHighAccuracy: true,
        maximumAge: 10000,
      }
    );
  });
}

// 2. Reverse geocode lat/long -> address using OpenStreetMap (Nominatim API)
export async function getAddressFromCoords(
  lat: number,
  lng: number
): Promise<{ address: string; raw: any }> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CivicWatch-OpenStreetMap-App/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim reverse geocode error: ${response.status}`);
    }

    const data = await response.json();
    return {
      address: data.display_name || `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      raw: data,
    };
  } catch (err) {
    console.warn('[AI Service] Nominatim lookup fallback:', err);
    return {
      address: `Roadway Segment near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      raw: { type: 'road', class: 'highway' },
    };
  }
}

// 3. Detect jurisdiction (Public vs Private) based on OSM response
export function detectJurisdiction(osmData: any): 'Public' | 'Private' {
  if (!osmData) return 'Public';

  const type = (osmData.type || '').toLowerCase();
  const osmClass = (osmData.class || '').toLowerCase();
  const addresstype = (osmData.addresstype || '').toLowerCase();

  // If OSM type or class = "residential", "building", "premise", "apartments", etc. -> Private
  const privateTags = ['building', 'residential', 'premise', 'apartments', 'house', 'commercial', 'industrial', 'private'];
  if (privateTags.includes(type) || privateTags.includes(osmClass) || privateTags.includes(addresstype)) {
    return 'Private';
  }

  // If OSM type = "highway", "road", "public", "street", "footway", etc. -> Public
  return 'Public';
}

// Helper category & severity mappers
export function mapToIssueCategory(catString: string): IssueCategory {
  const s = (catString || '').toLowerCase().trim();
  if (s.includes('pothole') || s.includes('road') || s.includes('asphalt') || s.includes('crater')) return 'pothole';
  if (s.includes('light') || s.includes('lamp') || s.includes('dark')) return 'street_light';
  if (s.includes('water') || s.includes('pipe') || s.includes('flood') || s.includes('waterlogging') || s.includes('drain')) return 'water_leak';
  if (s.includes('signal') || s.includes('traffic')) return 'traffic_signal';
  if (s.includes('sidewalk') || s.includes('pavement') || s.includes('curb') || s.includes('walkway')) return 'sidewalk';
  if (s.includes('garbage') || s.includes('dump') || s.includes('trash') || s.includes('waste')) return 'illegal_dumping';
  if (s.includes('tree') || s.includes('branch') || s.includes('wood')) return 'fallen_tree';
  if (s.includes('graffiti') || s.includes('paint')) return 'graffiti';
  return 'pothole';
}

export function mapToIssueSeverity(score: number): IssueSeverity {
  if (score >= 4) return 'critical';
  if (score >= 2) return 'moderate';
  return 'low';
}

// Fallback Mock AI Generator when in offline/demo mode or API quota exhausted
export function getMockAiAnalysis(
  fileOrName: File | string,
  locationData: LocationGeoData
): AiCivicAnalysisResult {
  const nameLower = (typeof fileOrName === 'string' ? fileOrName : fileOrName.name || '').toLowerCase();

  let category: IssueCategory = 'pothole';
  let categoryLabel = 'Road Pothole';
  let severityScore = 4;
  let severity: IssueSeverity = 'critical';
  let department = 'PWD / Road Maintenance';
  let summary = 'Deep asphalt failure on active roadway creating vehicle safety and tire hazard.';

  if (nameLower.includes('garbage') || nameLower.includes('dump') || nameLower.includes('trash') || nameLower.includes('waste')) {
    category = 'illegal_dumping';
    categoryLabel = 'Garbage Dump';
    severityScore = 3;
    severity = 'moderate';
    department = 'Solid Waste Management';
    summary = 'Garbage pile obstructing pedestrian walkway and creating sanitation hazard.';
  } else if (nameLower.includes('water') || nameLower.includes('leak') || nameLower.includes('flood') || nameLower.includes('waterlogging')) {
    category = 'water_leak';
    categoryLabel = 'Waterlogging / Leak';
    severityScore = 5;
    severity = 'critical';
    department = 'Drainage & Public Water Commission';
    summary = 'High pressure water pooling along sidewalk causing foundation erosion.';
  } else if (nameLower.includes('light') || nameLower.includes('lamp') || nameLower.includes('dark')) {
    category = 'street_light';
    categoryLabel = 'Broken Streetlight';
    severityScore = 2;
    severity = 'moderate';
    department = 'Electrical Department';
    summary = 'Non-functional street luminaire obscuring crosswalk at night.';
  } else if (nameLower.includes('tree') || nameLower.includes('branch')) {
    category = 'fallen_tree';
    categoryLabel = 'Fallen Tree Branch';
    severityScore = 4;
    severity = 'critical';
    department = 'Urban Forestry & Tree Care';
    summary = 'Dislodged tree limb obstructing public roadway.';
  }

  const result: AiCivicAnalysisResult = {
    verified: true,
    category,
    categoryLabel,
    severity,
    severityScore,
    summary,
    department,
    confidence: 96.8,
    recommendedPriority: severityScore >= 4 ? 'Tier 1 Rapid Dispatch' : 'Standard Maintenance Queue',
    estimatedRepairCost: severityScore >= 4 ? '$450 - $950' : '$180 - $400',
    location: locationData,
  };

  console.log('[AI Civic Analysis Result (Fallback Engine)]:', result);
  return result;
}

import { GoogleGenerativeAI } from '@google/generative-ai';

// 4. Main function: Integrate into analyzeCivicImage
export async function analyzeCivicImage(imageFile: File | Blob): Promise<AiCivicAnalysisResult> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  const base64Image = await fileToBase64(imageFile);

  // Step 1: Get user location
  console.log('[AI Service] Step 1: Getting user GPS coordinates...');
  const location = await getUserLocation();

  // Step 2: Reverse geocode with OpenStreetMap (Nominatim API)
  console.log('[AI Service] Step 2: Reverse geocoding lat/long with OpenStreetMap...', location);
  const addressData = await getAddressFromCoords(location.latitude, location.longitude);

  // Step 3: Detect jurisdiction (Public vs Private)
  const jurisdiction = detectJurisdiction(addressData.raw);
  console.log('[AI Service] Step 3: Detected Jurisdiction:', jurisdiction);

  const locationGeo: LocationGeoData = {
    latitude: location.latitude,
    longitude: location.longitude,
    address: addressData.address,
    jurisdiction: jurisdiction,
    raw: addressData.raw,
  };

  if (!isGeminiConfigured()) {
    console.info('[AI Service] Gemini Key missing. Running Fallback with OSM Geocoding & Jurisdiction.');
    await new Promise((r) => setTimeout(r, 900));
    const mockResult = getMockAiAnalysis(imageFile instanceof File ? imageFile : 'pothole', locationGeo);
    return { ...mockResult, verified: true };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a civic issue classifier for an Indian city reporting app. Analyze this image carefully and respond ONLY with a valid JSON object, no markdown, no explanation, just raw JSON:
{
  "issueTitle": "short title describing the issue and nearest landmark if visible",
  "category": "one of exactly: Pothole / Road, Street Light, Garbage / Sanitation, Waterlogging, Broken Footpath, Encroachment, Other",
  "severity": "one of exactly: Critical Hazard, High, Medium, Low",
  "description": "2 sentences describing the problem and safety impact",
  "confidence": a number from 0 to 100
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: imageFile.type === 'image/png' ? 'image/png' : 'image/jpeg',
          data: base64Image
        }
      },
      { text: prompt }
    ]);

    let responseText = result.response.text();
    
    // Clean potential markdown wrap
    responseText = responseText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(responseText);

    const isVerified = (parsed.confidence >= 50);
    
    // Use the exact string categories mapped to our internal type if needed, but we'll adapt our UI to match the exact string values from the prompt.
    // For now we map them to our existing `IssueCategory` keys to satisfy TS, and let `categoryLabel` hold the exact string.
    let categoryKey: IssueCategory = 'other';
    const rawCat = (parsed.category || '').toLowerCase();
    if (rawCat.includes('pothole') || rawCat.includes('road')) categoryKey = 'pothole';
    else if (rawCat.includes('light')) categoryKey = 'street_light';
    else if (rawCat.includes('garbage') || rawCat.includes('sanitation')) categoryKey = 'illegal_dumping';
    else if (rawCat.includes('waterlogging')) categoryKey = 'water_leak';
    else if (rawCat.includes('footpath')) categoryKey = 'sidewalk';
    else if (rawCat.includes('encroachment')) categoryKey = 'other';
    else if (rawCat.includes('tree')) categoryKey = 'fallen_tree';

    let severityKey: IssueSeverity = 'low';
    const rawSev = (parsed.severity || '').toLowerCase();
    if (rawSev.includes('critical')) severityKey = 'critical';
    else if (rawSev.includes('high')) severityKey = 'high';
    else if (rawSev.includes('medium')) severityKey = 'moderate';

    const severityScore = severityKey === 'critical' ? 5 : severityKey === 'high' ? 4 : severityKey === 'moderate' ? 3 : 1;

    const finalResult: AiCivicAnalysisResult = {
      verified: isVerified,
      category: categoryKey,
      categoryLabel: parsed.category || categoryKey.replace('_', ' '), // Send exact string back for form mapping
      severity: severityKey,
      severityScore,
      summary: parsed.description || 'Civic hazard detected from image analysis.',
      department: 'PWD / Road Maintenance',
      confidence: Number(parsed.confidence) || 95,
      recommendedPriority: severityScore >= 4 ? 'Tier 1 Critical Dispatch' : 'Standard Queue',
      estimatedRepairCost: '$400 - $800',
      location: locationGeo,
      rawResponse: parsed,
      suggestedTitle: parsed.issueTitle,
    };

    console.log('[AI Civic Analysis Result (Live Gemini + OSM)]:', finalResult);
    return finalResult;
  } catch (error) {
    console.error('[AI Service] Error calling Gemini API:', error);
    throw error; // Rethrow so the UI can catch it
  }
}
