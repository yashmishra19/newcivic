import React, { useState } from 'react';
import { X, Sparkles, Cloud, MapPin, CheckCircle2, AlertCircle, RefreshCw, Cpu, Layers } from 'lucide-react';
import {
  executeAiTriagePipeline,
  isCloudinaryConfigured,
  isGeminiConfigured,
  FullPipelineResult,
} from '../services/apiService';

interface AiDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToReport?: (pipelineData: FullPipelineResult) => void;
}

export const AiDiagnosticsModal: React.FC<AiDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  onApplyToReport,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepLabel, setStepLabel] = useState<string>('');
  const [result, setResult] = useState<FullPipelineResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasCloudinary = isCloudinaryConfigured();
  const hasGemini = isGeminiConfigured();

  if (!isOpen) return null;

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setSelectedFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setResult(null);
      setErrorMsg(null);
      setCurrentStep(0);
    }
  };

  const handleRunDiagnostic = async () => {
    if (!selectedFile) return;

    setIsRunning(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const output = await executeAiTriagePipeline(selectedFile, (_step, stepNum, label) => {
        setCurrentStep(stepNum);
        setStepLabel(label);
      });
      setResult(output);
      setCurrentStep(4);
    } catch (err: any) {
      setErrorMsg(err.message || 'Diagnostic execution failed');
      setCurrentStep(0);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">AI & Cloud Pipeline Diagnostics</h3>
              <p className="text-xs text-slate-400">Gemini Vision AI • Cloudinary • OpenStreetMap GPS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Credentials Overview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${hasCloudinary ? 'bg-emerald-400 shadow-emerald-400/40 shadow-sm' : 'bg-amber-400 shadow-amber-400/40 shadow-sm'}`} />
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-200 block">Cloudinary Media</span>
                <span className="text-[11px] text-slate-400">
                  {hasCloudinary ? 'Live Cloud Storage' : 'Demo / Sandbox Mode'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${hasGemini ? 'bg-emerald-400 shadow-emerald-400/40 shadow-sm' : 'bg-amber-400 shadow-amber-400/40 shadow-sm'}`} />
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-200 block">Gemini 2.0 Vision</span>
                <span className="text-[11px] text-slate-400">
                  {hasGemini ? 'Live Neural Engine' : 'Intelligent Fallback'}
                </span>
              </div>
            </div>
          </div>

          {/* Upload / Select Test File */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Select Test Image
            </label>
            <div
              onClick={() => document.getElementById('diag-file-input')?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                selectedFile
                  ? 'border-indigo-500 bg-indigo-500/5'
                  : 'border-slate-700 hover:border-indigo-400 bg-slate-800/30'
              }`}
            >
              <input
                id="diag-file-input"
                type="file"
                accept="image/*"
                onChange={handleFilePick}
                className="hidden"
              />
              {previewUrl ? (
                <div className="flex items-center gap-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-700 shadow-md"
                  />
                  <div className="text-left flex-1 min-w-0">
                    <span className="font-bold text-sm text-white truncate block">
                      {selectedFile?.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {((selectedFile?.size || 0) / 1024).toFixed(1)} KB • Ready for analysis
                    </span>
                  </div>
                  <span className="text-xs text-indigo-400 font-bold px-2 py-1 bg-indigo-500/10 rounded-lg">
                    Change
                  </span>
                </div>
              ) : (
                <div className="py-4">
                  <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">
                    Click to select an image for integration test
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">JPEG, PNG, WEBP supported</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleRunDiagnostic}
            disabled={!selectedFile || isRunning}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Pipeline: {stepLabel || 'Processing...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Full Multimodal Pipeline Test</span>
              </>
            )}
          </button>

          {/* Pipeline Progress Stages */}
          {(isRunning || currentStep > 0) && (
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Execution Pipeline
              </span>

              <div className={`flex items-center gap-3 text-xs ${currentStep >= 1 ? (currentStep > 1 ? 'text-emerald-400' : 'text-indigo-400 font-bold') : 'text-slate-500'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${currentStep > 1 ? 'bg-emerald-500/20 border-emerald-500' : currentStep === 1 ? 'bg-indigo-500/20 border-indigo-500 animate-pulse' : 'border-slate-700'}`}>
                  {currentStep > 1 ? '✓' : '1'}
                </div>
                <span>Step 1: Cloudinary CDN Media Upload</span>
              </div>

              <div className={`flex items-center gap-3 text-xs ${currentStep >= 2 ? (currentStep > 2 ? 'text-emerald-400' : 'text-indigo-400 font-bold') : 'text-slate-500'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${currentStep > 2 ? 'bg-emerald-500/20 border-emerald-500' : currentStep === 2 ? 'bg-indigo-500/20 border-indigo-500 animate-pulse' : 'border-slate-700'}`}>
                  {currentStep > 2 ? '✓' : '2'}
                </div>
                <span>Step 2: Geolocation & Nominatim Reverse Geocoding</span>
              </div>

              <div className={`flex items-center gap-3 text-xs ${currentStep >= 3 ? (currentStep > 3 ? 'text-emerald-400' : 'text-indigo-400 font-bold') : 'text-slate-500'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${currentStep > 3 ? 'bg-emerald-500/20 border-emerald-500' : currentStep === 3 ? 'bg-indigo-500/20 border-indigo-500 animate-pulse' : 'border-slate-700'}`}>
                  {currentStep > 3 ? '✓' : '3'}
                </div>
                <span>Step 3: Gemini Multimodal Vision AI Classification</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Pipeline Execution Error</span>
                <p className="mt-0.5 text-red-400">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Results Summary Card */}
          {result && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/90 to-indigo-950/40 border border-indigo-500/30 space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-extrabold text-sm text-white">Analysis Succeeded</span>
                </div>
                <span className="text-[11px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                  {result.aiAnalysis.confidence}% Confidence
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">CATEGORY</span>
                  <span className="font-bold text-white capitalize">{result.aiAnalysis.categoryLabel}</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">SEVERITY</span>
                  <span className="font-bold text-amber-400 uppercase">{result.aiAnalysis.severity} (Tier {result.aiAnalysis.severityScore}/5)</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">OSM JURISDICTION</span>
                  <span className={`font-black text-xs px-2 py-0.5 rounded-md inline-block mt-0.5 ${result.aiAnalysis.location?.jurisdiction === 'Private' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
                    🏛️ {result.aiAnalysis.location?.jurisdiction || 'Public'} Property
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">COORDINATES</span>
                  <span className="font-bold text-slate-300 text-xs">{result.aiAnalysis.location?.latitude.toFixed(4)}, {result.aiAnalysis.location?.longitude.toFixed(4)}</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 col-span-2">
                  <span className="text-slate-400 block text-[10px]">ASSIGNED DEPARTMENT</span>
                  <span className="font-bold text-emerald-400">{result.aiAnalysis.department}</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 col-span-2">
                  <span className="text-slate-400 block text-[10px]">RESOLVED ADDRESS (OPENSTREETMAP)</span>
                  <span className="font-bold text-slate-200">{result.aiAnalysis.location?.address || result.location.address}</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 col-span-2">
                  <span className="text-slate-400 block text-[10px]">AI HAZARD SUMMARY</span>
                  <span className="text-slate-300 italic">"{result.aiAnalysis.summary}"</span>
                </div>
              </div>

              {onApplyToReport && (
                <button
                  onClick={() => {
                    onApplyToReport(result);
                    onClose();
                  }}
                  className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply Diagnostics to Report Form</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
