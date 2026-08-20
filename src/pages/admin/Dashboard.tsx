import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  AlertTriangle, Clock, CheckCircle2, ShieldAlert, Eye,
  ArrowRight, MapPin, Wrench, Siren, Recycle, Zap, Shield,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { INCIDENT_SPARKLINE_DATA, DISPATCH_DISTRIBUTION } from '../../data/mockIncidents';
import { getPriorityIncidents } from '../../services/incidents';

const KPI_CARDS = [
  { label: 'Open Incidents',       value: 248,     trend: '+12%',   trendUp: true,  sub: 'From last week',              color: '#3B82F6', bg: 'bg-blue-50',   icon: AlertTriangle, iconColor: 'text-blue-600'   },
  { label: 'Critical',             value: 12,      trend: '3 urgent', trendUp: true, sub: 'Require immediate attention', color: '#EF4444', bg: 'bg-red-50',    icon: ShieldAlert,   iconColor: 'text-red-600'    },
  { label: 'In Progress',          value: 47,      trend: '31 crews', trendUp: false, sub: 'Active repair teams',        color: '#F59E0B', bg: 'bg-amber-50',  icon: Wrench,        iconColor: 'text-amber-600'  },
  { label: 'Awaiting Verification',value: 18,      trend: '',       trendUp: false, sub: 'Needs officer review',         color: '#8B5CF6', bg: 'bg-violet-50', icon: Eye,           iconColor: 'text-violet-600' },
  { label: 'Resolved',             value: '1,284', trend: '+18%',   trendUp: true,  sub: 'This month',                  color: '#22C55E', bg: 'bg-emerald-50',icon: CheckCircle2,  iconColor: 'text-emerald-600'},
];

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  'in-progress': { bg: 'bg-amber-100',  text: 'text-amber-700'  },
  assigned:      { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  reported:      { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  verified:      { bg: 'bg-violet-100', text: 'text-violet-700' },
  resolved:      { bg: 'bg-emerald-100',text: 'text-emerald-700'},
  closed:        { bg: 'bg-slate-100',  text: 'text-slate-600'  },
};

const PRIORITY_BADGE: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500'    },
  high:     { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  medium:   { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  low:      { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
};

const DEPT_ICONS: Record<string, any> = {
  'Public Works': Wrench, 'Emergency': Siren, 'Sanitation': Recycle,
  'Power': Zap, 'Law Enforcement': Shield,
};

export default function Dashboard() {
  const [priorityIncidents, setPriorityIncidents] = useState<any[]>([]);
  const { darkMode } = (useOutletContext() as { darkMode?: boolean; searchQuery?: string }) || {};
  const dm = Boolean(darkMode);

  const cardBg = dm ? 'bg-slate-800 border-slate-700/60 hover:shadow-slate-900/60' : 'bg-white border-slate-200/80';
  const cardTitle = dm ? 'text-slate-100' : 'text-slate-900';
  const cardSub = dm ? 'text-slate-400' : 'text-slate-500';
  const selectBg = dm ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-200 text-slate-700';
  const panelBg = dm ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200/80';
  const dividerColor = dm ? 'divide-slate-700' : 'divide-slate-100';
  const rowHover = dm ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50';
  const innerBg = dm ? 'bg-slate-700/50' : 'bg-slate-50';
  const innerBorder = dm ? 'border-slate-700' : 'border-slate-100';
  const textMuted = dm ? 'text-slate-400' : 'text-slate-500';
  const textBody = dm ? 'text-slate-300' : 'text-slate-800';

  useEffect(() => {
    getPriorityIncidents().then(setPriorityIncidents).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 max-w-[1440px]">
      {/* Date selector */}
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-2">
          <span className={`text-[13px] ${textMuted}`}>Period:</span>
          <select className={`text-[13px] border rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${selectBg}`}>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This month</option>
            <option>This quarter</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {KPI_CARDS.map((kpi) => (
          <div key={kpi.label} className={`rounded-xl border p-5 hover:shadow-md transition-all duration-200 group ${cardBg}`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
              </div>
              {kpi.trend && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  kpi.trendUp && kpi.trend.includes('+') ? 'bg-emerald-50 text-emerald-600'
                  : kpi.trendUp ? 'bg-red-50 text-red-600'
                  : 'bg-slate-100 text-slate-600'
                }`}>
                  {kpi.trend}
                </span>
              )}
            </div>
            <p className={`text-2xl font-bold ${cardTitle}`}>{kpi.value}</p>
            <p className={`text-[12px] mt-1 font-medium ${cardSub}`}>{kpi.label}</p>
            <div className="mt-3 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={INCIDENT_SPARKLINE_DATA}>
                  <Area type="monotone" dataKey="value" stroke={kpi.color} fill={kpi.color} fillOpacity={0.1} strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className={`text-[11px] mt-1 ${textMuted}`}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid: Priority Incidents & Dispatch Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Incidents */}
        <div className={`rounded-xl border flex flex-col ${panelBg}`}>
          <div className={`px-5 py-4 border-b flex items-center justify-between ${innerBorder}`}>
            <div>
              <h3 className={`font-semibold text-[15px] ${cardTitle}`}>Priority Incidents</h3>
              <p className={`text-[12px] mt-0.5 ${textMuted}`}>Requires immediate attention</p>
            </div>
            <Link to="/admin/incidents" className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className={`flex-1 overflow-y-auto max-h-[380px] divide-y ${dividerColor}`}>
            {priorityIncidents.map((inc) => {
              const pBadge = PRIORITY_BADGE[inc.priority] || PRIORITY_BADGE.low;
              const sBadge = STATUS_BADGE[inc.status]   || STATUS_BADGE.reported;
              return (
                <Link key={inc.id} to={`/admin/incidents/${inc.id}`}
                  className={`px-5 py-3.5 flex items-start gap-3 transition-colors group ${rowHover}`}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${pBadge.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-semibold truncate group-hover:text-blue-600 transition-colors ${textBody}`}>
                      {inc.title}
                    </p>
                    <p className={`text-[11px] mt-0.5 flex items-center gap-1 ${textMuted}`}>
                      <MapPin className="w-3 h-3" />
                      {inc.address}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pBadge.bg} ${pBadge.text} uppercase`}>
                        {inc.priority}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${sBadge.bg} ${sBadge.text}`}>
                        {inc.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] flex-shrink-0 mt-1 ${textMuted}`}>
                    <Clock className="w-3 h-3 inline mr-0.5" />
                    {new Date(inc.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className={`px-5 py-3 border-t ${innerBorder}`}>
            <Link to="/admin/incidents" className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all incidents <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Dispatch Distribution */}
        <div className={`rounded-xl border p-5 flex flex-col justify-between ${panelBg}`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`font-semibold text-[15px] ${cardTitle}`}>Municipal Dispatch Distribution</h3>
                <p className={`text-[12px] mt-0.5 ${textMuted}`}>Department-wise dispatch activity this month</p>
              </div>
              <span className={`text-[12px] font-medium ${textMuted}`}>Total: 408 dispatches</span>
            </div>
            <div className="h-[190px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DISPATCH_DISTRIBUTION} layout="vertical" barSize={18}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="department" width={110} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px', padding: '8px 14px' }}
                    formatter={(val: number) => [`${val} dispatches`, 'Total']}
                  />
                  <Bar dataKey="dispatches" radius={[0, 6, 6, 0]}>
                    {DISPATCH_DISTRIBUTION.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 content-start pt-3 border-t ${innerBorder}`}>
            {DISPATCH_DISTRIBUTION.map((dept) => {
              const Icon = DEPT_ICONS[dept.department] || Wrench;
              return (
                <div key={dept.department} className={`rounded-xl border p-3 hover:shadow-sm transition-shadow ${dm ? 'border-slate-700 bg-slate-700/40' : 'border-slate-200/80'}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: dept.color + '15' }}>
                      <Icon className="w-3 h-3" style={{ color: dept.color }} />
                    </div>
                  </div>
                  <p className={`text-base font-bold ${cardTitle}`}>{dept.percentage}%</p>
                  <p className={`text-[11px] truncate ${textMuted}`}>{dept.department}</p>
                  <p className={`text-[10px] ${textMuted}`}>{dept.dispatches} dispatches</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}