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
        <h2 className="text-sm font-extrabold text-[#0d1c2e]">
          My Submitted Reports ({myReported.length})
        </h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-[#1e40af] hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>

      <div className="space-y-2.5">
        {myReported.map((item) => (
          <div
            key={item.id}
            onClick={() => onViewDetails(item)}
            className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 flex gap-3 hover:shadow-md transition-all items-center cursor-pointer"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
              crossOrigin="anonymous"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xs text-[#0d1c2e] truncate mb-1">
                {item.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#757684]">{item.reportedAt}</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                    item.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'in_progress'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-[#e6eeff] text-[#1e40af]'
                  }`}
                >
                  {item.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#757684] flex-shrink-0" />
          </div>
        ))}
      </div>
    </section>
  );
};
