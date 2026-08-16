import React from 'react';
import { X, Check, RotateCcw, AlertTriangle, CheckCircle, Wrench, Sparkles } from 'lucide-react';
import { FilterOptions } from '../types';
import { motion } from 'motion/react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
  totalResultsCount: number;
}

const CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: '📍' },
  { id: 'pothole', label: 'Potholes & Roads', icon: '🕳️' },
  { id: 'street_light', label: 'Street Lights', icon: '💡' },
  { id: 'water_leak', label: 'Water & Sewage', icon: '🚰' },
  { id: 'traffic_signal', label: 'Traffic Signals', icon: '🚦' },
  { id: 'sidewalk', label: 'Sidewalks & Curbs', icon: '🚶' },
  { id: 'fallen_tree', label: 'Fallen Trees/Debris', icon: '🌳' },
  { id: 'graffiti', label: 'Graffiti & Cleanliness', icon: '🎨' },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  totalResultsCount,
}) => {
  const [localFilters, setLocalFilters] = React.useState<FilterOptions>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    const reset: FilterOptions = {
      searchQuery: '',
      category: 'all',
      severity: 'all',
      status: 'all',
      sortBy: 'newest',
    };
    setLocalFilters(reset);
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900">Filter Civic Issues</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Options */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
          {/* 1. Severity */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Severity Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'All Levels', icon: null },
                { id: 'critical', label: 'Critical', icon: AlertTriangle, color: 'text-red-600' },
                { id: 'moderate', label: 'Moderate', icon: Wrench, color: 'text-amber-600' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setLocalFilters({ ...localFilters, severity: item.id })}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    localFilters.severity === item.id
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.icon && <item.icon className={`w-3.5 h-3.5 ${item.color}`} />}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Status */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Resolution Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'All Status' },
                { id: 'reported', label: 'Reported' },
                { id: 'in_progress', label: 'In Progress' },
                { id: 'resolved', label: 'Resolved' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setLocalFilters({ ...localFilters, status: st.id })}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all ${
                    localFilters.status === st.id
                      ? 'bg-blue-700 border-blue-700 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Category Chips */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setLocalFilters({ ...localFilters, category: cat.id })}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                    localFilters.category === cat.id
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Sort By */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#757684] block mb-2.5">
              Sort By
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'newest', label: 'Recent' },
                { id: 'upvotes', label: 'Most Upvoted' },
                { id: 'severity', label: 'High Urgency' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setLocalFilters({ ...localFilters, sortBy: s.id as any })}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    localFilters.sortBy === s.id
                      ? 'bg-[#e6eeff] border-[#1e40af] text-[#1e40af]'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Apply Button */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            onClick={handleApply}
            className="w-full py-3 bg-[#1e40af] hover:bg-[#00288e] text-white rounded-xl font-bold text-sm shadow-md shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Apply Filters ({totalResultsCount} Matches)</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
