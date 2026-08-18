// ============================================================================
// AI SERVICE — GEMINI (default) + GROK (fallback) + OSM GEOCODING + RATE LIMITER
//
// Call chain for image analysis:
//   1. Device GPS  → raw lat/lng (no AI)
//   2. OSM Nominatim → structured human-readable address
//   3a. Gemini 1.5 Flash  → primary AI vision analysis (with location context)
//   3b. Grok Vision       → automatic fallback if Gemini fails / quota exceeded
//   4. Offline mock       → last-resort fallback if both AI services unavailable
// ============================================================================

import { IssueCategory, IssueSeverity } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Structured location built from GPS + OSM reverse geocoding.
 * The UI should use `displayName` — never raw coordinates.
 */
export interface LocationGeoData {
  latitude: number;
  longitude: number;

  /** e.g. "Western Railway Colony, Kandivali West, Mumbai" */
  displayName: string;

  /** Backward-compat alias for displayName */
  address: string;

  landmark?: string;
  neighborhood?: string;
  suburb?: string;
  city?: string;
  state?: string;

  /** 4-class jurisdiction instead of the old binary Public/Private */
  jurisdiction: 'Municipal' | 'Private' | 'Railway' | 'Unknown';

  raw?: any;
}

export interface AiCivicAnalysisResult {
  /** Was a civic issue actually detected in the image? */
  issueDetected: boolean;

  verified: boolean;
  category: IssueCategory;
  categoryLabel: string;
  severity: IssueSeverity;
  severityScore: number; // 1–5

  summary: string;

  /** Does the visible infrastructure look like a municipal/public asset? */
  municipalIssueLikely: boolean;
  municipalReason?: string;
  infrastructureType?: string;

  department: string;
  confidence: number;
  recommendedPriority: string;
  estimatedRepairCost?: string;
  location: LocationGeoData;
  rawResponse?: any;
  suggestedTitle?: string;

  /** Which AI engine produced this result */
  engine?: 'gemini' | 'grok' | 'mock';
}

// ─────────────────────────────────────────────────────────────────────────────
// DEPARTMENT MAP  (category → responsible civic body)
// ─────────────────────────────────────────────────────────────────────────────
const DEPARTMENT_MAP: Record<IssueCategory, string> = {
  pothole:         'Road Maintenance (PWD / BMC Roads)',
  street_light:    'Electrical Department (MSEDCL / BMC)',
  water_leak:      'Water & Drainage (BMC Hydraulics)',
  traffic_signal:  'Traffic Engineering Cell',
  sidewalk:        'Road Maintenance (PWD / BMC Roads)',
  illegal_dumping: 'Solid Waste Management (BMC SWM)',
  fallen_tree:     'Tree Authority (BMC Garden Dept.)',
  graffiti:        'Urban Affairs / Heritage Cell',
  other:           'Municipal Corporation (BMC)',
};

// ─────────────────────────────────────────────────────────────────────────────
// API KEY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const env = () => (import.meta as any).env ?? {};

export function isGeminiConfigured(): boolean {
  const k = env().VITE_GEMINI_API_KEY;
  return !!(k && k !== 'your_key_here' && k.trim().length > 10);
}

export function isGrokConfigured(): boolean {
  const k = env().VITE_GROK_API_KEY;
  return !!(k && k !== 'your_grok_key_here' && k.trim().length > 10);
}

// ─────────────────────────────────────────────────────────────────────────────
// GEMINI FREE-TIER RATE LIMITER  (15 RPM sliding window)
// ─────────────────────────────────────────────────────────────────────────────
const GEMINI_MAX_RPM   = 15;
const GEMINI_WINDOW_MS = 60_000;
const _geminiTimestamps: number[] = [];

