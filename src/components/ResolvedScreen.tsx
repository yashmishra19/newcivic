import React, { useState } from 'react';
import { CheckCircle, Sparkles, MapPin, ThumbsUp, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { CivicIssue } from '../types';

interface ResolvedScreenProps {
  issues: CivicIssue[];
  onViewDetails: (issue: CivicIssue) => void;
  onNavigateToMap: () => void;
}

export const ResolvedScreen: React.FC<ResolvedScreenProps> = ({
  issues,
  onViewDetails,
  onNavigateToMap,
}) => {
  const resolvedList = issues.filter((i) => i.status === 'resolved');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pothole' | 'street_light' | 'graffiti'>('all');

  const filtered = resolvedList.filter((item) => {
    if (selectedFilter === 'all') return true;
    return item.category === selectedFilter;
  });

  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 max-w-md mx-auto w-full space-y-5">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5" />
          Community Impact
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
          Resolved Fixes Archive
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track verified repairs completed by municipal crews and local public works.
        </p>
      </div>

      {/* Hero Achievement Stats Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 text-white shadow-lg shadow-emerald-600/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-extrabold uppercase tracking-wider">Resolution Rate</span>
          </div>
          <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold">92.8% On-Time</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-white/20">
          <div>
            <span className="text-2xl font-black block">142</span>
            <span className="text-[10px] text-emerald-100 font-medium">Repairs Fixed</span>
          </div>
          <div>
            <span className="text-2xl font-black block">28h</span>
            <span className="text-[10px] text-emerald-100 font-medium">Avg Response</span>
          </div>
          <div>
            <span className="text-2xl font-black block">$48k</span>
            <span className="text-[10px] text-emerald-100 font-medium">Public Budget Saved</span>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { id: 'all', label: 'All Repaired' },
          { id: 'street_light', label: '💡 Lighting' },
          { id: 'graffiti', label: '🎨 Cleanliness' },
          { id: 'pothole', label: '🕳️ Roads' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setSelectedFilter(btn.id as any)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
              selectedFilter === btn.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Resolved List Cards */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => onViewDetails(item)}
            className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-emerald-400 transition-all cursor-pointer space-y-3"
          >
            {/* Image Grid (Before & After if available) */}
            <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden aspect-2/1">
              <div className="relative bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt="Before"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
                <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Before
                </span>
              </div>
              <div className="relative bg-slate-100">
                <img
                  src={item.resolvedImageUrl || item.imageUrl}
                  alt="After"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
                <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Repaired ✓
                </span>
              </div>
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm">{item.title}</h3>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  Verified Fixed
                </span>
              </div>

              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.location.address}</span>
              </p>

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-xs">
                <span className="text-[#757684] text-[11px]">
                  Fixed by {item.assignedDepartment}
                </span>
                <span className="text-[#1e40af] font-bold flex items-center gap-1">
                  View Timeline <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
