import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Download, Clock, MapPin, Eye, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { CATEGORY_LABELS, STATUS_LABELS } from '../../data/mockIncidents';
import { getIncidents } from '../../services/incidents';

const PRIORITY_BADGE: Record<string, { bg: string; text: string }> = {
  critical: { bg: 'bg-red-100',    text: 'text-red-700'    },
  high:     { bg: 'bg-orange-100', text: 'text-orange-700' },
  medium:   { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  low:      { bg: 'bg-blue-100',   text: 'text-blue-700'   },
};

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  'in-progress': { bg: 'bg-amber-100',  text: 'text-amber-700'  },
  assigned:      { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  reported:      { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  verified:      { bg: 'bg-violet-100', text: 'text-violet-700' },
  resolved:      { bg: 'bg-emerald-100',text: 'text-emerald-700'},
  closed:        { bg: 'bg-slate-100',  text: 'text-slate-600'  },
};

const PAGE_SIZE = 8;

export default function Incidents() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    getIncidents()
      .then(setIncidents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !inc.title.toLowerCase().includes(q) &&
          !inc.id.toLowerCase().includes(q) &&
          !inc.address?.toLowerCase().includes(q)
        ) return false;
      }
      if (statusFilter !== 'all'   && inc.status   !== statusFilter)   return false;
      if (priorityFilter !== 'all' && inc.priority !== priorityFilter) return false;
      if (categoryFilter !== 'all' && inc.category !== categoryFilter) return false;
      return true;
    });
  }, [incidents, search, statusFilter, priorityFilter, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-[1440px]">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search incidents..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-700 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="reported">Reported</option>
          <option value="verified">Verified</option>
          <option value="assigned">Assigned</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-700 focus:outline-none"
        >
          <option value="all">All Priority</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-700 focus:outline-none"
        >
          <option value="all">All Departments</option>
          <option value="public-works">Public Works</option>
          <option value="emergency">Emergency</option>
          <option value="sanitation">Sanitation</option>
          <option value="power">Power & Utilities</option>
          <option value="law-enforcement">Law Enforcement</option>
        </select>

        <button className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-700 hover:bg-slate-50 transition-colors font-medium">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Summary */}
      <p className="text-[13px] text-slate-500">
        Showing <span className="font-semibold text-slate-700">{paged.length}</span> of{' '}
        <span className="font-semibold text-slate-700">{filtered.length}</span> incidents
      </p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Issue</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reported</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paged.map((inc) => {
                const pBadge = PRIORITY_BADGE[inc.priority] || PRIORITY_BADGE.low;
                const sBadge = STATUS_BADGE[inc.status]    || STATUS_BADGE.reported;
                return (
                  <tr key={inc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-[12px] font-mono font-semibold text-slate-500">{inc.id}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {inc.photo && (
                          <img src={inc.photo} alt={inc.title} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                        )}
                        <span className="text-[13px] font-semibold text-slate-800 truncate max-w-[200px]">
                          {inc.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[12px] text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {inc.address}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[12px] text-slate-600">
                        {CATEGORY_LABELS[inc.category as keyof typeof CATEGORY_LABELS] || inc.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${pBadge.bg} ${pBadge.text} uppercase`}>
                        {inc.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[12px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(inc.reported_at)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${sBadge.bg} ${sBadge.text} capitalize`}>
                        {STATUS_LABELS[inc.status as keyof typeof STATUS_LABELS] || inc.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/admin/incidents/${inc.id}`}
                        className="flex items-center gap-1 text-[12px] font-medium text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[12px] text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-[12px] font-medium flex items-center justify-center transition-colors ${
                    p === page ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}