async function waitForGeminiRateLimit(): Promise<void> {
  const now = Date.now();
  while (_geminiTimestamps.length > 0 && now - _geminiTimestamps[0] > GEMINI_WINDOW_MS) {
    _geminiTimestamps.shift();
  }
  if (_geminiTimestamps.length >= GEMINI_MAX_RPM) {
    const waitMs = GEMINI_WINDOW_MS - (now - _geminiTimestamps[0]) + 150;
    console.warn(
      `[Gemini Rate Limiter] ${GEMINI_MAX_RPM} RPM limit reached — waiting ${Math.ceil(waitMs / 1000)} s…`
    );
    await new Promise((r) => setTimeout(r, waitMs));
    return waitForGeminiRateLimit();
  }
  _geminiTimestamps.push(Date.now());
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Convert File/Blob → raw base64 string (no data-URI prefix). */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload  = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = (e) => reject(e);
  });
}

/** Map free-text category → internal IssueCategory key. */
export function mapToIssueCategory(catString: string): IssueCategory {
  const s = (catString || '').toLowerCase();
  if (s.includes('pothole') || s.includes('road') || s.includes('asphalt'))                    return 'pothole';
  if (s.includes('light') || s.includes('lamp'))                                                return 'street_light';
  if (s.includes('water') || s.includes('pipe') || s.includes('flood') || s.includes('drain') || s.includes('waterlog')) return 'water_leak';
  if (s.includes('signal') || s.includes('traffic'))                                            return 'traffic_signal';
  if (s.includes('sidewalk') || s.includes('footpath') || s.includes('pavement') || s.includes('curb')) return 'sidewalk';
  if (s.includes('garbage') || s.includes('dump') || s.includes('trash') || s.includes('waste') || s.includes('sanitation')) return 'illegal_dumping';
  if (s.includes('tree') || s.includes('branch'))                                               return 'fallen_tree';
  if (s.includes('graffiti') || s.includes('paint') || s.includes('vandal'))                   return 'graffiti';
  return 'other';
}

export function mapToIssueSeverity(score: number): IssueSeverity {
  if (score >= 4) return 'critical';
  if (score >= 2) return 'moderate';
  return 'low';
}

