import React from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  MapPin,
  ThumbsUp,
  User,
  Wrench,
} from 'lucide-react';
import { CivicIssue } from '../types';
import { SubmittedReportsCard } from './SubmittedReportsCard';

interface HomeScreenProps {
  issues: CivicIssue[];
  onSelectIssue: (id: string) => void;
  onViewDetails: (issue: CivicIssue) => void;
  onNavigateToMap: () => void;
  onNavigateToReport: () => void;
  onNavigateToProfile?: () => void;
  onUpvote: (id: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  issues,
  onSelectIssue,
  onViewDetails,
  onNavigateToMap,
  onNavigateToReport,
  onNavigateToProfile,
  onUpvote,
}) => {
  const criticalIssues = issues.filter((i) => i.severity === 'critical');

  const reporterFallback = (issue: CivicIssue) => {
    return {
      name: issue.reportedBy?.name || 'Citizen Reporter',
      avatar: issue.reportedBy?.avatar || '',
      badge: issue.reportedBy?.badge || 'Civic Watcher',
    };
  };

  return (
    <div className="w-full bg-[#f8f9ff] dark:bg-slate-900 transition-colors duration-200">
      <div className="max-w-md mx-auto w-full px-4 pt-4 space-y-5">
        
        {/* ================= 1. TOP LOCATION ROW ================= */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-[#e6eeff] dark:bg-slate-800 hover:bg-[#dce9ff] dark:hover:bg-slate-700/60 transition-colors px-3 py-1.5 rounded-full cursor-pointer select-none">
            <MapPin className="w-3.5 h-3.5 text-[#1e40af] dark:text-blue-400 fill-[#1e40af]/10" />
            <span className="text-[11px] font-extrabold tracking-wider text-[#0d1c2e] dark:text-slate-200 uppercase">
              METRO DISTRICT 4
            </span>
            <ChevronDown className="w-3 h-3 text-[#757684] dark:text-slate-400" />
          </div>
          <span className="text-xs font-semibold text-[#757684] dark:text-slate-400">
            Within 2 km
          </span>
        </div>

        {/* ================= 2. MAIN HEADER ================= */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0d1c2e] dark:text-slate-100 tracking-tight">
              CivicFix
            </h1>
            <span className="bg-[#1e40af] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center justify-center animate-pulse">
              LIVE
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="relative p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700/60 shadow-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            
            {/* User Avatar */}
            <div
              onClick={onNavigateToProfile}
              className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/60 shadow-xs bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* ================= 3. MY SUBMITTED REPORTS CARD ================= */}
        <SubmittedReportsCard
          issues={issues}
          onViewDetails={onViewDetails}
          onViewAll={onNavigateToProfile}
        />

        {/* ================= 4. INCIDENTS SECTION HEADER ================= */}
        <div className="pt-2">
          <h2 className="font-black text-[17px] text-[#0d1c2e] dark:text-slate-100 tracking-tight">
            Incidents Near You
          </h2>
          <p className="text-[10px] font-medium text-[#757684] dark:text-slate-400 mt-0.5">
            Updated 2 min ago
          </p>
        </div>

        {/* ================= 5. INCIDENT CARDS ================= */}
        <div className="space-y-6">
          {issues.map((item) => {
            const reporter = reporterFallback(item);
            
            const isCritical = item.severity === 'critical';
            const isResolved = item.status === 'resolved';
            const isRepairing = item.status === 'in_progress' || item.status === 'scheduled';
            const isReported = item.status === 'reported';
            
            // Format nice tags based on category
            const tagText = `#${item.category.replace('_', '')} #${item.location.neighborhood.replace(/\s+/g, '')}`;

            return (
              <div
                key={item.id}
                onClick={() => onViewDetails(item)}
                className="bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all overflow-hidden cursor-pointer"
              >
                {/* CARD TOP - Reporter Info */}
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 dark:border-slate-700 flex-shrink-0 bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                    {reporter.avatar ? (
                      <img
                        src={reporter.avatar}
                        alt={reporter.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#0d1c2e] dark:text-slate-100 text-sm truncate">
                        {reporter.name}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600 text-[10px] font-bold">•</span>
                      
                      {isCritical ? (
                        <span className="text-[10px] font-extrabold tracking-wider text-red-600 dark:text-red-400">
                          CRITICAL
                        </span>
                      ) : isRepairing ? (
                        <span className="text-[10px] font-extrabold tracking-wider text-amber-700 dark:text-amber-400">
                          REPAIRING
                        </span>
                      ) : isResolved ? (
                        <span className="text-[10px] font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400">
                          RESOLVED
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold tracking-wider text-blue-600 dark:text-blue-400">
                          REPORTED
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[10px] text-[#757684] dark:text-slate-400 font-medium truncate mt-0.5">
                      {item.location.address} • {item.reportedAt}
                    </p>
                  </div>
                </div>

                {/* CARD IMAGE SECTION */}
                <div className="relative w-full h-[320px] bg-slate-100 dark:bg-slate-900">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                  
                  {/* Crew Assigned Badge Overlay (Top Right) */}
                  {isRepairing && (
                    <div className="absolute top-4 right-4 bg-[#872d00] text-white font-extrabold text-[9px] tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      <span>CREW ASSIGNED</span>
                    </div>
                  )}

                  {/* Location Badge Overlay (Bottom Left) */}
                  <div className="absolute bottom-4 left-4 bg-[#0d1c2e]/85 dark:bg-slate-950/85 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span>📍</span>
                    <span>Metro District 4</span>
                  </div>

                  {/* Upvote Button Overlay (Bottom Right) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpvote(item.id);
                    }}
                    className={`absolute bottom-4 right-4 px-3.5 py-2 rounded-full font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 ${
                      item.hasUpvoted
                        ? 'bg-[#1e40af] dark:bg-blue-600 text-white shadow-blue-900/20'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${item.hasUpvoted ? 'fill-white stroke-[#1e40af] dark:stroke-blue-600' : ''}`} />
                    <span>UPVOTE • {item.upvotes}</span>
                  </button>
                </div>

                {/* CARD BOTTOM - Content */}
                <div className="p-4 space-y-1.5">
                  <h3 className="font-extrabold text-[15px] text-[#0d1c2e] dark:text-slate-100 leading-snug">
                    {item.title}
                  </h3>
                  
                  <p className="text-xs text-[#444653] dark:text-slate-300 leading-relaxed">
                    <span className="font-bold text-[#0d1c2e] dark:text-slate-200 mr-1">{reporter.name}</span>
                    {item.description}
                  </p>

                  <p className="text-[10px] font-bold text-[#1e40af] dark:text-blue-400">
                    {tagText}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {issues.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
              <CheckCircle className="w-10 h-10 mx-auto text-emerald-500" />
              <h3 className="font-bold text-[#0d1c2e] dark:text-slate-100 mt-3">
                No incidents nearby
              </h3>
              <p className="text-xs text-[#757684] dark:text-slate-400 mt-1">
                Your area is looking good!
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
