import React, { useState, useRef } from 'react';
import {
  Camera,
  MapPin,
  Sparkles,
  Check,
  AlertTriangle,
  Upload,
  ArrowLeft,
  RefreshCw,
  Cpu,
  Layers,
  CheckCircle2,
  Sliders,
  Shield,
  Zap,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { CivicIssue, IssueCategory, IssueSeverity } from '../types';
import {
  executeAiTriagePipeline,
  buildCivicIssueFromPipeline,
  isCloudinaryConfigured,
  isGeminiConfigured,
  FullPipelineResult,
  PipelineStep,
} from '../services/apiService';
import { AiDiagnosticsModal } from './AiDiagnosticsModal';

interface ReportScreenProps {
  onAddIssue: (newIssue: CivicIssue) => void;
  onCancel: () => void;
}

export interface DemoPreset {
  id: string;
  title: string;
  tag: string;
  category: IssueCategory;
  severity: IssueSeverity;
  description: string;
  imageUrl: string;
  dept: string;
  summary: string;
  address: string;
  neighborhood: string;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'preset-pothole',
    title: 'Severe Asphalt Pothole',
    tag: 'Pothole',
    category: 'pothole',
    severity: 'critical',
    description: 'Deep road cavity roughly 8 inches deep breaking apart asphalt gravel on active traffic lane.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    dept: 'Dept. of Transportation & Roadworks (PWD)',
    summary: 'Structural asphalt crater detected with high puncture hazard.',
    address: '450 Main St (near 5th Ave)',
    neighborhood: 'Downtown District 4',
  },
  {
    id: 'preset-streetlight',
    title: 'Dark Streetlight Outage',
    tag: 'Street Light',
    category: 'street_light',
    severity: 'moderate',
    description: 'Streetlight luminaire completely dark, obscuring pedestrian crosswalk at night.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    dept: 'Municipal Lighting & Electrical Division',
    summary: 'Flickering and burnt-out fixture causing night safety hazard.',
    address: '820 Pine Ave',
    neighborhood: 'North Hills',
  },
  {
    id: 'preset-water-leak',
    title: 'Gushing Water Pipe Leak',
    tag: 'Water Leak',
    category: 'water_leak',
    severity: 'critical',
    description: 'High pressure water pooling along sidewalk edge and eroding road foundation.',
    imageUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
    dept: 'Public Utilities Commission (Water/Drainage)',
    summary: 'Pressurized water distribution line breach with road erosion.',
    address: '1100 Market St',
    neighborhood: 'Civic Center',
  },
  {
    id: 'preset-fallen-tree',
    title: 'Downed Fallen Tree',
    tag: 'Fallen Tree',
    category: 'fallen_tree',
    severity: 'critical',
    description: 'Heavy limb snapped during high winds, completely obstructing bike & car lanes.',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    dept: 'Urban Forestry & Tree Care Bureau',
    summary: 'Fallen vegetative obstacle blocking municipal right-of-way.',
    address: '320 Sutter St',
    neighborhood: 'Financial Core',
  },
];