/** Build a consistent AiCivicAnalysisResult from a parsed Gemini/Grok JSON object. */
function buildResultFromParsed(
  parsed: any,
  locationGeo: LocationGeoData,
  engine: 'gemini' | 'grok'
): AiCivicAnalysisResult {
  // Strictly require the AI to explicitly return true — any other value means no issue
  const issueDetected: boolean = parsed.issueDetected === true;
  const categoryKey = issueDetected ? mapToIssueCategory(parsed.category || '') : 'other' as IssueCategory;

  let severityKey: IssueSeverity = 'low';
  const rawSev = (parsed.severity || '').toLowerCase();
  if (rawSev.includes('critical')) severityKey = 'critical';
  else if (rawSev.includes('high')) severityKey = 'high';
  else if (rawSev.includes('medium')) severityKey = 'moderate';

  const severityScore = severityKey === 'critical' ? 5 : severityKey === 'high' ? 4 : severityKey === 'moderate' ? 3 : 1;
  // Do NOT default confidence to 88 — use 0 if no issue detected, or what AI actually returned
  const confidence = issueDetected ? (Number(parsed.confidence) || 50) : 0;
  const isVerified  = issueDetected && confidence >= 50;

  return {
    issueDetected,
    verified: isVerified,
    category: categoryKey,
    categoryLabel: parsed.category || categoryKey.replace(/_/g, ' '),
    severity: severityKey,
    severityScore,
    summary: parsed.description || 'Civic hazard detected from image analysis.',
    municipalIssueLikely: parsed.municipalIssueLikely === true,
    municipalReason: parsed.municipalReason || undefined,
    infrastructureType: parsed.infrastructureType || undefined,
    department: DEPARTMENT_MAP[categoryKey],
    confidence,
    recommendedPriority: severityScore >= 4 ? 'Tier 1 Critical Dispatch' : 'Standard Queue',
    estimatedRepairCost: severityScore >= 4 ? '₹8,000 – ₹18,000' : '₹3,000 – ₹8,000',
    location: locationGeo,
    rawResponse: parsed,
    suggestedTitle:
      parsed.issueTitle ||
      `${parsed.category || 'Issue'} at ${locationGeo.neighborhood || locationGeo.suburb || locationGeo.city || 'Mumbai'}`,
    engine,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE 1 — DEVICE GPS
// ─────────────────────────────────────────────────────────────────────────────

const KANDIVALI_DEFAULT = { latitude: 19.2041, longitude: 72.8517 };

export function getUserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('[AI Service] Geolocation not supported. Using Kandivali default.');
      return resolve(KANDIVALI_DEFAULT);
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => {
        console.warn('[AI Service] GPS error — Kandivali fallback:', err.message);
        resolve(KANDIVALI_DEFAULT);
      },
      { timeout: 8000, enableHighAccuracy: true, maximumAge: 15000 }
    );
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE 2 — REVERSE GEOCODING (OSM Nominatim)
// ─────────────────────────────────────────────────────────────────────────────

export interface StructuredAddress {
  displayName: string;
  landmark?: string;
  neighborhood?: string;
  suburb?: string;
  city?: string;
  state?: string;
  jurisdiction: 'Municipal' | 'Private' | 'Railway' | 'Unknown';
  raw: any;
}

function classifyJurisdiction(addr: any, osmClass: string, osmType: string): 'Municipal' | 'Private' | 'Railway' | 'Unknown' {
  const tags = [osmClass, osmType, addr?.amenity || '', addr?.landuse || ''].map(t => (t || '').toLowerCase());

  if (tags.some(t => ['railway', 'rail', 'metro', 'station'].some(r => t.includes(r)))) return 'Railway';

  const privateTags = ['building', 'commercial', 'industrial', 'house', 'apartments', 'residential', 'private', 'retail', 'office', 'mall'];
  if (tags.some(t => privateTags.some(p => t.includes(p)))) return 'Private';

  const municipalTags = ['highway', 'road', 'street', 'footway', 'path', 'trunk', 'primary', 'secondary', 'tertiary', 'service', 'park', 'garden', 'drain', 'waterway'];
  if (tags.some(t => municipalTags.some(m => t.includes(m)))) return 'Municipal';

  return 'Unknown';
}

export async function getAddressFromCoords(lat: number, lng: number): Promise<StructuredAddress> {
  const fallback = (): StructuredAddress => ({
    displayName:  `Near Kandivali, Mumbai (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    neighborhood: 'Kandivali',
    suburb:       'Kandivali West',
    city:         'Mumbai',
    state:        'Maharashtra',
    jurisdiction: 'Unknown',
    raw: {},
  });

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CivicWatch-App/2.0',
      },
    });

    if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
    const data = await res.json();
    const addr = data.address || {};

    const colonyOrName = addr.neighbourhood || addr.quarter || addr.suburb || addr.city_district || '';
    const areaName     = addr.suburb || addr.city_district || addr.district || '';
    const cityName     = addr.city || addr.town || addr.county || 'Mumbai';
    const road         = addr.road || addr.pedestrian || addr.footway || addr.street || '';

    const parts: string[] = [];
    if (road)                                    parts.push(road);
    if (colonyOrName && colonyOrName !== road)   parts.push(colonyOrName);
    if (areaName && areaName !== colonyOrName)   parts.push(areaName);
    if (cityName)                                parts.push(cityName);

    const displayName = parts.length > 0
      ? parts.join(', ')
      : (data.display_name?.split(',').slice(0, 4).join(',') || fallback().displayName);

    return {
      displayName,
      landmark:     addr.amenity || addr.tourism || addr.historic || undefined,
      neighborhood: colonyOrName || undefined,
      suburb:       addr.suburb || addr.city_district || undefined,
      city:         cityName,
      state:        addr.state || undefined,
      jurisdiction: classifyJurisdiction(addr, data.class || '', data.type || ''),
      raw:          data,
    };
  } catch (err) {
    console.warn('[AI Service] OSM geocode failed, using fallback:', err);
    return fallback();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// OFFLINE MOCK FALLBACK
// ─────────────────────────────────────────────────────────────────────────────

export function getMockAiAnalysis(fileOrName: File | string, locationData: LocationGeoData): AiCivicAnalysisResult {
  // The mock has ZERO vision -- it cannot analyze image content at all.
  // Return issueDetected:false + engine:'mock' so the UI shows
  // "AI service unavailable" instead of a fabricated pothole detection.
  return {
    issueDetected: false,
    verified: false,
    category: 'other',
    categoryLabel: 'Unknown',
    severity: 'low',
    severityScore: 0,
    summary: 'AI vision service is currently unavailable. Please fill in the issue details manually.',
    municipalIssueLikely: false,
    municipalReason: 'Could not analyze -- AI service offline.',
    department: DEPARTMENT_MAP['other'],
    confidence: 0,
    recommendedPriority: 'N/A',
    location: locationData,
    suggestedTitle: '',
    engine: 'mock',
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// SHARED PROMPT FACTORY
// Both Gemini and Grok receive the same structured prompt.
// ─────────────────────────────────────────────────────────────────────────────

function buildCivicPrompt(locationContext: string): string {
  return `You are an AI analyst for a civic hazard reporting app used in Indian cities (primarily Mumbai).

The photograph was captured at this location (provided by device GPS + OpenStreetMap — do NOT override these coordinates):
${locationContext}

Analyze the photograph carefully and respond ONLY with a valid JSON object — no markdown, no code fences, no extra text:

{
  "issueDetected": true or false,
  "category": "one of exactly: Pothole / Road | Street Light | Garbage / Sanitation | Waterlogging | Broken Footpath | Encroachment | Fallen Tree | Graffiti | Other",
  "severity": "one of exactly: Critical Hazard | High | Medium | Low",
  "description": "2 sentences describing the visible problem and its safety or public-health impact",
  "issueTitle": "short descriptive title e.g. 'Deep Pothole near Kandivali Station'",
  "municipalIssueLikely": true or false,
  "infrastructureType": "e.g. public_road | footpath | drain | streetlight | park | private_compound | unknown",
  "municipalReason": "one sentence — why the visible infrastructure appears municipal or not. Base this only on visible evidence.",
  "confidence": a number 0 to 100
}

Rules:
- If no visible civic issue exists, set issueDetected to false and other fields to null.
- Set municipalIssueLikely based only on visible infrastructure — not solely because the location is outdoors.
- Do not assume BMC ownership from location alone; reason from visible evidence only.
- Do not invent or override the GPS coordinates.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE 3a — GEMINI 1.5 FLASH (primary)
// ─────────────────────────────────────────────────────────────────────────────

async function analyzeWithGemini(
  imageFile: File | Blob,
  base64Image: string,
  locationGeo: LocationGeoData,
  locationContext: string
): Promise<AiCivicAnalysisResult> {
  const apiKey = env().VITE_GEMINI_API_KEY;

  await waitForGeminiRateLimit();
  console.log('[AI Service] Gemini — rate limit OK, calling API…');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: (imageFile.type === 'image/png' ? 'image/png' : 'image/jpeg') as any,
        data: base64Image,
      },
    },
    { text: buildCivicPrompt(locationContext) },
  ]);

  const raw = result.response.text().replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(raw);
  console.log('[AI Service] Gemini response parsed OK.');
  return buildResultFromParsed(parsed, locationGeo, 'gemini');
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE 3b — GROK VISION (automatic fallback)
// Uses xAI's OpenAI-compatible API endpoint.
// Model: grok-2-vision-1212
// ─────────────────────────────────────────────────────────────────────────────

async function analyzeWithGrok(
  base64Image: string,
  imageFile: File | Blob,
  locationGeo: LocationGeoData,
  locationContext: string
): Promise<AiCivicAnalysisResult> {
  const apiKey = env().VITE_GROK_API_KEY;
  console.log('[AI Service] Grok fallback — calling xAI Vision API…');

  const mimeType = imageFile.type === 'image/png' ? 'image/png' : 'image/jpeg';

  const body = {
    model: 'grok-2-vision-1212',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
              detail: 'high',
            },
          },
          {
            type: 'text',
            text: buildCivicPrompt(locationContext),
          },
        ],
      },
    ],
    temperature: 0.2,
    max_tokens: 600,
  };

  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Grok API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const raw = (data.choices?.[0]?.message?.content || '').replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(raw);
  console.log('[AI Service] Grok response parsed OK.');
  return buildResultFromParsed(parsed, locationGeo, 'grok');
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT — analyzeCivicImage
// Gemini → Grok → Offline Mock (priority order)
// ─────────────────────────────────────────────────────────────────────────────

