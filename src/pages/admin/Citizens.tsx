import { useState } from 'react';
import { Search, Mail, Shield, AlertTriangle, ShieldCheck, Download, Ban } from 'lucide-react';
import { MOCK_CITIZENS, CITIZEN_STATUS_COLORS, CITIZEN_STATUS_LABELS } from '../../data/mockCitizens';

const KPI_METRICS = [
  { label: 'Total Registered', value: '12,482', color: 'text-blue-600', icon: Shield },
  { label: 'Verified Accounts', value: '8,914', color: 'text-emerald-600', icon: ShieldCheck },
  { label: 'Pending Review', value: '342', color: 'text-amber-600', icon: AlertTriangle },
  { label: 'Banned', value: '45', color: 'text-red-600', icon: Ban },
];

export default function Citizens() {
  const [activeTab, setActiveTab] = useState('All Citizens');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredCitizens = MOCK_CITIZENS.filter((citizen) => {
    if (activeTab === 'Verified Only' && citizen.status !== 'verified' && citizen.status !== 'top-contributor') return false;
    if (activeTab === 'Top Reporters' && citizen.status !== 'top-contributor') return false;
    if (activeTab === 'Pending' && citizen.status !== 'pending') return false;
    if (activeTab === 'Banned' && citizen.status !== 'banned') return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        citizen.name.toLowerCase().includes(q) ||
        citizen.email.toLowerCase().includes(q) ||
        citizen.neighborhood.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-[1440px]">
      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {KPI_METRICS.map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-100 ${kpi.color}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
              <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">{kpi.label}</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        {/* Controls */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['All Citizens', 'Verified Only', 'Top Reporters', 'Pending', 'Banned'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search citizens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-700 hover:bg-slate-50 transition-colors font-medium">
              <Download className="w-4 h-4" /> Export List
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Citizen</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Contact Info</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Neighborhood</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Reports</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Resolved</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Last Activity</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCitizens.map((citizen) => {
                const color = CITIZEN_STATUS_COLORS[citizen.status];
                return (
                  <tr key={citizen.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={citizen.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <p className="text-[14px] font-semibold text-slate-900">{citizen.name}</p>
                          <p className="text-[11px] text-slate-500">Joined {citizen.joinedDate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[13px] text-slate-700">{citizen.email}</p>
                      <p className="text-[11px] text-slate-500">{citizen.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-slate-700">
                      {citizen.neighborhood}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-[12px]">
                        {citizen.reportsSubmitted}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-block bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg text-[12px]">
                        {citizen.resolvedReports}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border"
                        style={{ color: color, backgroundColor: `${color}10`, borderColor: `${color}30` }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                        {CITIZEN_STATUS_LABELS[citizen.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[12px] text-slate-500">
                      {citizen.lastActivity}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors" title="Message Citizen">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 border border-transparent hover:bg-blue-50 rounded-lg transition-colors">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredCitizens.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-[13px]">
              No citizens found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