export const ReportScreen: React.FC<ReportScreenProps> = ({ onAddIssue, onCancel }) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Navigation state: Screen 1 = Bottom Sheet selector, Screen 2 = Details & AI Classification form
  const [currentScreen, setCurrentScreen] = useState<1 | 2>(1);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
  );
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IssueCategory>('pothole');
  const [severity, setSeverity] = useState<IssueSeverity>('critical');
  const [address, setAddress] = useState('550 Mission St, Downtown District 4');
  const [neighborhood, setNeighborhood] = useState('Downtown District 4');
  const [jurisdiction, setJurisdiction] = useState<'Public' | 'Private'>('Public');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 37.7845,
    lng: -122.4045,
  });
  const [department, setDepartment] = useState('Dept. of Transportation & Roadworks (PWD)');
  const [description, setDescription] = useState('');

  // AI Pipeline Execution States
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>('idle');
  const [pipelineStepNum, setPipelineStepNum] = useState<number>(0);
  const [pipelineLabel, setPipelineLabel] = useState<string>('');
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  const hasCloudinary = isCloudinaryConfigured();
  const hasGemini = isGeminiConfigured();

  // Handle real image selection (camera or device file upload) -> go to Screen 2
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const localPreview = URL.createObjectURL(file);
    setImageUrl(localPreview);

    // Transition to Screen 2
    setCurrentScreen(2);

    // Trigger full AI multimodal pipeline
    await triggerAiPipeline(file);
  };

  // Run AI pipeline
  const triggerAiPipeline = async (file: File | Blob) => {
    setIsAiAnalyzing(true);
    setPipelineError(null);

    try {
      const result: FullPipelineResult = await executeAiTriagePipeline(
        file,
        (step, num, label) => {
          setPipelineStep(step);
          setPipelineStepNum(num);
          setPipelineLabel(label);
        }
      );

      if (result.aiAnalysis) {
        setCategory(result.aiAnalysis.category);
        setSeverity(result.aiAnalysis.severity);
        setDepartment(result.aiAnalysis.department);
        setAddress(result.location.address);
        setNeighborhood(result.location.neighborhood);
        setJurisdiction(result.aiAnalysis.location?.jurisdiction || 'Public');
        setCoords({ lat: result.location.lat, lng: result.location.lng });
        setAiConfidence(result.aiAnalysis.confidence);
        setAiSummary(result.aiAnalysis.summary);
        setTitle(`${result.aiAnalysis.categoryLabel} on ${result.location.address.split(',')[0]}`);
        setDescription(result.aiAnalysis.summary);
        if (result.imageUrl) {
          setImageUrl(result.imageUrl);
        }
      }
    } catch (err: any) {
      console.error('Error running AI pipeline:', err);
      setPipelineError(err.message || 'Pipeline execution failed.');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

<<<<<<< HEAD
  // Quick Preset Sample selector -> go to Screen 2
  const handleSelectPreset = async (preset: DemoPreset) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setSeverity(preset.severity);
    setDescription(preset.description);
    setImageUrl(preset.imageUrl);
    setAddress(preset.address);
    setNeighborhood(preset.neighborhood);
    setDepartment(preset.dept);
    setAiSummary(preset.summary);
    setAiConfidence(97.8);
    setPipelineError(null);
=======
  const handleApplySample = async (sample: (typeof SAMPLE_TEMPLATES)[0]) => {
    setTitle(sample.title);
    setCategory(sample.category);
    setSeverity(sample.severity);
    setDescription(sample.description);
    setImageUrl(sample.imageUrl);
    setDepartment(sample.dept);
    setAiSummary(sample.summary);
    setAddress(sample.address);
    setNeighborhood(sample.neighborhood);
    setAiConfidence(96.8);
>>>>>>> 09fc1da06e953b11179e9895c673b22d147e6464

    // Transition to Screen 2
    setCurrentScreen(2);

    setIsAiAnalyzing(true);
    setPipelineStepNum(1);
    setPipelineLabel('Connecting to Gemini Multimodal Vision API...');

    setTimeout(() => {
      setPipelineStepNum(2);
      setPipelineLabel('Classifying hazard type & severity score...');
    }, 400);

    setTimeout(() => {
      setPipelineStepNum(3);
      setPipelineLabel('Determining municipal department dispatch routing...');
    }, 800);

    setTimeout(() => {
      setIsAiAnalyzing(false);
      setPipelineStep('completed');
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const pipelineData: FullPipelineResult = {
      imageUrl,
      location: {
        address,
        neighborhood,
        lat: coords.lat,
        lng: coords.lng,
        source: 'gps',
      },
      aiAnalysis: {
        category,
        categoryLabel: category.replace('_', ' ').toUpperCase(),
        severity,
        severityScore: severity === 'critical' ? 5 : severity === 'moderate' ? 3 : 1,
        confidence: aiConfidence || 95.0,
        department,
        recommendedPriority: severity === 'critical' ? 'Emergency Tier 1' : 'Standard Queue',
        estimatedRepairCost: '$450 - $1,200',
        summary: aiSummary || 'Hazard visually confirmed by municipal AI vision agent.',
        location: {
          latitude: coords.lat,
          longitude: coords.lng,
          address,
          neighborhood,
          jurisdiction,
        },
      },
    };

    const newIssue = buildCivicIssueFromPipeline(title, description, pipelineData);
    onAddIssue(newIssue);
  };

  return (
<<<<<<< HEAD
    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-40 flex flex-col justify-end overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif]">

      {/* SCREEN 1: REPORT POPUP (BOTTOM SHEET) */}
      {currentScreen === 1 && (
        <div className="w-full bg-white rounded-t-[32px] shadow-[0_-12px_48px_rgba(0,0,0,0.3)] p-5 sm:p-6 pb-24 max-h-[88vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 border-t border-slate-100">
          {/* Drag Pill at Top */}
          <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Report a hazard
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Add a photo to trigger AI classification
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-colors cursor-pointer text-sm"
              title="Close popup"
            >
              ✕
            </button>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Two Big Blue Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <button
              id="take-photo-btn"
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-extrabold text-sm sm:text-base py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Camera className="w-5 h-5 stroke-[2.5]" />
              <span>Take a photo</span>
            </button>

            <button
              id="upload-device-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-extrabold text-sm sm:text-base py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Upload className="w-5 h-5 stroke-[2.5]" />
              <span>Upload from device</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                or select a demo preset
              </span>
            </div>
          </div>

          {/* 2x2 Grid of Preset Cards */}
          <div className="grid grid-cols-2 gap-3">
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                id={`preset-card-${preset.category}`}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="group relative flex flex-col bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-500 rounded-2xl overflow-hidden text-left shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="h-24 sm:h-28 w-full relative overflow-hidden bg-slate-200">
                  <img
                    src={preset.imageUrl}
                    alt={preset.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-blue-600 text-white rounded-md text-[10px] font-extrabold tracking-wide uppercase shadow-xs">
                    {preset.tag}
                  </span>
                </div>
                <div className="p-2.5">
                  <h3 className="text-xs font-extrabold text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                    {preset.title}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SCREEN 2: DETAILS & AI CLASSIFICATION FORM */}
      {currentScreen === 2 && (
        <div className="w-full bg-white rounded-t-[32px] shadow-[0_-12px_48px_rgba(0,0,0,0.3)] p-5 sm:p-6 pb-28 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 border-t border-slate-100 flex flex-col gap-4">
          
          {/* Top Bar with Back to Screen 1 */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => setCurrentScreen(1)}
              className="flex items-center gap-1.5 text-blue-600 text-xs font-extrabold hover:text-blue-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to photo selection</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDiagnosticsOpen(true)}
                className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-full text-[11px] font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                title="Open AI Pipeline Status & Diagnostics"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>AI Pipeline</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping ml-0.5" />
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Review Hazard Report</span>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>AI VERIFIED</span>
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm hazard details and auto-detected coordinates before dispatching to city workers.
            </p>
          </div>

          {/* Integration Status Bar */}
          <div className="bg-slate-100/90 rounded-2xl p-2.5 border border-slate-200 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${hasGemini ? 'bg-emerald-500 shadow-xs' : 'bg-amber-500'}`} />
              <span className="font-bold text-slate-700">Gemini Vision:</span>
              <span className="text-slate-500">{hasGemini ? 'Live Active' : 'Intelligent Fallback'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${hasCloudinary ? 'bg-emerald-500 shadow-xs' : 'bg-amber-500'}`} />
              <span className="font-bold text-slate-700">Cloudinary:</span>
              <span className="text-slate-500">{hasCloudinary ? 'Connected' : 'Demo Sandbox'}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Evidence Upload Box */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                Hazard Photo Evidence
              </label>
              <div className="relative rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 p-1 text-center aspect-video flex flex-col items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Upload preview"
                    className="w-full h-full object-cover rounded-xl"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Camera className="w-8 h-8" />
                    <span className="text-xs font-semibold">No photo selected</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setCurrentScreen(1)}
                  className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md rounded-xl px-3 py-1.5 text-[11px] font-bold text-slate-800 shadow-md flex items-center gap-1.5 hover:bg-white transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  <span>Change Photo</span>
                </button>

                {selectedFile && (
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs rounded-lg px-2.5 py-1 text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                    <span>📁 {selectedFile.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Pipeline Live Status Card */}
            {isAiAnalyzing ? (
              <div className="p-3.5 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl text-xs space-y-2 animate-pulse shadow-xs">
                <div className="flex items-center justify-between text-indigo-900 font-bold">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                    <span>AI Dispatch Pipeline Active</span>
                  </div>
                  <span className="text-[10px] bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded-full font-extrabold">
                    Step {pipelineStepNum} of 3
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] font-medium pl-6">
                  {pipelineLabel || 'Processing image triage...'}
                </p>
              </div>
            ) : aiConfidence ? (
              <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>AI Triage Verified: {severity.toUpperCase()} Priority {category.toUpperCase().replace('_', ' ')}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                    {aiConfidence}% Match
                  </span>
                </div>
                {aiSummary && (
                  <p className="text-[11px] text-emerald-800 italic pl-6 leading-relaxed">
                    "{aiSummary}"
                  </p>
                )}
                <div className="pt-1.5 pl-6 border-t border-emerald-200/60 flex items-center justify-between text-[10px] text-emerald-700">
                  <span>Auto-routed to: <strong>{department}</strong></span>
                  <span className="font-semibold text-emerald-800">Auto-Filled</span>
                </div>
              </div>
            ) : null}

            {/* Issue Title */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                Issue Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep Pothole on Main & 4th"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-hidden shadow-xs"
              />
            </div>

            {/* Category & Severity Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IssueCategory)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden shadow-xs"
                >
                  <option value="pothole">🕳️ Pothole / Road</option>
                  <option value="street_light">💡 Streetlight Outage</option>
                  <option value="water_leak">🚰 Water Main Leak</option>
                  <option value="traffic_signal">🚦 Traffic Signal</option>
                  <option value="sidewalk">🚶 Broken Sidewalk</option>
                  <option value="fallen_tree">🌳 Tree Obstruction</option>
                  <option value="illegal_dumping">🗑️ Illegal Dumping</option>
                  <option value="graffiti">🎨 Graffiti / Wall</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                  Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden shadow-xs"
                >
                  <option value="critical">🔴 Critical Hazard</option>
                  <option value="moderate">🟡 Moderate Repair</option>
                  <option value="low">🟢 Low Priority</option>
                </select>
              </div>
            </div>

            {/* Location Address with GPS & OSM Jurisdiction */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Location Address (OpenStreetMap GPS)
                </label>
                <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>OSM Geo-Tagged</span>
                </span>
              </div>
              <div className="relative mb-2">
                <MapPin className="w-4 h-4 text-blue-600 absolute left-3 top-3" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden shadow-xs"
                />
              </div>

              {/* OpenStreetMap Jurisdiction Detection Pill */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">OSM Jurisdiction:</span>
                  <span
                    className={`text-[11px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1 ${
                      jurisdiction === 'Public'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {jurisdiction === 'Public' ? '🏛️ Public Municipal Property' : '🏠 Private Property / Premise'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setJurisdiction(jurisdiction === 'Public' ? 'Private' : 'Public')}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                >
                  Toggle
                </button>
              </div>
            </div>

            {/* Additional Description / AI Summary */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                Hazard Description & Field Notes
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe hazard dimension, traffic obstruction, or immediate safety danger..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-hidden shadow-xs"
              />
            </div>

            {/* Submit Button */}
            <button
              id="submit-new-issue-btn"
              type="submit"
              disabled={!title.trim() || isAiAnalyzing}
              className="w-full py-3.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 disabled:opacity-50 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-700/25 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAiAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Photo Evidence...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Publish & Pin to Live City Map</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
=======
    <div className="flex-1 overflow-y-auto pb-24 px-5 pt-5 max-w-md mx-auto w-full space-y-6 bg-white rounded-t-[32px] shadow-2xl border-t border-slate-200 min-h-full">
      {/* Top Header Row (Matching screen.png) */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h1 className="text-2xl font-black text-[#0d1c2e] tracking-tight">
          Report
        </h1>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Close"
        >
          <X className="w-6 h-6 stroke-[2.2]" />
        </button>
      </div>

      {/* Hidden File Input for Native Camera/Gallery Selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Primary Photo Action Buttons (Matching screen.png) */}
      <div className="space-y-3.5">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-5 bg-[#0052ff] hover:bg-[#0041d6] active:scale-[0.98] text-white rounded-[20px] shadow-md flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Camera className="w-7 h-7 stroke-[2.2]" />
          <span className="text-lg font-extrabold tracking-tight">Take a Photo</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-5 bg-[#0052ff] hover:bg-[#0041d6] active:scale-[0.98] text-white rounded-[20px] shadow-md flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <ImageIcon className="w-7 h-7 stroke-[2.2]" />
          <span className="text-lg font-extrabold tracking-tight">Upload Photo</span>
        </button>

        {/* Dashed Helper Box (Matching screen.png) */}
        <div className="w-full py-4 border-2 border-dashed border-slate-300 rounded-[16px] bg-slate-50/70 text-center">
          <span className="text-sm font-semibold text-slate-700">
            Add a clear photo of the issue
          </span>
        </div>
      </div>

      {/* Quick Demo Presets */}
      <div className="pt-2 border-t border-slate-100">
        <span className="text-[11px] font-extrabold text-[#757684] uppercase tracking-wider block mb-2">
          Or Select Demo Preset
        </span>
        <div className="grid grid-cols-2 gap-2">
          {SAMPLE_TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplySample(tpl)}
              className="p-2.5 bg-slate-50 hover:bg-[#e8edff] rounded-xl border border-slate-200/80 text-left text-xs transition-all cursor-pointer"
            >
              <span className="font-bold text-[#0d1c2e] line-clamp-1 block">{tpl.title}</span>
              <span className="text-[10px] text-[#757684] block mt-0.5 capitalize truncate">
                {tpl.category.replace('_', ' ')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Details & AI Pipeline Verification Section */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-200">
        {/* AI Analysis Status Pill */}
        {isAiAnalyzing ? (
          <div className="p-3 bg-[#e6eeff] border border-[#d5e3fc] rounded-xl text-xs text-[#00288e] font-semibold flex items-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 text-[#1e40af] animate-spin" />
            <span>{pipelineLabel || 'AI scanning photo for hazard triage & priority...'}</span>
          </div>
        ) : aiConfidence ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>AI Verified: {severity.toUpperCase()} Priority {category.toUpperCase()}</span>
            </div>
            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
              {aiConfidence}% Match
            </span>
          </div>
        ) : null}

        {/* Title */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#757684] block mb-1">
            Issue Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Deep Pothole on Main & 4th"
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#0d1c2e] placeholder-slate-400 focus:ring-2 focus:ring-[#1e40af] focus:outline-hidden"
          />
        </div>

        {/* Category & Severity */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#757684] block mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IssueCategory)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#0d1c2e] focus:outline-hidden"
            >
              <option value="pothole">🕳️ Pothole / Road</option>
              <option value="street_light">💡 Streetlight Outage</option>
              <option value="water_leak">🚰 Water Main Leak</option>
              <option value="traffic_signal">🚦 Traffic Signal</option>
              <option value="sidewalk">🚶 Broken Sidewalk</option>
              <option value="fallen_tree">🌳 Tree Obstruction</option>
              <option value="graffiti">🎨 Graffiti / Cleanliness</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#757684] block mb-1">
              Severity
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#0d1c2e] focus:outline-hidden"
            >
              <option value="critical">🔴 Critical Hazard</option>
              <option value="moderate">🟡 Moderate Repair</option>
              <option value="low">🟢 Low Priority</option>
            </select>
          </div>
        </div>

        {/* Location Address */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#757684] block mb-1">
            Location Address
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-[#1e40af] absolute left-3 top-3" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium text-[#0d1c2e] focus:ring-2 focus:ring-[#1e40af] focus:outline-hidden"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#757684] block mb-1">
            Additional Details (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe hazard dimension, traffic obstruction, or immediate safety danger..."
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-[#0d1c2e] placeholder-slate-400 focus:ring-2 focus:ring-[#1e40af] focus:outline-hidden"
          />
        </div>

        {/* Submit Button */}
        <button
          id="submit-new-issue-btn"
          type="submit"
          disabled={!title.trim() || isAiAnalyzing}
          className="w-full py-3.5 bg-[#0052ff] hover:bg-[#0041d6] disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Publish & Pin to Live Map</span>
        </button>
      </form>
>>>>>>> 09fc1da06e953b11179e9895c673b22d147e6464

      {/* Diagnostics Modal */}
      <AiDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        onApplyToReport={(diagResult) => {
          setCategory(diagResult.aiAnalysis.category);
          setSeverity(diagResult.aiAnalysis.severity);
          setDepartment(diagResult.aiAnalysis.department);
          setAddress(diagResult.location.address);
          setNeighborhood(diagResult.location.neighborhood);
          setJurisdiction(diagResult.aiAnalysis.location?.jurisdiction || 'Public');
          setCoords({ lat: diagResult.location.lat, lng: diagResult.location.lng });
          setAiConfidence(diagResult.aiAnalysis.confidence);
          setAiSummary(diagResult.aiAnalysis.summary);
          setTitle(`${diagResult.aiAnalysis.categoryLabel} on ${diagResult.location.address.split(',')[0]}`);
          setDescription(diagResult.aiAnalysis.summary);
          if (diagResult.imageUrl) {
            setImageUrl(diagResult.imageUrl);
          }
          setCurrentScreen(2);
        }}
      />
    </div>
  );
};

