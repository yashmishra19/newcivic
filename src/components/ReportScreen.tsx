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
  Search,
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

const SAMPLE_TEMPLATES = [
  {
    title: 'Severe Asphalt Pothole',
    category: 'pothole' as IssueCategory,
    severity: 'critical' as IssueSeverity,
    description: 'Deep road cavity roughly 8 inches deep breaking apart asphalt gravel on active traffic lane.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    dept: 'Dept. of Transportation & Roadworks (PWD)',
    summary: 'Structural asphalt crater detected with high puncture hazard.',
    address: '450 Main St (near 5th Ave)',
    neighborhood: 'Downtown District 4',
  },
  {
    title: 'Dark Streetlight Outage',
    category: 'street_light' as IssueCategory,
    severity: 'moderate' as IssueSeverity,
    description: 'Streetlight luminaire completely dark, obscuring pedestrian crosswalk at night.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    dept: 'Municipal Lighting & Electrical Division',
    summary: 'Flickering and burnt-out fixture causing night safety hazard.',
    address: '820 Pine Ave',
    neighborhood: 'North Hills',
  },
  {
    title: 'Gushing Water Pipe Leak',
    category: 'water_leak' as IssueCategory,
    severity: 'critical' as IssueSeverity,
    description: 'High pressure water pooling along sidewalk edge and eroding road foundation.',
    imageUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
    dept: 'Public Utilities Commission (Water/Drainage)',
    summary: 'Pressurized water distribution line breach with road erosion.',
    address: '1100 Market St',
    neighborhood: 'Civic Center',
  },
  {
    title: 'Downed Oak Tree Branch',
    category: 'fallen_tree' as IssueCategory,
    severity: 'critical' as IssueSeverity,
    description: 'Heavy limb snapped during high winds, completely obstructing bike & car lanes.',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    dept: 'Urban Forestry & Tree Care Bureau',
    summary: 'Fallen vegetative obstacle blocking municipal right-of-way.',
    address: '320 Sutter St',
    neighborhood: 'Financial Core',
  },
];

export const ReportScreen: React.FC<ReportScreenProps> = ({ onAddIssue, onCancel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

  // Handle local image file selection from camera/gallery
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const localPreview = URL.createObjectURL(file);
    setImageUrl(localPreview);

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
    <div className="flex-1 w-full max-w-md mx-auto bg-white overflow-y-auto p-5 pb-28 space-y-5 font-['Plus_Jakarta_Sans',sans-serif] min-h-full">
      {/* Top Header Row with Back Button */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 -ml-1 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Back to map"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h1 className="text-xl font-black text-[#0d1c2e] tracking-tight">
            Report a Hazard
          </h1>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Location / Address Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Search location address..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-[#0d1c2e] placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all shadow-xs"
        />
      </div>

      {/* Hidden File Inputs for Native Camera & Gallery Selection */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Primary Photo Action Buttons & Preview Box */}
      <div className="space-y-3.5">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="w-full py-4 bg-[#0052ff] hover:bg-[#0041d6] active:scale-[0.98] text-white rounded-[20px] shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer"
        >
          <Camera className="w-6 h-6 stroke-[2.2]" />
          <span className="text-base font-extrabold tracking-tight">Take a Photo</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-4 bg-[#0052ff] hover:bg-[#0041d6] active:scale-[0.98] text-white rounded-[20px] shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer"
        >
          <ImageIcon className="w-6 h-6 stroke-[2.2]" />
          <span className="text-base font-extrabold tracking-tight">Upload Photo</span>
        </button>

        {/* Photo Evidence Preview Box or Helper Box */}
        {imageUrl ? (
          <div className="relative rounded-[20px] overflow-hidden bg-slate-900 border-2 border-slate-200 aspect-video shadow-md group">
            <img
              src={imageUrl}
              alt="Photo evidence preview"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Camera className="w-3 h-3 text-blue-400" />
                  <span>{selectedFile ? selectedFile.name : 'Photo Evidence Attached'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setImageUrl('');
                  }}
                  className="w-7 h-7 rounded-full bg-slate-900/80 hover:bg-red-600 text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="bg-white/90 hover:bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  <span>Retake</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/90 hover:bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Change Photo</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full py-4 border-2 border-dashed border-slate-300 rounded-[16px] bg-slate-50/70 text-center">
            <span className="text-sm font-semibold text-slate-700">
              Add a clear photo of the issue
            </span>
          </div>
        )}
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
        }}
      />
    </div>
  );
};