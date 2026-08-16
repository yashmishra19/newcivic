import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock, User, Building2, Users, Tag,
  CheckCircle2, Circle, AlertTriangle, ChevronRight,
  Phone, Map, Flag, Edit, MessageSquare,
} from 'lucide-react';
import { MOCK_INCIDENTS, CATEGORY_LABELS, STATUS_LABELS } from '../../data/mockIncidents';
import { useState } from 'react';

const PRIORITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  'in-progress': { bg: 'bg-amber-100', text: 'text-amber-700' },
  assigned: { bg: 'bg-blue-100', text: 'text-blue-700' },
  reported: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  verified: { bg: 'bg-violet-100', text: 'text-violet-700' },
  resolved: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  closed: { bg: 'bg-slate-100', text: 'text-slate-600' },
};

export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const incident = MOCK_INCIDENTS.find((i) => i.id === id);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertTriangle className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500 text-[15px]">Incident not found</p>
        <Link to="/admin/incidents" className="text-blue-600 text-[13px] font-medium hover:underline">
          ← Back to Incidents
        </Link>
      </div>
    );
  }

  const pStyle = PRIORITY_STYLES[incident.priority];
  const sStyle = STATUS_STYLES[incident.status];

  return (
    <div className="max-w-[1200px] space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-mono font-semibold text-slate-400">{incident.id}</span>
            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase ${pStyle.bg} ${pStyle.text} border ${pStyle.border}`}>
              {incident.priority}
            </span>
            <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${sStyle.bg} ${sStyle.text}`}>
              {STATUS_LABELS[incident.status]}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 truncate">{incident.title}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Photo */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
            <img
              src={incident.photo}
              alt={incident.title}
              className="w-full h-[280px] object-cover"
            />
            <div className="p-5">
              <h3 className="font-semibold text-slate-900 text-[15px] mb-2">Description</h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">{incident.description}</p>
            </div>
          </div>

          {/* Info grid */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5">
            <h3 className="font-semibold text-slate-900 text-[15px] mb-4">Incident Information</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: MapPin, label: 'Address', value: incident.location.address },
                { icon: Map, label: 'Neighborhood', value: incident.location.neighborhood },
                { icon: Clock, label: 'Reported', value: new Date(incident.reportedAt).toLocaleString() },
                { icon: User, label: 'Reported By', value: incident.reportedBy },
                { icon: Tag, label: 'Category', value: CATEGORY_LABELS[incident.category] },
                { icon: Building2, label: 'Department', value: incident.assignedDepartment },
                { icon: Users, label: 'Assigned Team', value: incident.assignedTeam || 'Unassigned' },
                { icon: MapPin, label: 'Coordinates', value: `${incident.location.lat.toFixed(4)}, ${incident.location.lng.toFixed(4)}` },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium">{item.label}</p>
                    <p className="text-[13px] text-slate-800 font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity log */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5">
            <h3 className="font-semibold text-slate-900 text-[15px] mb-4">Activity Log</h3>
            {incident.activityLog.length === 0 ? (
              <p className="text-[13px] text-slate-400 italic">No activity recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {incident.activityLog.map((log, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-slate-700">
                        <span className="font-semibold">{log.user}</span> {log.action}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Actions */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 space-y-2.5">
            <h3 className="font-semibold text-slate-900 text-[15px] mb-3">Actions</h3>
            <button className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-semibold hover:bg-blue-700 transition-colors justify-center">
              <Users className="w-4 h-4" /> Assign Team
            </button>
            <button className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-[13px] font-medium hover:bg-slate-50 transition-colors justify-center">
              <Flag className="w-4 h-4" /> Change Priority
            </button>
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-[13px] font-medium hover:bg-slate-50 transition-colors justify-center"
              >
                <Edit className="w-4 h-4" /> Change Status
              </button>
              {showStatusMenu && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1 overflow-hidden">
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setShowStatusMenu(false)}
                      className="w-full text-left px-4 py-2 text-[12px] text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-[13px] font-medium hover:bg-slate-50 transition-colors justify-center">
              <Phone className="w-4 h-4" /> Contact Citizen
            </button>
            <button className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-[13px] font-medium hover:bg-slate-50 transition-colors justify-center">
              <Map className="w-4 h-4" /> Open on Map
            </button>
            <button className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-[13px] font-semibold hover:bg-emerald-700 transition-colors justify-center">
              <CheckCircle2 className="w-4 h-4" /> Mark Resolved
            </button>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5">
            <h3 className="font-semibold text-slate-900 text-[15px] mb-4">Timeline</h3>
            <div className="space-y-0">
              {incident.timeline.map((step, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  {/* Connector line */}
                  {i < incident.timeline.length - 1 && (
                    <div
                      className={`absolute left-[11px] top-6 w-0.5 h-full ${
                        step.completed ? 'bg-blue-200' : 'bg-slate-200'
                      }`}
                    />
                  )}
                  {/* Dot */}
                  <div className="relative z-10 flex-shrink-0">
                    {step.completed ? (
                      <CheckCircle2 className="w-[22px] h-[22px] text-blue-600" />
                    ) : (
                      <Circle className="w-[22px] h-[22px] text-slate-300" />
                    )}
                  </div>
                  <div className="pb-5">
                    <p className={`text-[13px] font-medium ${step.completed ? 'text-slate-800' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                    {step.time && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{step.time}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reporter */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5">
            <h3 className="font-semibold text-slate-900 text-[15px] mb-3">Reporter</h3>
            <div className="flex items-center gap-3">
              <img
                src={incident.reporterAvatar}
                alt={incident.reportedBy}
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div>
                <p className="text-[13px] font-semibold text-slate-800">{incident.reportedBy}</p>
                <p className="text-[11px] text-slate-500">Citizen Reporter</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
