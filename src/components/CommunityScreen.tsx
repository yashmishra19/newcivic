import React, { useState } from 'react';
import { 
  Building, 
  Trophy, 
  Crown, 
  Sparkles, 
  ChevronRight, 
  PlusCircle, 
  Calendar,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface Reporter {
  rank: number;
  name: string;
  reports: number;
  percentage: number;
  badge: string;
  medal: string;
  avatar: string;
  isTop?: boolean;
}

interface CommunityScreenProps {
  onNavigateToReport?: () => void;
}

export const CommunityScreen: React.FC<CommunityScreenProps> = ({ onNavigateToReport }) => {
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const reporters: Reporter[] = [
    {
      rank: 1,
      name: 'Sarah K.',
      reports: 23,
      percentage: 100,
      badge: '👑',
      medal: '🥇',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      isTop: true
    },
    {
      rank: 2,
      name: 'James L.',
      reports: 19,
      percentage: 82,
      badge: '🥇',
      medal: '🥈',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    {
      rank: 3,
      name: 'Zoe M.',
      reports: 14,
      percentage: 61,
      badge: '🥈',
      medal: '🥉',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80'
    },
    {
      rank: 4,
      name: 'David H.',
      reports: 11,
      percentage: 48,
      badge: '🥉',
      medal: '🎖️',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    }
  ];

  const handleReportClick = () => {
    if (onNavigateToReport) {
      onNavigateToReport();
    } else {
      const reportBtn = document.getElementById('nav-tab-report');
      if (reportBtn) {
        reportBtn.click();
      }
    }
  };

  const topReporter = reporters[0];
  const otherReporters = reporters.slice(1);

  return (
    <div className="w-full bg-[#F8F9FA] min-h-full font-['Plus_Jakarta_Sans',sans-serif] pb-28">
      {/* HEADER SECTION — Subtle Civic Gradient */}
      <div className="bg-gradient-to-b from-blue-50/80 via-indigo-50/30 to-white px-5 pt-6 pb-5 border-b border-blue-100/50 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
                <Trophy className="w-4 h-4" />
              </span>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">Community Hub</h1>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Metro District • Civic Contributors & City Notices
            </p>
          </div>
          <div className="flex items-center gap-1 bg-blue-100/60 border border-blue-200/70 text-blue-700 px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-2xs">
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>Active Month</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* SECTION 1 — TOP REPORTERS THIS MONTH LEADERBOARD */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Top Reporters This Month
              </h2>
              <span className="text-xs">🌟</span>
            </div>
            <span className="text-[11px] font-bold text-slate-400">4 Champions</span>
          </div>

          {/* #1 Standout Hero Card (Sarah K.) */}
          {topReporter && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-yellow-500/10 border-2 border-amber-300/80 p-4 shadow-sm mb-4">
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-400 text-amber-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
                <Crown className="w-3 h-3 fill-amber-950" />
                <span>#1 LEADER</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={topReporter.avatar}
                    alt={topReporter.name}
                    className="w-16 h-16 rounded-full object-cover border-3 border-amber-400 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-amber-400 text-white rounded-full shadow-xs w-6 h-6 flex items-center justify-center text-sm border-2 border-white">
                    🥇
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-black text-slate-900 truncate">
                      {topReporter.name}
                    </span>
                    <span className="text-xs font-extrabold text-amber-600 bg-amber-100/70 px-1.5 py-0.2 rounded">
                      Rank #1
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold mt-0.5">
                    <span className="font-extrabold text-amber-700">{topReporter.reports}</span> reports submitted
                  </p>

                  {/* Relative Progress Bar (100%) */}
                  <div className="mt-2.5">
                    <div className="flex justify-between text-[10px] font-bold text-amber-800/80 mb-1">
                      <span>Monthly Pace</span>
                      <span>100%</span>
                    </div>
                    <div className="w-full bg-amber-200/60 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500 shadow-xs"
                        style={{ width: `${topReporter.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Reporters (#2, #3, #4) */}
          <div className="space-y-3">
            {otherReporters.map((reporter) => (
              <div
                key={reporter.rank}
                className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                {/* Rank & Medal */}
                <div className="flex items-center justify-center w-8 text-center shrink-0">
                  <div className="flex flex-col items-center">
                    <span className="text-sm">{reporter.medal}</span>
                    <span className="text-[10px] font-black text-slate-500">#{reporter.rank}</span>
                  </div>
                </div>

                {/* Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={reporter.avatar}
                    alt={reporter.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-slate-200/80"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-white rounded-full shadow-2xs w-4 h-4 flex items-center justify-center text-[10px]">
                    {reporter.badge}
                  </span>
                </div>

                {/* Info & Progress Bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 truncate">
                      {reporter.name}
                    </span>
                    <span className="text-[11px] font-extrabold text-blue-600">
                      {reporter.reports} reports
                    </span>
                  </div>

                  {/* Relative Progress Bar */}
                  <div className="mt-1.5">
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-0.5">
                      <span>vs Leader</span>
                      <span>{reporter.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${reporter.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2 — MOTIVATIONAL USER RANK CALLOUT */}
        <div
          onClick={handleReportClick}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-dashed border-blue-300/80 p-4 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer active:scale-[0.99]"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-200 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
              🏅
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-700">
                  Your Rank This Month
                </span>
                <span className="inline-flex items-center text-[11px] font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                  Report Now <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                You are not ranked yet this month. Submit reports to climb the leaderboard!
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3 — CITY OF SF PUBLIC WORKS NOTICE CARD */}
        <div className="bg-white rounded-2xl p-5 border-l-4 border-l-blue-600 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Building className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900">City of SF Public Works</span>
                <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-bold">
                  ✓
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80 px-2 py-0.5 rounded-md">
              📢 NOTICE
            </span>
          </div>

          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Scheduled maintenance on Mission St this Friday 6AM-2PM. Expect lane closures and slow traffic.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setScheduleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-50 border border-blue-200 transition-all hover:border-blue-300 active:scale-95 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>View Full Schedule →</span>
            </button>
            <span className="text-[10px] font-semibold text-slate-400">Updated today</span>
          </div>
        </div>
      </div>

      {/* SCHEDULE MODAL */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900">Public Works Schedule</h3>
              </div>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <span className="font-extrabold text-blue-900 block">Mission St Resurfacing</span>
                <span className="text-slate-600 text-[11px]">Friday, 6:00 AM – 2:00 PM • Lane Closures</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-extrabold text-slate-800 block">Market St Water Main Maintenance</span>
                <span className="text-slate-600 text-[11px]">Saturday, 11:00 PM – 5:00 AM • Low Pressure</span>
              </div>
            </div>

            <button
              onClick={() => setScheduleModalOpen(false)}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
