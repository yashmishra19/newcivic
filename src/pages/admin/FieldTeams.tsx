import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Clock, MessageSquare, ShieldAlert,
  ChevronRight, Truck, Signal, CheckCircle2,
} from 'lucide-react';
import { getTeams } from '../../services/teams';

const TEAM_STATUS_COLORS: Record<string, string> = {
  available:  '#22C55E',
  'on-site':  '#3B82F6',
  'en-route': '#F97316',
  emergency:  '#EF4444',
  offline:    '#6B7280',
};

const TEAM_STATUS_LABELS: Record<string, string> = {
  available:  'Available',
  'on-site':  'On Site',
  'en-route': 'En Route',
  emergency:  'Emergency',
  offline:    'Offline',
};

const DEPT_NAME_MAP: Record<string, string> = {
  'dept-pw':  'Public Works',
  'dept-em':  'Emergency Services',
  'dept-san': 'Sanitation & Health',
  'dept-pow': 'Power & Utilities',
  'dept-law': 'Law Enforcement',
};

export default function FieldTeams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('All Departments');

  useEffect(() => {
    getTeams()
      .then(setTeams)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredTeams = deptFilter === 'All Departments'
    ? teams
    : teams.filter((t) => DEPT_NAME_MAP[t.department_id] === deptFilter);

  const statusCounts = {
    available:  teams.filter((t) => t.status === 'available').length,
    'on-site':  teams.filter((t) => t.status === 'on-site').length,
    'en-route': teams.filter((t) => t.status === 'en-route').length,
    emergency:  teams.filter((t) => t.status === 'emergency').length,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1440px] h-[calc(100vh-140px)]">
      {/* Left sidebar */}
      <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
        {/* Fleet Overview */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Fleet Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[13px] font-medium text-slate-700">Available</span>
              </div>
              <span className="text-lg font-bold text-slate-900">{statusCounts.available}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-[13px] font-medium text-slate-700">On Site</span>
              </div>
              <span className="text-lg font-bold text-slate-900">{statusCounts['on-site']}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="text-[13px] font-medium text-slate-700">En Route</span>
              </div>
              <span className="text-lg font-bold text-slate-900">{statusCounts['en-route']}</span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[13px] font-medium text-red-600">Emergency</span>
              </div>
              <span className="text-lg font-bold text-red-600">{statusCounts.emergency}</span>
            </div>
          </div>
        </div>

        {/* Dept Filter */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3">
          <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1 mb-2">
            Department Filter
          </h3>
          <div className="space-y-1">
            {['All Departments', 'Public Works', 'Emergency Services', 'Sanitation & Health', 'Power & Utilities', 'Law Enforcement'].map((dept) => (
              <button
                key={dept}
                onClick={() => setDeptFilter(dept)}
                className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  deptFilter === dept ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Team Cards */}
      <div className="flex-1 overflow-y-auto pr-2 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTeams.map((team) => {
            const isEmergency = team.status === 'emergency';
            const statusColor = TEAM_STATUS_COLORS[team.status] || '#6B7280';

            return (
              <div
                key={team.id}
                className={`bg-white rounded-xl border p-5 flex flex-col transition-shadow hover:shadow-md ${
                  isEmergency ? 'border-red-300 shadow-sm shadow-red-100/50' : 'border-slate-200/80'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[14px]">
                      {team.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className={`text-[14px] font-bold ${isEmergency ? 'text-red-700' : 'text-slate-900'}`}>
                        {team.name}
                      </h3>
                      <p className="text-[11px] font-medium text-slate-500">
                        {team.leader} • {team.members} members
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1.5"
                    style={{ color: statusColor, backgroundColor: `${statusColor}10`, borderColor: `${statusColor}30` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                    {TEAM_STATUS_LABELS[team.status] || team.status}
                  </span>
                </div>

                {/* Assignment */}
                <div className={`flex-1 rounded-lg p-3.5 mb-4 border ${
                  isEmergency ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'
                }`}>
                  {team.current_assignment ? (
                    <>
                      <div className="flex items-center gap-1.5 mb-2">
                        {isEmergency
                          ? <ShieldAlert className="w-4 h-4 text-red-500" />
                          : <MapPin className="w-4 h-4 text-slate-400" />
                        }
                        <span className={`text-[12px] font-bold ${isEmergency ? 'text-red-700' : 'text-slate-700'}`}>
                          {team.current_assignment}
                        </span>
                        {team.current_incident_id && (
                          <Link
                            to={`/admin/incidents/${team.current_incident_id}`}
                            className="text-[10px] font-mono text-blue-600 hover:underline ml-auto"
                          >
                            {team.current_incident_id}
                          </Link>
                        )}
                      </div>
                      <p className={`text-[12px] leading-relaxed line-clamp-2 ${isEmergency ? 'text-red-800/80' : 'text-slate-600'}`}>
                        {team.assignment_description}
                      </p>
                      {team.estimated_completion && (
                        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          Est. completion: {team.estimated_completion}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-2 text-slate-400">
                      <CheckCircle2 className="w-6 h-6 mb-2 opacity-50" />
                      <p className="text-[12px] font-medium">No current assignment</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Signal className="w-3.5 h-3.5" />
                    {new Date(team.last_update).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {team.status === 'available' ? (
                    <button className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      Assign Incident <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : isEmergency ? (
                    <button className="text-[12px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1">
                      Open Comms <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button className="text-[12px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1">
                      Track Vehicle <Truck className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}