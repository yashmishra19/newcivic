import React from 'react';
import { ChevronRight } from 'lucide-react';
import { CivicIssue } from '../types';

interface SubmittedReportsCardProps {
  issues: CivicIssue[];
  onViewDetails: (issue: CivicIssue) => void;
  onViewAll?: () => void;
}

export const SubmittedReportsCard: React.FC<SubmittedReportsCardProps> = ({
  issues,
  onViewDetails,
  onViewAll,
}) => {
  const myReported = issues.slice(0, 3);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-sm font-extrabold text-[#0d1c2e] dark:text-slate-100">
          My Submitted Reports ({myReported.length})
        </h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-[#1e40af] dark:text-blue-400 hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>

      <div className="space-y-2.5">
        {myReported.map((item) => (
          <div
            key={item.id}
            onClick={() => onViewDetails(item)}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-700/60 p-3 flex gap-3 hover:shadow-md dark:hover:shadow-slate-950/20 transition-all items-center cursor-pointer"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
              crossOrigin="anonymous"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xs text-[#0d1c2e] dark:text-slate-100 truncate mb-1">
                {item.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#757684] dark:text-slate-400">{item.reportedAt}</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                    item.status === 'resolved'
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-455 dark:text-emerald-400'
                      : item.status === 'in_progress'
                      ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-400'
                      : 'bg-[#e6eeff] dark:bg-blue-950/40 text-[#1e40af] dark:text-blue-400'
                  }`}
                >
                  {item.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#757684] dark:text-slate-400 flex-shrink-0" />
          </div>
        ))}
      </div>
    </section>
  );
};