export async function analyzeCivicImage(imageFile: File | Blob): Promise<AiCivicAnalysisResult> {
  // ── Step 1: GPS ──────────────────────────────────────────────────────────
  console.log('[AI Service] Step 1 — Acquiring GPS…');
  const gps = await getUserLocation();

  // ── Step 2: Structured reverse geocoding ────────────────────────────────
  console.log('[AI Service] Step 2 — Reverse geocoding…', gps);
  const geoData = await getAddressFromCoords(gps.latitude, gps.longitude);
  console.log('[AI Service] Step 2 — Resolved:', geoData.displayName, '| Jurisdiction:', geoData.jurisdiction);

  const locationGeo: LocationGeoData = {
    latitude:     gps.latitude,
    longitude:    gps.longitude,
    displayName:  geoData.displayName,
    address:      geoData.displayName,
    landmark:     geoData.landmark,
    neighborhood: geoData.neighborhood,
    suburb:       geoData.suburb,
    city:         geoData.city,
    state:        geoData.state,
    jurisdiction: geoData.jurisdiction,
    raw:          geoData.raw,
  };

  // Location context injected into both AI prompts
  const locationContext = [
    geoData.neighborhood  && `Neighbourhood / Colony: ${geoData.neighborhood}`,
    geoData.suburb        && `Area: ${geoData.suburb}`,
    geoData.city          && `City: ${geoData.city}`,
    geoData.state         && `State: ${geoData.state}`,
    `Coordinates: ${gps.latitude.toFixed(5)}, ${gps.longitude.toFixed(5)}`,
    `Pre-classified jurisdiction: ${geoData.jurisdiction}`,
  ].filter(Boolean).join('\n');

  // ── Step 3: Convert image to base64 (shared by both AI calls) ───────────
  const base64Image = await fileToBase64(imageFile);

  // ── Step 3a: TRY GEMINI (primary) ───────────────────────────────────────
  if (isGeminiConfigured()) {
    try {
      console.log('[AI Service] Step 3a — Trying Gemini Vision (primary)…');
      const result = await analyzeWithGemini(imageFile, base64Image, locationGeo, locationContext);
      console.log('[AI Service] ✅ Gemini succeeded.');
      return result;
    } catch (geminiErr: any) {
      console.warn('[AI Service] ⚠️ Gemini failed:', geminiErr?.message || geminiErr);
      console.info('[AI Service] → Falling back to Grok Vision…');
    }
  } else {
    console.info('[AI Service] Gemini not configured — skipping to Grok.');
  }

  // ── Step 3b: TRY GROK (fallback) ────────────────────────────────────────
  if (isGrokConfigured()) {
    try {
      console.log('[AI Service] Step 3b — Trying Grok Vision (fallback)…');
      const result = await analyzeWithGrok(base64Image, imageFile, locationGeo, locationContext);
      console.log('[AI Service] ✅ Grok succeeded.');
      return result;
    } catch (grokErr: any) {
      console.warn('[AI Service] ⚠️ Grok also failed:', grokErr?.message || grokErr);
      console.info('[AI Service] → Both AI services failed. Using offline mock analysis.');
    }
  } else {
    console.info('[AI Service] Grok not configured — using offline mock.');
  }

  // ── Step 4: OFFLINE MOCK (last resort) ──────────────────────────────────
  console.info('[AI Service] Running offline mock analysis with real GPS location.');
  await new Promise((r) => setTimeout(r, 700)); // simulate processing time
  return getMockAiAnalysis(imageFile instanceof File ? imageFile : 'pothole', locationGeo);
}
